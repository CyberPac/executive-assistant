/**
 * Type-Safe Mock Factory System Tests
 * Validates the new mock factory implementation
 */

import {
  mcpIntegrationMockFactory,
  financialContextMockFactory,
  executiveContextMockFactory,
  createTestEnvironment,
  createSecureTestEnvironment,
  MockValidationHelpers,
  resetAllMockFactories
} from '../utils/mock-factories';

describe('Type-Safe Mock Factory System', () => {
  beforeEach(() => {
    resetAllMockFactories();
  });

  describe('MCP Integration Mock Factory', () => {
    it('should create a properly typed mock with default values', () => {
      const mock = mcpIntegrationMockFactory.create();
      
      expect(mock).toBeDefined();
      expect(mock.swarmInit).toBeDefined();
      expect(jest.isMockFunction(mock.swarmInit)).toBe(true);
      expect(jest.isMockFunction(mock.agentSpawn)).toBe(true);
      expect(jest.isMockFunction(mock.taskOrchestrate)).toBe(true);
    });

    it('should handle overrides correctly', async () => {
      const mock = mcpIntegrationMockFactory.create({
        swarmInit: async () => ({
          swarmId: 'custom-swarm',
          topology: 'custom',
          maxAgents: 10,
          status: 'custom-status'
        })
      });

      const result = await mock.swarmInit('test', 5, 'test');
      expect(result.swarmId).toBe('custom-swarm');
      expect(result.topology).toBe('custom');
    });

    it('should create behavioral mocks', () => {
      const mock = mcpIntegrationMockFactory.createWithSwarmBehavior();
      expect(mock).toBeDefined();
      expect(jest.isMockFunction(mock.swarmInit)).toBe(true);
    });

    it('should create latency mocks', () => {
      const mock = mcpIntegrationMockFactory.createWithLatency(200);
      expect(mock).toBeDefined();
    });
  });

  describe('Financial Context Mock Factory', () => {
    it('should create realistic financial context', () => {
      const context = financialContextMockFactory.create();
      
      expect(context.executiveId).toBe('exec-001');
      expect(context.portfolioProfile).toBeDefined();
      expect(context.portfolioProfile.totalValue).toBeGreaterThan(0);
      expect(context.riskTolerance).toBe('moderate');
    });

    it('should create high net worth context', () => {
      const context = financialContextMockFactory.createHighNetWorth();
      
      expect(context.portfolioProfile.totalValue).toBeGreaterThan(10000000);
      expect(context.liquidityNeeds).toBeGreaterThan(1000000);
    });

    it('should create conservative profile', () => {
      const context = financialContextMockFactory.createConservative();
      
      expect(context.riskTolerance).toBe('conservative');
      expect(context.portfolioProfile.performanceTargets.maxDrawdown).toBeLessThan(0.1);
    });

    it('should handle overrides', () => {
      const context = financialContextMockFactory.create({
        executiveId: 'custom-exec',
        riskTolerance: 'aggressive'
      });
      
      expect(context.executiveId).toBe('custom-exec');
      expect(context.riskTolerance).toBe('aggressive');
    });
  });

  describe('Executive Context Mock Factory', () => {
    it('should create executive context with proper security levels', () => {
      const context = executiveContextMockFactory.create();
      
      expect(context.executiveId).toBe('exec-001');
      expect(context.confidentialityLevel).toBeDefined();
      expect(context.preferences).toBeDefined();
      expect(context.stakeholders).toBeInstanceOf(Array);
    });

    it('should create CEO context', () => {
      const context = executiveContextMockFactory.createCEO();
      
      expect(context.executiveId).toBe('ceo-001');
      expect(context.currentPriority).toBe('critical');
      expect(context.preferences.decisionThreshold).toBeGreaterThan(0.8);
    });

    it('should create crisis mode context', () => {
      const context = executiveContextMockFactory.createCrisisMode();
      
      expect(context.currentPriority).toBe('critical');
      expect(context.currentContext.meetingStatus).toBe('crisis_management');
    });
  });

  describe('Test Environment Creation', () => {
    it('should create complete test environment', () => {
      const env = createTestEnvironment();
      
      expect(env.mcpIntegration).toBeDefined();
      expect(env.financialContext).toBeDefined();
      expect(env.executiveContext).toBeDefined();
      expect(env.portfolioProfile).toBeDefined();
      
      expect(jest.isMockFunction(env.mcpIntegration.swarmInit)).toBe(true);
    });

    it('should create secure test environment', () => {
      const env = createSecureTestEnvironment();
      
      expect(env.executiveContext.executiveId).toBe('ceo-001');
      expect(env.financialContext.portfolioProfile.totalValue).toBeGreaterThan(10000000);
    });

    it('should handle environment overrides', () => {
      const env = createTestEnvironment({
        executiveContext: { executiveId: 'test-exec' },
        financialContext: { riskTolerance: 'aggressive' }
      });
      
      expect(env.executiveContext.executiveId).toBe('test-exec');
      expect(env.financialContext.riskTolerance).toBe('aggressive');
    });
  });

  describe('Mock Validation', () => {
    it('should validate mock structure', () => {
      const mock = mcpIntegrationMockFactory.create();
      const validation = mcpIntegrationMockFactory.validate(mock);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid mocks', () => {
      const invalidMock = {} as any;
      const validation = mcpIntegrationMockFactory.validate(invalidMock);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should not throw on valid mock assertion', () => {
      const mock = mcpIntegrationMockFactory.create();
      
      expect(() => {
        MockValidationHelpers.assertMockValid(mock, mcpIntegrationMockFactory);
      }).not.toThrow();
    });
  });

  describe('Factory Configuration', () => {
    it('should allow factory configuration', () => {
      financialContextMockFactory.configure({
        riskTolerance: 'aggressive',
        executiveId: 'configured-exec'
      });
      
      const context = financialContextMockFactory.create();
      expect(context.riskTolerance).toBe('aggressive');
      expect(context.executiveId).toBe('configured-exec');
    });

    it('should reset factory state', () => {
      financialContextMockFactory.configure({ riskTolerance: 'aggressive' });
      financialContextMockFactory.reset();
      
      const context = financialContextMockFactory.create();
      expect(context.riskTolerance).toBe('moderate'); // back to default
    });
  });

  describe('Performance Testing', () => {
    it('should track mock performance', () => {
      const mock = mcpIntegrationMockFactory.create();
      
      // Make some calls
      mock.swarmInit('test', 5, 'strategy');
      mock.agentSpawn('researcher', 'test', []);
      
      const metrics = MockValidationHelpers.getMockPerformanceMetrics(mock);
      expect(metrics.totalCalls).toBe(2);
      expect(metrics.functionMetrics.length).toBeGreaterThan(0);
    });
  });
});