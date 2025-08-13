/**
 * Mock Factories - Barrel Export
 * Central export for all type-safe mock factory implementations
 */

// Base Factory Infrastructure
export {
  MockFactory,
  MockValidationResult,
  BaseMockFactory,
  MockValidationHelpers,
  MockPerformanceMetrics
} from './base/MockFactory';

// MCP Integration Mocks
export {
  MCPIntegrationMockFactory,
  mcpIntegrationMockFactory
} from './mcp/MCPIntegrationMockFactory';

// Financial Context Mocks
export {
  FinancialContextMockFactory,
  PortfolioProfileMockFactory,
  financialContextMockFactory,
  portfolioProfileMockFactory
} from './financial/FinancialMockFactory';

// Executive Context Mocks
export {
  ExecutiveContextMockFactory,
  executiveContextMockFactory
} from './executive/ExecutiveMockFactory';

// Re-export type utilities for convenience
export type {
  DeepPartial,
  ClaudeFlowMCPIntegration,
  FinancialContext,
  PortfolioProfile,
  ExecutiveContext,
  SecurityLevel
} from '../../../src/types/test-types';

/**
 * Convenience function to reset all mock factories
 * Useful for test cleanup and ensuring clean state
 */
export function resetAllMockFactories(): void {
  mcpIntegrationMockFactory.reset();
  financialContextMockFactory.reset();
  portfolioProfileMockFactory.reset();
  executiveContextMockFactory.reset();
}

/**
 * Convenience function to validate all mocks in a test suite
 * Helps ensure comprehensive mock validation
 */
export function validateAllMocks(mocks: {
  mcpIntegration?: any;
  financialContext?: any;
  portfolioProfile?: any;
  executiveContext?: any;
}): void {
  if (mocks.mcpIntegration) {
    MockValidationHelpers.assertMockValid(mocks.mcpIntegration, mcpIntegrationMockFactory);
  }
  
  if (mocks.financialContext) {
    MockValidationHelpers.assertMockValid(mocks.financialContext, financialContextMockFactory);
  }
  
  if (mocks.portfolioProfile) {
    MockValidationHelpers.assertMockValid(mocks.portfolioProfile, portfolioProfileMockFactory);
  }
  
  if (mocks.executiveContext) {
    MockValidationHelpers.assertMockValid(mocks.executiveContext, executiveContextMockFactory);
  }
}

/**
 * Create a complete test environment with all necessary mocks
 * One-stop solution for comprehensive testing setup
 */
export interface TestEnvironment {
  mcpIntegration: jest.Mocked<ClaudeFlowMCPIntegration>;
  financialContext: FinancialContext;
  executiveContext: ExecutiveContext;
  portfolioProfile: PortfolioProfile;
}

export function createTestEnvironment(overrides?: {
  mcpIntegration?: DeepPartial<ClaudeFlowMCPIntegration>;
  financialContext?: DeepPartial<FinancialContext>;
  executiveContext?: DeepPartial<ExecutiveContext>;
  portfolioProfile?: DeepPartial<PortfolioProfile>;
}): TestEnvironment {
  return {
    mcpIntegration: mcpIntegrationMockFactory.create(overrides?.mcpIntegration),
    financialContext: financialContextMockFactory.create(overrides?.financialContext),
    executiveContext: executiveContextMockFactory.create(overrides?.executiveContext),
    portfolioProfile: portfolioProfileMockFactory.create(overrides?.portfolioProfile)
  };
}

/**
 * Create test environment for high-security scenarios
 */
export function createSecureTestEnvironment(overrides?: {
  mcpIntegration?: DeepPartial<ClaudeFlowMCPIntegration>;
  financialContext?: DeepPartial<FinancialContext>;
  executiveContext?: DeepPartial<ExecutiveContext>;
}): TestEnvironment {
  return createTestEnvironment({
    executiveContext: executiveContextMockFactory.createCEO(),
    financialContext: financialContextMockFactory.createHighNetWorth(),
    ...overrides
  });
}

/**
 * Create test environment for performance testing
 */
export function createPerformanceTestEnvironment(
  latencyMs: number = 100,
  overrides?: {
    mcpIntegration?: DeepPartial<ClaudeFlowMCPIntegration>;
    financialContext?: DeepPartial<FinancialContext>;
    executiveContext?: DeepPartial<ExecutiveContext>;
  }
): TestEnvironment {
  return createTestEnvironment({
    mcpIntegration: mcpIntegrationMockFactory.createWithLatency(latencyMs),
    ...overrides
  });
}

/**
 * Create test environment for failure testing
 */
export function createFailureTestEnvironment(
  failureRate: number = 0.1,
  overrides?: {
    mcpIntegration?: DeepPartial<ClaudeFlowMCPIntegration>;
    financialContext?: DeepPartial<FinancialContext>;
    executiveContext?: DeepPartial<ExecutiveContext>;
  }
): TestEnvironment {
  return createTestEnvironment({
    mcpIntegration: mcpIntegrationMockFactory.createWithFailures(failureRate),
    ...overrides
  });
}