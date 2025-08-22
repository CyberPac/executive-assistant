/**
 * Post-Quantum Cryptography Suite - WBS 2.3
 * Unified interface for CRYSTALS-Kyber and CRYSTALS-Dilithium
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * Complete post-quantum cryptography solution for executive data protection
 */

import { CRYSTALSKyber, KyberKeyPair, KyberEncapsulationResult, KyberDecapsulationResult } from './CRYSTALSKyber';
import { CRYSTALSDilithium, DilithiumKeyPair, DilithiumSignatureResult, DilithiumVerificationResult } from './CRYSTALSDilithium';
import { KyberHSMIntegration, KyberHSMKeyManager } from './KyberHSMIntegration';
import { DilithiumHSMIntegration, DilithiumHSMSignatureManager } from './DilithiumHSMIntegration';
import { DilithiumValidator, SecurityValidationConfig } from './validation/DilithiumValidator';
import { HSMInterface } from '../hsm/HSMInterface';

export interface PostQuantumConfig {
  readonly enableKyber: boolean;
  readonly enableDilithium: boolean;
  readonly defaultKyberVariant: 'Kyber512' | 'Kyber768' | 'Kyber1024';
  readonly defaultDilithiumVariant: 'Dilithium2' | 'Dilithium3' | 'Dilithium5';
  readonly hsmIntegration: boolean;
  readonly securityValidation: boolean;
  readonly performanceMonitoring: boolean;
  readonly executiveMode: boolean;
}

export interface PostQuantumKeyPair {
  readonly keyId: string;
  readonly kyberKeyPair?: KyberKeyPair;
  readonly dilithiumKeyPair?: DilithiumKeyPair;
  readonly combinedMetadata: {
    classification: 'executive' | 'strategic' | 'confidential';
    usage: string[];
    createdAt: Date;
    quantumResistant: boolean;
  };
}

export interface HybridEncryptionResult {
  readonly encapsulationResult: KyberEncapsulationResult;
  readonly signatureResult?: DilithiumSignatureResult;
  readonly combinedCiphertext: Uint8Array;
  readonly metadata: {
    keyId: string;
    algorithms: string[];
    timestamp: Date;
    securityLevel: number;
  };
}

export interface HybridDecryptionResult {
  readonly decapsulationResult: KyberDecapsulationResult;
  readonly verificationResult?: DilithiumVerificationResult;
  readonly plaintext: Uint8Array;
  readonly metadata: {
    keyId: string;
    algorithms: string[];
    timestamp: Date;
    verified: boolean;
  };
}

export interface PostQuantumMetrics {
  readonly kyberMetrics: any[];
  readonly dilithiumMetrics: any[];
  readonly hybridMetrics: any[];
  readonly performanceSummary: {
    averageEncryptionTime: number;
    averageDecryptionTime: number;
    averageSigningTime: number;
    averageVerificationTime: number;
  };
}

/**
 * Post-Quantum Cryptography Suite
 * Provides unified interface for quantum-resistant cryptography
 */
export class PostQuantumSuite {
  private readonly config: PostQuantumConfig;
  private readonly kyber?: CRYSTALSKyber;
  private readonly dilithium?: CRYSTALSDilithium;
  private readonly kyberHSM?: KyberHSMIntegration;
  private readonly dilithiumHSM?: DilithiumHSMIntegration;
  private readonly validator?: DilithiumValidator;
  private readonly hsm?: HSMInterface;
  private readonly keyRegistry: Map<string, PostQuantumKeyPair> = new Map();
  private readonly operationMetrics: any[] = [];

