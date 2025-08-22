/**
 * CRYSTALS-Dilithium Test Suite - WBS 2.3.2.4
 * Comprehensive unit tests for quantum-resistant digital signatures
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * Test coverage target: 90%+ with security validation
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/testing-library';
import { CRYSTALSDilithium, DilithiumKeyPair, DilithiumUtils } from '../../../../src/security/post-quantum/CRYSTALSDilithium';
import { DilithiumHSMIntegration } from '../../../../src/security/post-quantum/DilithiumHSMIntegration';
import { DilithiumBenchmark, createDefaultBenchmarkConfig } from '../../../../src/security/post-quantum/benchmarks/DilithiumBenchmark';
import { HSMInterface } from '../../../../src/security/hsm/HSMInterface';

describe('CRYSTALS-Dilithium Digital Signature Scheme', () => {
  let dilithium: CRYSTALSDilithium;
  let mockHSM: HSMInterface;
  let hsmIntegration: DilithiumHSMIntegration;

  beforeEach(() => {
    dilithium = new CRYSTALSDilithium();
    
    // Create mock HSM interface
    mockHSM = new HSMInterface({
      mode: 'simulation',
      endpoint: 'mock://hsm',
      authentication: {
        clientId: 'test',
        tokenEndpoint: 'mock://auth',
        authMethod: 'simulation'
      },
      algorithms: {
        symmetric: ['AES-256-GCM'],
        asymmetric: ['ECDSA-P384'],
        postQuantum: ['CRYSTALS-Dilithium'],
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

    hsmIntegration = new DilithiumHSMIntegration(mockHSM, {
      hsmEndpoint: 'mock://hsm',
      authMethod: 'simulation' as any,
      keyStoragePolicy: 'hsm_only',
      performanceMode: 'balanced',
      enableSecureEnclaves: true,
      signatureAuditing: true
    });
  });

  afterEach(() => {
    // Cleanup resources
    jest.clearAllMocks();
  });

  describe('Core Dilithium Operations', () => {
    test('should initialize with correct parameters', () => {
      expect(dilithium).toBeDefined();
      expect(dilithium.getSupportedVariants()).toEqual(['Dilithium2', 'Dilithium3', 'Dilithium5']);
      
      const params2 = dilithium.getParameters('Dilithium2');
      expect(params2?.securityLevel).toBe(2);
      expect(params2?.publicKeySize).toBe(1312);
      
      const params5 = dilithium.getParameters('Dilithium5');
      expect(params5?.securityLevel).toBe(5);
      expect(params5?.signatureSize).toBe(4595);
    });

    test('should generate valid key pairs for all variants', async () => {
      const variants = ['Dilithium2', 'Dilithium3', 'Dilithium5'] as const;
      
      for (const variant of variants) {
        const keyPair = await dilithium.generateKeyPair({
          variant,
          classification: 'executive',
          usage: ['digital_signature', 'test']
        });

        expect(keyPair).toBeDefined();
        expect(keyPair.keyId).toMatch(/^dilithium_/);
        expect(keyPair.parameters.variant).toBe(variant);
        expect(keyPair.publicKey.length).toBe(keyPair.parameters.publicKeySize);
        expect(keyPair.privateKey.length).toBe(keyPair.parameters.privateKeySize);
        expect(keyPair.metadata.classification).toBe('executive');
        expect(keyPair.metadata.usage).toContain('digital_signature');
      }
    });

    test('should generate deterministic key metadata', async () => {
      const keyPair1 = await dilithium.generateKeyPair({ variant: 'Dilithium3' });
      const keyPair2 = await dilithium.generateKeyPair({ variant: 'Dilithium3' });

      // Different key IDs but same parameters
      expect(keyPair1.keyId).not.toBe(keyPair2.keyId);
      expect(keyPair1.parameters).toEqual(keyPair2.parameters);
      expect(keyPair1.publicKey[0]).toBe(0x44); // 'D' for Dilithium
      expect(keyPair1.publicKey[1]).toBe(3); // Security level 3
    });

    test('should validate key pair integrity', async () => {
      const keyPair = await dilithium.generateKeyPair({
        variant: 'Dilithium3',
        classification: 'executive'
      });

      const isValid = await dilithium.validateKeyPair(keyPair);
      expect(isValid).toBe(true);
    });
  });

  describe('Digital Signature Operations', () => {
    let keyPair: DilithiumKeyPair;
    let testMessage: Uint8Array;

    beforeEach(async () => {
      keyPair = await dilithium.generateKeyPair({
        variant: 'Dilithium3',
        classification: 'executive'
      });

      testMessage = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    test('should create valid digital signatures', async () => {
      const signResult = await dilithium.sign(testMessage, keyPair.privateKey, keyPair.keyId);

      expect(signResult).toBeDefined();
      expect(signResult.signature.length).toBe(keyPair.parameters.signatureSize);
      expect(signResult.keyId).toBe(keyPair.keyId);
      expect(signResult.messageHash.length).toBe(32); // SHA hash size
      expect(signResult.metrics.operationType).toBe('signing');
      expect(signResult.metrics.duration).toBeGreaterThan(0);
      
      // Check signature format
      expect(signResult.signature[0]).toBe(0x44); // 'D' for Dilithium
      expect(signResult.signature[1]).toBe(3); // Security level 3
    });

    test('should verify valid signatures correctly', async () => {
      const signResult = await dilithium.sign(testMessage, keyPair.privateKey, keyPair.keyId);
      
      const verifyResult = await dilithium.verify(
        testMessage,
        signResult.signature,
        keyPair.publicKey,
        keyPair.keyId
      );

      expect(verifyResult.valid).toBe(true);
      expect(verifyResult.keyId).toBe(keyPair.keyId);
      expect(verifyResult.messageHash).toEqual(signResult.messageHash);
      expect(verifyResult.metrics.operationType).toBe('verification');
    });

    test('should reject invalid signatures', async () => {
      const signResult = await dilithium.sign(testMessage, keyPair.privateKey, keyPair.keyId);
      
      // Corrupt the signature
      const corruptedSignature = new Uint8Array(signResult.signature);
      corruptedSignature[10] ^= 0xFF;

      const verifyResult = await dilithium.verify(
        testMessage,
        corruptedSignature,
        keyPair.publicKey,
        keyPair.keyId
      );

      expect(verifyResult.valid).toBe(false);
    });

    test('should reject signatures with wrong message', async () => {
      const signResult = await dilithium.sign(testMessage, keyPair.privateKey, keyPair.keyId);
      
      const wrongMessage = new Uint8Array([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
      const verifyResult = await dilithium.verify(
        wrongMessage,
        signResult.signature,
        keyPair.publicKey,
        keyPair.keyId
      );

      expect(verifyResult.valid).toBe(false);
    });

    test('should handle different message sizes', async () => {
      const messageSizes = [0, 1, 32, 256, 1024, 4096];
      
      for (const size of messageSizes) {
        const message = new Uint8Array(size);
        if (size > 0) crypto.getRandomValues(message);

        const signResult = await dilithium.sign(message, keyPair.privateKey, keyPair.keyId);
        const verifyResult = await dilithium.verify(
          message,
          signResult.signature,
          keyPair.publicKey,
          keyPair.keyId
        );

        expect(verifyResult.valid).toBe(true);
        expect(signResult.metrics.bytesProcessed).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid variant gracefully', async () => {
      await expect(dilithium.generateKeyPair({
        variant: 'InvalidVariant' as any
      })).rejects.toThrow('Unsupported Dilithium variant');
    });

    test('should detect key size mismatches', async () => {
      const invalidPrivateKey = new Uint8Array(100); // Too small
      const message = new Uint8Array([1, 2, 3]);

      await expect(dilithium.sign(message, invalidPrivateKey, 'test'))
        .rejects.toThrow('Cannot determine Dilithium variant');
    });

    test('should validate signature sizes', async () => {
      const keyPair = await dilithium.generateKeyPair({ variant: 'Dilithium3' });
      const message = new Uint8Array([1, 2, 3]);
      const invalidSignature = new Uint8Array(100); // Wrong size

      await expect(dilithium.verify(message, invalidSignature, keyPair.publicKey, keyPair.keyId))
        .rejects.toThrow('Invalid signature size');
    });

    test('should handle corrupted key metadata', async () => {
      const keyPair = await dilithium.generateKeyPair({ variant: 'Dilithium3' });
      const message = new Uint8Array([1, 2, 3]);
      
      // Corrupt private key metadata
      const corruptedPrivateKey = new Uint8Array(keyPair.privateKey);
      corruptedPrivateKey[0] = 0x00; // Invalid identifier

      await expect(dilithium.sign(message, corruptedPrivateKey, keyPair.keyId))
        .rejects.toThrow('Invalid private key format');
    });
  });

  describe('Performance and Metrics', () => {
    test('should record performance metrics', async () => {
      const keyPair = await dilithium.generateKeyPair({ variant: 'Dilithium3' });
      const message = new Uint8Array(1024);
      crypto.getRandomValues(message);

      await dilithium.sign(message, keyPair.privateKey, keyPair.keyId);
      
      const metrics = dilithium.getPerformanceMetrics(10);
      expect(metrics.length).toBeGreaterThan(0);
      
      const signMetric = metrics.find(m => m.operationType === 'signing');
      expect(signMetric).toBeDefined();
      expect(signMetric!.duration).toBeGreaterThan(0);
      expect(signMetric!.variant).toBe('Dilithium3');
    });

    test('should meet performance targets', async () => {
      const keyPair = await dilithium.generateKeyPair({ variant: 'Dilithium2' });
      const message = new Uint8Array(256);
      crypto.getRandomValues(message);

      const startTime = Date.now();
      await dilithium.sign(message, keyPair.privateKey, keyPair.keyId);
      const signDuration = Date.now() - startTime;

      // Performance targets: signing should be < 90ms for Dilithium2
      expect(signDuration).toBeLessThan(90);

      const verifyStart = Date.now();
      const signResult = await dilithium.sign(message, keyPair.privateKey, keyPair.keyId);
      await dilithium.verify(message, signResult.signature, keyPair.publicKey, keyPair.keyId);
      const verifyDuration = Date.now() - verifyStart;

      // Verification should be faster than signing
      expect(verifyDuration).toBeLessThan(signDuration);
    });
  });

  describe('HSM Integration', () => {
    beforeEach(async () => {
      await mockHSM.initialize();
    });

    test('should generate HSM-backed key pairs', async () => {
      const result = await hsmIntegration.generateHSMKeyPair({
        variant: 'Dilithium5',
        classification: 'executive',
        usage: ['digital_signature', 'hsm_protected']
      });

      expect(result.success).toBe(true);
      expect(result.data?.keyId).toBeDefined();
      expect(result.data?.publicKey).toBeDefined();
      expect(result.data?.metadata.dilithiumVariant).toBe('Dilithium5');
      expect(result.data?.metadata.quantumResistant).toBe(true);
      expect(result.dilithiumMetrics.securityLevel).toBe(5);
    });

    test('should perform HSM-protected signing', async () => {
      const keyResult = await hsmIntegration.generateHSMKeyPair({
        variant: 'Dilithium3',
        classification: 'executive'
      });

      expect(keyResult.success).toBe(true);

      const message = new Uint8Array([1, 2, 3, 4, 5]);
      const signResult = await hsmIntegration.hsmSign({
        message,
        hsmKeyHandle: keyResult.data!.hsmKeyHandle!,
        keyId: keyResult.data!.keyId,
        useHSMSigning: true
      });

      expect(signResult.success).toBe(true);
      expect(signResult.data?.signature).toBeDefined();
      expect(signResult.data?.hsmSigned).toBe(true);
      expect(signResult.data?.auditEntry).toBeDefined();
    });

    test('should maintain signature audit log', async () => {
      const keyResult = await hsmIntegration.generateHSMKeyPair({
        variant: 'Dilithium3',
        classification: 'executive'
      });

      const message1 = new Uint8Array([1, 2, 3]);
      const message2 = new Uint8Array([4, 5, 6]);

      await hsmIntegration.hsmSign({
        message: message1,
        hsmKeyHandle: keyResult.data!.hsmKeyHandle!,
        keyId: keyResult.data!.keyId,
        useHSMSigning: true
      });

      await hsmIntegration.hsmSign({
        message: message2,
        hsmKeyHandle: keyResult.data!.hsmKeyHandle!,
        keyId: keyResult.data!.keyId,
        useHSMSigning: true
      });

      const auditLog = hsmIntegration.getSignatureAuditLog(keyResult.data!.keyId);
      expect(auditLog.length).toBe(2);
      expect(auditLog[0].messageLength).toBe(3);
      expect(auditLog[1].messageLength).toBe(3);
    });

    test('should rotate HSM keys successfully', async () => {
      const initialKeyResult = await hsmIntegration.generateHSMKeyPair({
        variant: 'Dilithium3',
        classification: 'executive'
      });

      const rotationResult = await hsmIntegration.rotateHSMKeys({
        currentKeyId: initialKeyResult.data!.keyId,
        hsmKeyHandle: initialKeyResult.data!.hsmKeyHandle!,
        newVariant: 'Dilithium5'
      });

      expect(rotationResult.success).toBe(true);
      expect(rotationResult.data?.newKeyId).toBeDefined();
      expect(rotationResult.data?.newKeyId).not.toBe(initialKeyResult.data!.keyId);
      expect(rotationResult.data?.migrationGuide).toBeDefined();
    });
  });

  describe('Utility Functions', () => {
    test('should convert keys to/from PEM format', async () => {
      const keyPair = await dilithium.generateKeyPair({ variant: 'Dilithium3' });

      const publicPEM = DilithiumUtils.keyToPEM(keyPair.publicKey, 'public');
      const privatePEM = DilithiumUtils.keyToPEM(keyPair.privateKey, 'private');

      expect(publicPEM).toContain('-----BEGIN DILITHIUM PUBLIC KEY-----');
      expect(publicPEM).toContain('-----END DILITHIUM PUBLIC KEY-----');
      expect(privatePEM).toContain('-----BEGIN DILITHIUM PRIVATE KEY-----');

      const recoveredPublicKey = DilithiumUtils.pemToKey(publicPEM);
      const recoveredPrivateKey = DilithiumUtils.pemToKey(privatePEM);

      expect(recoveredPublicKey).toEqual(keyPair.publicKey);
      expect(recoveredPrivateKey).toEqual(keyPair.privateKey);
    });

    test('should provide correct security bit estimates', () => {
      expect(DilithiumUtils.getSecurityBits('Dilithium2')).toBe(128);
      expect(DilithiumUtils.getSecurityBits('Dilithium3')).toBe(192);
      expect(DilithiumUtils.getSecurityBits('Dilithium5')).toBe(256);
      expect(DilithiumUtils.getSecurityBits('Unknown')).toBe(0);
    });

    test('should recommend appropriate variants', () => {
      expect(DilithiumUtils.getRecommendedVariant('standard')).toBe('Dilithium2');
      expect(DilithiumUtils.getRecommendedVariant('high')).toBe('Dilithium3');
      expect(DilithiumUtils.getRecommendedVariant('executive')).toBe('Dilithium5');
    });

    test('should validate signature format', async () => {
      const keyPair = await dilithium.generateKeyPair({ variant: 'Dilithium3' });
      const message = new Uint8Array([1, 2, 3]);
      const signResult = await dilithium.sign(message, keyPair.privateKey, keyPair.keyId);

      expect(DilithiumUtils.validateSignatureFormat(signResult.signature)).toBe(true);

      const invalidSignature = new Uint8Array([0x00, 0x01, 0x02]);
      expect(DilithiumUtils.validateSignatureFormat(invalidSignature)).toBe(false);
    });

    test('should extract signature metadata', async () => {
      const keyPair = await dilithium.generateKeyPair({ variant: 'Dilithium3' });
      const message = new Uint8Array([1, 2, 3]);
      const signResult = await dilithium.sign(message, keyPair.privateKey, keyPair.keyId);

      const metadata = DilithiumUtils.extractSignatureMetadata(signResult.signature);
      expect(metadata.algorithm).toBe('Dilithium3');
      expect(metadata.securityLevel).toBe(3);
      expect(metadata.version).toBe(1);
    });
  });

  describe('Benchmark Integration', () => {
    test('should run basic performance benchmark', async () => {
      const benchmark = new DilithiumBenchmark(createDefaultBenchmarkConfig());
      
      // Run a limited benchmark for testing
      const config = {
        ...createDefaultBenchmarkConfig(),
        iterations: 5,
        variants: ['Dilithium3'],
        messageSizes: [256],
        warmupRounds: 2
      };

      const benchmarkLimited = new DilithiumBenchmark(config);
      const suite = await benchmarkLimited.runBenchmarkSuite();

      expect(suite.results.length).toBeGreaterThan(0);
      expect(suite.summary.totalOperations).toBeGreaterThan(0);
      expect(suite.summary.performanceGrade).toMatch(/[A-F]/);
      expect(suite.environment.platform).toBeDefined();
    });

    test('should benchmark all operations', async () => {
      const config = {
        iterations: 3,
        variants: ['Dilithium2'],
        messageSizes: [128],
        concurrency: 2,
        warmupRounds: 1,
        targetLatency: 100
      };

      const benchmark = new DilithiumBenchmark(config);
      const suite = await benchmark.runBenchmarkSuite();

      const operations = suite.results.map(r => r.operation);
      expect(operations).toContain('key_generation');
      expect(operations).toContain('signing');
      expect(operations).toContain('verification');

      // Check that all operations completed successfully
      suite.results.forEach(result => {
        expect(result.successRate).toBeGreaterThan(0);
        expect(result.averageTime).toBeGreaterThan(0);
      });
    });
  });

  describe('Security Validation', () => {
    test('should maintain signature determinism', async () => {
      const keyPair = await dilithium.generateKeyPair({ variant: 'Dilithium3' });
      const message = new Uint8Array([1, 2, 3, 4, 5]);

      const sign1 = await dilithium.sign(message, keyPair.privateKey, keyPair.keyId);
      const sign2 = await dilithium.sign(message, keyPair.privateKey, keyPair.keyId);

      // Signatures should be different due to randomness in signing
      expect(sign1.signature).not.toEqual(sign2.signature);
      
      // But both should verify correctly
      const verify1 = await dilithium.verify(message, sign1.signature, keyPair.publicKey, keyPair.keyId);
      const verify2 = await dilithium.verify(message, sign2.signature, keyPair.publicKey, keyPair.keyId);
      
      expect(verify1.valid).toBe(true);
      expect(verify2.valid).toBe(true);
    });

    test('should resist tampering attempts', async () => {
      const keyPair = await dilithium.generateKeyPair({ variant: 'Dilithium3' });
      const message = new Uint8Array([1, 2, 3, 4, 5]);
      const signResult = await dilithium.sign(message, keyPair.privateKey, keyPair.keyId);

      // Test various tampering scenarios
      const tamperingTests = [
        () => { // Flip random bits
          const tampered = new Uint8Array(signResult.signature);
          tampered[Math.floor(Math.random() * tampered.length)] ^= 0xFF;
          return tampered;
        },
        () => { // Truncate signature
          return signResult.signature.subarray(0, -1);
        },
        () => { // Extend signature
          const extended = new Uint8Array(signResult.signature.length + 10);
          extended.set(signResult.signature);
          return extended;
        }
      ];

      for (const tamperFunc of tamperingTests) {
        const tamperedSignature = tamperFunc();
        
        try {
          const verifyResult = await dilithium.verify(
            message,
            tamperedSignature,
            keyPair.publicKey,
            keyPair.keyId
          );
          expect(verifyResult.valid).toBe(false);
        } catch (error) {
          // Tampering caused verification to fail entirely, which is acceptable
          expect(error).toBeDefined();
        }
      }
    });

    test('should maintain key isolation', async () => {
      const keyPair1 = await dilithium.generateKeyPair({ variant: 'Dilithium3' });
      const keyPair2 = await dilithium.generateKeyPair({ variant: 'Dilithium3' });
      const message = new Uint8Array([1, 2, 3, 4, 5]);

      const signature1 = await dilithium.sign(message, keyPair1.privateKey, keyPair1.keyId);
      
      // Signature from key1 should not verify with key2's public key
      const crossVerify = await dilithium.verify(
        message,
        signature1.signature,
        keyPair2.publicKey,
        keyPair2.keyId
      );

      expect(crossVerify.valid).toBe(false);
    });
  });

  describe('Compliance and Standards', () => {
    test('should follow NIST parameter specifications', () => {
      const variants = [
        { name: 'Dilithium2', level: 2, pubSize: 1312, privSize: 2528, sigSize: 2420 },
        { name: 'Dilithium3', level: 3, pubSize: 1952, privSize: 4000, sigSize: 3293 },
        { name: 'Dilithium5', level: 5, pubSize: 2592, privSize: 4864, sigSize: 4595 }
      ];

      variants.forEach(variant => {
        const params = dilithium.getParameters(variant.name);
        expect(params).toBeDefined();
        expect(params!.securityLevel).toBe(variant.level);
        expect(params!.publicKeySize).toBe(variant.pubSize);
        expect(params!.privateKeySize).toBe(variant.privSize);
        expect(params!.signatureSize).toBe(variant.sigSize);
        expect(params!.seedSize).toBe(32); // Standard seed size
      });
    });

    test('should implement proper key encoding', async () => {
      const keyPair = await dilithium.generateKeyPair({ variant: 'Dilithium5' });

      // Check key format compliance
      expect(keyPair.publicKey[0]).toBe(0x44); // 'D' identifier
      expect(keyPair.publicKey[1]).toBe(5); // Security level
      expect(keyPair.publicKey[2]).toBe(0x01); // Version

      expect(keyPair.privateKey[0]).toBe(0x44); // 'D' identifier
      expect(keyPair.privateKey[1]).toBe(5); // Security level
      expect(keyPair.privateKey[2]).toBe(0x01); // Version

      // Keys should have proper entropy distribution
      const publicEntropy = this.calculateEntropy(keyPair.publicKey.subarray(4));
      const privateEntropy = this.calculateEntropy(keyPair.privateKey.subarray(4));
      
      expect(publicEntropy).toBeGreaterThan(7.0); // High entropy expected
      expect(privateEntropy).toBeGreaterThan(7.0);
    });

    test('should maintain version compatibility', async () => {
      const keyPair = await dilithium.generateKeyPair({ variant: 'Dilithium3' });
      const message = new Uint8Array([1, 2, 3]);
      const signature = await dilithium.sign(message, keyPair.privateKey, keyPair.keyId);

      // Version field should be consistent
      expect(keyPair.publicKey[2]).toBe(0x01);
      expect(keyPair.privateKey[2]).toBe(0x01);
      expect(signature.signature[2]).toBe(0x01);

      // Should be able to verify with version info
      const metadata = DilithiumUtils.extractSignatureMetadata(signature.signature);
      expect(metadata.version).toBe(1);
    });

    // Helper method for entropy calculation
    calculateEntropy(data: Uint8Array): number {
      const freq = new Array(256).fill(0);
      for (const byte of data) {
        freq[byte]++;
      }
      
      let entropy = 0;
      const len = data.length;
      for (const count of freq) {
        if (count > 0) {
          const p = count / len;
          entropy -= p * Math.log2(p);
        }
      }
      
      return entropy;
    }
  });
});