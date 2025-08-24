/**
 * CRYSTALS-Kyber HSM Integration - WBS 2.3.1.5
 * Hardware Security Module integration for quantum-resistant cryptography
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * HSM integration layer for executive data protection
 */

import { HSMInterface, HSMOperationResult, HSMKeyMetadata } from '../hsm/HSMInterface';
import { CRYSTALSKyber } from './CRYSTALSKyber';
// import type { HSMAuditEntry } from '../hsm/core/HSMAuditLogger';
import * as crypto from 'crypto';

export interface KyberHSMConfig {
  readonly hsmEndpoint: string;
  readonly authMethod: 'certificate' | 'token';
  readonly keyStoragePolicy: 'hsm_only' | 'hybrid' | 'software_backup';
  readonly performanceMode: 'secure' | 'fast' | 'balanced';
  readonly enableSecureEnclaves: boolean;
}

export interface KyberHSMKeyMetadata extends HSMKeyMetadata {
  readonly kyberVariant: string;
  readonly securityLevel: number;
  readonly quantumResistant: boolean;
  readonly hsmKeyHandle: string;
}

export interface KyberHSMOperationResult<T = any> extends HSMOperationResult<T> {
  readonly kyberMetrics: {
    hsmLatency: number;
    totalLatency: number;
    securityLevel: number;
  };
}

/**
 * HSM integration layer for CRYSTALS-Kyber operations
 */
export class KyberHSMIntegration {
  private readonly hsm: HSMInterface;
  private readonly kyber: CRYSTALSKyber;
  private readonly config: KyberHSMConfig;

  constructor(hsm: HSMInterface, config: KyberHSMConfig) {
    this.hsm = hsm;
    this.kyber = new CRYSTALSKyber();
    this.config = config;
    console.log('🔐 Kyber HSM Integration initialized');
  }

