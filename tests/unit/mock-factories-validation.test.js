/**
 * Mock Factory Validation Tests (JavaScript)
 * Validates the mock factory implementation without TypeScript syntax issues
 */

const {
  mcpIntegrationMockFactory,
  financialContextMockFactory,
  executiveContextMockFactory,
  createTestEnvironment,
  createSecureTestEnvironment,
  MockValidationHelpers,
  resetAllMockFactories
} = require('../utils/mock-factories');

describe('Mock Factory System Validation', () => {
  beforeEach(() => {
    resetAllMockFactories();
  });

  describe('MCP Integration Mock Factory', () => {
    it('should create basic mock successfully', () => {
      const mock = mcpIntegrationMockFactory.create();
      
      expect(mock).toBeDefined();
      expect(mock.swarmInit).toBeDefined();
      expect(typeof mock.swarmInit).toBe('function');
      expect(typeof mock.agentSpawn).toBe('function');
      expect(typeof mock.taskOrchestrate).toBe('function');
    });

    it('should handle overrides correctly', async () => {
      const mock = mcpIntegrationMockFactory.create({
        swarmInit: async () => ({
          swarmId: 'test-swarm',
          topology: 'test',
          maxAgents: 5,
          status: 'test-status'
        })
      });

      const result = await mock.swarmInit('test', 5, 'test');
      expect(result.swarmId).toBe('test-swarm');
      expect(result.topology).toBe('test');
    });
  });

  describe('Financial Context Mock Factory', () => {
    it('should create financial context successfully', () => {
      const context = financialContextMockFactory.create();
      
      expect(context.executiveId).toBe('exec-001');
      expect(context.portfolioProfile).toBeDefined();
      expect(typeof context.portfolioProfile.totalValue).toBe('number');
      expect(context.riskTolerance).toBe('moderate');
    });

    it('should create high net worth context', () => {
      const context = financialContextMockFactory.createHighNetWorth();
      
      expect(context.portfolioProfile.totalValue).toBeGreaterThan(10000000);
      expect(context.liquidityNeeds).toBeGreaterThan(1000000);
    });
  });

  describe('Executive Context Mock Factory', () => {
    it('should create executive context successfully', () => {
      const context = executiveContextMockFactory.create();
      
      expect(context.executiveId).toBe('exec-001');
      expect(context.confidentialityLevel).toBeDefined();
      expect(context.preferences).toBeDefined();
      expect(Array.isArray(context.stakeholders)).toBe(true);
    });

    it('should create CEO context', () => {
      const context = executiveContextMockFactory.createCEO();
      
      expect(context.executiveId).toBe('ceo-001');
      expect(context.currentPriority).toBe('critical');
    });
  });

  describe('Test Environment Creation', () => {
    it('should create complete test environment', () => {
      const env = createTestEnvironment();
      
      expect(env.mcpIntegration).toBeDefined();
      expect(env.financialContext).toBeDefined();
      expect(env.executiveContext).toBeDefined();
      expect(env.portfolioProfile).toBeDefined();
      
      expect(typeof env.mcpIntegration.swarmInit).toBe('function');
    });

    it('should create secure test environment', () => {
      const env = createSecureTestEnvironment();
      
      expect(env.executiveContext.executiveId).toBe('ceo-001');
      expect(env.financialContext.portfolioProfile.totalValue).toBeGreaterThan(10000000);
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
      const invalidMock = {};
      const validation = mcpIntegrationMockFactory.validate(invalidMock);
      
      expect(validation.isValid).toBe(false);
      // Check for missing properties instead of errors
      expect(validation.missingProperties.length).toBeGreaterThan(0);
    });

    it('should not throw on valid mock assertion', () => {
      const mock = mcpIntegrationMockFactory.create();
      
      expect(() => {
        MockValidationHelpers.assertMockValid(mock, mcpIntegrationMockFactory);
      }).not.toThrow();
    });
  });

  describe('Factory Configuration and Reset', () => {
    it('should allow factory configuration', () => {
      financialContextMockFactory.configure({
        riskTolerance: 'aggressive',
        executiveId: 'test-exec'
      });
      
      const context = financialContextMockFactory.create();
      expect(context.riskTolerance).toBe('aggressive');
      expect(context.executiveId).toBe('test-exec');
    });

    it('should reset factory state', () => {
      financialContextMockFactory.configure({ riskTolerance: 'aggressive' });
      financialContextMockFactory.reset();
      
      const context = financialContextMockFactory.create();
      expect(context.riskTolerance).toBe('moderate'); // back to default
    });
  });
});