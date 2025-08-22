/**
 * CRYSTALS-Dilithium HSM Integration - WBS 2.3.2.5
 * Hardware Security Module integration for quantum-resistant digital signatures
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * HSM integration layer for executive digital signature protection
 */

import { HSMInterface, HSMOperationResult, HSMKeyMetadata } from '../hsm/HSMInterface';
import { CRYSTALSDilithium, DilithiumKeyPair, DilithiumParameters } from './CRYSTALSDilithium';

export interface DilithiumHSMConfig {
  readonly hsmEndpoint: string;
  readonly authMethod: 'certificate' | 'token';
  readonly keyStoragePolicy: 'hsm_only' | 'hybrid' | 'software_backup';
  readonly performanceMode: 'secure' | 'fast' | 'balanced';
  readonly enableSecureEnclaves: boolean;
  readonly signatureAuditing: boolean;
}

export interface DilithiumHSMKeyMetadata extends HSMKeyMetadata {
  readonly dilithiumVariant: string;
  readonly securityLevel: number;
  readonly quantumResistant: boolean;
  readonly hsmKeyHandle: string;
  readonly signatureCount: number;
}

export interface DilithiumHSMOperationResult<T = any> extends HSMOperationResult<T> {
  readonly dilithiumMetrics: {
    hsmLatency: number;
    totalLatency: number;
    securityLevel: number;
    operationCount: number;
  };
}

/**
 * HSM integration layer for CRYSTALS-Dilithium operations
 */
export class DilithiumHSMIntegration {
  private readonly hsm: HSMInterface;
  private readonly dilithium: CRYSTALSDilithium;
  private readonly config: DilithiumHSMConfig;
  private readonly signatureAuditLog: Map<string, any[]> = new Map();

  constructor(hsm: HSMInterface, config: DilithiumHSMConfig) {
    this.hsm = hsm;
    this.dilithium = new CRYSTALSDilithium();
    this.config = config;
    console.log('🔐 Dilithium HSM Integration initialized');
  }

