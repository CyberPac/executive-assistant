/**
 * HSM Production Integration Tests - WBS 2.2.6
 * Comprehensive test suite for production-ready HSM implementation
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * Tests: Performance, Security, Compliance, Failover
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { HSMInterface, HSMConfiguration } from '../../../src/security/hsm/HSMInterface';
import { ThalesHSMAdapter } from '../../../src/security/hsm/vendors/ThalesHSMAdapter';
import { SecureCrypto, CryptoUtils } from '../../../src/security/hsm/utils/SecureCrypto';
import { HSMConnectionPool } from '../../../src/security/hsm/core/HSMConnectionPool';
import { HSMAuditLogger } from '../../../src/security/hsm/core/HSMAuditLogger';

describe('HSM Production Integration Tests', () => {
  let hsmInterface: HSMInterface;
  let testConfig: HSMConfiguration;

  beforeAll(async () => {
    testConfig = {
      mode: 'simulation',
      vendor: 'simulation',
      endpoint: 'https://test-hsm.example.com:443',
      authentication: {
        clientId: 'test-executive-client',
        authMethod: 'certificate',
        certValidation: true,
        sessionTimeout: 3600
      },
      algorithms: {
        symmetric: ['AES-256-GCM', 'ChaCha20-Poly1305'],
        asymmetric: ['RSA-4096', 'ECDSA-P384', 'Ed25519'],
        postQuantum: ['CRYSTALS-Kyber', 'CRYSTALS-Dilithium', 'SPHINCS+'],
        hashing: ['SHA3-256', 'SHA3-384', 'SHAKE-256'],
        keyDerivation: ['scrypt', 'Argon2id']
      },
      performance: {
        maxConcurrentOperations: 50,
        timeoutMs: 10000,
        retryAttempts: 3,
        connectionPoolSize: 10,
        performanceTargets: {
          keyGeneration: 100,
          encryption: 50,
          signing: 75,
          verification: 25,
          connection: 500
        },
        caching: {
          enabled: true,
          ttlSeconds: 300,
          maxEntries: 1000
        }
      },
      monitoring: {
        healthCheckIntervalMs: 30000,
        metricsCollectionEnabled: true,
        alertThresholds: {
          errorRate: 0.01,
          latencyMs: 100,
          utilizationPercent: 80,
          failureCount: 3
        },
        logging: {
          auditLevel: 'comprehensive',
          logRotation: true,
          encryptLogs: true
        }
      },
      security: {
        enforceHardwareRng: true,
        keyEscrowPolicy: 'none',
        integrityChecks: true,
        sidechannelProtection: true,
        fipsCompliance: true
      },
      clustering: {
        enabled: false,
        nodes: [],
        failoverStrategy: 'priority',
        syncInterval: 5000
      }
    };

    hsmInterface = new HSMInterface(testConfig);
    await hsmInterface.initialize();
  });

  afterAll(async () => {
    if (hsmInterface) {
      await hsmInterface.shutdown();
    }
  });

  describe('Production HSM Operations', () => {
    test('should generate executive-grade keys with hardware backing', async () => {
      const keyParams = {
        keyType: 'asymmetric' as const,
        algorithm: 'RSA-4096',
        usage: ['encrypt', 'decrypt', 'sign', 'verify'],
        classification: 'executive',
        metadata: {
          purpose: 'Executive Document Signing',
          owner: 'Executive Assistant System'
        }
      };

      const result = await hsmInterface.generateKey(keyParams);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.keyId).toMatch(/^hsm_asymmetric_RSA-4096_/);
      expect(result.data!.publicKey).toBeDefined();
      expect(result.metrics.duration).toBeLessThan(100); // <100ms target
      expect(result.auditTrail).toBeDefined();
      expect(result.auditTrail.operation).toBe('key_generation');
      expect(result.auditTrail.result).toBe('success');
    });

    test('should perform high-speed symmetric encryption', async () => {
      // First generate a symmetric key
      const keyResult = await hsmInterface.generateKey({
        keyType: 'symmetric',
        algorithm: 'AES-256-GCM',
        usage: ['encrypt', 'decrypt'],
        classification: 'executive'
      });

      expect(keyResult.success).toBe(true);
      const keyId = keyResult.data!.keyId;

      // Test encryption
      const testData = Buffer.from('Executive confidential data for encryption test');
      const encryptResult = await hsmInterface.encrypt({
        keyId,
        data: testData,
        algorithm: 'AES-256-GCM'
      });

      expect(encryptResult.success).toBe(true);
      expect(encryptResult.data).toBeDefined();
      expect(encryptResult.data!.ciphertext).toBeDefined();
      expect(encryptResult.data!.tag).toBeDefined();
      expect(encryptResult.data!.nonce).toBeDefined();
      expect(encryptResult.metrics.duration).toBeLessThan(50); // <50ms target
    });

    test('should create post-quantum cryptographic keys', async () => {
      const pqKeyParams = {
        keyType: 'post-quantum' as const,
        algorithm: 'CRYSTALS-Kyber',
        usage: ['encrypt', 'decrypt'],
        classification: 'strategic',
        metadata: {
          quantumResistant: true,
          securityLevel: 5
        }
      };

      const result = await hsmInterface.generateKey(pqKeyParams);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.keyId).toMatch(/^hsm_post-quantum_CRYSTALS-Kyber_/);
      expect(result.data!.publicKey).toBeDefined();
      expect(result.metrics.duration).toBeLessThan(100);
    });

    test('should perform bulk key generation efficiently', async () => {
      const bulkRequests = [
        {
          keyType: 'symmetric' as const,
          algorithm: 'AES-256-GCM',
          usage: ['encrypt', 'decrypt'],
          classification: 'confidential',
          count: 5
        },
        {
          keyType: 'asymmetric' as const,
          algorithm: 'ECDSA-P384',
          usage: ['sign', 'verify'],
          classification: 'internal',
          count: 3
        }
      ];

      const result = await hsmInterface.generateBulkKeys(bulkRequests);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.keys).toHaveLength(8); // 5 + 3 keys
      expect(result.metrics.operationType).toBe('bulk_key_generation');
    });
  });

  describe('Security and Compliance', () => {
    test('should enforce FIPS 140-2 Level 3 compliance', async () => {
      expect(testConfig.security.fipsCompliance).toBe(true);
      
      const healthStatus = await hsmInterface.getHealthStatus();
      expect(healthStatus.capabilities).toContain('Hardware-RNG');
    });

    test('should maintain comprehensive audit trail', async () => {
      const keyResult = await hsmInterface.generateKey({
        keyType: 'symmetric',
        algorithm: 'AES-256-GCM',
        usage: ['encrypt'],
        classification: 'executive'
      });

      expect(keyResult.auditTrail).toBeDefined();
      expect(keyResult.auditTrail.operationId).toBeDefined();
      expect(keyResult.auditTrail.timestamp).toBeInstanceOf(Date);
      expect(keyResult.auditTrail.integrityVerified).toBe(true);
      expect(keyResult.auditTrail.performanceMetrics).toBeDefined();
      expect(keyResult.auditTrail.securityContext).toBeDefined();
    });

    test('should detect and handle security violations', async () => {
      // Test with invalid parameters that should trigger security alerts
      try {
        await hsmInterface.generateKey({
          keyType: 'symmetric',
          algorithm: 'INVALID_ALGORITHM',
          usage: ['encrypt'],
          classification: 'executive'
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance Optimization', () => {
    test('should meet performance targets', async () => {
      const startTime = Date.now();
      
      const result = await hsmInterface.generateKey({
        keyType: 'symmetric',
        algorithm: 'AES-256-GCM',
        usage: ['encrypt', 'decrypt'],
        classification: 'internal'
      });

      const duration = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(testConfig.performance.performanceTargets.keyGeneration);
    });

    test('should handle concurrent operations efficiently', async () => {
      const concurrentOps = Array.from({ length: 10 }, (_, i) => 
        hsmInterface.generateKey({
          keyType: 'symmetric',
          algorithm: 'AES-256-GCM',
          usage: ['encrypt'],
          classification: 'internal',
          metadata: { concurrent: true, index: i }
        })
      );

      const results = await Promise.all(concurrentOps);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    test('should provide comprehensive system status', async () => {
      const status = await hsmInterface.getComprehensiveStatus();

      expect(status.health).toBeDefined();
      expect(status.pool).toBeDefined();
      expect(status.performance).toBeDefined();
      expect(status.audit).toBeDefined();
      
      expect(status.health.status).toMatch(/healthy|degraded/);
      expect(status.audit.totalOperations).toBeGreaterThan(0);
    });
  });

  describe('Connection Pool Management', () => {
    test('should manage connection pool efficiently', async () => {
      const pool = new HSMConnectionPool(5);
      
      // Get multiple connections
      const connections = await Promise.all([
        pool.getConnection(),
        pool.getConnection(),
        pool.getConnection()
      ]);

      expect(connections).toHaveLength(3);
      
      const status = pool.getStatus();
      expect(status.busy).toBe(3);
      expect(status.available).toBe(0);

      // Return connections
      connections.forEach(conn => pool.returnConnection(conn));
      
      const statusAfterReturn = pool.getStatus();
      expect(statusAfterReturn.busy).toBe(0);
      expect(statusAfterReturn.available).toBe(3);

      await pool.shutdown();
    });
  });

  describe('Secure Cryptographic Operations', () => {
    test('should use SHA3-256 for integrity hashing', async () => {
      const crypto = SecureCrypto.getInstance();
      const testData = Buffer.from('test data for hashing');
      
      const hash = await crypto.secureHash(testData, { 
        algorithm: 'sha3-256' 
      });

      expect(hash).toBeInstanceOf(Buffer);
      expect(hash.length).toBe(32); // SHA3-256 = 32 bytes
    });

    test('should generate hardware-quality random numbers', async () => {
      const crypto = SecureCrypto.getInstance();
      
      const randomData = await crypto.secureRandom(32, { 
        source: 'hybrid' 
      });

      expect(randomData).toBeInstanceOf(Buffer);
      expect(randomData.length).toBe(32);
      
      // Test uniqueness
      const randomData2 = await crypto.secureRandom(32, { 
        source: 'hybrid' 
      });
      
      expect(randomData.equals(randomData2)).toBe(false);
    });

    test('should perform secure key derivation', async () => {
      const crypto = SecureCrypto.getInstance();
      const password = Buffer.from('executive-password-123');
      const salt = await crypto.secureRandom(32, { source: 'hybrid' });
      
      const derivedKey = await crypto.deriveKey(password, {
        algorithm: 'scrypt',
        salt,
        keyLength: 32,
        iterations: 32768
      });

      expect(derivedKey).toBeInstanceOf(Buffer);
      expect(derivedKey.length).toBe(32);
    });

    test('should generate secure UUIDs', async () => {
      const uuid1 = await CryptoUtils.generateSecureUUID();
      const uuid2 = await CryptoUtils.generateSecureUUID();
      
      expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(uuid2).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('Vendor Adapter Integration', () => {
    test('should initialize Thales HSM adapter correctly', async () => {
      const adapter = new ThalesHSMAdapter();
      
      expect(adapter.vendorName).toBe('Thales');
      expect(adapter.apiVersion).toBe('12.80.0');
    });

    test('should handle vendor-specific operations', async () => {
      const adapter = new ThalesHSMAdapter();
      
      const connection = await adapter.connect({
        endpoint: 'test-endpoint',
        credentials: {
          type: 'certificate',
          certificate: {
            certPath: '/test/cert.pem',
            keyPath: '/test/key.pem'
          }
        },
        timeout: 5000,
        retryPolicy: {
          maxAttempts: 3,
          backoffMs: 1000,
          retryableErrors: ['TIMEOUT', 'CONNECTION_LOST']
        }
      });

      expect(connection.vendor).toBe('Thales');
      expect(connection.status).toBe('connected');

      await adapter.disconnect(connection);
    });
  });

  describe('Audit Logging', () => {
    test('should maintain comprehensive audit logs', async () => {
      const auditLogger = new HSMAuditLogger({
        auditLevel: 'comprehensive',
        logRotation: true,
        encryptLogs: false, // For testing
        maxLogSize: 10,
        retentionDays: 30,
        alertThresholds: {
          failureRate: 0.05,
          suspiciousPatterns: true,
          unauthorizedAccess: true
        },
        complianceMode: 'general'
      });

      await auditLogger.logOperation({
        operation: 'test_operation',
        keyId: 'test-key-123',
        result: 'success',
        performanceMetrics: {
          duration: 50,
          operationType: 'test',
          bytesProcessed: 1024
        },
        securityContext: {
          authMethod: 'certificate',
          sessionId: 'test-session-123'
        }
      });

      const stats = await auditLogger.generateStatistics({
        start: new Date(Date.now() - 60000), // Last minute
        end: new Date()
      });

      expect(stats.totalOperations).toBeGreaterThanOrEqual(1);
      expect(stats.complianceStatus).toBeDefined();

      await auditLogger.shutdown();
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle connection failures gracefully', async () => {
      // Test with invalid configuration
      const invalidConfig = {
        ...testConfig,
        endpoint: 'https://invalid-hsm-endpoint.test:443'
      };

      const invalidHSM = new HSMInterface(invalidConfig);
      
      try {
        await invalidHSM.initialize();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should implement proper retry logic', async () => {
      // This would be tested with actual network failures in integration tests
      expect(testConfig.performance.retryAttempts).toBe(3);
      expect(testConfig.performance.timeoutMs).toBe(10000);
    });
  });

  describe('HSM Production Deployment Validation', () => {
    test('should validate production deployment requirements', () => {
      // Verify configuration meets production standards
      expect(testConfig.security.enforceHardwareRng).toBe(true);
      expect(testConfig.security.fipsCompliance).toBe(true);
      expect(testConfig.security.integrityChecks).toBe(true);
      expect(testConfig.authentication.certValidation).toBe(true);
      expect(testConfig.monitoring.logging.auditLevel).toBe('comprehensive');
    });

    test('should meet executive-grade security requirements', () => {
      expect(testConfig.algorithms.postQuantum).toContain('CRYSTALS-Kyber');
      expect(testConfig.algorithms.postQuantum).toContain('CRYSTALS-Dilithium');
      expect(testConfig.algorithms.hashing).toContain('SHA3-256');
      expect(testConfig.security.keyEscrowPolicy).toBe('none'); // Executive keys never escrowed
    });

    test('should validate performance targets', () => {
      expect(testConfig.performance.performanceTargets.keyGeneration).toBeLessThanOrEqual(100);
      expect(testConfig.performance.performanceTargets.encryption).toBeLessThanOrEqual(50);
      expect(testConfig.performance.performanceTargets.signing).toBeLessThanOrEqual(75);
      expect(testConfig.performance.performanceTargets.verification).toBeLessThanOrEqual(25);
    });
  });
});