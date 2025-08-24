/**
 * Production HSM Configuration - WBS 2.2.7
 * Executive-grade HSM configuration for production deployment
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * Environment: Production
 * Compliance: SOX, HIPAA, PCI-DSS, FIPS 140-2 Level 3
 */

import { HSMConfiguration } from '../HSMInterface';
import * as path from 'path';
const _path = path; // Prevent unused import warning

/**
 * Production HSM Configuration Factory
 * Creates environment-specific configurations for different deployment scenarios
 */
export class ProductionHSMConfigFactory {
  
  /**
   * Executive Assistant Production Configuration
   * Highest security level for executive operations
   */
  static createExecutiveConfig(): HSMConfiguration {
    return {
      mode: 'production',
      vendor: 'thales', // Primary vendor for executive operations
      endpoint: process.env.HSM_ENDPOINT || 'https://hsm-executive.internal:9000',
      
      authentication: {
        clientId: 'executive-assistant-prod',
        clientCertPath: process.env.HSM_CLIENT_CERT_PATH || '/opt/certs/executive-hsm-client.pem',
        clientKeyPath: process.env.HSM_CLIENT_KEY_PATH || '/opt/certs/executive-hsm-client-key.pem',
        caCertPath: process.env.HSM_CA_CERT_PATH || '/opt/certs/hsm-ca.pem',
        authMethod: 'certificate',
        certValidation: true,
        sessionTimeout: 1800 // 30 minutes for executive sessions
      },
      
      algorithms: {
        symmetric: [
          'AES-256-GCM',     // Primary symmetric encryption
          'ChaCha20-Poly1305' // Alternative for high-performance scenarios
        ],
        asymmetric: [
          'RSA-4096',        // Executive document signing
          'ECDSA-P384',      // High-security digital signatures
          'Ed25519'          // Modern elliptic curve signatures
        ],
        postQuantum: [
          'CRYSTALS-Kyber',    // Post-quantum key encapsulation
          'CRYSTALS-Dilithium', // Post-quantum digital signatures
          'SPHINCS+',          // Stateless hash-based signatures
          'FALCON-1024'        // NIST Round 3 finalist
        ],
        hashing: [
          'SHA3-256',        // Primary hash function
          'SHA3-384',        // High-security hashing
          'SHAKE-256',       // Extensible output function
          'BLAKE3'           // High-performance hashing
        ],
        keyDerivation: [
          'scrypt',          // Memory-hard key derivation
          'Argon2id'         // Password hashing champion
        ]
      },
      
      performance: {
        maxConcurrentOperations: 100,
        timeoutMs: 30000,     // 30 seconds for executive operations
        retryAttempts: 5,     // Higher retry for critical operations
        connectionPoolSize: 20, // Executive workload pool
        performanceTargets: {
          keyGeneration: 100, // <100ms
          encryption: 50,     // <50ms
          signing: 75,        // <75ms
          verification: 25,   // <25ms
          connection: 500     // <500ms
        },
        caching: {
          enabled: true,
          ttlSeconds: 600,    // 10 minutes cache
          maxEntries: 5000    // Large cache for executive operations
        }
      },
      
      monitoring: {
        healthCheckIntervalMs: 15000, // 15 seconds for executive monitoring
        metricsCollectionEnabled: true,
        alertThresholds: {
          errorRate: 0.001,           // 0.1% - Very low tolerance
          latencyMs: 100,             // 100ms latency threshold
          utilizationPercent: 70,     // 70% utilization alert
          failureCount: 2             // Alert after 2 failures
        },
        logging: {
          auditLevel: 'comprehensive',
          logRotation: true,
          encryptLogs: true
        }
      },
      
      security: {
        enforceHardwareRng: true,     // Hardware RNG only
        keyEscrowPolicy: 'none',      // Executive keys never escrowed
        integrityChecks: true,        // Always verify integrity
        sidechannelProtection: true,  // Anti-side-channel measures
        fipsCompliance: true          // FIPS 140-2 Level 3 required
      },
      
      clustering: {
        enabled: true,
        nodes: [
          {
            nodeId: 'hsm-primary',
            endpoint: process.env.HSM_PRIMARY_ENDPOINT || 'https://hsm-1.internal:9000',
            priority: 10,
            healthStatus: 'active'
          },
          {
            nodeId: 'hsm-secondary',
            endpoint: process.env.HSM_SECONDARY_ENDPOINT || 'https://hsm-2.internal:9000',
            priority: 9,
            healthStatus: 'standby'
          },
          {
            nodeId: 'hsm-tertiary',
            endpoint: process.env.HSM_TERTIARY_ENDPOINT || 'https://hsm-3.internal:9000',
            priority: 8,
            healthStatus: 'standby'
          }
        ],
        failoverStrategy: 'priority',
        syncInterval: 30000 // 30 seconds cluster sync
      }
    };
  }
  
