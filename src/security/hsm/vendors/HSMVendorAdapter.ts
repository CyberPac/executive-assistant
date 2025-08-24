/**
 * HSM Vendor Adapter Interface - WBS 2.2.1
 * Vendor-agnostic adapter pattern for HSM integration
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * Supports: Thales, AWS CloudHSM, Azure Dedicated HSM
 */

export interface HSMVendorAdapter {
  readonly vendorName: string;
  readonly apiVersion: string;
  
  // Connection Management
  connect(config: HSMConnectionConfig): Promise<HSMConnection>;
  disconnect(_connection: HSMConnection): Promise<void>;
  healthCheck(_connection: HSMConnection): Promise<HSMVendorHealthStatus>;
  
  // Key Operations
  generateKey(_connection: HSMConnection, params: HSMKeyGenerationParams): Promise<HSMVendorKeyResult>;
  importKey(_connection: HSMConnection, params: HSMKeyImportParams): Promise<HSMVendorKeyResult>;
  exportKey(_connection: HSMConnection, keyId: string, format: string): Promise<HSMVendorExportResult>;
  deleteKey(_connection: HSMConnection, keyId: string): Promise<HSMVendorOperationResult>;
  
  // Cryptographic Operations
  encrypt(_connection: HSMConnection, params: HSMEncryptionParams): Promise<HSMVendorCryptoResult>;
  decrypt(_connection: HSMConnection, params: HSMDecryptionParams): Promise<HSMVendorCryptoResult>;
  sign(_connection: HSMConnection, params: HSMSigningParams): Promise<HSMVendorSignatureResult>;
  verify(_connection: HSMConnection, params: HSMVerificationParams): Promise<HSMVendorVerificationResult>;
  
  // Administrative Operations
  getKeyMetadata(_connection: HSMConnection, keyId: string): Promise<HSMVendorKeyMetadata>;
  listKeys(_connection: HSMConnection, filter?: HSMKeyFilter): Promise<HSMVendorKeyList>;
  getAuditLogs(_connection: HSMConnection, filter?: HSMAuditFilter): Promise<HSMVendorAuditResult>;
}

export interface HSMConnectionConfig {
  endpoint: string;
  credentials: HSMCredentials;
  timeout: number;
  retryPolicy: HSMRetryPolicy;
}

export interface HSMCredentials {
  type: 'certificate' | 'token' | 'username-password';
  certificate?: {
    certPath: string;
    keyPath: string;
    caCertPath?: string;
  };
  token?: {
    accessToken: string;
    refreshToken?: string;
    tokenEndpoint?: string;
  };
  usernamePassword?: {
    username: string;
    password: string;
  };
}

export interface HSMRetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  retryableErrors: string[];
}

export interface HSMConnection {
  readonly connectionId: string;
  readonly vendor: string;
  readonly status: 'connected' | 'disconnected' | 'error';
  readonly establishedAt: Date;
  readonly lastActivity: Date;
}

export interface HSMVendorHealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  version: string;
  capabilities: string[];
  performance: {
    latencyMs: number;
    throughputOps: number;
    errorRate: number;
  };
}

export interface HSMKeyGenerationParams {
  keyType: 'symmetric' | 'asymmetric' | 'post-quantum';
  algorithm: string;
  keySize?: number;
  usage: string[];
  exportable: boolean;
  attributes?: Record<string, any>;
}

export interface HSMKeyImportParams {
  keyData: Buffer;
  keyType: string;
  algorithm: string;
  usage: string[];
  attributes?: Record<string, any>;
}

export interface HSMVendorKeyResult {
  keyId: string;
  publicKey?: Buffer;
  keyHandle?: string;
  attributes: Record<string, any>;
}

export interface HSMVendorExportResult {
  keyData: Buffer;
  format: string;
  protected: boolean;
}

export interface HSMVendorOperationResult {
  success: boolean;
  message?: string;
  details?: Record<string, any>;
}

export interface HSMEncryptionParams {
  keyId: string;
  algorithm: string;
  data: Buffer;
  iv?: Buffer;
  additionalData?: Buffer;
}

export interface HSMDecryptionParams {
  keyId: string;
  algorithm: string;
  ciphertext: Buffer;
  iv?: Buffer;
  tag?: Buffer;
  additionalData?: Buffer;
}

export interface HSMSigningParams {
  keyId: string;
  algorithm: string;
  data: Buffer;
  hashAlgorithm?: string;
}