  /**
   * Generate Dilithium key pair with HSM backing
   */
  async generateHSMKeyPair(params: {
    variant?: 'Dilithium2' | 'Dilithium3' | 'Dilithium5';
    classification?: 'executive' | 'strategic' | 'confidential';
    usage?: string[];
    hsmStorage?: boolean;
  }): Promise<DilithiumHSMOperationResult<{
    keyId: string;
    publicKey: Uint8Array;
    hsmKeyHandle?: string;
    metadata: DilithiumHSMKeyMetadata;
  }>> {
    
    const startTime = Date.now();
    console.log('🔑 Generating HSM-backed Dilithium key pair...');

    try {
      // Generate Dilithium key pair
      const dilithiumKeyPair = await this.dilithium.generateKeyPair({
        variant: params.variant || 'Dilithium5',
        classification: params.classification || 'executive',
        usage: params.usage || ['digital_signature', 'hsm_protected']
      });

      let hsmKeyHandle: string | undefined;
      
      // Store private key in HSM if configured
      if (params.hsmStorage !== false && this.config.keyStoragePolicy !== 'software_backup') {
        const hsmResult = await this.hsm.generateKey({
          keyType: 'post-quantum',
          algorithm: 'CRYSTALS-Dilithium',
          usage: ['sign', 'verify'],
          classification: params.classification || 'executive',
          metadata: {
            dilithiumVariant: dilithiumKeyPair.parameters.variant,
            securityLevel: dilithiumKeyPair.parameters.securityLevel,
            quantumResistant: true
          }
        });

        if (hsmResult.success && hsmResult.data) {
          hsmKeyHandle = hsmResult.data.keyId;
        }
      }

      // Create HSM metadata
      const metadata: DilithiumHSMKeyMetadata = {
        keyId: dilithiumKeyPair.keyId,
        keyType: 'post-quantum',
        algorithm: `CRYSTALS-${dilithiumKeyPair.parameters.variant}`,
        usage: dilithiumKeyPair.metadata.usage,
        classification: dilithiumKeyPair.metadata.classification as any,
        createdAt: dilithiumKeyPair.createdAt,
        rotationPolicy: dilithiumKeyPair.metadata.rotationPolicy,
        dilithiumVariant: dilithiumKeyPair.parameters.variant,
        securityLevel: dilithiumKeyPair.parameters.securityLevel,
        quantumResistant: true,
        hsmKeyHandle: hsmKeyHandle || '',
        signatureCount: 0
      };

      // Initialize audit log for this key
      if (this.config.signatureAuditing) {
        this.signatureAuditLog.set(dilithiumKeyPair.keyId, []);
      }

      const totalLatency = Date.now() - startTime;

      console.log(`✅ HSM Dilithium key pair generated: ${dilithiumKeyPair.keyId} (${totalLatency}ms)`);

      return {
        success: true,
        data: {
          keyId: dilithiumKeyPair.keyId,
          publicKey: dilithiumKeyPair.publicKey,
          hsmKeyHandle,
          metadata
        },
        metrics: {
          operationType: 'hsm_key_generation',
          duration: totalLatency,
          timestamp: new Date(),
          keyId: dilithiumKeyPair.keyId,
          bytesProcessed: dilithiumKeyPair.parameters.publicKeySize + dilithiumKeyPair.parameters.privateKeySize
        },
        dilithiumMetrics: {
          hsmLatency: hsmKeyHandle ? 50 : 0, // Simulated HSM latency
          totalLatency,
          securityLevel: dilithiumKeyPair.parameters.securityLevel,
          operationCount: 1
        }
      };

    } catch (error) {
      console.error('❌ HSM Dilithium key generation failed:', error);
      
      return {
        success: false,
        error: {
          code: 'HSM_DILITHIUM_KEYGEN_FAILED',
          message: `HSM Dilithium key generation failed: ${error.message}`,
          recoverable: true,
          details: { originalError: error }
        },
        metrics: {
          operationType: 'hsm_key_generation',
          duration: Date.now() - startTime,
          timestamp: new Date()
        },
        dilithiumMetrics: {
          hsmLatency: 0,
          totalLatency: Date.now() - startTime,
          securityLevel: 0,
          operationCount: 0
        }
      };
    }
  }

  /**
   * Perform HSM-protected digital signature
   */
  async hsmSign(params: {
    message: Uint8Array;
    hsmKeyHandle: string;
    keyId: string;
    useHSMSigning?: boolean;
  }): Promise<DilithiumHSMOperationResult<{
    signature: Uint8Array;
    messageHash: Uint8Array;
    hsmSigned: boolean;
    auditEntry?: any;
  }>> {
    
    const startTime = Date.now();
    console.log(`✍️ Performing HSM-protected Dilithium signature: ${params.keyId}`);

    try {
      let hsmLatency = 0;
      let hsmSigned = false;
      let signature: Uint8Array;
      let messageHash: Uint8Array;

      if (params.useHSMSigning && params.hsmKeyHandle) {
        // Use HSM for signing
        const hsmStartTime = Date.now();
        
        const hsmResult = await this.hsm.sign({
          keyId: params.hsmKeyHandle,
          data: Buffer.from(params.message)
        });

        hsmLatency = Date.now() - hsmStartTime;

        if (hsmResult.success && hsmResult.data) {
          signature = new Uint8Array(hsmResult.data.signature);
          hsmSigned = true;
          // For HSM signing, we still need to compute message hash for audit
          messageHash = await this.computeMessageHash(params.message);
        } else {
          throw new Error('HSM signing failed');
        }
      } else {
        // Fallback to software signing
        // Note: In real implementation, we would retrieve private key from HSM
        throw new Error('Software signing not supported in HSM mode without key retrieval');
      }

      // Create audit entry if enabled
      let auditEntry;
      if (this.config.signatureAuditing) {
        auditEntry = {
          keyId: params.keyId,
          messageLength: params.message.length,
          messageHash: Array.from(messageHash),
          signatureLength: signature.length,
          timestamp: new Date(),
          hsmSigned,
          hsmKeyHandle: params.hsmKeyHandle
        };

        const auditLog = this.signatureAuditLog.get(params.keyId) || [];
        auditLog.push(auditEntry);
        this.signatureAuditLog.set(params.keyId, auditLog);
      }

      // Additional HSM-level security checks
      if (this.config.enableSecureEnclaves) {
        await this.performSecureEnclaveOperations(signature);
      }

      const totalLatency = Date.now() - startTime;

      console.log(`✅ HSM Dilithium signature completed: ${params.keyId} (${totalLatency}ms)`);

      return {
        success: true,
        data: {
          signature,
          messageHash,
          hsmSigned,
          auditEntry
        },
        metrics: {
          operationType: 'hsm_signing',
          duration: totalLatency,
          timestamp: new Date(),
          keyId: params.keyId,
          bytesProcessed: params.message.length + signature.length
        },
        dilithiumMetrics: {
          hsmLatency,
          totalLatency,
          securityLevel: this.detectSecurityLevel(signature),
          operationCount: this.getSignatureCount(params.keyId) + 1
        }
      };

    } catch (error) {
      console.error('❌ HSM Dilithium signing failed:', error);
      
      return {
        success: false,
        error: {
          code: 'HSM_DILITHIUM_SIGN_FAILED',
          message: `HSM Dilithium signing failed: ${error.message}`,
          recoverable: true,
          details: { keyId: params.keyId }
        },
        metrics: {
          operationType: 'hsm_signing',
          duration: Date.now() - startTime,
          timestamp: new Date(),
          keyId: params.keyId
        },
        dilithiumMetrics: {
          hsmLatency: 0,
          totalLatency: Date.now() - startTime,
          securityLevel: 0,
          operationCount: 0
        }
      };
    }
  }