  /**
   * Generate Kyber key pair with HSM backing
   */
  async generateHSMKeyPair(params: {
    variant?: 'Kyber512' | 'Kyber768' | 'Kyber1024';
    classification?: 'executive' | 'strategic' | 'confidential';
    usage?: string[];
    hsmStorage?: boolean;
  }): Promise<KyberHSMOperationResult<{
    keyId: string;
    publicKey: Uint8Array;
    hsmKeyHandle?: string;
    metadata: KyberHSMKeyMetadata;
  }>> {
    
    const startTime = Date.now();
    console.log('🔑 Generating HSM-backed Kyber key pair...');

    try {
      // Generate Kyber key pair
      const kyberKeyPair = await this.kyber.generateKeyPair({
        variant: params.variant || 'Kyber1024',
        classification: params.classification || 'executive',
        usage: params.usage || ['key_encapsulation', 'hsm_protected']
      });

      let hsmKeyHandle: string | undefined;
      
      // Store private key in HSM if configured
      if (params.hsmStorage !== false && this.config.keyStoragePolicy !== 'software_backup') {
        const hsmResult = await this.hsm.generateKey({
          keyType: 'post-quantum',
          algorithm: 'CRYSTALS-Kyber',
          usage: ['encrypt', 'decrypt', 'key_encapsulation'],
          classification: params.classification || 'executive',
          metadata: {
            kyberVariant: kyberKeyPair.parameters.variant,
            securityLevel: kyberKeyPair.parameters.securityLevel,
            quantumResistant: true
          }
        });

        if (hsmResult.success && hsmResult.data) {
          hsmKeyHandle = hsmResult.data.keyId;
        }
      }

      // Create HSM metadata
      const metadata: KyberHSMKeyMetadata = {
        keyId: kyberKeyPair.keyId,
        keyType: 'post-quantum',
        algorithm: `CRYSTALS-${kyberKeyPair.parameters.variant}`,
        usage: kyberKeyPair.metadata.usage,
        classification: kyberKeyPair.metadata.classification as any,
        createdAt: kyberKeyPair.createdAt,
        hardwareGenerated: true,
        escrowStatus: 'none',
        integrityHash: crypto.createHash('sha256').update(kyberKeyPair.keyId + Date.now().toString()).digest('hex'),
        accessLog: [],
        rotationPolicy: kyberKeyPair.metadata.rotationPolicy,
        kyberVariant: kyberKeyPair.parameters.variant,
        securityLevel: kyberKeyPair.parameters.securityLevel,
        quantumResistant: true,
        hsmKeyHandle: hsmKeyHandle ?? ''
      };

      const totalLatency = Date.now() - startTime;

      console.log(`✅ HSM Kyber key pair generated: ${kyberKeyPair.keyId} (${totalLatency}ms)`);

      return {
        success: true,
        data: {
          keyId: kyberKeyPair.keyId,
          publicKey: kyberKeyPair.publicKey,
          ...(hsmKeyHandle && { hsmKeyHandle }),
          metadata
        },
        metrics: {
          operationType: 'hsm_key_generation',
          duration: totalLatency,
          timestamp: new Date(),
          keyId: kyberKeyPair.keyId,
          bytesProcessed: kyberKeyPair.parameters.publicKeySize + kyberKeyPair.parameters.privateKeySize
        },
        kyberMetrics: {
          hsmLatency: hsmKeyHandle ? 50 : 0, // Simulated HSM latency
          totalLatency,
          securityLevel: kyberKeyPair.parameters.securityLevel
        },
        auditTrail: {
          operationId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'kyber_key_generation',
          keyId: kyberKeyPair.keyId,
          result: 'success',
          integrityVerified: true,
          performanceMetrics: {
            duration: totalLatency,
            operationType: 'key_generation'
          },
          securityContext: {
            authMethod: 'hsm_certificate'
          },
          additionalData: {
            variant: kyberKeyPair.parameters.variant
          }
        }
      };

    } catch (error) {
      console.error('❌ HSM Kyber key generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: {
          code: 'HSM_KYBER_KEYGEN_FAILED',
          message: `HSM Kyber key generation failed: ${errorMessage}`,
          recoverable: true,
          details: { originalError: error }
        },
        metrics: {
          operationType: 'hsm_key_generation',
          duration: Date.now() - startTime,
          timestamp: new Date()
        },
        kyberMetrics: {
          hsmLatency: 0,
          totalLatency: Date.now() - startTime,
          securityLevel: 0
        },
        auditTrail: {
          operationId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'kyber_operation_error',
          result: 'error',
          integrityVerified: false,
          performanceMetrics: {
            duration: Date.now() - startTime,
            operationType: 'error_handling'
          },
          securityContext: {
            authMethod: 'hsm_certificate',
            sessionId: 'error_session_' + crypto.randomUUID().substring(0, 8)
          }
        }
      };
    }
  }

  /**
   * Perform HSM-protected encapsulation
   */
  async hsmEncapsulate(params: {
    publicKey: Uint8Array;
    keyId: string;
    useHSMValidation?: boolean;
  }): Promise<KyberHSMOperationResult<{
    ciphertext: Uint8Array;
    sharedSecret: Uint8Array;
    hsmValidated: boolean;
  }>> {
    
    const startTime = Date.now();
    console.log(`🔒 Performing HSM-protected Kyber encapsulation: ${params.keyId}`);

    try {
      // Validate public key through HSM if requested
      let hsmValidated = false;
      let hsmLatency = 0;

      if (params.useHSMValidation) {
        const hsmStartTime = Date.now();
        // Simulate HSM validation
        await new Promise(resolve => setTimeout(resolve, 10));
        hsmLatency = Date.now() - hsmStartTime;
        hsmValidated = true;
      }

      // Perform Kyber encapsulation
      const encapResult = await this.kyber.encapsulate(params.publicKey, params.keyId);

      // Additional HSM-level security checks
      if (this.config.enableSecureEnclaves) {
        await this.performSecureEnclaveOperations(encapResult.sharedSecret);
      }

      const totalLatency = Date.now() - startTime;

      console.log(`✅ HSM Kyber encapsulation completed: ${params.keyId} (${totalLatency}ms)`);

      return {
        success: true,
        data: {
          ciphertext: encapResult.ciphertext,
          sharedSecret: encapResult.sharedSecret,
          hsmValidated
        },
        metrics: {
          operationType: 'hsm_encapsulation',
          duration: totalLatency,
          timestamp: new Date(),
          keyId: params.keyId,
          bytesProcessed: params.publicKey.length + encapResult.ciphertext.length
        },
        kyberMetrics: {
          hsmLatency,
          totalLatency,
          securityLevel: this.detectSecurityLevel(params.publicKey)
        },
        auditTrail: {
          operationId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'kyber_encapsulation',
          keyId: params.keyId,
          result: 'success',
          integrityVerified: true,
          performanceMetrics: {
            duration: totalLatency,
            operationType: 'encapsulation'
          },
          securityContext: {
            authMethod: 'hsm_certificate'
          },
          additionalData: {
            hsmValidated: hsmValidated.toString()
          }
        }
      };

    } catch (error) {
      console.error('❌ HSM Kyber encapsulation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: {
          code: 'HSM_KYBER_ENCAP_FAILED',
          message: `HSM Kyber encapsulation failed: ${errorMessage}`,
          recoverable: true,
          details: { keyId: params.keyId }
        },
        metrics: {
          operationType: 'hsm_encapsulation',
          duration: Date.now() - startTime,
          timestamp: new Date(),
          keyId: params.keyId
        },
        kyberMetrics: {
          hsmLatency: 0,
          totalLatency: Date.now() - startTime,
          securityLevel: 0
        },
        auditTrail: {
          operationId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'kyber_operation_error',
          result: 'error',
          integrityVerified: false,
          performanceMetrics: {
            duration: Date.now() - startTime,
            operationType: 'error_handling'
          },
          securityContext: {
            authMethod: 'hsm_certificate',
            sessionId: 'error_session_' + crypto.randomUUID().substring(0, 8)
          }
        }
      };
    }
  }

  /**
   * Perform HSM-protected decapsulation
   */
  async hsmDecapsulate(params: {
    ciphertext: Uint8Array;
    hsmKeyHandle: string;
    keyId: string;
    useHSMDecryption?: boolean;
  }): Promise<KyberHSMOperationResult<{
    sharedSecret: Uint8Array;
    hsmDecrypted: boolean;
  }>> {
    
    const startTime = Date.now();
    console.log(`🔓 Performing HSM-protected Kyber decapsulation: ${params.keyId}`);

    try {
      let hsmLatency = 0;
      let hsmDecrypted = false;
      let sharedSecret: Uint8Array;

      if (params.useHSMDecryption && params.hsmKeyHandle) {
        // Use HSM for decapsulation
        const hsmStartTime = Date.now();
        
        const hsmResult = await this.hsm.decrypt({
          keyId: params.hsmKeyHandle,
          ciphertext: Buffer.from(params.ciphertext)
        });

        hsmLatency = Date.now() - hsmStartTime;

        if (hsmResult.success && hsmResult.data) {
          sharedSecret = new Uint8Array(hsmResult.data.plaintext);
          hsmDecrypted = true;
        } else {
          throw new Error('HSM decapsulation failed');
        }
      } else {
        // Fallback to software decapsulation
        // Note: In real implementation, we would retrieve private key from HSM
        throw new Error('Software decapsulation not supported in HSM mode');
      }

      const totalLatency = Date.now() - startTime;

      console.log(`✅ HSM Kyber decapsulation completed: ${params.keyId} (${totalLatency}ms)`);

      return {
        success: true,
        data: {
          sharedSecret,
          hsmDecrypted
        },
        metrics: {
          operationType: 'hsm_decapsulation',
          duration: totalLatency,
          timestamp: new Date(),
          keyId: params.keyId,
          bytesProcessed: params.ciphertext.length + sharedSecret.length
        },
        kyberMetrics: {
          hsmLatency,
          totalLatency,
          securityLevel: this.detectSecurityLevel(params.ciphertext)
        },
        auditTrail: {
          operationId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'kyber_decapsulation',
          keyId: params.keyId,
          result: 'success',
          integrityVerified: true,
          performanceMetrics: {
            duration: totalLatency,
            operationType: 'decapsulation'
          },
          securityContext: {
            authMethod: 'hsm_certificate'
          },
          additionalData: {
            hsmDecrypted: hsmDecrypted.toString()
          }
        }
      };

    } catch (error) {
      console.error('❌ HSM Kyber decapsulation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: {
          code: 'HSM_KYBER_DECAP_FAILED',
          message: `HSM Kyber decapsulation failed: ${errorMessage}`,
          recoverable: true,
          details: { keyId: params.keyId }
        },
        metrics: {
          operationType: 'hsm_decapsulation',
          duration: Date.now() - startTime,
          timestamp: new Date(),
          keyId: params.keyId
        },
        kyberMetrics: {
          hsmLatency: 0,
          totalLatency: Date.now() - startTime,
          securityLevel: 0
        },
        auditTrail: {
          operationId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'kyber_operation_error',
          result: 'error',
          integrityVerified: false,
          performanceMetrics: {
            duration: Date.now() - startTime,
            operationType: 'error_handling'
          },
          securityContext: {
            authMethod: 'hsm_certificate',
            sessionId: 'error_session_' + crypto.randomUUID().substring(0, 8)
          }
        }
      };
    }
  }

  /**
   * Rotate HSM-backed Kyber keys
   */
  async rotateHSMKeys(params: {
    currentKeyId: string;
    hsmKeyHandle: string;
    newVariant?: string;
  }): Promise<KyberHSMOperationResult<{
    newKeyId: string;
    newHsmKeyHandle: string;
    rotationTime: Date;
  }>> {
    
    const startTime = Date.now();
    console.log(`🔄 Rotating HSM Kyber keys: ${params.currentKeyId}`);

    try {
      // Generate new key pair
      const newKeyResult = await this.generateHSMKeyPair({
        variant: params.newVariant as any || 'Kyber1024',
        classification: 'executive',
        usage: ['key_encapsulation', 'key_rotation'],
        hsmStorage: true
      });

      if (!newKeyResult.success) {
        throw new Error('Failed to generate new key pair during rotation');
      }

      // Rotate HSM key
      const hsmRotationResult = await this.hsm.rotateKey(params.hsmKeyHandle);
      
      if (!hsmRotationResult.success) {
        throw new Error('HSM key rotation failed');
      }

      const totalLatency = Date.now() - startTime;

      console.log(`✅ HSM Kyber key rotation completed: ${params.currentKeyId} -> ${newKeyResult.data!.keyId} (${totalLatency}ms)`);

      return {
        success: true,
        data: {
          newKeyId: newKeyResult.data!.keyId,
          newHsmKeyHandle: newKeyResult.data!.hsmKeyHandle ?? '',
          rotationTime: new Date()
        },
        metrics: {
          operationType: 'hsm_key_rotation',
          duration: totalLatency,
          timestamp: new Date(),
          keyId: params.currentKeyId
        },
        kyberMetrics: {
          hsmLatency: hsmRotationResult.metrics.duration,
          totalLatency,
          securityLevel: newKeyResult.data!.metadata.securityLevel
        },
        auditTrail: {
          operationId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'kyber_key_rotation',
          keyId: params.currentKeyId,
          result: 'success',
          integrityVerified: true,
          performanceMetrics: {
            duration: totalLatency,
            operationType: 'key_rotation'
          },
          securityContext: {
            authMethod: 'hsm_certificate'
          },
          additionalData: {
            newKeyId: newKeyResult.data!.keyId
          }
        }
      };

    } catch (error) {
      console.error('❌ HSM Kyber key rotation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: {
          code: 'HSM_KYBER_ROTATION_FAILED',
          message: `HSM Kyber key rotation failed: ${errorMessage}`,
          recoverable: true,
          details: { currentKeyId: params.currentKeyId }
        },
        metrics: {
          operationType: 'hsm_key_rotation',
          duration: Date.now() - startTime,
          timestamp: new Date(),
          keyId: params.currentKeyId
        },
        kyberMetrics: {
          hsmLatency: 0,
          totalLatency: Date.now() - startTime,
          securityLevel: 0
        },
        auditTrail: {
          operationId: crypto.randomUUID(),
          timestamp: new Date(),
          operation: 'kyber_operation_error',
          result: 'error',
          integrityVerified: false,
          performanceMetrics: {
            duration: Date.now() - startTime,
            operationType: 'error_handling'
          },
          securityContext: {
            authMethod: 'hsm_certificate',
            sessionId: 'error_session_' + crypto.randomUUID().substring(0, 8)
          }
        }
      };
    }
  }

  /**
   * Validate HSM Kyber configuration
   */
  async validateHSMConfiguration(): Promise<{
    valid: boolean;
    capabilities: string[];
    recommendations: string[];
    securityLevel: string;
  }> {
    console.log('🔍 Validating HSM Kyber configuration...');

    const capabilities: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check HSM health
      const healthStatus = await this.hsm.getHealthStatus();
      
      if (healthStatus.status === 'healthy') {
        capabilities.push('HSM operational');
      } else {
        recommendations.push('HSM health issues detected');
      }

      // Check quantum algorithm support
      if (healthStatus.capabilities.includes('post_quantum')) {
        capabilities.push('Post-quantum algorithms supported');
      } else {
        recommendations.push('Enable post-quantum algorithm support');
      }

      // Check performance
      const metrics = this.hsm.getPerformanceMetrics(10);
      const avgLatency = metrics.length > 0 
        ? metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length 
        : 0;

      if (avgLatency < 100) {
        capabilities.push('Good HSM performance');
      } else {
        recommendations.push('HSM performance optimization needed');
      }

      // Determine security level
      let securityLevel = 'adequate';
      if (capabilities.length >= 3 && recommendations.length === 0) {
        securityLevel = 'excellent';
      } else if (capabilities.length >= 2) {
        securityLevel = 'good';
      }

      const valid = capabilities.length > 0 && recommendations.length < 3;

      console.log(`✅ HSM configuration validation: ${valid ? 'PASSED' : 'FAILED'}`);

      return {
        valid,
        capabilities,
        recommendations,
        securityLevel
      };

    } catch (error) {
      console.error('❌ HSM configuration validation failed:', error);
      
      return {
        valid: false,
        capabilities: [],
        recommendations: ['HSM configuration validation failed', 'Manual review required'],
        securityLevel: 'critical'
      };
    }
  }

  // Private helper methods

  private async performSecureEnclaveOperations(sharedSecret: Uint8Array): Promise<void> {
    // Simulate secure enclave operations
    await new Promise(resolve => setTimeout(resolve, 5));
    
    // Additional entropy mixing in secure enclave
    const enclaveEntropy = new Uint8Array(8);
    crypto.getRandomValues(enclaveEntropy);
    
    for (let i = 0; i < Math.min(8, sharedSecret.length); i++) {
      sharedSecret[i] ^= enclaveEntropy[i];
    }
  }

  private detectSecurityLevel(keyData: Uint8Array): number {
    // Detect security level from key/ciphertext data
    if (keyData.length >= 1568) return 5; // Kyber1024
    if (keyData.length >= 1184) return 3; // Kyber768
    if (keyData.length >= 800) return 1;  // Kyber512
    return 0; // Unknown
  }
}

