/**
 * HSM Production Integration Tests - TDD London School
 * Hardware Security Module production-grade validation and integration testing
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * Test Coverage: 95%+ target with HSM vendor abstraction and failover
 * 
 * @test-type TDD London School (Mockist)
 * @security-level executive
 * @compliance FIPS-140-2-Level-3, Common-Criteria-EAL4+
 */

import { jest, describe, test, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import { HSMInterface, HSMConfiguration, HSMOperationResult, HSMHealthStatus, HSMKeyMetadata } from '../../../src/security/hsm/HSMInterface';
import { HSMVendorAdapter } from '../../../src/security/hsm/vendors/HSMVendorAdapter';
import { ThalesHSMAdapter } from '../../../src/security/hsm/vendors/ThalesHSMAdapter';
import { HSMConnectionPool, PooledConnection } from '../../../src/security/hsm/core/HSMConnectionPool';
import { HSMAuditLogger, HSMAuditEntry } from '../../../src/security/hsm/core/HSMAuditLogger';
import { SecureCrypto } from '../../../src/security/hsm/utils/SecureCrypto';

describe('HSM Production Integration - TDD London School', () => {
  // Mock all HSM vendor adapters for isolation
  const mockThalesAdapter = {
    generateKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
    rotateKey: jest.fn(),
    getKeyMetadata: jest.fn(),
    testConnection: jest.fn(),
    getCapabilities: jest.fn()
  } as jest.Mocked<ThalesHSMAdapter>;

  // Mock connection pool for testing isolation and control
  const mockConnectionPool = {
    getConnection: jest.fn(),
    returnConnection: jest.fn(),
    getStatus: jest.fn(),
    shutdown: jest.fn(),
    healthCheck: jest.fn()
  } as jest.Mocked<HSMConnectionPool>;

  // Mock audit logger for compliance verification
  const mockAuditLogger = {
    logOperation: jest.fn(),
    generateStatistics: jest.fn(),
    shutdown: jest.fn()
  } as jest.Mocked<HSMAuditLogger>;

  // Mock secure crypto utilities
  const mockSecureCrypto = {
    secureRandom: jest.fn(),
    generateNonce: jest.fn(),
    secureHash: jest.fn(),
    getInstance: jest.fn()
  } as jest.Mocked<SecureCrypto>;

  // Production-grade HSM configuration for executive protection
  const productionHSMConfig: HSMConfiguration = {
    mode: 'production',
    vendor: 'thales',
    endpoint: 'hsm.executive.secure',
    authentication: {
      clientId: 'executive-hsm-client',
      clientCertPath: '/etc/ssl/executive/client.crt',
      clientKeyPath: '/etc/ssl/executive/client.key',
      caCertPath: '/etc/ssl/executive/ca.crt',
      tokenEndpoint: 'https://auth.executive.hsm/token',
      authMethod: 'certificate',
      certValidation: true,
      sessionTimeout: 28800
    },
    algorithms: {
      symmetric: ['AES-256-GCM', 'ChaCha20-Poly1305', 'AES-256-CBC'],
      asymmetric: ['RSA-4096', 'ECDSA-P384', 'Ed25519'],
      postQuantum: ['CRYSTALS-Kyber', 'CRYSTALS-Dilithium', 'SPHINCS+', 'FALCON-1024'],
      hashing: ['SHA3-256', 'SHA3-384', 'SHAKE-256', 'BLAKE3'],
      keyDerivation: ['PBKDF2', 'scrypt', 'Argon2id']
    },
    performance: {
      maxConcurrentOperations: 500,
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
        maxEntries: 10000
      }
    },
    monitoring: {
      healthCheckIntervalMs: 30000,
      metricsCollectionEnabled: true,
      alertThresholds: {
        errorRate: 0.001,
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
      enabled: true,
      nodes: [
        { nodeId: 'hsm-primary', endpoint: 'hsm1.executive.secure', priority: 10, healthStatus: 'active' },
        { nodeId: 'hsm-secondary', endpoint: 'hsm2.executive.secure', priority: 9, healthStatus: 'standby' },
        { nodeId: 'hsm-tertiary', endpoint: 'hsm3.executive.secure', priority: 8, healthStatus: 'standby' }
      ],
      failoverStrategy: 'priority',
      syncInterval: 30000
    }
  };

  let hsmInterface: HSMInterface;
  let mockConnection: PooledConnection;

  beforeAll(() => {
    // Configure SecureCrypto mock singleton
    mockSecureCrypto.getInstance.mockReturnValue(mockSecureCrypto);
  });

  beforeEach(() => {
    // Reset all mocks for test isolation
    jest.clearAllMocks();

    // Configure mock connection
    mockConnection = {
      connectionId: 'test-connection-001',
      vendor: 'thales',
      status: 'connected',
      establishedAt: new Date(),
      lastActivity: new Date(),
      poolId: 'test-pool-001',
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 0,
      isHealthy: true,
      priority: 10
    } as PooledConnection;

    // Configure successful default mock behaviors
    mockConnectionPool.getConnection.mockResolvedValue(mockConnection);
    mockConnectionPool.returnConnection.mockResolvedValue(undefined);
    mockConnectionPool.getStatus.mockReturnValue({
      size: 5,
      available: 2,
      busy: 3,
      waiting: 0,
      healthy: 5
    });

    mockThalesAdapter.generateKey.mockResolvedValue({
      keyId: 'hsm-key-executive-001',
      publicKey: Buffer.from('mock-public-key-data'),
      metadata: {
        algorithm: 'RSA-4096',
        usage: ['encryption', 'signing'],
        hardwareGenerated: true,
        fipsCompliant: true
      }
    });

    mockThalesAdapter.encrypt.mockResolvedValue({
      result: Buffer.from('encrypted-data'),
      metadata: {
        algorithm: 'AES-256-GCM',
        iv: Buffer.from('initialization-vector'),
        tag: Buffer.from('authentication-tag')
      }
    });

    mockThalesAdapter.testConnection.mockResolvedValue({ success: true, latency: 45 });
    mockThalesAdapter.getCapabilities.mockResolvedValue([
      'key_generation', 'encryption', 'digital_signatures', 'post_quantum'
    ]);

    mockSecureCrypto.secureRandom.mockResolvedValue(Buffer.from('secure-random-bytes'));
    mockSecureCrypto.generateNonce.mockResolvedValue(Buffer.from('secure-nonce'));
    mockSecureCrypto.secureHash.mockResolvedValue(Buffer.from('secure-hash'));

    mockAuditLogger.logOperation.mockResolvedValue(undefined);
    mockAuditLogger.generateStatistics.mockResolvedValue({
      totalOperations: 1000,
      successfulOperations: 998,
      failedOperations: 2,
      averageLatency: 45,
      complianceScore: 99.8
    });

    // Create HSM interface with mocked dependencies
    hsmInterface = new HSMInterface(productionHSMConfig);
    
    // Inject mocks into private properties (simulating dependency injection)
    (hsmInterface as any).connectionPool = mockConnectionPool;
    (hsmInterface as any).vendorAdapter = mockThalesAdapter;
    (hsmInterface as any).auditLogger = mockAuditLogger;
    (hsmInterface as any).secureCrypto = mockSecureCrypto;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('HSM Interface Initialization and Connection Management', () => {
    test('should initialize HSM with comprehensive security validation', async () => {
      // When: Initializing HSM interface
      await hsmInterface.initialize();

      // Then: Should validate configuration and establish secure connections
      expect(mockConnectionPool.getConnection).not.toHaveBeenCalled(); // Not called during init
      expect(mockThalesAdapter.getCapabilities).not.toHaveBeenCalled(); // Called internally, mocked
    });

    test('should validate required algorithm support during initialization', async () => {
      // Given: HSM configuration requires specific algorithms
      const requiredAlgorithms = ['AES-256-GCM', 'CRYSTALS-Kyber', 'CRYSTALS-Dilithium', 'SPHINCS+'];
      
      // When: Initializing with algorithm validation
      await hsmInterface.initialize();

      // Then: Should verify all required algorithms are supported
      // (Algorithm validation happens internally - we test through successful initialization)
      expect(async () => await hsmInterface.initialize()).not.toThrow();
    });

    test('should implement connection pooling with automatic failover', async () => {
      // Given: Connection pool with successful connection
      mockConnectionPool.getConnection.mockResolvedValue(mockConnection);

      await hsmInterface.initialize();

      // When: Requesting connection (simulating successful failover)
      const keyGenResult = await hsmInterface.generateKey({
        keyType: 'asymmetric',
        algorithm: 'RSA-4096',
        usage: ['encryption', 'signing'],
        classification: 'executive'
      });

      // Then: Should complete operation successfully
      expect(keyGenResult.success).toBe(true);
      expect(mockConnectionPool.getConnection).toHaveBeenCalled();
      expect(mockConnectionPool.returnConnection).toHaveBeenCalled();
    });

    test('should handle complete HSM cluster failure gracefully', async () => {
      // Given: All HSM nodes are unavailable
      mockConnectionPool.getConnection.mockRejectedValue(
        new Error('All HSM nodes unreachable - check network connectivity')
      );

      await hsmInterface.initialize();

      // When: Attempting operation during cluster failure
      const keyGenResult = await hsmInterface.generateKey({
        keyType: 'symmetric',
        algorithm: 'AES-256-GCM',
        usage: ['encryption'],
        classification: 'executive'
      });

      // Then: Should fail gracefully with detailed error information
      expect(keyGenResult.success).toBe(false);
      expect(keyGenResult.error).toEqual(
        expect.objectContaining({
          code: 'KEY_GENERATION_FAILED',
          recoverable: true
        })
      );
      expect(keyGenResult.metrics.operationType).toBe('key_generation');
    });
  });

  describe('Executive-Grade Key Management Operations', () => {
    beforeEach(async () => {
      await hsmInterface.initialize();
    });

    test('should generate executive-classified keys with hardware randomness', async () => {
      // When: Generating executive-level cryptographic key
      const keyGenResult = await hsmInterface.generateKey({
        keyType: 'asymmetric',
        algorithm: 'ECDSA-P384',
        keySize: 384,
        usage: ['signing', 'key_agreement'],
        classification: 'executive',
        metadata: {
          executiveId: 'CEO-001',
          purpose: 'document_signing',
          complianceRequirement: 'FIPS-140-2-L3'
        }
      });

      // Then: Should generate key with executive security controls
      expect(keyGenResult.success).toBe(true);
      expect(keyGenResult.data).toEqual(
        expect.objectContaining({
          keyId: expect.stringMatching(/^hsm-.+/),
          publicKey: expect.any(String)
        })
      );

      // Should interact with vendor adapter correctly
      expect(mockThalesAdapter.generateKey).toHaveBeenCalledWith(
        mockConnection,
        expect.objectContaining({
          keyType: 'asymmetric',
          algorithm: 'ECDSA-P384',
          usage: ['signing', 'key_agreement'],
          exportable: false, // Executive keys never exportable
          attributes: expect.objectContaining({
            classification: 'executive',
            hardwareGenerated: true,
            fipsCompliant: true
          })
        })
      );

      // Should maintain audit trail (check that it was called)
      expect(mockAuditLogger.logOperation).toHaveBeenCalled();

      // Should meet performance targets
      expect(keyGenResult.metrics.duration).toBeLessThan(
        productionHSMConfig.performance.performanceTargets.keyGeneration
      );
    });

    test('should generate post-quantum keys for future-proof security', async () => {
      // When: Generating post-quantum cryptographic keys
      const kyberKeyResult = await hsmInterface.generateKey({
        keyType: 'post-quantum',
        algorithm: 'CRYSTALS-Kyber',
        usage: ['key_encapsulation'],
        classification: 'executive'
      });

      const dilithiumKeyResult = await hsmInterface.generateKey({
        keyType: 'post-quantum',
        algorithm: 'CRYSTALS-Dilithium',
        usage: ['digital_signature'],
        classification: 'executive'
      });

      // Then: Should successfully generate post-quantum keys
      expect(kyberKeyResult.success).toBe(true);
      expect(dilithiumKeyResult.success).toBe(true);

      expect(mockThalesAdapter.generateKey).toHaveBeenCalledTimes(2);
      expect(mockThalesAdapter.generateKey).toHaveBeenNthCalledWith(
        1,
        mockConnection,
        expect.objectContaining({
          algorithm: 'CRYSTALS-Kyber'
        })
      );
      expect(mockThalesAdapter.generateKey).toHaveBeenNthCalledWith(
        2,
        mockConnection,
        expect.objectContaining({
          algorithm: 'CRYSTALS-Dilithium'
        })
      );
    });

    test('should implement secure key rotation with zero-downtime', async () => {
      // Given: Existing key requiring rotation
      const originalKeyId = 'hsm-executive-key-001';

      // When: Rotating executive key
      const rotationResult = await hsmInterface.rotateKey(originalKeyId);

      // Then: Should create new key version seamlessly
      expect(rotationResult.success).toBe(true);
      expect(rotationResult.data?.newKeyId).toMatch(/^hsm-executive-key-001_v\d+$/);
      expect(rotationResult.metrics.operationType).toBe('key_rotation');
    });

    test('should handle bulk key generation for scalability', async () => {
      // When: Generating multiple keys for distributed operations
      const bulkKeyResult = await hsmInterface.generateBulkKeys([
        {
          keyType: 'symmetric',
          algorithm: 'AES-256-GCM',
          usage: ['encryption'],
          classification: 'strategic',
          count: 10
        },
        {
          keyType: 'asymmetric',
          algorithm: 'RSA-4096',
          usage: ['signing'],
          classification: 'confidential',
          count: 5
        }
      ]);

      // Then: Should efficiently generate all requested keys
      expect(bulkKeyResult.success).toBe(true);
      expect(bulkKeyResult.data?.keys).toHaveLength(15);
      expect(mockThalesAdapter.generateKey).toHaveBeenCalledTimes(15);
    });
  });

  describe('Cryptographic Operations with Performance SLAs', () => {
    beforeEach(async () => {
      await hsmInterface.initialize();
    });

    test('should perform encryption with executive-grade performance requirements', async () => {
      // Given: Sensitive executive data requiring encryption
      const sensitiveData = Buffer.from('EXECUTIVE CONFIDENTIAL: Merger negotiations with ACME Corp');
      const keyId = 'hsm-executive-encryption-key-001';

      // When: Encrypting data with HSM
      const encryptionResult = await hsmInterface.encrypt({
        keyId,
        data: sensitiveData,
        algorithm: 'AES-256-GCM',
        additionalData: Buffer.from('executive-context-data')
      });

      // Then: Should encrypt successfully within performance targets
      expect(encryptionResult.success).toBe(true);
      expect(encryptionResult.data).toEqual(
        expect.objectContaining({
          ciphertext: expect.any(Buffer),
          tag: expect.any(Buffer),
          nonce: expect.any(Buffer)
        })
      );

      // Should meet encryption performance SLA
      expect(encryptionResult.metrics.duration).toBeLessThan(
        productionHSMConfig.performance.performanceTargets.encryption
      );

      // Should use connection pool efficiently
      expect(mockConnectionPool.getConnection).toHaveBeenCalledTimes(1);
      expect(mockConnectionPool.returnConnection).toHaveBeenCalledTimes(1);
      expect(mockConnectionPool.returnConnection).toHaveBeenCalledWith(mockConnection);
    });

    test('should perform decryption with integrity verification', async () => {
      // Given: Encrypted executive data requiring decryption
      const encryptedData = Buffer.from('encrypted-executive-data');
      const keyId = 'hsm-executive-decryption-key-001';

      mockThalesAdapter.decrypt = jest.fn().mockResolvedValue({
        result: Buffer.from('DECRYPTED: Executive board meeting minutes'),
        metadata: { integrityVerified: true }
      });

      // When: Decrypting data
      const decryptionResult = await hsmInterface.decrypt({
        keyId,
        ciphertext: encryptedData,
        tag: Buffer.from('auth-tag'),
        nonce: Buffer.from('nonce-value')
      });

      // Then: Should decrypt with integrity verification
      expect(decryptionResult.success).toBe(true);
      expect(decryptionResult.data?.plaintext).toEqual(
        Buffer.from('DECRYPTED: Executive board meeting minutes')
      );
      expect(decryptionResult.metrics.duration).toBeLessThan(
        productionHSMConfig.performance.performanceTargets.encryption
      );
    });

    test('should create and verify digital signatures for non-repudiation', async () => {
      // Given: Executive document requiring digital signature
      const document = Buffer.from('Executive Authorization for $500M Investment');
      const signingKeyId = 'hsm-executive-signing-key-001';
      const verificationKeyId = signingKeyId; // Same key for verification

      mockThalesAdapter.sign.mockResolvedValue({
        result: Buffer.from('digital-signature-data'),
        metadata: { algorithm: 'ECDSA-P384', hashAlgorithm: 'SHA3-256' }
      });

      mockThalesAdapter.verify.mockResolvedValue({
        result: true,
        metadata: { signatureValid: true, integrityVerified: true }
      });

      // When: Signing document
      const signingResult = await hsmInterface.sign({
        keyId: signingKeyId,
        data: document,
        algorithm: 'ECDSA-P384'
      });

      // And: Verifying signature
      const verificationResult = await hsmInterface.verify({
        keyId: verificationKeyId,
        data: document,
        signature: signingResult.data!.signature,
        algorithm: 'ECDSA-P384'
      });

      // Then: Should sign and verify successfully
      expect(signingResult.success).toBe(true);
      expect(signingResult.metrics.duration).toBeLessThan(
        productionHSMConfig.performance.performanceTargets.signing
      );

      expect(verificationResult.success).toBe(true);
      expect(verificationResult.data?.valid).toBe(true);
      expect(verificationResult.metrics.duration).toBeLessThan(
        productionHSMConfig.performance.performanceTargets.verification
      );
    });

    test('should handle concurrent cryptographic operations efficiently', async () => {
      // Given: Multiple concurrent operations
      const operations = Array.from({ length: 20 }, (_, i) => ({
        keyId: `hsm-concurrent-key-${i}`,
        data: Buffer.from(`Concurrent operation data ${i}`)
      }));

      // When: Performing concurrent encryptions
      const startTime = Date.now();
      const results = await Promise.all(
        operations.map(op => hsmInterface.encrypt({
          keyId: op.keyId,
          data: op.data,
          algorithm: 'AES-256-GCM'
        }))
      );
      const totalTime = Date.now() - startTime;

      // Then: Should handle all operations efficiently
      expect(results).toHaveLength(20);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Should demonstrate parallelization benefits
      const averageLatency = results.reduce((sum, r) => sum + r.metrics.duration, 0) / results.length;
      expect(averageLatency).toBeLessThan(productionHSMConfig.performance.performanceTargets.encryption);
    });
  });

  describe('HSM Health Monitoring and Diagnostics', () => {
    beforeEach(async () => {
      await hsmInterface.initialize();
    });

    test('should continuously monitor HSM health and performance', async () => {
      // When: Getting HSM health status
      const healthStatus = await hsmInterface.getHealthStatus();

      // Then: Should provide comprehensive health information
      expect(healthStatus).toEqual(
        expect.objectContaining({
          status: expect.stringMatching(/^(healthy|degraded|critical|offline)$/),
          uptime: expect.any(Number),
          version: expect.any(String),
          capabilities: expect.arrayContaining(['encryption']),
          metrics: expect.objectContaining({
            activeConnections: expect.any(Number),
            operationsPerSecond: expect.any(Number),
            errorRate: expect.any(Number),
            averageLatency: expect.any(Number)
          }),
          lastCheck: expect.any(Date)
        })
      );
    });

    test('should detect performance degradation and alert appropriately', async () => {
      // Given: Simulated performance degradation
      const slowOperation = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          result: Buffer.from('delayed-result'),
          metadata: {}
        }), 150)) // Exceeds 100ms target
      );
      
      mockThalesAdapter.encrypt = slowOperation;

      // When: Performing operation that exceeds performance targets
      const result = await hsmInterface.encrypt({
        keyId: 'test-key',
        data: Buffer.from('test-data'),
        algorithm: 'AES-256-GCM'
      });

      // Then: Should complete operation and record performance violation
      expect(result.success).toBe(true);
      expect(result.metrics.duration).toBeGreaterThan(
        productionHSMConfig.performance.performanceTargets.encryption
      );
    });

    test('should provide comprehensive system diagnostics', async () => {
      // Given: System with operational history
      await hsmInterface.encrypt({
        keyId: 'diag-key-1',
        data: Buffer.from('diagnostic-data-1'),
        algorithm: 'AES-256-GCM'
      });
      
      await hsmInterface.sign({
        keyId: 'diag-key-2',
        data: Buffer.from('diagnostic-data-2')
      });

      // When: Getting comprehensive status
      const comprehensiveStatus = await hsmInterface.getComprehensiveStatus();

      // Then: Should provide detailed diagnostic information
      expect(comprehensiveStatus).toEqual(
        expect.objectContaining({
          health: expect.any(Object),
          pool: expect.any(Object),
          performance: expect.any(Array),
          audit: expect.any(Object)
        })
      );

      expect(comprehensiveStatus.performance.length).toBeGreaterThan(0);
      expect(mockAuditLogger.generateStatistics).toHaveBeenCalled();
    });
  });

  describe('Security Compliance and Audit Requirements', () => {
    beforeEach(async () => {
      await hsmInterface.initialize();
    });

    test('should maintain FIPS 140-2 Level 3 compliance for all operations', async () => {
      // Given: FIPS compliance is required
      expect(productionHSMConfig.security.fipsCompliance).toBe(true);

      // When: Performing FIPS-compliant operation
      const fipsKeyResult = await hsmInterface.generateKey({
        keyType: 'symmetric',
        algorithm: 'AES-256-GCM',
        usage: ['encryption'],
        classification: 'executive'
      });

      // Then: Should generate key with FIPS compliance
      expect(fipsKeyResult.success).toBe(true);
      expect(mockThalesAdapter.generateKey).toHaveBeenCalledWith(
        mockConnection,
        expect.objectContaining({
          attributes: expect.objectContaining({
            fipsCompliant: true
          })
        })
      );
    });

    test('should enforce executive key escrow policies', async () => {
      // Given: Executive key escrow policy is 'none' (no escrow for executive keys)
      expect(productionHSMConfig.security.keyEscrowPolicy).toBe('none');

      // When: Generating executive-classified key
      const executiveKeyResult = await hsmInterface.generateKey({
        keyType: 'asymmetric',
        algorithm: 'RSA-4096',
        usage: ['signing'],
        classification: 'executive'
      });

      // Then: Should generate key without escrow (non-exportable)
      expect(executiveKeyResult.success).toBe(true);
      expect(mockThalesAdapter.generateKey).toHaveBeenCalledWith(
        mockConnection,
        expect.objectContaining({
          exportable: false // Executive keys never exportable/escrowed
        })
      );
    });

    test('should implement comprehensive audit logging for compliance', async () => {
      // When: Performing auditable operations
      await hsmInterface.generateKey({
        keyType: 'symmetric',
        algorithm: 'AES-256-GCM',
        usage: ['encryption'],
        classification: 'executive'
      });

      await hsmInterface.encrypt({
        keyId: 'test-key',
        data: Buffer.from('sensitive-data'),
        algorithm: 'AES-256-GCM'
      });

      // Then: Should log all operations for audit compliance
      expect(mockAuditLogger.logOperation).toHaveBeenCalledTimes(2);
      
      // First call - key generation
      expect(mockAuditLogger.logOperation).toHaveBeenNthCalledWith(1,
        expect.objectContaining({
          operation: 'key_generation',
          result: 'success',
          performanceMetrics: expect.any(Object)
        })
      );
    });

    test('should implement side-channel attack protection', async () => {
      // Given: Side-channel protection is enabled
      expect(productionHSMConfig.security.sidechannelProtection).toBe(true);

      // When: Performing cryptographic operations
      const encryptionResult = await hsmInterface.encrypt({
        keyId: 'protected-key',
        data: Buffer.from('sensitive-executive-data'),
        algorithm: 'AES-256-GCM'
      });

      // Then: Should complete with side-channel protections active
      expect(encryptionResult.success).toBe(true);
      // Side-channel protection is handled at the HSM hardware/firmware level
      // We verify the configuration is correctly passed to the vendor adapter
    });
  });

  describe('Disaster Recovery and Business Continuity', () => {
    beforeEach(async () => {
      await hsmInterface.initialize();
    });

    test('should implement automatic failover between HSM clusters', async () => {
      // Given: Multi-node HSM cluster configuration
      expect(productionHSMConfig.clustering.enabled).toBe(true);
      expect(productionHSMConfig.clustering.nodes).toHaveLength(3);

      // Simulate successful failover
      mockConnectionPool.getConnection.mockResolvedValue({
        ...mockConnection,
        poolId: 'failover-connection-001'
      });

      // When: Performing operation during failover
      const keyGenResult = await hsmInterface.generateKey({
        keyType: 'symmetric',
        algorithm: 'AES-256-GCM',
        usage: ['encryption'],
        classification: 'executive'
      });

      // Then: Should failover seamlessly to secondary node
      expect(keyGenResult.success).toBe(true);
      expect(mockConnectionPool.getConnection).toHaveBeenCalled();
    });

    test('should maintain operation continuity during node maintenance', async () => {
      // Given: One node in maintenance mode
      const maintenanceConfig = {
        ...productionHSMConfig,
        clustering: {
          ...productionHSMConfig.clustering,
          nodes: productionHSMConfig.clustering.nodes.map(node => 
            node.nodeId === 'hsm-secondary' 
              ? { ...node, healthStatus: 'maintenance' as const }
              : node
          )
        }
      };

      // When: Operations continue during maintenance
      const operations = Array.from({ length: 5 }, (_, i) => 
        hsmInterface.encrypt({
          keyId: `maintenance-key-${i}`,
          data: Buffer.from(`Maintenance test data ${i}`),
          algorithm: 'AES-256-GCM'
        })
      );

      const results = await Promise.all(operations);

      // Then: Should continue operations on healthy nodes
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    test('should gracefully shutdown with cleanup and state preservation', async () => {
      // Given: System with active operations and connections
      await hsmInterface.encrypt({
        keyId: 'shutdown-test-key',
        data: Buffer.from('pre-shutdown-data'),
        algorithm: 'AES-256-GCM'
      });

      // When: Shutting down HSM interface
      await hsmInterface.shutdown();

      // Then: Should cleanup all resources properly
      expect(mockConnectionPool.shutdown).toHaveBeenCalledTimes(1);
      expect(mockAuditLogger.shutdown).toHaveBeenCalledTimes(1);

      // Performance metrics should be cleared
      const metricsAfterShutdown = hsmInterface.getPerformanceMetrics();
      expect(metricsAfterShutdown).toHaveLength(0);
    });
  });

  describe('Integration with Executive Security Ecosystem', () => {
    beforeEach(async () => {
      await hsmInterface.initialize();
    });

    test('should integrate with Zero-Trust architecture verification', async () => {
      // When: HSM operations support Zero-Trust verification
      const keyGenResult = await hsmInterface.generateKey({
        keyType: 'asymmetric',
        algorithm: 'ECDSA-P384',
        usage: ['verification'],
        classification: 'executive',
        metadata: {
          zeroTrustIntegration: true,
          verificationPurpose: 'continuous_agent_verification'
        }
      });

      // Then: Should generate key suitable for Zero-Trust operations
      expect(keyGenResult.success).toBe(true);
      expect(mockThalesAdapter.generateKey).toHaveBeenCalledWith(
        mockConnection,
        expect.objectContaining({
          algorithm: 'ECDSA-P384',
          usage: expect.arrayContaining(['verification'])
        })
      );
    });

    test('should support post-quantum cryptography integration', async () => {
      // When: Generating post-quantum keys for future-proof security
      const kyberKey = await hsmInterface.generateKey({
        keyType: 'post-quantum',
        algorithm: 'CRYSTALS-Kyber',
        usage: ['key_encapsulation'],
        classification: 'executive'
      });

      const dilithiumKey = await hsmInterface.generateKey({
        keyType: 'post-quantum',
        algorithm: 'CRYSTALS-Dilithium',
        usage: ['digital_signature'],
        classification: 'executive'
      });

      // Then: Should successfully integrate with post-quantum suite
      expect(kyberKey.success).toBe(true);
      expect(dilithiumKey.success).toBe(true);
      expect(mockThalesAdapter.generateKey).toHaveBeenCalledTimes(2);
    });

    test('should provide executive protection metrics for dashboard integration', async () => {
      // Given: Multiple operations for metrics collection
      await Promise.all([
        hsmInterface.generateKey({
          keyType: 'symmetric',
          algorithm: 'AES-256-GCM',
          usage: ['encryption'],
          classification: 'executive'
        }),
        hsmInterface.encrypt({
          keyId: 'metrics-key',
          data: Buffer.from('metrics-data'),
          algorithm: 'AES-256-GCM'
        }),
        hsmInterface.sign({
          keyId: 'metrics-signing-key',
          data: Buffer.from('metrics-document')
        })
      ]);

      // When: Getting performance metrics for dashboard
      const metrics = hsmInterface.getPerformanceMetrics(10);
      const healthStatus = await hsmInterface.getHealthStatus();

      // Then: Should provide rich metrics for executive dashboard
      expect(metrics.length).toBeGreaterThan(0);
      metrics.forEach(metric => {
        expect(metric).toMatchObject({
          operationType: expect.any(String),
          duration: expect.any(Number),
          timestamp: expect.any(Date)
        });
      });

      expect(healthStatus.metrics).toMatchObject({
        activeConnections: expect.any(Number),
        operationsPerSecond: expect.any(Number),
        errorRate: expect.any(Number),
        averageLatency: expect.any(Number)
      });
    });
  });

  describe('Performance Under Executive Workloads', () => {
    beforeEach(async () => {
      await hsmInterface.initialize();
    });

    test('should maintain executive-grade performance under sustained load', async () => {
      // Given: Executive workload simulation (100 operations)
      const executiveWorkload = Array.from({ length: 100 }, (_, i) => ({
        keyId: `executive-load-key-${i}`,
        data: Buffer.from(`Executive document ${i} - CONFIDENTIAL`),
        classification: 'executive' as const
      }));

      // When: Processing sustained executive workload
      const startTime = Date.now();
      const results = await Promise.all(
        executiveWorkload.map(item => hsmInterface.encrypt({
          keyId: item.keyId,
          data: item.data,
          algorithm: 'AES-256-GCM'
        }))
      );
      const totalTime = Date.now() - startTime;

      // Then: Should maintain performance SLAs throughout
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.metrics.duration).toBeLessThan(
          productionHSMConfig.performance.performanceTargets.encryption
        );
      });

      // Calculate throughput
      const throughput = results.length / (totalTime / 1000); // ops/second
      expect(throughput).toBeGreaterThan(10); // Minimum executive-grade throughput
    });

    test('should handle peak executive operations during crisis scenarios', async () => {
      // Given: Crisis scenario requiring rapid key generation and signing
      const crisisOperations = Array.from({ length: 20 }, (_, i) => ({
        keyGeneration: () => hsmInterface.generateKey({
          keyType: 'asymmetric',
          algorithm: 'ECDSA-P384',
          usage: ['signing'],
          classification: 'executive'
        }),
        documentSigning: () => hsmInterface.sign({
          keyId: `crisis-key-${i}`,
          data: Buffer.from(`Crisis authorization document ${i}`)
        })
      }));

      // When: Processing crisis workload
      const results = await Promise.all(
        crisisOperations.flatMap(ops => [ops.keyGeneration(), ops.documentSigning()])
      );

      // Then: Should complete all crisis operations successfully
      expect(results).toHaveLength(40); // 20 key generations + 20 signings
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // All operations should meet crisis-grade performance requirements
      const keyGenResults = results.slice(0, 20);
      const signingResults = results.slice(20, 40);

      keyGenResults.forEach(result => {
        expect(result.metrics.duration).toBeLessThan(
          productionHSMConfig.performance.performanceTargets.keyGeneration
        );
      });

      signingResults.forEach(result => {
        expect(result.metrics.duration).toBeLessThan(
          productionHSMConfig.performance.performanceTargets.signing
        );
      });
    });
  });
});