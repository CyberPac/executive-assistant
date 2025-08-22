/**
 * Work Package 1.1.2 Tests: Email Integration Agent Technical Design
 * Comprehensive test suite with 95% coverage target
 */

import WorkPackage112, { EmailIntegrationAgent, EmailMessage } from './index';
import { PEAAgentType, AgentStatus, SecurityLevel, ExecutiveContext } from '../../../types/pea-agent-types';
import { MCPIntegration } from '../../../types/mcp';

// Mock MCP Integration
const mockMCPIntegration: MCPIntegration = {
  swarmInit: jest.fn(),
  agentSpawn: jest.fn(),
  taskOrchestrate: jest.fn(),
  memoryUsage: jest.fn().mockResolvedValue({ success: true, key: 'test', value: 'test' }),
  neuralTrain: jest.fn(),
  neuralPatterns: jest.fn(),
  request: jest.fn()
};

// Mock Executive Context
const mockExecutiveContext: ExecutiveContext = {
  executiveId: 'exec-001',
  sessionId: 'session-001',
  preferences: {
    communicationStyle: 'diplomatic',
    decisionThreshold: 0.8,
    privacyLevel: SecurityLevel.EXECUTIVE_PERSONAL,
    timeZone: 'UTC',
    languages: ['en'],
    culturalAdaptation: true
  },
  currentPriority: 'high',
  stakeholders: [
    {
      id: 'stakeholder-001',
      name: 'John Smith',
      relationship: 'board',
      priority: 'critical',
      communicationHistory: []
    }
  ],
  timeZone: 'UTC',
  confidentialityLevel: SecurityLevel.EXECUTIVE_PERSONAL
};

// Mock Email Message
const mockEmailMessage: EmailMessage = {
  id: 'email-001',
  threadId: 'thread-001',
  from: { name: 'Test Sender', email: 'sender@example.com' },
  to: [{ name: 'Executive', email: 'exec@company.com' }],
  subject: 'Urgent Board Meeting Update',
  body: 'This is an urgent message about the board meeting with John Smith.',
  bodyType: 'text',
  timestamp: new Date(),
  priority: 'urgent',
  classification: SecurityLevel.STRATEGIC_CONFIDENTIAL,
  attachments: [],
  isRead: false,
  labels: ['important']
};

