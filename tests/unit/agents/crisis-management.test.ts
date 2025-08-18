/**
 * Comprehensive Unit Tests for Crisis Management System
 * Testing crisis detection, escalation, stakeholder coordination, and response protocols
 */

import {
  CrisisManagementAgent,
  CrisisType,
  CrisisSeverity,
  CrisisStatus,
  CrisisIncident,
  CrisisResponse,
  CrisisEscalationLevel,
  CrisisManagementConfig
} from '../../../src/agents/phase2/crisis-management/CrisisManagementAgent';
import {
  CrisisDetectionEngine,
  DetectionRule,
  DetectionResult,
  MonitoringTarget
} from '../../../src/agents/phase2/crisis-management/CrisisDetectionEngine';
import {
  StakeholderCoordinationSystem,
  StakeholderRole,
  StakeholderNotification,
  CommunicationChannel,
  EscalationMatrix
} from '../../../src/agents/phase2/crisis-management/StakeholderCoordinationSystem';
import {
  EnhancedCrisisManagementAgent,
  EnhancedCrisisIncident,
  CrisisCategory,
  ResponseProtocol
} from '../../../src/agents/phase2/crisis-management/EnhancedCrisisManagementAgent';
import { PEAAgentType, AgentStatus } from '../../../src/types/enums';

// Mock MCP integration
const createMockMCPIntegration = () => ({
  invokeFunction: jest.fn(),
  storeMemory: jest.fn(),
  retrieveMemory: jest.fn(),
  sendNotification: jest.fn(),
  scheduleTask: jest.fn(),
  getAgentStatus: jest.fn(),
  coordinateWith: jest.fn()
});