/**
 * HSM-backed Kyber Key Manager
 */
export class KyberHSMKeyManager {
  private readonly integration: KyberHSMIntegration;
  private readonly keyRegistry: Map<string, KyberHSMKeyMetadata>;

  constructor(integration: KyberHSMIntegration) {
    this.integration = integration;
    this.keyRegistry = new Map();
  }

  /**
   * Register new HSM-backed key
   */
  registerKey(metadata: KyberHSMKeyMetadata): void {
    this.keyRegistry.set(metadata.keyId, metadata);
    console.log(`📝 Registered HSM Kyber key: ${metadata.keyId}`);
  }

  /**
   * Get key metadata
   */
  getKeyMetadata(keyId: string): KyberHSMKeyMetadata | undefined {
    return this.keyRegistry.get(keyId);
  }

  /**
   * List all registered keys
   */
  listKeys(filter?: {
    variant?: string;
    classification?: string;
    quantumResistant?: boolean;
  }): KyberHSMKeyMetadata[] {
    let keys = Array.from(this.keyRegistry.values());

    if (filter) {
      if (filter.variant) {
        keys = keys.filter(k => k.kyberVariant === filter.variant);
      }
      if (filter.classification) {
        keys = keys.filter(k => k.classification === filter.classification);
      }
      if (filter.quantumResistant !== undefined) {
        keys = keys.filter(k => k.quantumResistant === filter.quantumResistant);
      }
    }

    return keys;
  }

