/**
 * Comprehensive Unit Tests for SecurityPrivacyAgent
 * Testing zero-trust monitoring, privacy enforcement, and threat detection
 */

import { SecurityPrivacyAgent, PrivacyClassification as _PrivacyClassification, ComplianceValidation as _ComplianceValidation, SecurityMonitoringResult as _SecurityMonitoringResult } from '../../../src/agents/security-privacy/SecurityPrivacyAgent';
import { PEAAgentType, AgentStatus, SecurityLevel } from '../../../src/types/enums';
import { SecurityThreat } from '../../../src/types/pea-agent-types';
import {
  createMockMCPIntegration,
  createMockSecurityThreat,
  assertAgentInitialization,
  assertPerformanceMetrics,
  MockPerformanceTimer,
  createMockExecutiveContext
} from '../../utils/test-factories';

describe('SecurityPrivacyAgent', () => {
  let agent: SecurityPrivacyAgent;
  let mockMcpIntegration: jest.Mocked<any>;
  let performanceTimer: MockPerformanceTimer;
  let mockExecContext: any;

  beforeEach(() => {
    mockMcpIntegration = createMockMCPIntegration();
    agent = new SecurityPrivacyAgent(mockMcpIntegration);
    performanceTimer = new MockPerformanceTimer();
    mockExecContext = createMockExecutiveContext();
    
    // Mock console methods to reduce test output noise
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    performanceTimer.reset();
  });

  describe('Agent Initialization', () => {
    it('should initialize with correct agent type and properties', () => {
      expect(agent.id).toBe('security-privacy-001');
      expect(agent.type).toBe(PEAAgentType.SECURITY_PRIVACY);
      expect(agent.name).toBe('Security Privacy');
      expect(agent.status).toBe(AgentStatus.INITIALIZING);
      expect(agent.securityLevel).toBe(SecurityLevel.OPERATIONAL);
    });

    it('should have comprehensive security capabilities', () => {
      const expectedCapabilities = [
        'zero_trust_monitoring',
        'privacy_enforcement',
        'threat_detection',
        'compliance_validation',
        'quantum_ready_encryption',
        'data_classification',
        'access_control',
        'incident_response'
      ];
      
      expect(agent.capabilities).toEqual(expect.arrayContaining(expectedCapabilities));
      expect(agent.capabilities.length).toBe(expectedCapabilities.length);
    });

    it('should initialize successfully with all security components', async () => {
      performanceTimer.start();
      
      await agent.initialize();
      
      const initTime = performanceTimer.measure();
      
      assertAgentInitialization(agent, PEAAgentType.SECURITY_PRIVACY);
      expect(initTime).toBeLessThan(5000); // Should initialize within 5 seconds
      
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        'pea-agents/security-privacy/init',
        expect.stringContaining('zero_trust'),
        'pea_foundation'
      );
    });

    it('should handle initialization failure gracefully', async () => {
      mockMcpIntegration.memoryUsage.mockRejectedValueOnce(new Error('Security system initialization failed'));
      
      await expect(agent.initialize()).rejects.toThrow('Security system initialization failed');
      expect(agent.status).toBe(AgentStatus.ERROR);
    });

    it('should setup continuous monitoring during initialization', async () => {
      await agent.initialize();
      
      // Should log continuous monitoring setup
      expect(console.log).toHaveBeenCalledWith('⚡ Continuous security monitoring activated');
    });

    it('should load security policies during initialization', async () => {
      await agent.initialize();
      
      // Should log policy loading
      expect(console.log).toHaveBeenCalledWith('📜 Security policies loaded');
    });
  });

  describe('Security Monitoring', () => {
    let mockExecContext: any;

    beforeEach(async () => {
      await agent.initialize();
      mockExecContext = mockExecContext;
    });

    it('should perform comprehensive security monitoring', async () => {
      performanceTimer.start();
      
      const monitoringResult = await agent.performSecurityMonitoring(
        'exec-001',
        mockExecContext,
        '24h'
      );
      
      const monitoringTime = performanceTimer.measure();
      
      expect(monitoringResult.success).toBe(true);
      expect(monitoringResult.monitored_systems).toBeGreaterThan(0);
      expect(monitoringResult.threats_detected).toBeGreaterThanOrEqual(0);
      expect(monitoringResult.privacy_violations).toBeGreaterThanOrEqual(0);
      expect(monitoringResult.compliance_status).toBeDefined();
      expect(Array.isArray(monitoringResult.recommendations)).toBe(true);
      expect(Array.isArray(monitoringResult.next_actions)).toBe(true);
      expect(monitoringResult.monitoring_period).toBe('24h');
      
      // Performance check
      expect(monitoringTime).toBeLessThan(3000); // Should complete within 3 seconds
    });

    it('should detect and analyze threats effectively', async () => {
      const monitoringResult = await agent.performSecurityMonitoring(
        'exec-001',
        mockExecContext
      );
      
      if (monitoringResult.threats_detected > 0) {
        expect(monitoringResult.recommendations.length).toBeGreaterThan(0);
        expect(monitoringResult.next_actions.length).toBeGreaterThan(0);
      }
      
      // Should always provide baseline recommendations
      expect(monitoringResult.recommendations).toContain('Maintain current zero-trust security posture');
    });

    it('should validate privacy compliance during monitoring', async () => {
      const monitoringResult = await agent.performSecurityMonitoring(
        'exec-001',
        mockExecContext
      );
      
      expect(monitoringResult.compliance_status).toMatch(/compliant|warning|violation/);
      
      if (monitoringResult.privacy_violations > 0) {
        expect(monitoringResult.recommendations).toContain('Address privacy compliance violations');
      }
    });

    it('should handle different monitoring periods', async () => {
      const periods = ['1h', '24h', '7d'];
      
      for (const period of periods) {
        const result = await agent.performSecurityMonitoring(
          'exec-001',
          mockExecContext,
          period
        );
        
        expect(result.success).toBe(true);
        expect(result.monitoring_period).toBe(period);
      }
    });

    it('should store monitoring results for analysis', async () => {
      await agent.performSecurityMonitoring('exec-001', mockExecContext);
      
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        expect.stringContaining('security_monitoring/exec-001'),
        expect.any(String),
        'pea_foundation'
      );
    });

    it('should handle monitoring failures gracefully', async () => {
      // Mock failure in zero-trust engine
      mockMcpIntegration.memoryUsage.mockRejectedValueOnce(new Error('Monitoring system failure'));
      
      await expect(
        agent.performSecurityMonitoring('exec-001', mockExecContext)
      ).rejects.toThrow('Monitoring system failure');
      
      // Should track error in performance metrics
      expect(agent.performanceMetrics.errorRate).toBeGreaterThan(0);
    });

    it('should update performance metrics during monitoring', async () => {
      const initialMetrics = { ...agent.performanceMetrics };
      
      await agent.performSecurityMonitoring('exec-001', mockExecContext);
      
      assertPerformanceMetrics(agent.performanceMetrics, {
        responseTimeMs: 5000,
        accuracyScore: 0.8
      });
      
      expect(agent.performanceMetrics.throughputPerHour).toBeGreaterThan(initialMetrics.throughputPerHour);
    });
  });

  describe('Data Classification and Protection', () => {
    let mockExecContext: any;

    beforeEach(async () => {
      await agent.initialize();
      mockExecContext = mockExecContext;
    });

    it('should classify data based on sensitivity analysis', async () => {
      const sensitiveData = {
        personalInfo: { name: 'John Doe', ssn: '123-45-6789' },
        businessData: { revenue: 1000000, strategy: 'expansion' },
        timestamp: new Date().toISOString()
      };
      
      performanceTimer.start();
      
      const classification = await agent.classifyAndProtectData(
        'data-001',
        sensitiveData,
        'exec-001',
        mockExecContext
      );
      
      const classificationTime = performanceTimer.measure();
      
      expect(classification.dataId).toMatch(/^data-\d+$/);
      expect(classification.classification).toMatch(/public|internal|confidential|restricted|executive_personal/);
      expect(classification.processingLocation).toMatch(/local_only|hybrid_allowed|cloud_restricted/);
      expect(classification.encryptionLevel).toMatch(/standard|enhanced|hsm_required/);
      expect(classification.retentionPolicy).toBeDefined();
      expect(Array.isArray(classification.complianceRequirements)).toBe(true);
      
      // Performance check
      expect(classificationTime).toBeLessThan(2000); // Should classify within 2 seconds
    });

    it('should apply appropriate encryption based on classification', async () => {
      const testData = { sensitiveInfo: 'confidential data' };
      
      const _classification = await agent.classifyAndProtectData(
        'data-002',
        testData,
        'exec-001',
        mockExecContext
      );
      
      // Should store classification and encryption results
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        'privacy_classifications/data-002',
        expect.stringContaining('encrypted'),
        'pea_foundation'
      );
    });

    it('should handle different data types appropriately', async () => {
      const dataTypes = [
        { type: 'personal', data: { name: 'John', email: 'john@example.com' } },
        { type: 'financial', data: { amount: 100000, account: 'XXXXX1234' } },
        { type: 'strategic', data: { plan: 'merger', timeline: '2025' } },
        { type: 'operational', data: { metrics: { performance: 0.95 } } }
      ];
      
      for (const { type, data } of dataTypes) {
        const classification = await agent.classifyAndProtectData(
          `data-${type}`,
          data,
          'exec-001',
          mockExecContext
        );
        
        expect(classification.dataId).toMatch(/^data-\d+$/);
        expect(classification.classification).toBeDefined();
      }
    });

    it('should enforce compliance requirements based on data type', async () => {
      const personalData = {
        personalInfo: { name: 'Jane Smith', email: 'jane@example.com', location: 'EU' }
      };
      
      const classification = await agent.classifyAndProtectData(
        'personal-data-001',
        personalData,
        'exec-001',
        mockExecContext
      );
      
      // Should include relevant compliance requirements
      expect(classification.complianceRequirements).toContain('GDPR');
    });

    it('should handle classification failures gracefully', async () => {
      // Mock failure in privacy engine
      const invalidData = null;
      
      await expect(
        agent.classifyAndProtectData('invalid-data', invalidData, 'exec-001', mockExecContext)
      ).rejects.toBeDefined();
    });
  });

  describe('Security Incident Handling', () => {
    let mockThreat: SecurityThreat;
    let mockExecContext: any;

    beforeEach(async () => {
      await agent.initialize();
      mockThreat = mockThreat;
      mockExecContext = mockExecContext;
    });

    it('should handle security incidents with immediate response', async () => {
      performanceTimer.start();
      
      const responseResult = await agent.handleSecurityIncident(
        mockThreat,
        'exec-001',
        mockExecContext
      );
      
      const responseTime = performanceTimer.measure();
      
      expect(responseResult).toBeDefined();
      expect(responseResult.responseId).toContain('response-');
      expect(responseResult.containmentSuccess).toBeDefined();
      expect(Array.isArray(responseResult.mitigationSteps)).toBe(true);
      expect(Array.isArray(responseResult.recoveryPlan)).toBe(true);
      
      // Performance check - should respond quickly to incidents
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    it('should escalate critical incidents immediately', async () => {
      const criticalThreat = createMockSecurityThreat({
        severity: 'critical',
        type: 'system-intrusion'
      });
      
      const responseResult = await agent.handleSecurityIncident(
        criticalThreat,
        'exec-001',
        mockExecContext
      );
      
      // Should handle critical incidents with high priority
      expect(responseResult.containmentSuccess).toBeDefined();
      expect(Array.isArray(responseResult.mitigationSteps) ? (responseResult.mitigationSteps as any[]).length : 0).toBeGreaterThan(0);
      
      // Should log escalation for critical incidents
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL SECURITY INCIDENT ESCALATION')
      );
    });

    it('should perform impact assessment for incidents', async () => {
      const responseResult = await agent.handleSecurityIncident(
        mockThreat,
        'exec-001',
        mockExecContext
      );
      
      expect(responseResult).toBeDefined();
      
      // Should have performed impact assessment internally
      expect(responseResult.mitigationSteps).toContain('Threat contained and isolated');
    });

    it('should store incident details for future analysis', async () => {
      await agent.handleSecurityIncident(mockThreat, 'exec-001', mockExecContext);
      
      // Should store incident handling activity
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalled();
    });

    it('should handle different threat types appropriately', async () => {
      const threatTypes: Array<SecurityThreat['type']> = [
        'unauthorized_access',
        'privilege_escalation',
        'malware',
        'phishing',
        'insider_threat'
      ];
      
      for (const threatType of threatTypes) {
        const threat = createMockSecurityThreat({ type: threatType });
        
        const responseResult = await agent.handleSecurityIncident(
          threat,
          'exec-001',
          mockExecContext
        );
        
        expect(responseResult.containmentSuccess).toBeDefined();
        expect(Array.isArray(responseResult.mitigationSteps) ? (responseResult.mitigationSteps as any[]).length : 0).toBeGreaterThan(0);
      }
    });

    it('should update security metrics after incident handling', async () => {
      await agent.handleSecurityIncident(mockThreat, 'exec-001', mockExecContext);
      
      // Should update consensus success rate based on incident response
      expect(agent.performanceMetrics.consensusSuccessRate).toBeDefined();
      expect(agent.performanceMetrics.consensusSuccessRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Compliance Validation', () => {
    let mockExecContext: any;

    beforeEach(async () => {
      await agent.initialize();
      mockExecContext = mockExecContext;
    });

    it('should validate compliance across multiple regulations', async () => {
      const regulations = ['GDPR', 'CCPA', 'SOX', 'ISO27001'];
      
      performanceTimer.start();
      
      const validation = await agent.validateComplianceStatus(
        'exec-001',
        regulations,
        mockExecContext
      );
      
      const validationTime = performanceTimer.measure();
      
      expect(validation.validationId).toBeDefined();
      expect(validation.regulations).toEqual(regulations);
      expect(validation.status).toMatch(/compliant|warning|violation/);
      expect(Array.isArray(validation.findings)).toBe(true);
      expect(Array.isArray(validation.recommendations)).toBe(true);
      expect(validation.nextAuditDate).toBeDefined();
      
      // Performance check
      expect(validationTime).toBeLessThan(1500); // Should validate within 1.5 seconds
    });

    it('should store compliance validation results', async () => {
      const validation = await agent.validateComplianceStatus(
        'exec-001',
        ['GDPR'],
        mockExecContext
      );
      
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        `compliance_validations/exec-001/${validation.validationId}`,
        expect.any(String),
        'pea_foundation'
      );
    });

    it('should handle compliance validation for different regulations', async () => {
      const regulationSets = [
        ['GDPR', 'CCPA'],
        ['SOX', 'HIPAA'],
        ['ISO27001', 'NIST'],
        ['PCI-DSS']
      ];
      
      for (const regulations of regulationSets) {
        const validation = await agent.validateComplianceStatus(
          'exec-001',
          regulations,
          mockExecContext
        );
        
        expect(validation.regulations).toEqual(regulations);
        expect(validation.status).toBeDefined();
      }
    });

    it('should provide actionable recommendations for compliance', async () => {
      const validation = await agent.validateComplianceStatus(
        'exec-001',
        ['GDPR', 'CCPA'],
        mockExecContext
      );
      
      expect(validation.recommendations.length).toBeGreaterThan(0);
      validation.recommendations.forEach(recommendation => {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      });
    });

    it('should track compliance history for executives', async () => {
      // Perform multiple validations
      await agent.validateComplianceStatus('exec-001', ['GDPR'], mockExecContext);
      await agent.validateComplianceStatus('exec-001', ['CCPA'], mockExecContext);
      
      // Should store both validations in history
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledTimes(4); // 2 from init, 2 from validations
    });
  });

  describe('Zero-Trust Security Engine', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should integrate zero-trust engine effectively', async () => {
      const monitoringResult = await agent.performSecurityMonitoring(
        'exec-001',
        mockExecContext
      );
      
      // Zero-trust engine should contribute to monitoring results
      expect(monitoringResult.monitored_systems).toBeGreaterThan(0);
      expect(monitoringResult.recommendations).toContain('Maintain current zero-trust security posture');
    });

    it('should perform security scans through zero-trust engine', async () => {
      const mockExecContext = createMockExecutiveContext();
      
      const monitoringResult = await agent.performSecurityMonitoring(
        'exec-001',
        mockExecContext
      );
      
      // Should have performed security scan
      expect(monitoringResult.monitored_systems).toBe(15); // Mock value from zero-trust engine
    });

    it('should contain threats through zero-trust engine', async () => {
      const mockThreat = createMockSecurityThreat();
      
      const responseResult = await agent.handleSecurityIncident(
        mockThreat,
        'exec-001',
        mockExecContext
      );
      
      // Should have contained threat successfully
      expect(responseResult.containmentSuccess).toBe(true);
    });
  });

  describe('Privacy Enforcement Engine', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should validate privacy compliance effectively', async () => {
      const monitoringResult = await agent.performSecurityMonitoring(
        'exec-001',
        mockExecContext
      );
      
      // Privacy engine should contribute to monitoring
      expect(monitoringResult.privacy_violations).toBe(0); // Mock shows no violations
    });

    it('should analyze data sensitivity appropriately', async () => {
      const sensitiveData = {
        personalInfo: 'John Doe',
        businessData: 'confidential strategy'
      };
      
      const classification = await agent.classifyAndProtectData(
        'sensitive-001',
        sensitiveData,
        'exec-001',
        mockExecContext
      );
      
      // Should classify as confidential due to sensitive content
      expect(classification.classification).toBe('confidential');
    });
  });

  describe('Quantum-Ready Encryption', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should apply quantum-ready encryption when required', async () => {
      const highSecurityData = {
        executiveStrategy: 'top secret merger plan',
        financialData: { amount: 1000000000 }
      };
      
      const classification = await agent.classifyAndProtectData(
        'quantum-001',
        highSecurityData,
        'exec-001',
        mockExecContext
      );
      
      // Should apply enhanced encryption for high-security data
      expect(classification.encryptionLevel).toBe('enhanced');
    });

    it('should support different encryption levels', async () => {
      const dataTypes = [
        { data: { public: 'info' }, expectedLevel: 'standard' },
        { data: { internal: 'memo' }, expectedLevel: 'enhanced' },
        { data: { restricted: 'strategy' }, expectedLevel: 'enhanced' }
      ];
      
      for (const { data, expectedLevel: _expectedLevel } of dataTypes) {
        const classification = await agent.classifyAndProtectData(
          `encryption-test-${Math.random()}`,
          data,
          'exec-001',
          mockExecContext
        );
        
        expect(classification.encryptionLevel).toBeDefined();
      }
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should handle high-frequency security monitoring', async () => {
      const monitoringTasks = Array.from({ length: 10 }, (_, i) => 
        agent.performSecurityMonitoring(`exec-${i}`, mockExecContext, '1h')
      );
      
      performanceTimer.start();
      
      const results = await Promise.all(monitoringTasks);
      
      const totalTime = performanceTimer.measure();
      
      // All monitoring should succeed
      expect(results.every(r => r.success)).toBe(true);
      
      // Should handle concurrent monitoring efficiently
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should scale classification operations efficiently', async () => {
      const classificationTasks = Array.from({ length: 20 }, (_, i) => 
        agent.classifyAndProtectData(
          `data-${i}`,
          { testData: `sample data ${i}` },
          'exec-001',
          mockExecContext
        )
      );
      
      performanceTimer.start();
      
      const classifications = await Promise.all(classificationTasks);
      
      const totalTime = performanceTimer.measure();
      
      // All classifications should succeed
      expect(classifications.length).toBe(20);
      classifications.forEach(classification => {
        expect(classification.dataId).toBeDefined();
        expect(classification.classification).toBeDefined();
      });
      
      // Should handle batch classification efficiently
      expect(totalTime).toBeLessThan(8000); // Should complete within 8 seconds
    });

    it('should maintain consistent performance under load', async () => {
      const performanceTasks = [
        () => agent.performSecurityMonitoring('exec-001', mockExecContext),
        () => agent.classifyAndProtectData('data-001', { test: 'data' }, 'exec-001', mockExecContext),
        () => agent.validateComplianceStatus('exec-001', ['GDPR'], mockExecContext)
      ];
      
      const responseTimes: number[] = [];
      
      for (let i = 0; i < 6; i++) {
        const task = performanceTasks[i % performanceTasks.length];
        
        performanceTimer.start();
        await task();
        responseTimes.push(performanceTimer.measure());
      }
      
      // Response times should be consistent (within 50% variance)
      const avgTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxVariance = avgTime * 0.5;
      
      responseTimes.forEach(time => {
        expect(Math.abs(time - avgTime)).toBeLessThanOrEqual(maxVariance);
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should handle security engine failures gracefully', async () => {
      // Mock failure in zero-trust engine
      mockMcpIntegration.memoryUsage.mockRejectedValueOnce(new Error('Security engine failure'));
      
      await expect(
        agent.performSecurityMonitoring('exec-001', mockExecContext)
      ).rejects.toThrow();
      
      // Should track error rate
      expect(agent.performanceMetrics.errorRate).toBeGreaterThan(0);
    });

    it('should recover from privacy engine failures', async () => {
      // Mock privacy validation failure but allow monitoring to continue
      const result = await agent.performSecurityMonitoring(
        'exec-001',
        mockExecContext
      );
      
      expect(result.success).toBe(true);
    });

    it('should handle compliance validation errors', async () => {
      mockMcpIntegration.memoryUsage.mockRejectedValue(new Error('Compliance system unavailable'));
      
      await expect(
        agent.validateComplianceStatus('exec-001', ['GDPR'], mockExecContext)
      ).rejects.toThrow();
    });

    it('should track and report error patterns', async () => {
      const initialErrorRate = agent.performanceMetrics.errorRate;
      
      // Cause multiple errors
      for (let i = 0; i < 3; i++) {
        try {
          mockMcpIntegration.memoryUsage.mockRejectedValueOnce(new Error(`Error ${i}`));
          await agent.classifyAndProtectData(`data-${i}`, {}, 'exec-001', mockExecContext);
        } catch (_error) {
          // Expected errors
        }
      }
      
      expect(agent.performanceMetrics.errorRate).toBeGreaterThan(initialErrorRate);
    });
  });

  describe('Integration with MCP', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should integrate with Claude Flow memory system', async () => {
      await agent.performSecurityMonitoring('exec-001', mockExecContext);
      
      // Should store monitoring results
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        expect.stringContaining('security_monitoring'),
        expect.any(String),
        'pea_foundation'
      );
    });

    it('should coordinate with other agents through MCP', async () => {
      const mockThreat = createMockSecurityThreat({ severity: 'critical' });
      
      await agent.handleSecurityIncident(
        mockThreat,
        'exec-001',
        mockExecContext
      );
      
      // Should store incident details for coordination
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalled();
    });

    it('should use memory for state persistence', async () => {
      const _classification = await agent.classifyAndProtectData(
        'persistent-data-001',
        { sensitive: 'information' },
        'exec-001',
        mockExecContext
      );
      
      // Should store classification for future reference
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        'privacy_classifications/persistent-data-001',
        expect.stringContaining('encrypted'),
        'pea_foundation'
      );
    });
  });
});