describe('Work Package 1.1.2: Email Integration Technical Design', () => {
  let workPackage: WorkPackage112;
  let emailAgent: EmailIntegrationAgent;
  
  beforeEach(() => {
    workPackage = new WorkPackage112(mockMCPIntegration);
  });
  
  describe('Work Package Initialization', () => {
    test('should initialize work package successfully', () => {
      expect(workPackage).toBeDefined();
      expect(workPackage.getAgent()).toBeInstanceOf(EmailIntegrationAgent);
    });
    
    test('should execute work package and return email agent', async () => {
      const agent = await workPackage.execute();
      expect(agent).toBeInstanceOf(EmailIntegrationAgent);
      expect(agent.status).toBe(AgentStatus.ACTIVE);
    });
  });
  
  describe('EmailIntegrationAgent Core Functionality', () => {
    beforeEach(async () => {
      emailAgent = new EmailIntegrationAgent(
        'test-email-agent',
        mockMCPIntegration,
        SecurityLevel.BUSINESS_SENSITIVE
      );
      await emailAgent.initialize();
    });
    
    test('should initialize with correct properties', () => {
      expect(emailAgent.id).toBe('test-email-agent');
      expect(emailAgent.type).toBe(PEAAgentType.EMAIL_INTEGRATION);
      expect(emailAgent.name).toBe('Email Integration Agent');
      expect(emailAgent.status).toBe(AgentStatus.ACTIVE);
      expect(emailAgent.capabilities).toContain('email-processing');
      expect(emailAgent.capabilities).toContain('oauth2-authentication');
      expect(emailAgent.capabilities).toContain('gmail-integration');
      expect(emailAgent.capabilities).toContain('outlook-integration');
    });
    
    test('should process email within performance targets', async () => {
      const startTime = Date.now();
      const result = await emailAgent.processEmail(mockEmailMessage, mockExecutiveContext);
      const processingTime = Date.now() - startTime;
      
      // Verify sub-75ms target (allowing some overhead for test environment)
      expect(processingTime).toBeLessThan(150); // Relaxed for test environment
      expect(result.processingTimeMs).toBeLessThan(75);
    });
    
    test('should classify email security correctly', async () => {
      const result = await emailAgent.processEmail(mockEmailMessage, mockExecutiveContext);
      
      expect(result.classification).toBeDefined();
      expect(Object.values(SecurityLevel)).toContain(result.classification);
    });
    
    test('should assess email priority correctly', async () => {
      const result = await emailAgent.processEmail(mockEmailMessage, mockExecutiveContext);
      
      expect(result.priority).toBeDefined();
      expect(['low', 'normal', 'high', 'urgent']).toContain(result.priority);
      // Should detect urgent keywords
      expect(result.priority).toBe('urgent');
    });
    
    test('should analyze stakeholders correctly', async () => {
      const result = await emailAgent.processEmail(mockEmailMessage, mockExecutiveContext);
      
      expect(result.stakeholderAnalysis).toBeDefined();
      expect(Array.isArray(result.stakeholderAnalysis)).toBe(true);
      // Should find John Smith mentioned in email
      expect(result.stakeholderAnalysis.length).toBeGreaterThan(0);
    });
    
    test('should generate appropriate action recommendations', async () => {
      const result = await emailAgent.processEmail(mockEmailMessage, mockExecutiveContext);
      
      expect(result.suggestedActions).toBeDefined();
      expect(Array.isArray(result.suggestedActions)).toBe(true);
      expect(result.suggestedActions.length).toBeGreaterThan(0);
      // Should recommend immediate notification for urgent emails
      expect(result.suggestedActions).toContain('Notify executive immediately');
    });
    
    test('should determine consensus requirements correctly', async () => {
      const result = await emailAgent.processEmail(mockEmailMessage, mockExecutiveContext);
      
      expect(typeof result.consensusRecommended).toBe('boolean');
      // Urgent emails should require consensus
      expect(result.consensusRecommended).toBe(true);
    });
    
    test('should identify emails requiring executive attention', async () => {
      const result = await emailAgent.processEmail(mockEmailMessage, mockExecutiveContext);
      
      expect(typeof result.requiresExecutiveAttention).toBe('boolean');
      // Urgent emails should require executive attention
      expect(result.requiresExecutiveAttention).toBe(true);
    });
  });
  
  describe('Performance Metrics and Monitoring', () => {
    beforeEach(async () => {
      emailAgent = new EmailIntegrationAgent(
        'perf-test-agent',
        mockMCPIntegration
      );
      await emailAgent.initialize();
    });
    
    test('should track performance metrics', async () => {
      await emailAgent.processEmail(mockEmailMessage, mockExecutiveContext);
      
      const status = emailAgent.getAgentStatus();
      expect(status.emailMetrics).toBeDefined();
      expect(status.emailMetrics.totalProcessed).toBeGreaterThan(0);
      expect(status.emailMetrics.lastProcessingTime).toBeGreaterThan(0);
    });
    
    test('should provide comprehensive agent status', () => {
      const status = emailAgent.getAgentStatus();
      
      expect(status.status).toBe(AgentStatus.ACTIVE);
      expect(status.metrics).toBeDefined();
      expect(status.emailMetrics).toBeDefined();
      expect(status.providers).toContain('gmail');
      expect(status.providers).toContain('outlook');
      expect(status.capabilities).toBeDefined();
      expect(status.queueSize).toBeDefined();
    });
    
    test('should update performance metrics after processing', async () => {
      const initialMetrics = emailAgent.getAgentStatus().metrics;
      
      await emailAgent.processEmail(mockEmailMessage, mockExecutiveContext);
      
      const updatedMetrics = emailAgent.getAgentStatus().metrics;
      expect(updatedMetrics.responseTimeMs).toBeGreaterThan(0);
      expect(updatedMetrics.lastUpdated).not.toBe(initialMetrics.lastUpdated);
    });
  });
  
  describe('Email Provider Configuration', () => {
    beforeEach(async () => {
      emailAgent = new EmailIntegrationAgent(
        'provider-test-agent',
        mockMCPIntegration
      );
      await emailAgent.initialize();
    });
    
    test('should configure Gmail and Outlook providers', () => {
      const status = emailAgent.getAgentStatus();
      expect(status.providers).toContain('gmail');
      expect(status.providers).toContain('outlook');
    });
  });
  
  describe('Error Handling and Edge Cases', () => {
    beforeEach(async () => {
      emailAgent = new EmailIntegrationAgent(
        'error-test-agent',
        mockMCPIntegration
      );
      await emailAgent.initialize();
    });
    
    test('should handle emails without stakeholders', async () => {
      const emailWithoutStakeholders = {
        ...mockEmailMessage,
        body: 'Generic email without specific stakeholder mentions',
        subject: 'General inquiry'
      };
      
      const result = await emailAgent.processEmail(emailWithoutStakeholders, mockExecutiveContext);
      expect(result).toBeDefined();
      expect(result.stakeholderAnalysis).toBeDefined();
    });
    
    test('should handle emails with attachments', async () => {
      const emailWithAttachments = {
        ...mockEmailMessage,
        attachments: [
          {
            id: 'att-001',
            filename: 'document.pdf',
            mimeType: 'application/pdf',
            size: 1024
          }
        ]
      };
      
      const result = await emailAgent.processEmail(emailWithAttachments, mockExecutiveContext);
      expect(result.suggestedActions).toContain('Review attachments for security');
    });
    
    test('should classify executive personal emails correctly', async () => {
      const executiveEmail = {
        ...mockEmailMessage,
        from: { name: 'Executive', email: 'exec-001@company.com' }
      };
      
      const result = await emailAgent.processEmail(executiveEmail, mockExecutiveContext);
      expect(result.classification).toBe(SecurityLevel.EXECUTIVE_PERSONAL);
    });
  });
  
  describe('Integration with PEA Agent System', () => {
    beforeEach(async () => {
      emailAgent = new EmailIntegrationAgent(
        'integration-test-agent',
        mockMCPIntegration
      );
      await emailAgent.initialize();
    });
    
    test('should store activity in memory for coordination', async () => {
      await emailAgent.processEmail(mockEmailMessage, mockExecutiveContext);
      
      // Verify memory storage was called
      expect(mockMCPIntegration.memoryUsage).toHaveBeenCalled();
    });
    
    test('should inherit from PEAAgentBase correctly', () => {
      expect(emailAgent.agentType).toBe(PEAAgentType.EMAIL_INTEGRATION);
      expect(emailAgent.agentId).toBe('integration-test-agent');
      expect(typeof emailAgent.responseTime).toBe('number');
    });
  });
});

