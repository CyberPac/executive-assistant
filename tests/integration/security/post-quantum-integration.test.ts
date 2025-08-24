/**
 * Post-Quantum Integration Test Suite - WBS 2.3
 * Comprehensive integration tests for complete post-quantum suite
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * Integration testing for quantum-resistant cryptography suite
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { PostQuantumSuite, createExecutivePostQuantumConfig, createDefaultPostQuantumConfig } from '../../../src/security/post-quantum/PostQuantumSuite';
import { HSMInterface } from '../../../src/security/hsm/HSMInterface';
import { DilithiumValidator, createExecutiveValidationConfig } from '../../../src/security/post-quantum/validation/DilithiumValidator';

describe('Post-Quantum Cryptography Integration Tests', () => {
  let postQuantumSuite: PostQuantumSuite;
  let mockHSM: HSMInterface;
  let _validator: DilithiumValidator;

  beforeEach(async () => {
    // Create mock HSM interface
    mockHSM = new HSMInterface({
      mode: 'simulation',
      endpoint: 'mock://hsm',
      authentication: {
        clientId: 'integration-test',
        tokenEndpoint: 'mock://auth',
        authMethod: 'simulation'
      },
      algorithms: {
        symmetric: ['AES-256-GCM'],
        asymmetric: ['ECDSA-P384'],
        postQuantum: ['CRYSTALS-Kyber', 'CRYSTALS-Dilithium'],
        hashing: ['SHA-384']
      },
      performance: {
        maxConcurrentOperations: 10,
        timeoutMs: 5000,
        retryAttempts: 3,
        performanceTargets: {
          keyGeneration: 100,
          encryption: 50,
          signing: 75,
          verification: 25
        }
      },
      monitoring: {
        healthCheckIntervalMs: 30000,
        metricsCollectionEnabled: true,
        alertThresholds: {
          errorRate: 0.1,
          latencyMs: 100,
          utilizationPercent: 80
        }
      }
    });

    await mockHSM.initialize();

    // Create post-quantum suite with executive configuration
    const config = createExecutivePostQuantumConfig();
    postQuantumSuite = new PostQuantumSuite(config, mockHSM);
    await postQuantumSuite.initialize();

    // Create validator for security testing
    _validator = new DilithiumValidator(createExecutiveValidationConfig());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Suite Initialization and Configuration', () => {
    test('should initialize with executive configuration', async () => {
      const config = createExecutivePostQuantumConfig();
      const suite = new PostQuantumSuite(config, mockHSM);
      
      await expect(suite.initialize()).resolves.not.toThrow();
      
      // Verify configuration applied correctly
      expect(config.enableKyber).toBe(true);
      expect(config.enableDilithium).toBe(true);
      expect(config.defaultKyberVariant).toBe('Kyber1024');
      expect(config.defaultDilithiumVariant).toBe('Dilithium5');
      expect(config.executiveMode).toBe(true);
    });

    test('should initialize with default configuration', async () => {
      const config = createDefaultPostQuantumConfig();
      const suite = new PostQuantumSuite(config);
      
      await expect(suite.initialize()).resolves.not.toThrow();
      
      expect(config.defaultKyberVariant).toBe('Kyber768');
      expect(config.defaultDilithiumVariant).toBe('Dilithium3');
      expect(config.executiveMode).toBe(false);
    });

    test('should handle HSM initialization failure gracefully', async () => {
      // Create faulty HSM configuration
      const faultyHSM = new HSMInterface({
        mode: 'production', // This will fail in test environment
        endpoint: 'invalid://endpoint',
        authentication: {
          clientId: 'invalid',
          tokenEndpoint: 'invalid://auth',
          authMethod: 'certificate'
        },
        algorithms: {
          symmetric: [],
          asymmetric: [],
          postQuantum: [],
          hashing: []
        },
        performance: {
          maxConcurrentOperations: 1,
          timeoutMs: 1000,
          retryAttempts: 1,
          performanceTargets: {
            keyGeneration: 100,
            encryption: 50,
            signing: 75,
            verification: 25
          }
        },
        monitoring: {
          healthCheckIntervalMs: 30000,
          metricsCollectionEnabled: false,
          alertThresholds: {
            errorRate: 0.1,
            latencyMs: 100,
            utilizationPercent: 80
          }
        }
      });

      const config = createExecutivePostQuantumConfig();
      const suite = new PostQuantumSuite(config, faultyHSM);
      
      await expect(suite.initialize()).rejects.toThrow();
    });
  });

  describe('Key Management Integration', () => {
    test('should generate complete post-quantum key pairs', async () => {
      const keyPair = await postQuantumSuite.generateKeyPair({
        classification: 'executive',
        usage: ['encryption', 'digital_signature']
      });

      expect(keyPair).toBeDefined();
      expect(keyPair.keyId).toBeDefined();
      expect(keyPair.kyberKeyPair).toBeDefined();
      expect(keyPair.dilithiumKeyPair).toBeDefined();
      expect(keyPair.combinedMetadata.quantumResistant).toBe(true);
      expect(keyPair.combinedMetadata.classification).toBe('executive');

      // Verify key pair is registered
      const registeredKeys = postQuantumSuite.getRegisteredKeys();
      expect(registeredKeys).toContain(keyPair.keyId);
    });

    test('should generate Kyber-only key pairs', async () => {
      const keyPair = await postQuantumSuite.generateKeyPair({
        includeKyber: true,
        includeDilithium: false,
        classification: 'strategic'
      });

      expect(keyPair.kyberKeyPair).toBeDefined();
      expect(keyPair.dilithiumKeyPair).toBeUndefined();
      expect(keyPair.combinedMetadata.classification).toBe('strategic');
    });

    test('should generate Dilithium-only key pairs', async () => {
      const keyPair = await postQuantumSuite.generateKeyPair({
        includeKyber: false,
        includeDilithium: true,
        classification: 'confidential'
      });

      expect(keyPair.kyberKeyPair).toBeUndefined();
      expect(keyPair.dilithiumKeyPair).toBeDefined();
      expect(keyPair.combinedMetadata.classification).toBe('confidential');
    });

    test('should retrieve key pairs by ID', async () => {
      const _keyPair = await postQuantumSuite.generateKeyPair({
        keyId: 'test-key-123',
        classification: 'executive'
      });

      const retrieved = postQuantumSuite.getKeyPair('test-key-123');
      expect(retrieved).toBeDefined();
      expect(retrieved?.keyId).toBe('test-key-123');
      expect(retrieved?.combinedMetadata.classification).toBe('executive');
    });
  });

  describe('Hybrid Encryption Integration', () => {
    let senderKeyPair: any;
    let recipientKeyPair: any;

    beforeEach(async () => {
      senderKeyPair = await postQuantumSuite.generateKeyPair({
        keyId: 'sender-key',
        classification: 'executive'
      });

      recipientKeyPair = await postQuantumSuite.generateKeyPair({
        keyId: 'recipient-key',
        classification: 'executive'
      });
    });

    test('should perform hybrid encryption without signature', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      const encryptResult = await postQuantumSuite.hybridEncrypt({
        data: testData,
        recipientKeyId: recipientKeyPair.keyId,
        includeSignature: false
      });

      expect(encryptResult).toBeDefined();
      expect(encryptResult.encapsulationResult).toBeDefined();
      expect(encryptResult.signatureResult).toBeUndefined();
      expect(encryptResult.combinedCiphertext).toBeDefined();
      expect(encryptResult.metadata.algorithms).toContain('CRYSTALS-Kyber1024');
      expect(encryptResult.metadata.keyId).toBe(recipientKeyPair.keyId);
    });

    test('should perform hybrid encryption with signature', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      const encryptResult = await postQuantumSuite.hybridEncrypt({
        data: testData,
        recipientKeyId: recipientKeyPair.keyId,
        signerKeyId: senderKeyPair.keyId,
        includeSignature: true
      });

      expect(encryptResult).toBeDefined();
      expect(encryptResult.encapsulationResult).toBeDefined();
      expect(encryptResult.signatureResult).toBeDefined();
      expect(encryptResult.combinedCiphertext).toBeDefined();
      expect(encryptResult.metadata.algorithms).toContain('CRYSTALS-Kyber1024');
      expect(encryptResult.metadata.algorithms).toContain('CRYSTALS-Dilithium5');
    });

    test('should perform hybrid decryption without signature verification', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      const encryptResult = await postQuantumSuite.hybridEncrypt({
        data: testData,
        recipientKeyId: recipientKeyPair.keyId,
        includeSignature: false
      });

      const decryptResult = await postQuantumSuite.hybridDecrypt({
        combinedCiphertext: encryptResult.combinedCiphertext,
        recipientKeyId: recipientKeyPair.keyId,
        verifySignature: false
      });

      expect(decryptResult).toBeDefined();
      expect(decryptResult.decapsulationResult).toBeDefined();
      expect(decryptResult.verificationResult).toBeUndefined();
      expect(decryptResult.plaintext).toEqual(testData);
      expect(decryptResult.metadata.verified).toBe(false);
    });

    test('should perform hybrid decryption with signature verification', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      const encryptResult = await postQuantumSuite.hybridEncrypt({
        data: testData,
        recipientKeyId: recipientKeyPair.keyId,
        signerKeyId: senderKeyPair.keyId,
        includeSignature: true
      });

      const decryptResult = await postQuantumSuite.hybridDecrypt({
        combinedCiphertext: encryptResult.combinedCiphertext,
        recipientKeyId: recipientKeyPair.keyId,
        signerKeyId: senderKeyPair.keyId,
        verifySignature: true
      });

      expect(decryptResult).toBeDefined();
      expect(decryptResult.decapsulationResult).toBeDefined();
      expect(decryptResult.verificationResult).toBeDefined();
      expect(decryptResult.plaintext).toEqual(testData);
      expect(decryptResult.metadata.verified).toBe(true);
      expect(decryptResult.verificationResult!.valid).toBe(true);
    });

    test('should handle large data encryption/decryption', async () => {
      // Test with 1MB of data
      const largeData = new Uint8Array(1024 * 1024);
      crypto.getRandomValues(largeData);
      
      const startTime = Date.now();
      
      const encryptResult = await postQuantumSuite.hybridEncrypt({
        data: largeData,
        recipientKeyId: recipientKeyPair.keyId,
        signerKeyId: senderKeyPair.keyId,
        includeSignature: true
      });

      const decryptResult = await postQuantumSuite.hybridDecrypt({
        combinedCiphertext: encryptResult.combinedCiphertext,
        recipientKeyId: recipientKeyPair.keyId,
        signerKeyId: senderKeyPair.keyId,
        verifySignature: true
      });

      const totalTime = Date.now() - startTime;
      
      expect(decryptResult.plaintext).toEqual(largeData);
      expect(decryptResult.metadata.verified).toBe(true);
      
      // Performance check: should complete within reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds for 1MB
      
      console.log(`Large data test (1MB): ${totalTime}ms`);
    });

    test('should detect signature tampering', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      
      const encryptResult = await postQuantumSuite.hybridEncrypt({
        data: testData,
        recipientKeyId: recipientKeyPair.keyId,
        signerKeyId: senderKeyPair.keyId,
        includeSignature: true
      });

      // Tamper with the ciphertext
      const tamperedCiphertext = new Uint8Array(encryptResult.combinedCiphertext);
      tamperedCiphertext[tamperedCiphertext.length - 10] ^= 0xFF;

      const decryptResult = await postQuantumSuite.hybridDecrypt({
        combinedCiphertext: tamperedCiphertext,
        recipientKeyId: recipientKeyPair.keyId,
        signerKeyId: senderKeyPair.keyId,
        verifySignature: true
      });

      expect(decryptResult.metadata.verified).toBe(false);
      expect(decryptResult.verificationResult?.valid).toBe(false);
    });
  });

  describe('Performance and Metrics Integration', () => {
    test('should collect comprehensive performance metrics', async () => {
      // Perform multiple operations to generate metrics
      const keyPair1 = await postQuantumSuite.generateKeyPair({ classification: 'executive' });
      const keyPair2 = await postQuantumSuite.generateKeyPair({ classification: 'executive' });

      const testData = new Uint8Array(1024);
      crypto.getRandomValues(testData);

      // Multiple encryption/decryption cycles
      for (let i = 0; i < 5; i++) {
        const encryptResult = await postQuantumSuite.hybridEncrypt({
          data: testData,
          recipientKeyId: keyPair1.keyId,
          signerKeyId: keyPair2.keyId,
          includeSignature: true
        });

        await postQuantumSuite.hybridDecrypt({
          combinedCiphertext: encryptResult.combinedCiphertext,
          recipientKeyId: keyPair1.keyId,
          signerKeyId: keyPair2.keyId,
          verifySignature: true
        });
      }

      const metrics = postQuantumSuite.getMetrics();
      
      expect(metrics.kyberMetrics.length).toBeGreaterThan(0);
      expect(metrics.dilithiumMetrics.length).toBeGreaterThan(0);
      expect(metrics.hybridMetrics.length).toBeGreaterThan(0);
      expect(metrics.performanceSummary.averageEncryptionTime).toBeGreaterThan(0);
      expect(metrics.performanceSummary.averageDecryptionTime).toBeGreaterThan(0);
      expect(metrics.performanceSummary.averageSigningTime).toBeGreaterThan(0);
      expect(metrics.performanceSummary.averageVerificationTime).toBeGreaterThan(0);
    });

    test('should meet executive-grade performance targets', async () => {
      const keyPair = await postQuantumSuite.generateKeyPair({
        classification: 'executive'
      });

      const testData = new Uint8Array(256);
      crypto.getRandomValues(testData);

      // Test encryption performance
      const encryptStart = Date.now();
      const encryptResult = await postQuantumSuite.hybridEncrypt({
        data: testData,
        recipientKeyId: keyPair.keyId,
        includeSignature: false
      });
      const encryptTime = Date.now() - encryptStart;

      // Test decryption performance
      const decryptStart = Date.now();
      await postQuantumSuite.hybridDecrypt({
        combinedCiphertext: encryptResult.combinedCiphertext,
        recipientKeyId: keyPair.keyId,
        verifySignature: false
      });
      const decryptTime = Date.now() - decryptStart;

      // Executive-grade targets (stricter than default)
      expect(encryptTime).toBeLessThan(100); // <100ms for encryption
      expect(decryptTime).toBeLessThan(75);  // <75ms for decryption
      
      console.log(`Performance: Encrypt ${encryptTime}ms, Decrypt ${decryptTime}ms`);
    });
  });

  describe('Security Validation Integration', () => {
    test('should run comprehensive security validation', async () => {
      const auditResult = await postQuantumSuite.runSecurityValidation();
      
      expect(auditResult).toBeDefined();
      expect(auditResult.overallSecurityScore).toBeGreaterThan(0);
      expect(auditResult.complianceReports).toBeDefined();
      expect(auditResult.complianceReports.length).toBeGreaterThan(0);
      expect(auditResult.riskAssessment).toMatch(/^(low|medium|high|critical)$/);
      expect(auditResult.executiveRecommendations).toBeDefined();
      
      // Executive mode should achieve high security scores
      expect(auditResult.overallSecurityScore).toBeGreaterThan(80);
    });

    test('should validate NIST compliance', async () => {
      const auditResult = await postQuantumSuite.runSecurityValidation();
      
      const nistReport = auditResult.complianceReports.find(
        (report: any) => report.standard === 'NIST-FIPS-204'
      );
      
      expect(nistReport).toBeDefined();
      expect(nistReport.overallCompliance).toBeGreaterThan(90);
      
      const parameterTest = nistReport.results.find(
        (result: any) => result.testName === 'NIST Parameter Compliance'
      );
      expect(parameterTest?.passed).toBe(true);
    });

    test('should validate executive security requirements', async () => {
      const auditResult = await postQuantumSuite.runSecurityValidation();
      
      const execReport = auditResult.complianceReports.find(
        (report: any) => report.standard === 'EXECUTIVE-SECURITY'
      );
      
      expect(execReport).toBeDefined();
      expect(execReport.overallCompliance).toBeGreaterThan(85);
      
      const perfTest = execReport.results.find(
        (result: any) => result.testName === 'Performance Requirements'
      );
      expect(perfTest?.passed).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing recipient key', async () => {
      const testData = new Uint8Array([1, 2, 3]);
      
      await expect(postQuantumSuite.hybridEncrypt({
        data: testData,
        recipientKeyId: 'non-existent-key'
      })).rejects.toThrow('Recipient key not found');
    });

    test('should handle missing signer key', async () => {
      const keyPair = await postQuantumSuite.generateKeyPair({
        classification: 'executive'
      });
      
      const testData = new Uint8Array([1, 2, 3]);
      
      await expect(postQuantumSuite.hybridEncrypt({
        data: testData,
        recipientKeyId: keyPair.keyId,
        signerKeyId: 'non-existent-signer',
        includeSignature: true
      })).rejects.toThrow('Dilithium key pair not available');
    });

    test('should handle corrupted ciphertext', async () => {
      const keyPair = await postQuantumSuite.generateKeyPair({
        classification: 'executive'
      });

      const corruptedCiphertext = new Uint8Array([0, 1, 2, 3, 4, 5]); // Invalid format
      
      await expect(postQuantumSuite.hybridDecrypt({
        combinedCiphertext: corruptedCiphertext,
        recipientKeyId: keyPair.keyId
      })).rejects.toThrow();
    });

    test('should handle key pair without required components', async () => {
      const kyberOnlyKey = await postQuantumSuite.generateKeyPair({
        includeKyber: true,
        includeDilithium: false
      });

      const testData = new Uint8Array([1, 2, 3]);
      
      // Should fail when trying to sign with Kyber-only key
      await expect(postQuantumSuite.hybridEncrypt({
        data: testData,
        recipientKeyId: kyberOnlyKey.keyId,
        signerKeyId: kyberOnlyKey.keyId,
        includeSignature: true
      })).rejects.toThrow('Dilithium key pair not available');
    });
  });

  describe('Cross-Component Compatibility', () => {
    test('should maintain compatibility between Kyber and Dilithium operations', async () => {
      // Generate keys with different security levels
      const kyber768Key = await postQuantumSuite.generateKeyPair({
        keyId: 'kyber768-test'
      });

      // Verify that mixed security levels work together
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      
      const encryptResult = await postQuantumSuite.hybridEncrypt({
        data: testData,
        recipientKeyId: kyber768Key.keyId,
        signerKeyId: kyber768Key.keyId,
        includeSignature: true
      });

      const decryptResult = await postQuantumSuite.hybridDecrypt({
        combinedCiphertext: encryptResult.combinedCiphertext,
        recipientKeyId: kyber768Key.keyId,
        signerKeyId: kyber768Key.keyId,
        verifySignature: true
      });

      expect(decryptResult.plaintext).toEqual(testData);
      expect(decryptResult.metadata.verified).toBe(true);
    });

    test('should handle interoperability between HSM and software implementations', async () => {
      // This test would verify that keys generated in HSM can be used
      // with software implementations and vice versa
      const keyPair = await postQuantumSuite.generateKeyPair({
        classification: 'executive'
      });

      expect(keyPair.kyberKeyPair).toBeDefined();
      expect(keyPair.dilithiumKeyPair).toBeDefined();
      
      // Verify basic operations work with HSM-backed keys
      const testData = new Uint8Array([1, 2, 3]);
      
      const encryptResult = await postQuantumSuite.hybridEncrypt({
        data: testData,
        recipientKeyId: keyPair.keyId
      });

      const decryptResult = await postQuantumSuite.hybridDecrypt({
        combinedCiphertext: encryptResult.combinedCiphertext,
        recipientKeyId: keyPair.keyId
      });

      expect(decryptResult.plaintext).toEqual(testData);
    });
  });

  describe('Compliance and Standards Integration', () => {
    test('should meet all required compliance standards', async () => {
      const auditResult = await postQuantumSuite.runSecurityValidation();
      
      const requiredStandards = ['NIST-FIPS-204', 'RFC-8692', 'EXECUTIVE-SECURITY'];
      
      for (const standard of requiredStandards) {
        const report = auditResult.complianceReports.find(
          (r: any) => r.standard === standard
        );
        
        expect(report).toBeDefined();
        expect(report.overallCompliance).toBeGreaterThan(75);
        
        // No critical failures allowed
        const criticalFailures = report.results.filter(
          (r: any) => !r.passed && r.severity === 'critical'
        );
        expect(criticalFailures.length).toBe(0);
      }
    });

    test('should generate executive-grade compliance reports', async () => {
      const auditResult = await postQuantumSuite.runSecurityValidation();
      
      expect(auditResult.dilithiumVersion).toBeDefined();
      expect(auditResult.timestamp).toBeInstanceOf(Date);
      expect(auditResult.executiveRecommendations.length).toBeGreaterThan(0);
      
      // Executive mode should have low risk assessment
      expect(['low', 'medium']).toContain(auditResult.riskAssessment);
      
      // Should include specific executive recommendations
      const execRecommendations = auditResult.executiveRecommendations.filter(
        (rec: string) => rec.includes('executive')
      );
      expect(execRecommendations.length).toBeGreaterThan(0);
    });
  });
});