  /**
   * High-Availability Configuration
   * Multi-region deployment with automatic failover
   */
  static createHAConfig(): HSMConfiguration {
    const baseConfig = this.createExecutiveConfig();
    
    return {
      ...baseConfig,
      clustering: {
        enabled: true,
        nodes: [
          // Primary Region (US-East)
          {
            nodeId: 'hsm-use1-primary',
            endpoint: 'https://hsm-use1-1.internal:9000',
            priority: 10,
            healthStatus: 'active'
          },
          {
            nodeId: 'hsm-use1-secondary',
            endpoint: 'https://hsm-use1-2.internal:9000',
            priority: 9,
            healthStatus: 'standby'
          },
          // Secondary Region (US-West)
          {
            nodeId: 'hsm-usw2-primary',
            endpoint: 'https://hsm-usw2-1.internal:9000',
            priority: 8,
            healthStatus: 'standby'
          },
          {
            nodeId: 'hsm-usw2-secondary',
            endpoint: 'https://hsm-usw2-2.internal:9000',
            priority: 7,
            healthStatus: 'standby'
          },
          // Disaster Recovery (EU)
          {
            nodeId: 'hsm-eu-dr',
            endpoint: 'https://hsm-eu-1.internal:9000',
            priority: 6,
            healthStatus: 'standby'
          }
        ],
        failoverStrategy: 'priority',
        syncInterval: 15000 // 15 seconds for HA sync
      },
      performance: {
        ...baseConfig.performance,
        connectionPoolSize: 50, // Larger pool for HA
        maxConcurrentOperations: 200
      }
    };
  }
  
  /**
   * Development Configuration
   * Simulation mode for development and testing
   */
  static createDevelopmentConfig(): HSMConfiguration {
    return {
      mode: 'simulation',
      vendor: 'simulation',
      endpoint: 'http://localhost:8080',
      
      authentication: {
        clientId: 'executive-assistant-dev',
        authMethod: 'simulation',
        certValidation: false,
        sessionTimeout: 3600
      },
      
      algorithms: {
        symmetric: ['AES-256-GCM'],
        asymmetric: ['RSA-4096', 'ECDSA-P384'],
        postQuantum: ['CRYSTALS-Kyber', 'CRYSTALS-Dilithium'],
        hashing: ['SHA3-256'],
        keyDerivation: ['scrypt']
      },
      
      performance: {
        maxConcurrentOperations: 10,
        timeoutMs: 5000,
        retryAttempts: 2,
        connectionPoolSize: 5,
        performanceTargets: {
          keyGeneration: 200,
          encryption: 100,
          signing: 150,
          verification: 50,
          connection: 1000
        },
        caching: {
          enabled: true,
          ttlSeconds: 300,
          maxEntries: 100
        }
      },
      
      monitoring: {
        healthCheckIntervalMs: 60000,
        metricsCollectionEnabled: true,
        alertThresholds: {
          errorRate: 0.1,
          latencyMs: 500,
          utilizationPercent: 90,
          failureCount: 5
        },
        logging: {
          auditLevel: 'standard',
          logRotation: false,
          encryptLogs: false
        }
      },
      
      security: {
        enforceHardwareRng: false,
        keyEscrowPolicy: 'none',
        integrityChecks: true,
        sidechannelProtection: false,
        fipsCompliance: false
      },
      
      clustering: {
        enabled: false,
        nodes: [],
        failoverStrategy: 'round-robin',
        syncInterval: 60000
      }
    };
  }
  
  /**
   * Testing Configuration
   * Optimized for automated testing scenarios
   */
  static createTestingConfig(): HSMConfiguration {
    const devConfig = this.createDevelopmentConfig();
    
    return {
      ...devConfig,
      performance: {
        ...devConfig.performance,
        timeoutMs: 2000,
        connectionPoolSize: 2,
        maxConcurrentOperations: 5
      },
      monitoring: {
        ...devConfig.monitoring,
        healthCheckIntervalMs: 1000,
        logging: {
          auditLevel: 'minimal',
          logRotation: false,
          encryptLogs: false
        }
      }
    };
  }
  