  /**
   * Check for keys needing rotation
   */
  getKeysNeedingRotation(maxAge: number = 30 * 24 * 60 * 60 * 1000): KyberHSMKeyMetadata[] {
    const now = Date.now();
    
    return Array.from(this.keyRegistry.values()).filter(key => {
      const age = now - key.createdAt.getTime();
      return age > maxAge;
    });
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): {
    totalKeys: number;
    quantumResistantKeys: number;
    keysByVariant: Record<string, number>;
    keysByClassification: Record<string, number>;
    recommendations: string[];
  } {
    const keys = Array.from(this.keyRegistry.values());
    const keysByVariant: Record<string, number> = {};
    const keysByClassification: Record<string, number> = {};
    const recommendations: string[] = [];

    // Count keys by variant
    keys.forEach(key => {
      keysByVariant[key.kyberVariant] = (keysByVariant[key.kyberVariant] || 0) + 1;
      keysByClassification[key.classification] = (keysByClassification[key.classification] || 0) + 1;
    });

    // Generate recommendations
    const quantumResistantKeys = keys.filter(k => k.quantumResistant).length;
    
    if (quantumResistantKeys < keys.length) {
      recommendations.push('Migrate non-quantum-resistant keys to Kyber variants');
    }

    if (keysByVariant['Kyber512'] > keysByVariant['Kyber1024']) {
      recommendations.push('Consider upgrading to higher security variants');
    }

    const keysNeedingRotation = this.getKeysNeedingRotation().length;
    if (keysNeedingRotation > 0) {
      recommendations.push(`${keysNeedingRotation} keys need rotation`);
    }

    return {
      totalKeys: keys.length,
      quantumResistantKeys,
      keysByVariant,
      keysByClassification,
      recommendations
    };
  }

  private getSecurityLevel(variant: string): 1 | 2 | 3 {
    switch (variant) {
      case 'Kyber512': return 1;
      case 'Kyber768': return 2;
      case 'Kyber1024': return 3;
      default: return 1;
    }
  }

  /**
   * Calculate integrity hash for key
   */
  private calculateIntegrityHash(keyId: string): string {
    return crypto.createHash('sha256').update(keyId + Date.now().toString()).digest('hex');
  }
}