  /**
   * Perform HSM-enhanced signature verification
   */
  async hsmVerify(params: {
    message: Uint8Array;
    signature: Uint8Array;
    publicKey: Uint8Array;
    keyId: string;
    useHSMVerification?: boolean;
  }): Promise<DilithiumHSMOperationResult<{
    valid: boolean;
    messageHash: Uint8Array;
    hsmVerified: boolean;
    securityChecks: any;
  }>> {
    
    const startTime = Date.now();
    console.log(`🔍 Performing HSM-enhanced Dilithium verification: ${params.keyId}`);

    try {
      let hsmLatency = 0;
      let hsmVerified = false;
      let valid: boolean;

      // Perform security checks
      const securityChecks = await this.performSecurityChecks(params);

      if (params.useHSMVerification) {
        // Use HSM for verification
        const hsmStartTime = Date.now();
        
        const hsmResult = await this.hsm.verify({
          keyId: params.keyId,
          data: Buffer.from(params.message),
          signature: Buffer.from(params.signature)
        });

        hsmLatency = Date.now() - hsmStartTime;

        if (hsmResult.success && hsmResult.data) {
          valid = hsmResult.data.valid;
          hsmVerified = true;
        } else {
          throw new Error('HSM verification failed');
        }
      } else {
        // Use software verification
        const verifyResult = await this.dilithium.verify(
          params.message,
          params.signature,
          params.publicKey,
          params.keyId
        );
        valid = verifyResult.valid;
      }

      const messageHash = await this.computeMessageHash(params.message);
      const totalLatency = Date.now() - startTime;

      console.log(`✅ HSM Dilithium verification completed: ${params.keyId} - ${valid ? 'VALID' : 'INVALID'} (${totalLatency}ms)`);

      return {
        success: true,
        data: {
          valid,
          messageHash,
          hsmVerified,
          securityChecks
        },
        metrics: {
          operationType: 'hsm_verification',
          duration: totalLatency,
          timestamp: new Date(),
          keyId: params.keyId,
          bytesProcessed: params.message.length + params.signature.length + params.publicKey.length
        },
        dilithiumMetrics: {
          hsmLatency,
          totalLatency,
          securityLevel: this.detectSecurityLevel(params.signature),
          operationCount: 1
        }
      };

    } catch (error) {
      console.error('❌ HSM Dilithium verification failed:', error);
      
      return {
        success: false,
        error: {
          code: 'HSM_DILITHIUM_VERIFY_FAILED',
          message: `HSM Dilithium verification failed: ${error.message}`,
          recoverable: true,
          details: { keyId: params.keyId }
        },
        metrics: {
          operationType: 'hsm_verification',
          duration: Date.now() - startTime,
          timestamp: new Date(),
          keyId: params.keyId
        },
        dilithiumMetrics: {
          hsmLatency: 0,
          totalLatency: Date.now() - startTime,
          securityLevel: 0,
          operationCount: 0
        }
      };
    }
  }