describe('Crisis Management System', () => {
  let mockMcpIntegration: jest.Mocked<any>;

  beforeEach(() => {
    mockMcpIntegration = createMockMCPIntegration();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('CrisisManagementAgent', () => {
    let agent: CrisisManagementAgent;
    let config: CrisisManagementConfig;

    beforeEach(() => {
      config = {
        alertThresholds: {
          low: 0.3,
          medium: 0.6,
          high: 0.8,
          critical: 0.95
        },
        escalationTimeouts: {
          low: 3600000, // 1 hour
          medium: 1800000, // 30 minutes
          high: 900000, // 15 minutes
          critical: 300000 // 5 minutes
        },
        stakeholderMatrix: {
          executive: ['CEO', 'COO', 'CTO'],
          operational: ['Operations Manager', 'Team Lead'],
          technical: ['Senior Engineer', 'DevOps'],
          legal: ['Legal Counsel', 'Compliance Officer'],
          pr: ['PR Manager', 'Communications Director']
        },
        monitoringTargets: [
          'system_performance',
          'security_threats',
          'operational_issues',
          'financial_anomalies',
          'regulatory_compliance'
        ],
        responseProtocols: {
          security: ['isolate', 'assess', 'contain', 'remediate', 'review'],
          operational: ['identify', 'prioritize', 'allocate', 'execute', 'monitor'],
          financial: ['freeze', 'investigate', 'report', 'correct', 'audit'],
          regulatory: ['document', 'report', 'collaborate', 'remediate', 'verify']
        }
      };

      agent = new CrisisManagementAgent(mockMcpIntegration, config);
    });

    describe('Initialization', () => {
      it('should initialize with correct agent properties', () => {
        expect(agent.id).toBe('crisis-management-001');
        expect(agent.type).toBe(PEAAgentType.CRISIS_MANAGEMENT);
        expect(agent.name).toBe('Crisis Management Agent');
        expect(agent.status).toBe(AgentStatus.INITIALIZING);
      });

      it('should initialize with default configuration when not provided', () => {
        const defaultAgent = new CrisisManagementAgent(mockMcpIntegration);
        expect(defaultAgent).toBeInstanceOf(CrisisManagementAgent);
      });

      it('should set up monitoring systems on initialization', async () => {
        await agent.initialize();
        
        expect(agent.status).toBe(AgentStatus.READY);
        expect(mockMcpIntegration.storeMemory).toHaveBeenCalledWith(
          'crisis_management_initialization',
          expect.objectContaining({
            status: 'initialized',
            timestamp: expect.any(Date)
          })
        );
      });

      it('should have comprehensive crisis management capabilities', () => {
        const capabilities = agent.getCapabilities();
        
        expect(capabilities).toMatchObject({
          crisisDetection: true,
          stakeholderCoordination: true,
          escalationManagement: true,
          responseOrchestration: true,
          realTimeMonitoring: true,
          multiChannelCommunication: true,
          complianceTracking: true,
          documentationGeneration: true
        });
      });
    });

    describe('Crisis Detection', () => {
      beforeEach(async () => {
        await agent.initialize();
      });

      it('should detect operational crisis', async () => {
        const crisisData = {
          type: CrisisType.OPERATIONAL,
          severity: CrisisSeverity.HIGH,
          description: 'Major system outage affecting customer operations',
          affectedSystems: ['production-api', 'customer-portal'],
          estimatedImpact: 'High customer impact with potential revenue loss',
          detectedAt: new Date()
        };

        const incident = await agent.detectCrisis(crisisData);

        expect(incident).toBeDefined();
        expect(incident.type).toBe(CrisisType.OPERATIONAL);
        expect(incident.severity).toBe(CrisisSeverity.HIGH);
        expect(incident.status).toBe(CrisisStatus.DETECTED);
        expect(incident.id).toMatch(/^crisis-/);
        expect(incident.timeline).toContainEqual(
          expect.objectContaining({
            action: 'crisis_detected',
            timestamp: expect.any(Date)
          })
        );
      });

      it('should detect security crisis with appropriate escalation', async () => {
        const securityCrisis = {
          type: CrisisType.SECURITY,
          severity: CrisisSeverity.CRITICAL,
          description: 'Potential data breach detected in customer database',
          affectedSystems: ['customer-db', 'payment-system'],
          securityIndicators: ['unauthorized_access', 'data_exfiltration'],
          detectedAt: new Date()
        };

        const incident = await agent.detectCrisis(securityCrisis);

        expect(incident.severity).toBe(CrisisSeverity.CRITICAL);
        expect(incident.escalationLevel).toBe(CrisisEscalationLevel.EXECUTIVE);
        expect(mockMcpIntegration.sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: 'CRITICAL',
            recipients: expect.arrayContaining(['CEO', 'COO', 'CTO'])
          })
        );
      });

      it('should detect financial crisis', async () => {
        const financialCrisis = {
          type: CrisisType.FINANCIAL,
          severity: CrisisSeverity.MEDIUM,
          description: 'Unusual payment processing patterns detected',
          affectedSystems: ['payment-gateway', 'billing-system'],
          financialImpact: 500000,
          detectedAt: new Date()
        };

        const incident = await agent.detectCrisis(financialCrisis);

        expect(incident.type).toBe(CrisisType.FINANCIAL);
        expect(incident.estimatedCost).toBe(500000);
        expect(incident.responseTeam).toContain('financial_team');
      });

      it('should detect regulatory compliance crisis', async () => {
        const complianceCrisis = {
          type: CrisisType.REGULATORY,
          severity: CrisisSeverity.HIGH,
          description: 'GDPR compliance violation detected',
          affectedSystems: ['user-data-system'],
          regulatoryBody: 'EU Data Protection Authority',
          complianceFramework: 'GDPR',
          detectedAt: new Date()
        };

        const incident = await agent.detectCrisis(complianceCrisis);

        expect(incident.type).toBe(CrisisType.REGULATORY);
        expect(incident.complianceRequirements).toContain('GDPR');
        expect(incident.responseTeam).toContain('legal_team');
      });

      it('should handle multiple simultaneous crises', async () => {
        const crisis1 = {
          type: CrisisType.OPERATIONAL,
          severity: CrisisSeverity.MEDIUM,
          description: 'Minor system performance degradation',
          detectedAt: new Date()
        };

        const crisis2 = {
          type: CrisisType.SECURITY,
          severity: CrisisSeverity.HIGH,
          description: 'Suspicious login attempts detected',
          detectedAt: new Date()
        };

        const incident1 = await agent.detectCrisis(crisis1);
        const incident2 = await agent.detectCrisis(crisis2);

        expect(incident1.id).not.toBe(incident2.id);
        expect(agent.getActiveCrises()).toHaveLength(2);
        
        // Higher severity crisis should have priority
        const activeCrises = agent.getActiveCrises().sort((a, b) => b.priority - a.priority);
        expect(activeCrises[0].type).toBe(CrisisType.SECURITY);
      });
    });

    describe('Crisis Response Management', () => {
      let incident: CrisisIncident;

      beforeEach(async () => {
        await agent.initialize();
        
        incident = await agent.detectCrisis({
          type: CrisisType.OPERATIONAL,
          severity: CrisisSeverity.HIGH,
          description: 'Production database failure',
          affectedSystems: ['production-db'],
          detectedAt: new Date()
        });
      });

      it('should initiate crisis response', async () => {
        const response = await agent.initiateResponse(incident.id);

        expect(response).toBeDefined();
        expect(response.incidentId).toBe(incident.id);
        expect(response.status).toBe('initiated');
        expect(response.responseTeam.length).toBeGreaterThan(0);
        expect(response.actionPlan.length).toBeGreaterThan(0);
        expect(response.timeline).toContainEqual(
          expect.objectContaining({
            action: 'response_initiated',
            timestamp: expect.any(Date)
          })
        );
      });

      it('should execute response steps sequentially', async () => {
        const response = await agent.initiateResponse(incident.id);
        
        // Execute first response step
        const stepResult = await agent.executeResponseStep(incident.id, 0);

        expect(stepResult.success).toBe(true);
        expect(stepResult.stepIndex).toBe(0);
        expect(stepResult.executedAt).toBeInstanceOf(Date);
        
        const updatedIncident = agent.getCrisis(incident.id);
        expect(updatedIncident?.responseProgress).toBe(1);
      });

      it('should handle response step failures', async () => {
        await agent.initiateResponse(incident.id);
        
        // Mock a step failure
        mockMcpIntegration.invokeFunction.mockRejectedValueOnce(
          new Error('Database restoration failed')
        );

        const stepResult = await agent.executeResponseStep(incident.id, 0);

        expect(stepResult.success).toBe(false);
        expect(stepResult.error).toContain('Database restoration failed');
        expect(stepResult.retryCount).toBe(1);
      });

      it('should coordinate with multiple stakeholders', async () => {
        const response = await agent.initiateResponse(incident.id);
        
        await agent.coordinateStakeholders(incident.id, [
          StakeholderRole.EXECUTIVE,
          StakeholderRole.TECHNICAL,
          StakeholderRole.OPERATIONAL
        ]);

        expect(mockMcpIntegration.sendNotification).toHaveBeenCalledTimes(3);
        expect(mockMcpIntegration.coordinateWith).toHaveBeenCalledWith(
          expect.arrayContaining(['technical_team', 'operations_team'])
        );
      });

      it('should generate status updates', async () => {
        await agent.initiateResponse(incident.id);
        
        const statusUpdate = await agent.generateStatusUpdate(incident.id);

        expect(statusUpdate).toMatchObject({
          incidentId: incident.id,
          status: expect.any(String),
          progress: expect.any(Number),
          nextSteps: expect.any(Array),
          estimatedResolution: expect.any(Date),
          stakeholderSummary: expect.any(String)
        });
      });
    });

    describe('Escalation Management', () => {
      let incident: CrisisIncident;

      beforeEach(async () => {
        await agent.initialize();
        
        incident = await agent.detectCrisis({
          type: CrisisType.SECURITY,
          severity: CrisisSeverity.MEDIUM,
          description: 'Suspicious network activity detected',
          detectedAt: new Date()
        });
      });

      it('should escalate crisis based on severity', async () => {
        // Update incident to high severity
        await agent.updateCrisisSeverity(incident.id, CrisisSeverity.HIGH);

        const updatedIncident = agent.getCrisis(incident.id);
        expect(updatedIncident?.escalationLevel).toBe(CrisisEscalationLevel.SENIOR_MANAGEMENT);
        expect(mockMcpIntegration.sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: 'HIGH',
            type: 'escalation'
          })
        );
      });

      it('should escalate crisis based on time threshold', async () => {
        await agent.initiateResponse(incident.id);
        
        // Fast forward time beyond escalation threshold
        jest.advanceTimersByTime(config.escalationTimeouts.medium + 1000);

        await agent.checkEscalationThresholds();

        const updatedIncident = agent.getCrisis(incident.id);
        expect(updatedIncident?.escalationLevel).toBeGreaterThan(CrisisEscalationLevel.OPERATIONAL);
      });

      it('should escalate to critical when multiple failures occur', async () => {
        await agent.initiateResponse(incident.id);
        
        // Simulate multiple step failures
        for (let i = 0; i < 3; i++) {
          mockMcpIntegration.invokeFunction.mockRejectedValueOnce(
            new Error(`Step ${i} failed`)
          );
          await agent.executeResponseStep(incident.id, i);
        }

        const updatedIncident = agent.getCrisis(incident.id);
        expect(updatedIncident?.severity).toBe(CrisisSeverity.CRITICAL);
        expect(updatedIncident?.escalationLevel).toBe(CrisisEscalationLevel.EXECUTIVE);
      });

      it('should handle executive escalation protocols', async () => {
        await agent.escalateToExecutive(incident.id, 'Multiple response failures detected');

        expect(mockMcpIntegration.sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: 'CRITICAL',
            recipients: expect.arrayContaining(['CEO', 'COO', 'CTO']),
            type: 'executive_escalation'
          })
        );

        const updatedIncident = agent.getCrisis(incident.id);
        expect(updatedIncident?.escalationLevel).toBe(CrisisEscalationLevel.EXECUTIVE);
      });
    });

    describe('Crisis Resolution', () => {
      let incident: CrisisIncident;

      beforeEach(async () => {
        await agent.initialize();
        
        incident = await agent.detectCrisis({
          type: CrisisType.OPERATIONAL,
          severity: CrisisSeverity.HIGH,
          description: 'API gateway failure',
          detectedAt: new Date()
        });

        await agent.initiateResponse(incident.id);
      });

      it('should resolve crisis successfully', async () => {
        const resolution = await agent.resolveCrisis(incident.id, {
          resolutionSummary: 'API gateway restored after database reconnection',
          rootCause: 'Database connection pool exhaustion',
          preventiveMeasures: ['Increase connection pool size', 'Add monitoring alerts'],
          lessonsLearned: ['Need better early warning systems'],
          resolvedBy: 'technical_team',
          verificationSteps: ['System health check', 'Load testing']
        });

        expect(resolution.success).toBe(true);
        expect(resolution.resolvedAt).toBeInstanceOf(Date);
        expect(resolution.resolutionDuration).toBeGreaterThan(0);

        const resolvedIncident = agent.getCrisis(incident.id);
        expect(resolvedIncident?.status).toBe(CrisisStatus.RESOLVED);
      });

      it('should generate post-incident report', async () => {
        await agent.resolveCrisis(incident.id, {
          resolutionSummary: 'Issue resolved',
          rootCause: 'System overload',
          preventiveMeasures: ['Add capacity'],
          lessonsLearned: ['Monitor capacity'],
          resolvedBy: 'ops_team'
        });

        const report = await agent.generatePostIncidentReport(incident.id);

        expect(report).toMatchObject({
          incidentId: incident.id,
          incidentSummary: expect.any(String),
          timeline: expect.any(Array),
          impactAnalysis: expect.any(Object),
          responseEffectiveness: expect.any(Object),
          rootCauseAnalysis: expect.any(String),
          preventiveMeasures: expect.any(Array),
          lessonsLearned: expect.any(Array),
          recommendations: expect.any(Array)
        });
      });

      it('should handle partial resolution scenarios', async () => {
        const partialResolution = await agent.markPartialResolution(incident.id, {
          mitigationSteps: ['Redirected traffic to backup servers'],
          remainingIssues: ['Primary server still offline'],
          nextActions: ['Restore primary server', 'Verify data integrity'],
          estimatedFullResolution: new Date(Date.now() + 3600000)
        });

        expect(partialResolution.success).toBe(true);
        
        const updatedIncident = agent.getCrisis(incident.id);
        expect(updatedIncident?.status).toBe(CrisisStatus.MITIGATED);
      });
    });

    describe('Monitoring and Analytics', () => {
      beforeEach(async () => {
        await agent.initialize();
      });

      it('should provide crisis analytics', async () => {
        // Create multiple test incidents
        const incidents = [];
        for (let i = 0; i < 5; i++) {
          const incident = await agent.detectCrisis({
            type: i % 2 === 0 ? CrisisType.OPERATIONAL : CrisisType.SECURITY,
            severity: CrisisSeverity.MEDIUM,
            description: `Test incident ${i}`,
            detectedAt: new Date(Date.now() - i * 3600000)
          });
          incidents.push(incident);
        }

        const analytics = await agent.getCrisisAnalytics({
          timeRange: '24h',
          includeResolved: true,
          groupBy: 'type'
        });

        expect(analytics.totalIncidents).toBe(5);
        expect(analytics.byType.OPERATIONAL).toBe(3);
        expect(analytics.byType.SECURITY).toBe(2);
        expect(analytics.averageResolutionTime).toBeGreaterThan(0);
        expect(analytics.escalationRate).toBeDefined();
      });

      it('should track response team performance', async () => {
        const incident = await agent.detectCrisis({
          type: CrisisType.OPERATIONAL,
          severity: CrisisSeverity.HIGH,
          description: 'Performance tracking test',
          detectedAt: new Date()
        });

        await agent.initiateResponse(incident.id);
        
        const performance = await agent.getResponseTeamPerformance('technical_team');

        expect(performance).toMatchObject({
          teamId: 'technical_team',
          totalIncidents: expect.any(Number),
          averageResponseTime: expect.any(Number),
          successRate: expect.any(Number),
          escalationRate: expect.any(Number),
          recentPerformance: expect.any(Array)
        });
      });

      it('should provide real-time crisis dashboard data', async () => {
        await agent.detectCrisis({
          type: CrisisType.SECURITY,
          severity: CrisisSeverity.HIGH,
          description: 'Active security incident',
          detectedAt: new Date()
        });

        const dashboard = await agent.getCrisisDashboard();

        expect(dashboard).toMatchObject({
          activeCrises: expect.any(Array),
          criticalAlerts: expect.any(Array),
          systemHealth: expect.any(Object),
          responseTeamStatus: expect.any(Object),
          recentActivity: expect.any(Array),
          upcomingDeadlines: expect.any(Array)
        });

        expect(dashboard.activeCrises.length).toBe(1);
        expect(dashboard.activeCrises[0].type).toBe(CrisisType.SECURITY);
      });
    });

    describe('Integration and Communication', () => {
      beforeEach(async () => {
        await agent.initialize();
      });

      it('should integrate with external monitoring systems', async () => {
        const externalAlert = {
          source: 'nagios',
          alertType: 'service_down',
          severity: 'critical',
          message: 'Database server is down',
          affectedServices: ['database', 'api'],
          timestamp: new Date()
        };

        const incident = await agent.processExternalAlert(externalAlert);

        expect(incident.type).toBe(CrisisType.OPERATIONAL);
        expect(incident.severity).toBe(CrisisSeverity.CRITICAL);
        expect(incident.externalSource).toBe('nagios');
      });

      it('should coordinate with other PEA agents', async () => {
        const incident = await agent.detectCrisis({
          type: CrisisType.FINANCIAL,
          severity: CrisisSeverity.HIGH,
          description: 'Financial anomaly detected',
          detectedAt: new Date()
        });

        await agent.coordinateWithPEAAgents(incident.id, [
          'financial-intelligence',
          'security-privacy',
          'executive-orchestrator'
        ]);

        expect(mockMcpIntegration.coordinateWith).toHaveBeenCalledWith(
          expect.arrayContaining([
            'financial-intelligence',
            'security-privacy',
            'executive-orchestrator'
          ])
        );
      });

      it('should send notifications through multiple channels', async () => {
        const incident = await agent.detectCrisis({
          type: CrisisType.SECURITY,
          severity: CrisisSeverity.CRITICAL,
          description: 'Security breach detected',
          detectedAt: new Date()
        });

        await agent.sendMultiChannelNotification(incident.id, {
          channels: [
            CommunicationChannel.EMAIL,
            CommunicationChannel.SMS,
            CommunicationChannel.SLACK,
            CommunicationChannel.PHONE
          ],
          recipients: ['CEO', 'CTO', 'CISO'],
          urgency: 'immediate'
        });

        expect(mockMcpIntegration.sendNotification).toHaveBeenCalledTimes(4);
      });
    });

    describe('Error Handling and Edge Cases', () => {
      beforeEach(async () => {
        await agent.initialize();
      });

      it('should handle invalid crisis data gracefully', async () => {
        const invalidCrisisData = {
          type: 'INVALID_TYPE' as any,
          severity: 'INVALID_SEVERITY' as any,
          description: '',
          detectedAt: 'invalid_date' as any
        };

        await expect(agent.detectCrisis(invalidCrisisData))
          .rejects.toThrow('Invalid crisis data provided');
      });

      it('should handle MCP integration failures', async () => {
        mockMcpIntegration.storeMemory.mockRejectedValue(new Error('MCP storage failed'));

        const incident = await agent.detectCrisis({
          type: CrisisType.OPERATIONAL,
          severity: CrisisSeverity.MEDIUM,
          description: 'Test incident',
          detectedAt: new Date()
        });

        // Should still create incident despite storage failure
        expect(incident).toBeDefined();
        expect(agent.getCrisis(incident.id)).toBeDefined();
      });

      it('should handle notification failures gracefully', async () => {
        mockMcpIntegration.sendNotification.mockRejectedValue(
          new Error('Notification service unavailable')
        );

        const incident = await agent.detectCrisis({
          type: CrisisType.SECURITY,
          severity: CrisisSeverity.HIGH,
          description: 'Test incident',
          detectedAt: new Date()
        });

        // Should continue processing despite notification failure
        expect(incident).toBeDefined();
        expect(incident.status).toBe(CrisisStatus.DETECTED);
      });

      it('should handle concurrent crisis processing', async () => {
        const promises = [];
        
        for (let i = 0; i < 10; i++) {
          promises.push(agent.detectCrisis({
            type: CrisisType.OPERATIONAL,
            severity: CrisisSeverity.MEDIUM,
            description: `Concurrent incident ${i}`,
            detectedAt: new Date()
          }));
        }

        const incidents = await Promise.all(promises);
        
        expect(incidents.length).toBe(10);
        expect(new Set(incidents.map(i => i.id)).size).toBe(10); // All unique
        expect(agent.getActiveCrises().length).toBe(10);
      });
    });
  });

  describe('CrisisDetectionEngine', () => {
    let detectionEngine: CrisisDetectionEngine;

    beforeEach(() => {
      detectionEngine = new CrisisDetectionEngine(mockMcpIntegration, {
        monitoringInterval: 5000,
        detectionRules: [],
        alertThresholds: {
          low: 0.3,
          medium: 0.6,
          high: 0.8,
          critical: 0.95
        }
      });
    });

    it('should initialize detection engine', () => {
      expect(detectionEngine).toBeInstanceOf(CrisisDetectionEngine);
    });

    it('should add detection rules', () => {
      const rule: DetectionRule = {
        id: 'test-rule',
        name: 'Test Detection Rule',
        description: 'Test rule for unit testing',
        conditions: {
          metric: 'cpu_usage',
          operator: 'greater_than',
          threshold: 0.9,
          duration: 300000
        },
        severity: CrisisSeverity.HIGH,
        actions: ['alert', 'escalate']
      };

      detectionEngine.addRule(rule);
      
      const rules = detectionEngine.getRules();
      expect(rules).toContainEqual(rule);
    });

    it('should detect anomalies based on rules', async () => {
      const rule: DetectionRule = {
        id: 'cpu-rule',
        name: 'High CPU Usage',
        description: 'Detect high CPU usage',
        conditions: {
          metric: 'cpu_usage',
          operator: 'greater_than',
          threshold: 0.8
        },
        severity: CrisisSeverity.HIGH,
        actions: ['alert']
      };

      detectionEngine.addRule(rule);

      const testData = {
        cpu_usage: 0.95,
        timestamp: new Date()
      };

      const result = await detectionEngine.evaluateData(testData);
      
      expect(result.detected).toBe(true);
      expect(result.triggeredRules).toContainEqual(
        expect.objectContaining({ id: 'cpu-rule' })
      );
    });
  });

  describe('StakeholderCoordinationSystem', () => {
    let coordinationSystem: StakeholderCoordinationSystem;

    beforeEach(() => {
      coordinationSystem = new StakeholderCoordinationSystem(mockMcpIntegration, {
        stakeholderMatrix: {
          executive: ['CEO', 'COO'],
          technical: ['CTO', 'Engineering Manager'],
          operational: ['Operations Manager'],
          legal: ['Legal Counsel'],
          pr: ['PR Manager']
        },
        escalationMatrix: {
          low: ['operational'],
          medium: ['operational', 'technical'],
          high: ['technical', 'executive'],
          critical: ['executive', 'legal', 'pr']
        },
        communicationChannels: {
          email: { enabled: true, priority: 1 },
          sms: { enabled: true, priority: 2 },
          slack: { enabled: true, priority: 3 },
          phone: { enabled: true, priority: 4 }
        }
      });
    });

    it('should coordinate stakeholders for crisis', async () => {
      const notification: StakeholderNotification = {
        incidentId: 'test-incident',
        severity: CrisisSeverity.HIGH,
        message: 'High severity incident requires immediate attention',
        stakeholderRoles: [StakeholderRole.EXECUTIVE, StakeholderRole.TECHNICAL],
        channels: [CommunicationChannel.EMAIL, CommunicationChannel.SMS],
        urgency: 'immediate'
      };

      await coordinationSystem.notifyStakeholders(notification);

      expect(mockMcpIntegration.sendNotification).toHaveBeenCalledTimes(2); // Email and SMS
    });

    it('should handle escalation matrix properly', () => {
      const stakeholders = coordinationSystem.getStakeholdersForSeverity(CrisisSeverity.CRITICAL);
      
      expect(stakeholders).toContain('CEO');
      expect(stakeholders).toContain('Legal Counsel');
      expect(stakeholders).toContain('PR Manager');
    });
  });

  describe('EnhancedCrisisManagementAgent', () => {
    let enhancedAgent: EnhancedCrisisManagementAgent;

    beforeEach(() => {
      enhancedAgent = new EnhancedCrisisManagementAgent(mockMcpIntegration);
    });

    it('should initialize enhanced agent', () => {
      expect(enhancedAgent).toBeInstanceOf(EnhancedCrisisManagementAgent);
    });

    it('should handle enhanced incident types', async () => {
      const enhancedIncident: EnhancedCrisisIncident = {
        id: 'enhanced-incident',
        type: CrisisType.OPERATIONAL,
        category: CrisisCategory.INFRASTRUCTURE,
        severity: CrisisSeverity.HIGH,
        status: CrisisStatus.DETECTED,
        description: 'Infrastructure failure',
        detectedAt: new Date(),
        timeline: [],
        affectedSystems: ['primary-datacenter'],
        impactAssessment: {
          customerImpact: 'high',
          revenueImpact: 100000,
          reputationImpact: 'medium'
        },
        responseProtocol: ResponseProtocol.INFRASTRUCTURE_FAILURE,
        automaticActions: ['failover_to_backup', 'notify_customers'],
        complianceRequirements: ['SOC2', 'ISO27001']
      };

      await enhancedAgent.processEnhancedIncident(enhancedIncident);

      expect(mockMcpIntegration.invokeFunction).toHaveBeenCalledWith(
        'execute_automatic_action',
        expect.objectContaining({
          action: 'failover_to_backup'
        })
      );
    });
  });
});