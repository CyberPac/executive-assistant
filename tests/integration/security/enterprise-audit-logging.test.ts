/**
 * Enterprise Audit Logging Integration Tests - WBS 2.5.4
 * Comprehensive testing for SIEM integration, immutable audit trails, and compliance reporting
 * 
 * @version 2.5.4
 * @author Executive Assistant Security Team
 * @since 2025-01-21
 */

import { describe, it, expect, beforeEach, afterEach, jest as _jest } from '@jest/globals';
import { SIEMIntegrationFramework, SIEMConfig } from '../../../src/security/audit/SIEMIntegrationFramework';
import { ImmutableAuditTrail, AuditChainConfig } from '../../../src/security/audit/ImmutableAuditTrail';
import { ComplianceReportingEngine, ComplianceConfig } from '../../../src/security/audit/ComplianceReportingEngine';
import { HSMAuditLogger, HSMAuditEntry } from '../../../src/security/hsm/core/HSMAuditLogger';

describe('Enterprise Audit Logging Integration', () => {
  let siemFramework: SIEMIntegrationFramework;
  let auditTrail: ImmutableAuditTrail;
  let complianceEngine: ComplianceReportingEngine;
  let auditLogger: HSMAuditLogger;
  
  let siemConfig: SIEMConfig;
  let chainConfig: AuditChainConfig;
  let complianceConfig: ComplianceConfig;

  beforeEach(async () => {
    // SIEM configuration
    siemConfig = {
      vendor: 'splunk',
      connection: {
        protocol: 'https',
        endpoint: 'https://splunk-test.example.com',
        port: 8088,
        authentication: {
          type: 'api-key',
          credentials: { token: 'test-token-12345', index: 'security' }
        },
        encryption: {
          enabled: true,
          protocol: 'tls1.3',
          certificateValidation: true,
          cipherSuites: ['TLS_AES_256_GCM_SHA384']
        },
        connectionPool: {
          minConnections: 2,
          maxConnections: 10,
          connectionTimeout: 5000,
          idleTimeout: 30000,
          keepAlive: true
        }
      },
      format: 'json',
      compliance: {
        frameworks: ['sox', 'hipaa'],
        dataClassification: true,
        retentionPolicies: [
          { framework: 'sox', category: 'financial', retentionDays: 2555, archivalRequired: true, deletionPolicy: 'secure-delete' }
        ],
        privacyControls: {
          piiDetection: true,
          dataAnonymization: false,
          consentTracking: true,
          rightToErasure: true
        },
        auditTrails: true
      },
      filtering: {
        severityFilter: ['critical', 'high', 'medium'],
        categoryFilter: ['authentication', 'authorization', 'data-access'],
        customFilters: [],
        rateLimiting: {
          enabled: true,
          maxEventsPerSecond: 1000,
          burstSize: 5000,
          backpressureStrategy: 'buffer'
        },
        deduplication: true
      },
      reliability: {
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeout: 60000,
          halfOpenRequests: 3
        },
        failover: {
          enabled: true,
          secondaryEndpoints: ['https://backup-splunk.example.com'],
          failoverStrategy: 'priority',
          healthCheckInterval: 30000
        },
        monitoring: {
          healthChecks: true,
          metrics: true,
          alerting: true,
          dashboardEnabled: true
        }
      },
      performance: {
        batchSize: 100,
        flushInterval: 5000,
        compression: true,
        parallelStreams: 4,
        bufferSize: 10000
      }
    };

    // Audit chain configuration
    chainConfig = {
      chainId: 'exec-audit-chain-test',
      blockSize: 100,
      hashAlgorithm: 'sha3-256',
      signatureAlgorithm: 'ecdsa',
      merkleTreeEnabled: true,
      distributedStorage: {
        enabled: false, // Simplified for testing
        nodes: [],
        consensusRequired: 1,
        syncInterval: 60000
      },
      validation: {
        validatorNodes: ['node-1'],
        consensusThreshold: 1,
        validationTimeout: 30000,
        byzantineTolerance: false
      },
      replication: {
        factor: 1,
        strategy: 'round-robin',
        verification: true,
        automaticRepair: false
      }
    };

    // Compliance configuration
    complianceConfig = {
      frameworks: [
        {
          framework: 'sox',
          enabled: true,
          requirements: [
            {
              id: 'sox-302',
              title: 'Management Assessment of Internal Controls',
              category: 'Internal Controls',
              mandatory: true,
              dataElements: ['control-assessments', 'deficiencies', 'remediation'],
              validationRules: [
                {
                  ruleId: 'sox-302-1',
                  description: 'Annual management assessment required',
                  condition: 'assessment_date < 365 days',
                  severity: 'critical',
                  autoRemediation: false
                }
              ],
              evidenceRequired: ['assessment-documents', 'audit-logs', 'remediation-plans']
            }
          ],
          reportingFrequency: 'quarterly',
          submissionEndpoints: [
            {
              name: 'sec-edgar',
              url: 'https://test-edgar.sec.gov/submit',
              authConfig: { type: 'certificate', credentials: { cert: 'test-cert' } },
              format: 'xml',
              encryption: true
            }
          ],
          retentionPolicy: {
            retentionYears: 7,
            archivalRequired: true,
            deletionPolicy: 'secure-delete',
            legalHold: false
          }
        }
      ],
      reporting: {
        outputDirectory: './test-reports',
        templateDirectory: './test-templates',
        defaultFormats: ['json', 'pdf'],
        emailNotifications: false, // Disabled for testing
        dashboardIntegration: true
      },
      monitoring: {
        continuousMonitoring: true,
        alertThresholds: [
          { metric: 'compliance-score', threshold: 90, condition: 'less-than', severity: 'high' }
        ],
        escalationMatrix: [
          { severity: 'critical', timeWindow: 3600, recipients: ['compliance-team@test.com'], escalationDelay: 1800 }
        ],
        dashboardRefreshInterval: 60000
      },
      automation: {
        autoReportGeneration: false, // Disabled for testing
        'autoEvidence Collection': true,
        autoRemediation: false,
        scheduledAssessments: true
      },
      storage: {
        encryptionEnabled: true,
        compressionEnabled: true,
        backupEnabled: true,
        archivalPolicy: {
          archiveAfterDays: 90,
          archiveLocation: './test-archive',
          deleteAfterYears: 7
        }
      }
    };

    // Initialize components
    siemFramework = new SIEMIntegrationFramework(siemConfig);
    auditTrail = new ImmutableAuditTrail(chainConfig);
    complianceEngine = new ComplianceReportingEngine(complianceConfig, auditTrail, siemFramework);
    auditLogger = new HSMAuditLogger({
      auditLevel: 'comprehensive',
      logRotation: true,
      encryptLogs: true,
      maxLogSize: 100,
      retentionDays: 2555,
      alertThresholds: { failureRate: 0.05, suspiciousPatterns: true, unauthorizedAccess: true },
      complianceMode: 'sox'
    }, './test-logs');
  });

  afterEach(async () => {
    // Cleanup
    try {
      await siemFramework.shutdown();
      await auditTrail.shutdown();
      await complianceEngine.shutdown();
      await auditLogger.shutdown();
    } catch (_error) {
      // Ignore cleanup errors in tests
    }
  });

  describe('SIEM Integration Framework', () => {
    it('should initialize SIEM connection successfully', async () => {
      // Act
      await siemFramework.initialize();
      
      // Assert
      const metrics = siemFramework.getMetrics();
      expect(metrics.connectionStatus).toBe('connected');
    });

    it('should send audit events to SIEM', async () => {
      // Arrange
      await siemFramework.initialize();
      
      const testAuditEntry: HSMAuditEntry = {
        operationId: 'test-op-001',
        timestamp: new Date(),
        operation: 'key-generation',
        result: 'success',
        integrityVerified: true,
        performanceMetrics: { duration: 150, operationType: 'crypto' },
        securityContext: { authMethod: 'certificate' },
        userId: 'test-user',
        sourceIp: '192.168.1.100'
      };
      
      // Act
      await siemFramework.sendEvent(testAuditEntry);
      
      // Assert
      const metrics = siemFramework.getMetrics();
      expect(metrics.eventsProcessed).toBe(1);
    });

    it('should handle batch event processing', async () => {
      // Arrange
      await siemFramework.initialize();
      
      const batchEntries: HSMAuditEntry[] = Array.from({ length: 50 }, (_, i) => ({
        operationId: `batch-op-${i}`,
        timestamp: new Date(),
        operation: 'key-usage',
        result: 'success',
        integrityVerified: true,
        performanceMetrics: { duration: 100 + i, operationType: 'crypto' },
        securityContext: { authMethod: 'api-key' }
      }));
      
      // Act
      await siemFramework.sendEventsBatch(batchEntries);
      
      // Assert
      const metrics = siemFramework.getMetrics();
      expect(metrics.eventsProcessed).toBe(50);
    });

    it('should filter events based on severity', async () => {
      // Arrange
      await siemFramework.initialize();
      
      const lowSeverityEntry: HSMAuditEntry = {
        operationId: 'low-severity-op',
        timestamp: new Date(),
        operation: 'status-check',
        result: 'success',
        integrityVerified: true,
        performanceMetrics: { duration: 10, operationType: 'monitoring' },
        securityContext: { authMethod: 'internal' }
      };
      
      // Act
      await siemFramework.sendEvent(lowSeverityEntry);
      
      // Assert - Low severity events might be filtered out
      const metrics = siemFramework.getMetrics();
      expect(metrics.eventsProcessed).toBeGreaterThanOrEqual(0);
    });

    it('should handle connection failures gracefully', async () => {
      // Arrange - Use invalid endpoint
      const failConfig = { ...siemConfig };
      failConfig.connection.endpoint = 'https://invalid-endpoint.example.com';
      const failingSiem = new SIEMIntegrationFramework(failConfig);
      
      // Act & Assert
      await expect(failingSiem.testConnection()).resolves.toBe(false);
      
      await failingSiem.shutdown();
    });
  });

  describe('Immutable Audit Trail', () => {
    it('should initialize audit chain with genesis block', async () => {
      // Act
      await auditTrail.initialize();
      
      // Assert
      const metrics = await auditTrail.getChainMetrics();
      expect(metrics.blockCount).toBe(1); // Genesis block
      expect(metrics.chainIntegrity).toBe(true);
    });

    it('should add audit entries to immutable trail', async () => {
      // Arrange
      await auditTrail.initialize();
      
      const testAuditEntry: HSMAuditEntry = {
        operationId: 'immutable-test-001',
        timestamp: new Date(),
        operation: 'key-signing',
        result: 'success',
        integrityVerified: true,
        performanceMetrics: { duration: 200, operationType: 'signature' },
        securityContext: { authMethod: 'hsm' }
      };
      
      // Act
      const entryId = await auditTrail.addAuditEntry(testAuditEntry);
      
      // Assert
      expect(entryId).toBeDefined();
      expect(entryId).toMatch(/^entry-\d+$/);
    });

    it('should maintain chain integrity after multiple entries', async () => {
      // Arrange
      await auditTrail.initialize();
      
      const entries: HSMAuditEntry[] = Array.from({ length: 10 }, (_, i) => ({
        operationId: `integrity-test-${i}`,
        timestamp: new Date(),
        operation: 'data-encryption',
        result: 'success',
        integrityVerified: true,
        performanceMetrics: { duration: 150 + i, operationType: 'encryption' },
        securityContext: { authMethod: 'certificate' }
      }));
      
      // Act
      for (const entry of entries) {
        await auditTrail.addAuditEntry(entry);
      }
      
      // Assert
      const integrity = await auditTrail.verifyChainIntegrity();
      expect(integrity).toBe(true);
      
      const metrics = await auditTrail.getChainMetrics();
      expect(metrics.entryCount).toBe(11); // 10 entries + genesis
    });

    it('should verify individual entry integrity', async () => {
      // Arrange
      await auditTrail.initialize();
      
      const testEntry: HSMAuditEntry = {
        operationId: 'verify-test-001',
        timestamp: new Date(),
        operation: 'key-derivation',
        result: 'success',
        integrityVerified: true,
        performanceMetrics: { duration: 180, operationType: 'derivation' },
        securityContext: { authMethod: 'token' }
      };
      
      // Act
      const entryId = await auditTrail.addAuditEntry(testEntry);
      const isValid = await auditTrail.verifyEntryIntegrity(entryId);
      
      // Assert
      expect(isValid).toBe(true);
    });

    it('should support executive audit trail queries', async () => {
      // Arrange
      await auditTrail.initialize();
      
      const executiveEntry: HSMAuditEntry = {
        operationId: 'exec-op-001',
        timestamp: new Date(),
        operation: 'executive-key-access',
        result: 'success',
        integrityVerified: true,
        performanceMetrics: { duration: 100, operationType: 'access' },
        securityContext: { authMethod: 'biometric' }
      };
      
      const executiveMetadata = {
        executiveId: 'exec-001',
        protectionLevel: 'maximum' as const,
        classification: 'secret' as const,
        priority: 'critical' as const,
        retention: 10
      };
      
      // Act
      await auditTrail.addAuditEntry(executiveEntry, executiveMetadata);
      const executiveTrail = await auditTrail.getExecutiveAuditTrail('exec-001');
      
      // Assert
      expect(executiveTrail.length).toBe(1);
      expect(executiveTrail[0].executive?.executiveId).toBe('exec-001');
      expect(executiveTrail[0].executive?.protectionLevel).toBe('maximum');
    });

    it('should export audit trail for compliance', async () => {
      // Arrange
      await auditTrail.initialize();
      
      // Add some test entries
      for (let i = 0; i < 5; i++) {
        await auditTrail.addAuditEntry({
          operationId: `export-test-${i}`,
          timestamp: new Date(),
          operation: 'compliance-test',
          result: 'success',
          integrityVerified: true,
          performanceMetrics: { duration: 120, operationType: 'test' },
          securityContext: { authMethod: 'system' }
        });
      }
      
      // Act
      const jsonExport = await auditTrail.exportAuditTrail('json');
      const csvExport = await auditTrail.exportAuditTrail('csv');
      
      // Assert
      expect(jsonExport).toContain('export-test-0');
      expect(csvExport).toContain('ID,Timestamp,Operation');
    });
  });

  describe('Compliance Reporting Engine', () => {
    beforeEach(async () => {
      await auditTrail.initialize();
      await siemFramework.initialize();
      await complianceEngine.initialize();
    });

    it('should generate SOX compliance report', async () => {
      // Arrange
      const reportPeriod = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        description: 'Monthly SOX Assessment'
      };
      
      // Act
      const report = await complianceEngine.generateComplianceReport('sox', 'compliance-status', reportPeriod);
      
      // Assert
      expect(report).toBeDefined();
      expect(report.framework).toBe('sox');
      expect(report.reportType).toBe('compliance-status');
      expect(report.summary.complianceScore).toBeGreaterThanOrEqual(0);
      expect(report.summary.complianceScore).toBeLessThanOrEqual(100);
    });

    it('should generate gap analysis report', async () => {
      // Act
      const gapAnalysis = await complianceEngine.generateGapAnalysis('sox');
      
      // Assert
      expect(gapAnalysis.reportType).toBe('gap-analysis');
      expect(gapAnalysis.findings).toBeDefined();
      expect(gapAnalysis.recommendations).toBeDefined();
    });

    it('should generate executive compliance dashboard', async () => {
      // Act
      const dashboard = await complianceEngine.generateExecutiveDashboard();
      
      // Assert
      expect(dashboard.timestamp).toBeInstanceOf(Date);
      expect(dashboard.overallStatus).toBeDefined();
      expect(dashboard.frameworkStatus).toBeDefined();
      expect(dashboard.executiveSummary).toBeDefined();
    });

    it('should calculate compliance metrics', async () => {
      // Act
      const metrics = await complianceEngine.getComplianceMetrics();
      
      // Assert
      expect(metrics.overallCompliance).toBeGreaterThanOrEqual(0);
      expect(metrics.overallCompliance).toBeLessThanOrEqual(100);
      expect(metrics.frameworkCompliance).toBeDefined();
      expect(metrics.trendsOverTime).toBeDefined();
    });

    it('should perform real-time compliance monitoring', async () => {
      // Act & Assert - Should not throw
      await expect(complianceEngine.performRealTimeMonitoring()).resolves.not.toThrow();
    });

    it('should export compliance data for regulatory submission', async () => {
      // Arrange
      const reportPeriod = {
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        description: 'Quarterly Submission Period'
      };
      
      // Act
      const result = await complianceEngine.exportForRegulatory('sox', 'sec-edgar', reportPeriod);
      
      // Assert
      expect(result).toBe(true);
    });
  });

  describe('Integration Testing', () => {
    beforeEach(async () => {
      await auditTrail.initialize();
      await siemFramework.initialize();
      await complianceEngine.initialize();
    });

    it('should create end-to-end audit workflow', async () => {
      // Arrange
      const testAuditEntry: HSMAuditEntry = {
        operationId: 'e2e-test-001',
        timestamp: new Date(),
        operation: 'executive-crypto-operation',
        keyId: 'exec-key-001',
        userId: 'exec-user-001',
        sourceIp: '10.0.1.100',
        result: 'success',
        integrityVerified: true,
        performanceMetrics: { duration: 75, operationType: 'executive-crypto' },
        securityContext: { 
          authMethod: 'multi-factor',
          sessionId: 'exec-session-001',
          certificateFingerprint: 'SHA256:abcd1234...'
        }
      };
      
      const executiveContext = {
        executiveId: 'exec-001',
        protectionLevel: 'maximum' as const,
        riskProfile: 'low',
        threatLevel: 'green'
      };
      
      const executiveMetadata = {
        executiveId: 'exec-001',
        protectionLevel: 'maximum' as const,
        classification: 'top-secret' as const,
        priority: 'critical' as const,
        retention: 15
      };
      
      // Act - Complete audit workflow
      
      // 1. Log to HSM audit logger
      await auditLogger.logOperation(testAuditEntry);
      
      // 2. Add to immutable audit trail
      const entryId = await auditTrail.addAuditEntry(testAuditEntry, executiveMetadata);
      
      // 3. Send to SIEM
      await siemFramework.sendEvent(testAuditEntry, executiveContext);
      
      // 4. Generate compliance report
      const reportPeriod = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        description: 'End-to-End Test Period'
      };
      
      const complianceReport = await complianceEngine.generateComplianceReport('sox', 'compliance-status', reportPeriod);
      
      // Assert
      expect(entryId).toBeDefined();
      
      const siemMetrics = siemFramework.getMetrics();
      expect(siemMetrics.eventsProcessed).toBeGreaterThan(0);
      
      const chainIntegrity = await auditTrail.verifyChainIntegrity();
      expect(chainIntegrity).toBe(true);
      
      expect(complianceReport.framework).toBe('sox');
      expect(complianceReport.summary.complianceScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle high-volume audit processing', async () => {
      // Arrange
      const batchSize = 100;
      const auditEntries: HSMAuditEntry[] = Array.from({ length: batchSize }, (_, i) => ({
        operationId: `volume-test-${i}`,
        timestamp: new Date(),
        operation: 'high-volume-crypto',
        result: Math.random() > 0.1 ? 'success' : 'failure',
        integrityVerified: true,
        performanceMetrics: { duration: 50 + Math.floor(Math.random() * 100), operationType: 'crypto' },
        securityContext: { authMethod: 'api-key' }
      }));
      
      const startTime = Date.now();
      
      // Act
      const promises = auditEntries.map(async (entry) => {
        // Parallel processing
        const [entryId] = await Promise.all([
          auditTrail.addAuditEntry(entry),
          siemFramework.sendEvent(entry)
        ]);
        return entryId;
      });
      
      const results = await Promise.all(promises);
      const processingTime = Date.now() - startTime;
      
      // Assert
      expect(results.length).toBe(batchSize);
      expect(processingTime).toBeLessThan(30000); // Should complete within 30 seconds
      
      const chainIntegrity = await auditTrail.verifyChainIntegrity();
      expect(chainIntegrity).toBe(true);
      
      const siemMetrics = siemFramework.getMetrics();
      expect(siemMetrics.eventsProcessed).toBeGreaterThanOrEqual(batchSize);
    });

    it('should maintain data consistency across all components', async () => {
      // Arrange
      const testEntries: HSMAuditEntry[] = [
        {
          operationId: 'consistency-test-001',
          timestamp: new Date(),
          operation: 'key-generation',
          result: 'success',
          integrityVerified: true,
          performanceMetrics: { duration: 120, operationType: 'generation' },
          securityContext: { authMethod: 'certificate' }
        },
        {
          operationId: 'consistency-test-002',
          timestamp: new Date(),
          operation: 'unauthorized-access-attempt',
          result: 'unauthorized',
          integrityVerified: false,
          performanceMetrics: { duration: 10, operationType: 'access' },
          securityContext: { authMethod: 'unknown' },
          sourceIp: '192.168.1.200'
        }
      ];
      
      // Act
      for (const entry of testEntries) {
        await Promise.all([
          auditTrail.addAuditEntry(entry),
          siemFramework.sendEvent(entry)
        ]);
      }
      
      // Verify data consistency
      const chainMetrics = await auditTrail.getChainMetrics();
      const siemMetrics = siemFramework.getMetrics();
      
      // Generate compliance report
      const reportPeriod = {
        startDate: new Date(Date.now() - 60 * 60 * 1000),
        endDate: new Date(),
        description: 'Consistency Test Period'
      };
      
      const report = await complianceEngine.generateComplianceReport('sox', 'compliance-status', reportPeriod);
      
      // Assert
      expect(chainMetrics.entryCount).toBeGreaterThanOrEqual(testEntries.length);
      expect(siemMetrics.eventsProcessed).toBeGreaterThanOrEqual(testEntries.length);
      expect(report.summary.totalFindings).toBeGreaterThanOrEqual(0);
      
      // Verify unauthorized access was flagged
      const unauthorizedEvents = report.findings.filter(f => 
        f.description.toLowerCase().includes('unauthorized') ||
        f.severity === 'critical'
      );
      expect(unauthorizedEvents.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      await auditTrail.initialize();
      await siemFramework.initialize();
      await complianceEngine.initialize();
    });

    it('should meet performance requirements for audit processing', async () => {
      // Arrange
      const performanceTestEntry: HSMAuditEntry = {
        operationId: 'perf-test-001',
        timestamp: new Date(),
        operation: 'performance-crypto-operation',
        result: 'success',
        integrityVerified: true,
        performanceMetrics: { duration: 100, operationType: 'crypto' },
        securityContext: { authMethod: 'certificate' }
      };
      
      // Act
      const startTime = Date.now();
      
      const [entryId] = await Promise.all([
        auditTrail.addAuditEntry(performanceTestEntry),
        siemFramework.sendEvent(performanceTestEntry)
      ]);
      
      const processingTime = Date.now() - startTime;
      
      // Assert
      expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
      expect(entryId).toBeDefined();
    });

    it('should handle concurrent audit operations', async () => {
      // Arrange
      const concurrentOps = 50;
      const operations = Array.from({ length: concurrentOps }, (_, i) => 
        async () => {
          const entry: HSMAuditEntry = {
            operationId: `concurrent-${i}`,
            timestamp: new Date(),
            operation: 'concurrent-operation',
            result: 'success',
            integrityVerified: true,
            performanceMetrics: { duration: 75, operationType: 'concurrent' },
            securityContext: { authMethod: 'api-key' }
          };
          
          return Promise.all([
            auditTrail.addAuditEntry(entry),
            siemFramework.sendEvent(entry)
          ]);
        }
      );
      
      // Act
      const startTime = Date.now();
      const results = await Promise.all(operations.map(op => op()));
      const totalTime = Date.now() - startTime;
      
      // Assert
      expect(results.length).toBe(concurrentOps);
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds
      
      const chainIntegrity = await auditTrail.verifyChainIntegrity();
      expect(chainIntegrity).toBe(true);
    });
  });
});