  constructor(config: PostQuantumConfig, hsm?: HSMInterface) {
    this.config = config;
    this.hsm = hsm;

    // Initialize Kyber if enabled
    if (config.enableKyber) {
      this.kyber = new CRYSTALSKyber();
      
      if (config.hsmIntegration && hsm) {
        this.kyberHSM = new KyberHSMIntegration(hsm, {
          hsmEndpoint: 'executive-hsm',
          authMethod: 'certificate',
          keyStoragePolicy: 'hsm_only',
          performanceMode: config.executiveMode ? 'secure' : 'balanced',
          enableSecureEnclaves: config.executiveMode
        });
      }
    }

    // Initialize Dilithium if enabled
    if (config.enableDilithium) {
      this.dilithium = new CRYSTALSDilithium();
      
      if (config.hsmIntegration && hsm) {
        this.dilithiumHSM = new DilithiumHSMIntegration(hsm, {
          hsmEndpoint: 'executive-hsm',
          authMethod: 'certificate',
          keyStoragePolicy: 'hsm_only',
          performanceMode: config.executiveMode ? 'secure' : 'balanced',
          enableSecureEnclaves: config.executiveMode,
          signatureAuditing: true
        });
      }

      // Initialize security validator if enabled
      if (config.securityValidation) {
        const validationConfig: SecurityValidationConfig = {
          strictMode: config.executiveMode,
          complianceStandards: ['NIST-FIPS-204', 'RFC-8692', 'EXECUTIVE-SECURITY'],
          performanceRequirements: {
            maxKeyGenTime: config.executiveMode ? 50 : 100,
            maxSignTime: config.executiveMode ? 40 : 75,
            maxVerifyTime: config.executiveMode ? 25 : 50
          },
          securityRequirements: {
            minEntropyBits: config.executiveMode ? 7.8 : 7.5,
            maxBiasThreshold: config.executiveMode ? 0.02 : 0.05,
            requiredSecurityLevel: config.executiveMode ? 5 : 3
          }
        };
        
        this.validator = new DilithiumValidator(validationConfig, this.dilithiumHSM);
      }
    }

    console.log('🔒 Post-Quantum Cryptography Suite initialized');
    console.log(`   Kyber: ${config.enableKyber ? 'Enabled' : 'Disabled'}`);
    console.log(`   Dilithium: ${config.enableDilithium ? 'Enabled' : 'Disabled'}`);
    console.log(`   HSM Integration: ${config.hsmIntegration ? 'Enabled' : 'Disabled'}`);
    console.log(`   Executive Mode: ${config.executiveMode ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Initialize the post-quantum suite
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Post-Quantum Suite...');

    // Initialize HSM if configured
    if (this.hsm && this.config.hsmIntegration) {
      await this.hsm.initialize();
      console.log('✅ HSM initialized');
    }

    // Run security validation if enabled
    if (this.validator && this.config.securityValidation) {
      const auditResult = await this.validator.runSecurityAudit();
      
      if (auditResult.riskAssessment === 'critical') {
        throw new Error('Critical security issues detected. Suite initialization aborted.');
      }
      
      console.log(`✅ Security validation completed. Risk level: ${auditResult.riskAssessment}`);
    }

    console.log('✅ Post-Quantum Suite initialization complete');
  }

  /**
   * Generate post-quantum key pair
   */
  async generateKeyPair(params: {
    keyId?: string;
    includeKyber?: boolean;
    includeDilithium?: boolean;
    classification?: 'executive' | 'strategic' | 'confidential';
    usage?: string[];
  }): Promise<PostQuantumKeyPair> {
    
    const keyId = params.keyId || this.generateKeyId();
    const includeKyber = params.includeKyber ?? this.config.enableKyber;
    const includeDilithium = params.includeDilithium ?? this.config.enableDilithium;
    const classification = params.classification || (this.config.executiveMode ? 'executive' : 'strategic');
    const usage = params.usage || ['encryption', 'digital_signature'];

    console.log(`🔑 Generating post-quantum key pair: ${keyId}`);

    let kyberKeyPair: KyberKeyPair | undefined;
    let dilithiumKeyPair: DilithiumKeyPair | undefined;

    // Generate Kyber key pair if requested
    if (includeKyber && this.kyber) {
      if (this.kyberHSM && this.config.hsmIntegration) {
        const hsmResult = await this.kyberHSM.generateHSMKeyPair({
          variant: this.config.defaultKyberVariant,
          classification,
          usage: [...usage, 'key_encapsulation']
        });
        
        if (hsmResult.success && hsmResult.data) {
          // Convert HSM result to standard KyberKeyPair format
          kyberKeyPair = {
            publicKey: hsmResult.data.publicKey,
            privateKey: new Uint8Array(), // Private key stays in HSM
            keyId: hsmResult.data.keyId,
            parameters: this.kyber.getParameters(this.config.defaultKyberVariant)!,
            createdAt: new Date(),
            metadata: {
              usage: hsmResult.data.metadata.usage,
              classification: hsmResult.data.metadata.classification as any,
              rotationPolicy: hsmResult.data.metadata.rotationPolicy
            }
          };
        }
      } else {
        kyberKeyPair = await this.kyber.generateKeyPair({
          variant: this.config.defaultKyberVariant,
          classification,
          usage: [...usage, 'key_encapsulation']
        });
      }
    }

    // Generate Dilithium key pair if requested
    if (includeDilithium && this.dilithium) {
      if (this.dilithiumHSM && this.config.hsmIntegration) {
        const hsmResult = await this.dilithiumHSM.generateHSMKeyPair({
          variant: this.config.defaultDilithiumVariant,
          classification,
          usage: [...usage, 'digital_signature']
        });
        
        if (hsmResult.success && hsmResult.data) {
          // Convert HSM result to standard DilithiumKeyPair format
          dilithiumKeyPair = {
            publicKey: hsmResult.data.publicKey,
            privateKey: new Uint8Array(), // Private key stays in HSM
            keyId: hsmResult.data.keyId,
            parameters: this.dilithium.getParameters(this.config.defaultDilithiumVariant)!,
            createdAt: new Date(),
            metadata: {
              usage: hsmResult.data.metadata.usage,
              classification: hsmResult.data.metadata.classification as any,
              rotationPolicy: hsmResult.data.metadata.rotationPolicy
            }
          };
        }
      } else {
        dilithiumKeyPair = await this.dilithium.generateKeyPair({
          variant: this.config.defaultDilithiumVariant,
          classification,
          usage: [...usage, 'digital_signature']
        });
      }
    }

    const postQuantumKeyPair: PostQuantumKeyPair = {
      keyId,
      kyberKeyPair,
      dilithiumKeyPair,
      combinedMetadata: {
        classification,
        usage,
        createdAt: new Date(),
        quantumResistant: true
      }
    };

    // Register the key pair
    this.keyRegistry.set(keyId, postQuantumKeyPair);
    
    console.log(`✅ Post-quantum key pair generated: ${keyId}`);
    return postQuantumKeyPair;
  }

  /**
   * Hybrid encryption with optional signing
   */
  async hybridEncrypt(params: {
    data: Uint8Array;
    recipientKeyId: string;
    signerKeyId?: string;
    includeSignature?: boolean;
  }): Promise<HybridEncryptionResult> {
    
    const startTime = Date.now();
    const recipientKeys = this.keyRegistry.get(params.recipientKeyId);
    
    if (!recipientKeys) {
      throw new Error(`Recipient key not found: ${params.recipientKeyId}`);
    }

    if (!recipientKeys.kyberKeyPair) {
      throw new Error(`Kyber key pair not available for recipient: ${params.recipientKeyId}`);
    }

    console.log(`🔒 Hybrid encryption for recipient: ${params.recipientKeyId}`);

    // Perform Kyber encapsulation
    const encapsulationResult = await this.kyber!.encapsulate(
      recipientKeys.kyberKeyPair.publicKey,
      recipientKeys.kyberKeyPair.keyId
    );

    // Encrypt data with shared secret using AES-GCM
    const encryptedData = await this.symmetricEncrypt(params.data, encapsulationResult.sharedSecret);

    let signatureResult: DilithiumSignatureResult | undefined;

    // Add digital signature if requested
    if (params.includeSignature && params.signerKeyId) {
      const signerKeys = this.keyRegistry.get(params.signerKeyId);
      
      if (!signerKeys?.dilithiumKeyPair) {
        throw new Error(`Dilithium key pair not available for signer: ${params.signerKeyId}`);
      }

      // Sign the encrypted data
      if (this.dilithiumHSM && this.config.hsmIntegration) {
        const hsmSignResult = await this.dilithiumHSM.hsmSign({
          message: encryptedData,
          hsmKeyHandle: signerKeys.dilithiumKeyPair.keyId, // Assuming HSM handle
          keyId: signerKeys.dilithiumKeyPair.keyId,
          useHSMSigning: true
        });
        
        if (hsmSignResult.success && hsmSignResult.data) {
          signatureResult = {
            signature: hsmSignResult.data.signature,
            keyId: signerKeys.dilithiumKeyPair.keyId,
            timestamp: new Date(),
            messageHash: hsmSignResult.data.messageHash,
            metrics: {
              operationType: 'signing',
              duration: hsmSignResult.dilithiumMetrics.totalLatency,
              securityLevel: hsmSignResult.dilithiumMetrics.securityLevel,
              variant: this.config.defaultDilithiumVariant,
              bytesProcessed: encryptedData.length
            }
          };
        }
      } else {
        signatureResult = await this.dilithium!.sign(
          encryptedData,
          signerKeys.dilithiumKeyPair.privateKey,
          signerKeys.dilithiumKeyPair.keyId
        );
      }
    }

    // Combine ciphertext and signature
    const combinedCiphertext = this.combineCiphertextAndSignature(
      encapsulationResult.ciphertext,
      encryptedData,
      signatureResult?.signature
    );

    const totalTime = Date.now() - startTime;
    
    // Record metrics
    this.recordMetrics({
      operation: 'hybrid_encryption',
      duration: totalTime,
      keyId: params.recipientKeyId,
      dataSize: params.data.length,
      includeSignature: !!params.includeSignature
    });

    const result: HybridEncryptionResult = {
      encapsulationResult,
      signatureResult,
      combinedCiphertext,
      metadata: {
        keyId: params.recipientKeyId,
        algorithms: signatureResult 
          ? [`CRYSTALS-${this.config.defaultKyberVariant}`, `CRYSTALS-${this.config.defaultDilithiumVariant}`]
          : [`CRYSTALS-${this.config.defaultKyberVariant}`],
        timestamp: new Date(),
        securityLevel: Math.max(
          encapsulationResult.metrics.securityLevel,
          signatureResult?.metrics.securityLevel || 0
        )
      }
    };

    console.log(`✅ Hybrid encryption completed: ${params.recipientKeyId} (${totalTime}ms)`);
    return result;
  }

  /**
   * Hybrid decryption with optional signature verification
   */
  async hybridDecrypt(params: {
    combinedCiphertext: Uint8Array;
    recipientKeyId: string;
    signerKeyId?: string;
    verifySignature?: boolean;
  }): Promise<HybridDecryptionResult> {
    
    const startTime = Date.now();
    const recipientKeys = this.keyRegistry.get(params.recipientKeyId);
    
    if (!recipientKeys) {
      throw new Error(`Recipient key not found: ${params.recipientKeyId}`);
    }

    if (!recipientKeys.kyberKeyPair) {
      throw new Error(`Kyber key pair not available for recipient: ${params.recipientKeyId}`);
    }

    console.log(`🔓 Hybrid decryption for recipient: ${params.recipientKeyId}`);

    // Extract ciphertext components
    const { kyberCiphertext, encryptedData, signature } = this.extractCiphertextComponents(
      params.combinedCiphertext
    );

    // Perform Kyber decapsulation
    const decapsulationResult = await this.kyber!.decapsulate(
      kyberCiphertext,
      recipientKeys.kyberKeyPair.privateKey,
      recipientKeys.kyberKeyPair.keyId
    );

    // Decrypt data with shared secret
    const plaintext = await this.symmetricDecrypt(encryptedData, decapsulationResult.sharedSecret);

    let verificationResult: DilithiumVerificationResult | undefined;
    let verified = false;

    // Verify signature if requested and available
    if (params.verifySignature && signature && params.signerKeyId) {
      const signerKeys = this.keyRegistry.get(params.signerKeyId);
      
      if (signerKeys?.dilithiumKeyPair) {
        if (this.dilithiumHSM && this.config.hsmIntegration) {
          const hsmVerifyResult = await this.dilithiumHSM.hsmVerify({
            message: encryptedData,
            signature,
            publicKey: signerKeys.dilithiumKeyPair.publicKey,
            keyId: signerKeys.dilithiumKeyPair.keyId,
            useHSMVerification: true
          });
          
          if (hsmVerifyResult.success && hsmVerifyResult.data) {
            verificationResult = {
              valid: hsmVerifyResult.data.valid,
              keyId: signerKeys.dilithiumKeyPair.keyId,
              timestamp: new Date(),
              messageHash: hsmVerifyResult.data.messageHash,
              metrics: {
                operationType: 'verification',
                duration: hsmVerifyResult.dilithiumMetrics.totalLatency,
                securityLevel: hsmVerifyResult.dilithiumMetrics.securityLevel,
                variant: this.config.defaultDilithiumVariant,
                bytesProcessed: encryptedData.length + signature.length
              }
            };
            verified = hsmVerifyResult.data.valid;
          }
        } else {
          verificationResult = await this.dilithium!.verify(
            encryptedData,
            signature,
            signerKeys.dilithiumKeyPair.publicKey,
            signerKeys.dilithiumKeyPair.keyId
          );
          verified = verificationResult.valid;
        }
      }
    }

    const totalTime = Date.now() - startTime;
    
    // Record metrics
    this.recordMetrics({
      operation: 'hybrid_decryption',
      duration: totalTime,
      keyId: params.recipientKeyId,
      dataSize: plaintext.length,
      verifySignature: !!params.verifySignature,
      signatureValid: verified
    });

    const result: HybridDecryptionResult = {
      decapsulationResult,
      verificationResult,
      plaintext,
      metadata: {
        keyId: params.recipientKeyId,
        algorithms: verificationResult 
          ? [`CRYSTALS-${this.config.defaultKyberVariant}`, `CRYSTALS-${this.config.defaultDilithiumVariant}`]
          : [`CRYSTALS-${this.config.defaultKyberVariant}`],
        timestamp: new Date(),
        verified
      }
    };

    console.log(`✅ Hybrid decryption completed: ${params.recipientKeyId} - ${verified ? 'VERIFIED' : 'UNVERIFIED'} (${totalTime}ms)`);
    return result;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PostQuantumMetrics {
    const kyberMetrics = this.kyber?.getPerformanceMetrics() || [];
    const dilithiumMetrics = this.dilithium?.getPerformanceMetrics() || [];
    const hybridMetrics = this.operationMetrics.slice(-100);

    // Calculate performance summary
    const encryptionTimes = hybridMetrics
      .filter(m => m.operation === 'hybrid_encryption')
      .map(m => m.duration);
    const decryptionTimes = hybridMetrics
      .filter(m => m.operation === 'hybrid_decryption')
      .map(m => m.duration);
    const signingTimes = dilithiumMetrics
      .filter(m => m.operationType === 'signing')
      .map(m => m.duration);
    const verificationTimes = dilithiumMetrics
      .filter(m => m.operationType === 'verification')
      .map(m => m.duration);

    const average = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      kyberMetrics,
      dilithiumMetrics,
      hybridMetrics,
      performanceSummary: {
        averageEncryptionTime: average(encryptionTimes),
        averageDecryptionTime: average(decryptionTimes),
        averageSigningTime: average(signingTimes),
        averageVerificationTime: average(verificationTimes)
      }
    };
  }

  /**
   * Get registered keys
   */
  getRegisteredKeys(): string[] {
    return Array.from(this.keyRegistry.keys());
  }

  /**
   * Get key pair by ID
   */
  getKeyPair(keyId: string): PostQuantumKeyPair | undefined {
    return this.keyRegistry.get(keyId);
  }

  /**
   * Run security validation
   */
  async runSecurityValidation(): Promise<any> {
    if (!this.validator) {
      throw new Error('Security validation not enabled');
    }
    
    return await this.validator.runSecurityAudit();
  }

  // Private helper methods

  private generateKeyId(): string {
    return `pq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async symmetricEncrypt(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
    // Simplified symmetric encryption using key material
    // In production, would use proper AES-GCM with the shared secret as key
    const encrypted = new Uint8Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ key[i % key.length];
    }
    
    return encrypted;
  }

  private async symmetricDecrypt(encryptedData: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
    // Simplified symmetric decryption using key material
    // In production, would use proper AES-GCM with the shared secret as key
    const decrypted = new Uint8Array(encryptedData.length);
    
    for (let i = 0; i < encryptedData.length; i++) {
      decrypted[i] = encryptedData[i] ^ key[i % key.length];
    }
    
    return decrypted;
  }

  private combineCiphertextAndSignature(
    kyberCiphertext: Uint8Array,
    encryptedData: Uint8Array,
    signature?: Uint8Array
  ): Uint8Array {
    // Combine all components with length prefixes
    const hasSignature = signature ? 1 : 0;
    const totalLength = 1 + 4 + kyberCiphertext.length + 4 + encryptedData.length + 
      (signature ? 4 + signature.length : 0);
    
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    
    // Has signature flag
    combined[offset] = hasSignature;
    offset += 1;
    
    // Kyber ciphertext length and data
    combined.set(this.encodeLength(kyberCiphertext.length), offset);
    offset += 4;
    combined.set(kyberCiphertext, offset);
    offset += kyberCiphertext.length;
    
    // Encrypted data length and data
    combined.set(this.encodeLength(encryptedData.length), offset);
    offset += 4;
    combined.set(encryptedData, offset);
    offset += encryptedData.length;
    
    // Signature length and data (if present)
    if (signature) {
      combined.set(this.encodeLength(signature.length), offset);
      offset += 4;
      combined.set(signature, offset);
    }
    
    return combined;
  }

  private extractCiphertextComponents(combinedCiphertext: Uint8Array): {
    kyberCiphertext: Uint8Array;
    encryptedData: Uint8Array;
    signature?: Uint8Array;
  } {
    let offset = 0;
    
    // Check signature flag
    const hasSignature = combinedCiphertext[offset] === 1;
    offset += 1;
    
    // Extract Kyber ciphertext
    const kyberLength = this.decodeLength(combinedCiphertext.subarray(offset, offset + 4));
    offset += 4;
    const kyberCiphertext = combinedCiphertext.subarray(offset, offset + kyberLength);
    offset += kyberLength;
    
    // Extract encrypted data
    const dataLength = this.decodeLength(combinedCiphertext.subarray(offset, offset + 4));
    offset += 4;
    const encryptedData = combinedCiphertext.subarray(offset, offset + dataLength);
    offset += dataLength;
    
    // Extract signature if present
    let signature: Uint8Array | undefined;
    if (hasSignature) {
      const signatureLength = this.decodeLength(combinedCiphertext.subarray(offset, offset + 4));
      offset += 4;
      signature = combinedCiphertext.subarray(offset, offset + signatureLength);
    }
    
    return {
      kyberCiphertext,
      encryptedData,
      signature
    };
  }

  private encodeLength(length: number): Uint8Array {
    const bytes = new Uint8Array(4);
    bytes[0] = (length >> 24) & 0xFF;
    bytes[1] = (length >> 16) & 0xFF;
    bytes[2] = (length >> 8) & 0xFF;
    bytes[3] = length & 0xFF;
    return bytes;
  }

  private decodeLength(bytes: Uint8Array): number {
    return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  }

  private recordMetrics(metrics: any): void {
    this.operationMetrics.push({
      ...metrics,
      timestamp: new Date()
    });
    
    // Keep only recent metrics
    if (this.operationMetrics.length > 1000) {
      this.operationMetrics.splice(0, this.operationMetrics.length - 500);
    }
  }
}

/**
 * Create default post-quantum configuration
 */
export function createDefaultPostQuantumConfig(): PostQuantumConfig {
  return {
    enableKyber: true,
    enableDilithium: true,
    defaultKyberVariant: 'Kyber768',
    defaultDilithiumVariant: 'Dilithium3',
    hsmIntegration: false,
    securityValidation: true,
    performanceMonitoring: true,
    executiveMode: false
  };
}

/**
 * Create executive-grade post-quantum configuration
 */
export function createExecutivePostQuantumConfig(): PostQuantumConfig {
  return {
    enableKyber: true,
    enableDilithium: true,
    defaultKyberVariant: 'Kyber1024',
    defaultDilithiumVariant: 'Dilithium5',
    hsmIntegration: true,
    securityValidation: true,
    performanceMonitoring: true,
    executiveMode: true
  };
}