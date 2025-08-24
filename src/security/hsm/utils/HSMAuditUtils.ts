/**
 * HSM Audit Utilities - Helper functions for creating audit entries
 */

import type { HSMAuditEntry } from '../core/HSMAuditLogger';

export interface CreateAuditEntryParams {
  operation: string;
  keyId?: string;
  userId?: string;
  sourceIp?: string;
  result: 'success' | 'failure' | 'unauthorized' | 'error';
  duration: number;
  operationType: string;
  bytesProcessed?: number;
  authMethod: string;
  sessionId?: string;
  additionalData?: Record<string, unknown>;
}

export class HSMAuditUtils {
  static async createAuditEntry(params: CreateAuditEntryParams): Promise<Omit<HSMAuditEntry, 'operationId' | 'timestamp' | 'integrityVerified'>> {
    const perfMetrics: any = {
      duration: params.duration,
      operationType: params.operationType
    };
    
    if (params.bytesProcessed !== undefined) {
      perfMetrics.bytesProcessed = params.bytesProcessed;
    }
    
    const secContext: any = {
      authMethod: params.authMethod
    };
    
    if (params.sessionId !== undefined) {
      secContext.sessionId = params.sessionId;
    }
    
    const result: any = {
      operation: params.operation,
      result: params.result,
      performanceMetrics: perfMetrics,
      securityContext: secContext
    };
    
    if (params.keyId !== undefined) {
      result.keyId = params.keyId;
    }
    
    if (params.userId !== undefined) {
      result.userId = params.userId;
    }
    
    if (params.sourceIp !== undefined) {
      result.sourceIp = params.sourceIp;
    }
    
    if (params.additionalData !== undefined) {
      result.additionalData = params.additionalData;
    }
    
    return result;
  }
}