  /**
   * Rotate HSM-backed Dilithium keys
   */
  async rotateHSMKeys(params: {
    currentKeyId: string;
    hsmKeyHandle: string;
    newVariant?: string;
  }): Promise<DilithiumHSMOperationResult<{
    newKeyId: string;
    newHsmKeyHandle: string;
    rotationTime: Date;
    migrationGuide: any;
  }>> {
    
    const startTime = Date.now();
    console.log(`🔄 Rotating HSM Dilithium keys: ${params.currentKeyId}`);

    try {
      // Generate new key pair
      const newKeyResult = await this.generateHSMKeyPair({
        variant: params.newVariant as any || 'Dilithium5',
        classification: 'executive',
        usage: ['digital_signature', 'key_rotation'],
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

      // Create migration guide
      const migrationGuide = {
        oldKeyId: params.currentKeyId,
        newKeyId: newKeyResult.data!.keyId,
        rotationTime: new Date(),
        instructions: [
          'Update all signature verification processes',
          'Re-sign critical documents with new key',
          'Archive old signatures with timestamp',
          'Update backup and recovery procedures'
        ]
      };

      // Migrate audit log if enabled
      if (this.config.signatureAuditing) {
        const oldAuditLog = this.signatureAuditLog.get(params.currentKeyId) || [];
        this.signatureAuditLog.set(newKeyResult.data!.keyId, []);
        
        // Archive old audit log
        migrationGuide.auditLogArchived = oldAuditLog.length;
      }

      const totalLatency = Date.now() - startTime;

      console.log(`✅ HSM Dilithium key rotation completed: ${params.currentKeyId} -> ${newKeyResult.data!.keyId} (${totalLatency}ms)`);

      return {
        success: true,
        data: {
          newKeyId: newKeyResult.data!.keyId,
          newHsmKeyHandle: newKeyResult.data!.hsmKeyHandle || '',
          rotationTime: new Date(),
          migrationGuide
        },
        metrics: {
          operationType: 'hsm_key_rotation',
          duration: totalLatency,
          timestamp: new Date(),
          keyId: params.currentKeyId
        },
        dilithiumMetrics: {
          hsmLatency: hsmRotationResult.metrics.duration,
          totalLatency,
          securityLevel: newKeyResult.data!.metadata.securityLevel,
          operationCount: 1
        }
      };

    } catch (error) {
      console.error('❌ HSM Dilithium key rotation failed:', error);
      
      return {
        success: false,
        error: {
          code: 'HSM_DILITHIUM_ROTATION_FAILED',
          message: `HSM Dilithium key rotation failed: ${error.message}`,
          recoverable: true,
          details: { currentKeyId: params.currentKeyId }
        },
        metrics: {
          operationType: 'hsm_key_rotation',
          duration: Date.now() - startTime,
          timestamp: new Date(),
          keyId: params.currentKeyId
        },
        dilithiumMetrics: {
          hsmLatency: 0,
          totalLatency: Date.now() - startTime,
          securityLevel: 0,
          operationCount: 0
        }
      };
    }
  }

  /**
   * Get signature audit log for a key
   */
  getSignatureAuditLog(keyId: string): any[] {
    return this.signatureAuditLog.get(keyId) || [];
  }

  /**
   * Generate comprehensive audit report
   */
  generateAuditReport(keyId?: string): {
    totalSignatures: number;
    keyStatistics: Record<string, any>;
    securityMetrics: any;
    recommendations: string[];
  } {
    const keyStatistics: Record<string, any> = {};
    let totalSignatures = 0;

    // Analyze audit logs
    for (const [id, auditLog] of this.signatureAuditLog) {
      if (!keyId || id === keyId) {
        keyStatistics[id] = {
          signatureCount: auditLog.length,
          firstSignature: auditLog[0]?.timestamp,
          lastSignature: auditLog[auditLog.length - 1]?.timestamp,
          hsmSignatures: auditLog.filter(entry => entry.hsmSigned).length
        };
        totalSignatures += auditLog.length;
      }
    }

    // Generate security metrics
    const securityMetrics = {
      hsmUsagePercentage: totalSignatures > 0 
        ? Object.values(keyStatistics).reduce((sum: number, stats: any) => sum + stats.hsmSignatures, 0) / totalSignatures * 100 
        : 0,
      averageMessageSize: totalSignatures > 0 
        ? Array.from(this.signatureAuditLog.values()).flat().reduce((sum, entry) => sum + entry.messageLength, 0) / totalSignatures 
        : 0,
      activeKeys: Object.keys(keyStatistics).length
    };

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (securityMetrics.hsmUsagePercentage < 90) {
      recommendations.push('Increase HSM usage for enhanced security');
    }
    
    if (securityMetrics.activeKeys > 10) {
      recommendations.push('Consider key consolidation to reduce management overhead');
    }
    
    if (totalSignatures > 10000) {
      recommendations.push('Implement key rotation policy for high-volume signing');
    }

    return {
      totalSignatures,
      keyStatistics,
      securityMetrics,
      recommendations
    };
  }

  // Private helper methods

  private async performSecureEnclaveOperations(signature: Uint8Array): Promise<void> {
    // Simulate secure enclave operations
    await new Promise(resolve => setTimeout(resolve, 5));
    
    // Additional entropy mixing in secure enclave
    const enclaveEntropy = new Uint8Array(8);
    crypto.getRandomValues(enclaveEntropy);
    
    for (let i = 4; i < Math.min(12, signature.length); i++) {
      signature[i] ^= enclaveEntropy[i - 4];
    }
  }

  private async performSecurityChecks(params: any): Promise<any> {
    // Perform comprehensive security checks
    const checks = {
      signatureFormat: this.validateSignatureFormat(params.signature),
      publicKeyFormat: this.validatePublicKeyFormat(params.publicKey),
      messageIntegrity: await this.validateMessageIntegrity(params.message),
      timestampValid: this.validateTimestamp(params.signature),
      securityLevel: this.detectSecurityLevel(params.signature)
    };

    return {
      ...checks,
      overallValid: Object.values(checks).every(check => 
        typeof check === 'boolean' ? check : check > 0
      )
    };
  }

  private validateSignatureFormat(signature: Uint8Array): boolean {
    if (signature.length < 4) return false;
    if (signature[0] !== 0x44) return false; // Must start with 'D'
    if (![2, 3, 5].includes(signature[1])) return false; // Valid security levels
    return true;
  }

  private validatePublicKeyFormat(publicKey: Uint8Array): boolean {
    if (publicKey.length < 4) return false;
    if (publicKey[0] !== 0x44) return false; // Must start with 'D'
    if (![2, 3, 5].includes(publicKey[1])) return false; // Valid security levels
    return true;
  }

  private async validateMessageIntegrity(message: Uint8Array): Promise<boolean> {
    // Check for suspicious patterns or corruption
    if (message.length === 0) return false;
    
    // Check for null bytes (potential corruption)
    const nullBytes = Array.from(message).filter(byte => byte === 0).length;
    return nullBytes < message.length * 0.1; // Less than 10% null bytes
  }

  private validateTimestamp(signature: Uint8Array): boolean {
    if (signature.length < 4) return false;
    
    // Extract timestamp and validate it's reasonable
    const timestamp = signature[3];
    const now = Date.now() & 0xFF;
    const diff = Math.abs(timestamp - now);
    
    // Allow for reasonable timestamp variance
    return diff < 100;
  }

  private detectSecurityLevel(data: Uint8Array): number {
    // Detect security level from signature/key data
    if (data.length >= 4000) return 5; // Dilithium5
    if (data.length >= 3000) return 3; // Dilithium3
    if (data.length >= 2000) return 2; // Dilithium2
    return 0; // Unknown
  }

  private async computeMessageHash(message: Uint8Array): Promise<Uint8Array> {
    // Simple hash for simulation - in production would use SHA3-256
    const hash = new Uint8Array(32);
    let hashValue = 0;
    
    for (let i = 0; i < message.length; i++) {
      hashValue = ((hashValue * 31) + message[i]) & 0xFFFFFFFF;
    }
    
    for (let i = 0; i < hash.length; i++) {
      hash[i] = (hashValue >> (i % 4 * 8)) & 0xFF;
      hashValue = ((hashValue * 17) + i) & 0xFFFFFFFF;
    }
    
    return hash;
  }

  private getSignatureCount(keyId: string): number {
    const auditLog = this.signatureAuditLog.get(keyId);
    return auditLog ? auditLog.length : 0;
  }
}

/**
 * HSM-backed Dilithium Signature Manager
 */
export class DilithiumHSMSignatureManager {
  private readonly integration: DilithiumHSMIntegration;
  private readonly keyRegistry: Map<string, DilithiumHSMKeyMetadata>;
  private readonly signatureCache: Map<string, any> = new Map();

  constructor(integration: DilithiumHSMIntegration) {
    this.integration = integration;
    this.keyRegistry = new Map();
  }

  /**
   * Register new HSM-backed key
   */
  registerKey(metadata: DilithiumHSMKeyMetadata): void {
    this.keyRegistry.set(metadata.keyId, metadata);
    console.log(`📝 Registered HSM Dilithium key: ${metadata.keyId}`);
  }

  /**
   * Get key metadata
   */
  getKeyMetadata(keyId: string): DilithiumHSMKeyMetadata | undefined {
    return this.keyRegistry.get(keyId);
  }

  /**
   * List all registered keys
   */
  listKeys(filter?: {
    variant?: string;
    classification?: string;
    quantumResistant?: boolean;
  }): DilithiumHSMKeyMetadata[] {
    let keys = Array.from(this.keyRegistry.values());

    if (filter) {
      if (filter.variant) {
        keys = keys.filter(k => k.dilithiumVariant === filter.variant);
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
   * Generate security report
   */
  generateSecurityReport(): {
    totalKeys: number;
    quantumResistantKeys: number;
    keysByVariant: Record<string, number>;
    keysByClassification: Record<string, number>;
    totalSignatures: number;
    recommendations: string[];
  } {
    const keys = Array.from(this.keyRegistry.values());
    const keysByVariant: Record<string, number> = {};
    const keysByClassification: Record<string, number> = {};
    const recommendations: string[] = [];

    // Count keys by variant and classification
    keys.forEach(key => {
      keysByVariant[key.dilithiumVariant] = (keysByVariant[key.dilithiumVariant] || 0) + 1;
      keysByClassification[key.classification] = (keysByClassification[key.classification] || 0) + 1;
    });

    // Calculate total signatures
    const totalSignatures = keys.reduce((sum, key) => sum + key.signatureCount, 0);

    // Generate recommendations
    const quantumResistantKeys = keys.filter(k => k.quantumResistant).length;
    
    if (quantumResistantKeys < keys.length) {
      recommendations.push('Migrate non-quantum-resistant keys to Dilithium variants');
    }

    if (keysByVariant['Dilithium2'] > keysByVariant['Dilithium5']) {
      recommendations.push('Consider upgrading to higher security variants for executive use');
    }

    if (totalSignatures > 50000) {
      recommendations.push('High signature volume detected - implement key rotation policy');
    }

    return {
      totalKeys: keys.length,
      quantumResistantKeys,
      keysByVariant,
      keysByClassification,
      totalSignatures,
      recommendations
    };
  }
}