  /**
   * Compliance Configuration
   * SOX/HIPAA/PCI-DSS compliant configuration
   */
  static createComplianceConfig(complianceType: 'sox' | 'hipaa' | 'pcidss'): HSMConfiguration {
    const baseConfig = this.createExecutiveConfig();
    
    const complianceSettings = {
      sox: {
        auditLevel: 'comprehensive' as const,
        keyEscrowPolicy: 'backup' as const,
        sessionTimeout: 900, // 15 minutes
        errorRateThreshold: 0.001
      },
      hipaa: {
        auditLevel: 'comprehensive' as const,
        keyEscrowPolicy: 'split' as const,
        sessionTimeout: 600, // 10 minutes
        errorRateThreshold: 0.0005
      },
      pcidss: {
        auditLevel: 'comprehensive' as const,
        keyEscrowPolicy: 'backup' as const,
        sessionTimeout: 1200, // 20 minutes
        errorRateThreshold: 0.0001
      }
    };
    
    const settings = complianceSettings[complianceType];
    
    return {
      ...baseConfig,
      authentication: {
        ...baseConfig.authentication,
        sessionTimeout: settings.sessionTimeout
      },
      security: {
        ...baseConfig.security,
        keyEscrowPolicy: settings.keyEscrowPolicy
      },
      monitoring: {
        ...baseConfig.monitoring,
        alertThresholds: {
          ...baseConfig.monitoring.alertThresholds,
          errorRate: settings.errorRateThreshold
        },
        logging: {
          ...baseConfig.monitoring.logging,
          auditLevel: settings.auditLevel
        }
      }
    };
  }
  
  /**
   * Get configuration based on environment
   */
  static getConfigForEnvironment(env?: string): HSMConfiguration {
    const environment = env || process.env.NODE_ENV || 'development';
    
    switch (environment.toLowerCase()) {
      case 'production':
        return this.createExecutiveConfig();
      case 'staging':
        return this.createHAConfig();
      case 'development':
        return this.createDevelopmentConfig();
      case 'test':
        return this.createTestingConfig();
      default:
        console.warn(`Unknown environment: ${environment}, using development config`);
        return this.createDevelopmentConfig();
    }
  }
  
  /**
   * Validate configuration for production deployment
   */
  static validateProductionConfig(config: HSMConfiguration): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Critical security checks
    if (config.mode !== 'production') {
      errors.push('Configuration must be in production mode');
    }
    
    if (!config.security.enforceHardwareRng) {
      errors.push('Hardware RNG must be enforced in production');
    }
    
    if (!config.security.fipsCompliance) {
      errors.push('FIPS compliance must be enabled in production');
    }
    
    if (config.authentication.authMethod === 'simulation') {
      errors.push('Simulation authentication not allowed in production');
    }
    
    if (!config.authentication.certValidation) {
      errors.push('Certificate validation must be enabled in production');
    }
    
    // Performance checks
    if (config.performance.performanceTargets.keyGeneration > 100) {
      warnings.push('Key generation target exceeds 100ms recommendation');
    }
    
    if (config.performance.connectionPoolSize < 10) {
      warnings.push('Connection pool size may be too small for production load');
    }
    
    // Monitoring checks
    if (config.monitoring.logging.auditLevel !== 'comprehensive') {
      warnings.push('Comprehensive audit logging recommended for production');
    }
    
    if (!config.monitoring.logging.encryptLogs) {
      warnings.push('Log encryption recommended for production');
    }
    
    // Certificate path checks
    if (config.authentication.authMethod === 'certificate') {
      if (!config.authentication.clientCertPath) {
        errors.push('Client certificate path required for certificate authentication');
      }
      
      if (!config.authentication.clientKeyPath) {
        errors.push('Client key path required for certificate authentication');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Environment-specific configuration exports
 */
export const ProductionHSMConfig = ProductionHSMConfigFactory.createExecutiveConfig();
export const HAHSMConfig = ProductionHSMConfigFactory.createHAConfig();
export const DevelopmentHSMConfig = ProductionHSMConfigFactory.createDevelopmentConfig();
export const TestingHSMConfig = ProductionHSMConfigFactory.createTestingConfig();

/**
 * Default configuration based on current environment
 */
export const DefaultHSMConfig = ProductionHSMConfigFactory.getConfigForEnvironment();

/**
 * Configuration validation utility
 */
export const validateHSMConfig = ProductionHSMConfigFactory.validateProductionConfig;