// Performance benchmark test
describe('Email Processing Performance Benchmarks', () => {
  let emailAgent: EmailIntegrationAgent;
  
  beforeEach(async () => {
    emailAgent = new EmailIntegrationAgent(
      'benchmark-agent',
      mockMCPIntegration
    );
    await emailAgent.initialize();
  });
  
  test('should consistently meet sub-75ms processing targets', async () => {
    const iterations = 10;
    const processingTimes: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const testEmail = {
        ...mockEmailMessage,
        id: `benchmark-email-${i}`,
        subject: `Benchmark Test ${i}`
      };
      
      const result = await emailAgent.processEmail(testEmail, mockExecutiveContext);
      processingTimes.push(result.processingTimeMs);
    }
    
    // Calculate average processing time
    const averageTime = processingTimes.reduce((sum, time) => sum + time, 0) / iterations;
    
    // Verify performance targets
    expect(averageTime).toBeLessThan(75); // Sub-75ms target
    expect(Math.max(...processingTimes)).toBeLessThan(100); // No outliers above 100ms
    
    console.log(`Average processing time: ${averageTime.toFixed(2)}ms`);
    console.log(`Max processing time: ${Math.max(...processingTimes).toFixed(2)}ms`);
    console.log(`Min processing time: ${Math.min(...processingTimes).toFixed(2)}ms`);
  });
});