export interface HSMVerificationParams {
  keyId: string;
  algorithm: string;
  data: Buffer;
  signature: Buffer;
  hashAlgorithm?: string;
}

export interface HSMVendorCryptoResult {
  result: Buffer;
  metadata?: {
    iv?: Buffer;
    tag?: Buffer;
    algorithm: string;
  };
}

export interface HSMVendorSignatureResult {
  signature: Buffer;
  algorithm: string;
  keyId: string;
}

export interface HSMVendorVerificationResult {
  valid: boolean;
  algorithm: string;
  keyId: string;
}

export interface HSMVendorKeyMetadata {
  keyId: string;
  keyType: string;
  algorithm: string;
  usage: string[];
  created: Date;
  expires?: Date;
  attributes: Record<string, any>;
}

export interface HSMKeyFilter {
  keyType?: string;
  algorithm?: string;
  usage?: string[];
  created?: { after?: Date; before?: Date };
}

export interface HSMVendorKeyList {
  keys: HSMVendorKeyMetadata[];
  totalCount: number;
  hasMore: boolean;
}

export interface HSMAuditFilter {
  operation?: string;
  keyId?: string;
  timeRange?: { start: Date; end: Date };
  userId?: string;
  result?: 'success' | 'failure';
}

export interface HSMVendorAuditResult {
  entries: HSMVendorAuditEntry[];
  totalCount: number;
  hasMore: boolean;
}

export interface HSMVendorAuditEntry {
  timestamp: Date;
  operation: string;
  keyId?: string;
  userId?: string;
  result: 'success' | 'failure';
  details?: Record<string, any>;
}

/**
 * Abstract base class for HSM vendor adapters
 */
export abstract class BaseHSMVendorAdapter implements HSMVendorAdapter {
  abstract readonly vendorName: string;
  abstract readonly apiVersion: string;

  protected validateConnection(connection: HSMConnection): void {
    if (connection.status !== 'connected') {
      throw new Error(`HSM connection not active: ${connection.status}`);
    }
  }

  protected createOperationResult(success: boolean, message?: string, details?: Record<string, any>): HSMVendorOperationResult {
    const result: HSMVendorOperationResult = { success };
    
    if (message !== undefined) {
      result.message = message;
    }
    
    if (details !== undefined) {
      result.details = details;
    }
    
    return result;
  }

  protected validateKeyGenerationParams(params: HSMKeyGenerationParams): void {
    if (!params.keyType || !params.algorithm || !params.usage?.length) {
      throw new Error('Invalid key generation parameters');
    }
  }

  protected validateEncryptionParams(params: HSMEncryptionParams): void {
    if (!params.keyId || !params.algorithm || !params.data) {
      throw new Error('Invalid encryption parameters');
    }
  }

  // Abstract methods to be implemented by vendor-specific adapters
  abstract connect(config: HSMConnectionConfig): Promise<HSMConnection>;
  abstract disconnect(_connection: HSMConnection): Promise<void>;
  abstract healthCheck(_connection: HSMConnection): Promise<HSMVendorHealthStatus>;
  abstract generateKey(_connection: HSMConnection, params: HSMKeyGenerationParams): Promise<HSMVendorKeyResult>;
  abstract importKey(_connection: HSMConnection, params: HSMKeyImportParams): Promise<HSMVendorKeyResult>;
  abstract exportKey(_connection: HSMConnection, keyId: string, format: string): Promise<HSMVendorExportResult>;
  abstract deleteKey(_connection: HSMConnection, keyId: string): Promise<HSMVendorOperationResult>;
  abstract encrypt(_connection: HSMConnection, params: HSMEncryptionParams): Promise<HSMVendorCryptoResult>;
  abstract decrypt(_connection: HSMConnection, params: HSMDecryptionParams): Promise<HSMVendorCryptoResult>;
  abstract sign(_connection: HSMConnection, params: HSMSigningParams): Promise<HSMVendorSignatureResult>;
  abstract verify(_connection: HSMConnection, params: HSMVerificationParams): Promise<HSMVendorVerificationResult>;
  abstract getKeyMetadata(_connection: HSMConnection, keyId: string): Promise<HSMVendorKeyMetadata>;
  abstract listKeys(_connection: HSMConnection, filter?: HSMKeyFilter): Promise<HSMVendorKeyList>;
  abstract getAuditLogs(_connection: HSMConnection, filter?: HSMAuditFilter): Promise<HSMVendorAuditResult>;
}