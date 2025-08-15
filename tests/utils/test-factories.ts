// Import all required types from central test types file
import {
  ClaudeFlowMCPIntegration,
  FinancialContext,
  ExecutiveContext,
  PortfolioProfile,
  Holding,
  MockOverrides
} from '../../src/types/test-types';

/**
 * Test data factories for creating mock objects used in tests.
 * These factories provide consistent test data and reduce duplication across test files.
 */

// Mock executive context for testing
export const mockExecutiveContext = {
  executiveId: 'exec-001',
  sessionId: 'session-001',
  currentPriority: 'high',
  stakeholders: ['board-member-1', 'team-lead-1'],
  timeZone: 'America/New_York',
  confidentialityLevel: 'restricted',
  preferences: {
    riskTolerance: 'moderate',
    communicationStyle: 'direct',
    decisionSpeed: 'balanced'
  },
  currentContext: {
    schedule: [],
    priorities: ['strategic planning', 'team management'],
    workload: 'normal'
  }
};

// Mock threat data for security tests
export const mockThreat = {
  id: 'threat-001',
  type: 'unauthorized_access',
  severity: 'high',
  description: 'Unauthorized access attempt detected',
  source: 'external',
  timestamp: new Date(),
  indicators: [],
  affected_systems: ['system-1'],
  status: 'detected'
};

// Mock calendar events for calendar intelligence tests
export const mockCalendarEvents = [
  {
    id: 'event-001',
    title: 'Board Meeting',
    start: new Date('2024-01-01T09:00:00Z'),
    end: new Date('2024-01-01T10:30:00Z'),
    attendees: ['exec-001', 'board-member-1']
  }
];

// Import new type-safe mock factories
import {
  mcpIntegrationMockFactory,
  executiveContextMockFactory
} from './mock-factories';

/**
 * @deprecated Use mcpIntegrationMockFactory.create() instead
 * Creates a mock MCP integration for testing agent communication
 */
export const createMockMCPIntegration = (overrides: MockOverrides<ClaudeFlowMCPIntegration> = {}): jest.Mocked<ClaudeFlowMCPIntegration> => {
  console.warn('createMockMCPIntegration is deprecated. Use mcpIntegrationMockFactory.create() instead.');
  return mcpIntegrationMockFactory.create(overrides);
};

/**
 * Creates mock performance metrics for agent testing
 */
export const createMockPerformanceMetrics = () => ({
  responseTime: 100,
  throughputPerHour: 50,
  errorRate: 0.02,
  accuracyScore: 0.95,
  consensusSuccessRate: 0.92,
  lastUpdated: new Date()
});

/**
 * Creates mock agent configuration for testing
 */
export const createMockAgentConfig = (overrides: Record<string, any> = {}) => ({
  id: 'test-agent-001',
  type: 'generic-agent',
  name: 'Test Agent',
  capabilities: ['analysis', 'coordination'],
  securityLevel: 'operational',
  maxConcurrentTasks: 5,
  ...overrides
});

/**
 * Creates mock swarm configuration for testing  
 */
export const createMockSwarmConfig = (overrides = {}) => ({
  topology: 'hierarchical',
  maxAgents: 10,
  strategy: 'balanced',
  coordinationMode: 'centralized',
  ...overrides
});

/**
 * Creates mock task data for testing
 */
export const createMockTask = (overrides = {}) => ({
  id: 'task-001',
  type: 'analysis',
  priority: 'medium',
  description: 'Mock task for testing',
  requiredCapabilities: ['analysis'],
  expectedDuration: 30000, // 30 seconds
  ...overrides
});

/**
 * Creates mock cultural analysis data
 */
export const createMockCulturalAnalysis = () => ({
  region: 'North America',
  preferences: {
    communicationStyle: 'direct',
    meetingFormat: 'structured',
    decisionMaking: 'collaborative'
  },
  considerations: [
    'Time zone differences',
    'Business etiquette',
    'Language preferences'
  ]
});

/**
 * Creates mock financial data for testing
 */
export const createMockFinancialData = () => ({
  budget: {
    total: 100000,
    allocated: 75000,
    remaining: 25000
  },
  expenses: [
    { category: 'travel', amount: 5000 },
    { category: 'supplies', amount: 2000 }
  ],
  forecast: {
    nextQuarter: 110000,
    confidence: 0.85
  }
});

/**
 * Creates a mock financial context for testing
 */
export const createMockFinancialContext = (overrides: MockOverrides<FinancialContext> = {}): FinancialContext => ({
  executiveId: 'exec-001',
  portfolioProfile: {
    totalValue: 500000,
    assetAllocation: { stocks: 60, bonds: 30, cash: 10 },
    holdings: [],
    performanceTargets: { annualReturn: 0.08, maxDrawdown: 0.15 },
    rebalancingRules: []
  },
  taxProfile: {
    jurisdiction: 'US',
    taxBracket: 0.37,
    taxOptimizationGoals: ['minimize_current_tax', 'defer_gains'],
    harvestingRules: [],
    retirementAccounts: []
  },
  riskTolerance: 'moderate',
  investmentHorizon: 5,
  liquidityNeeds: 100000,
  regulatoryJurisdictions: ['US'],
  currencies: ['USD'],
  complianceRequirements: ['SOX', 'FINRA'],
  ...overrides
});

/**
 * Creates a mock portfolio profile for testing
 */
export const createMockPortfolioProfile = (overrides: MockOverrides<PortfolioProfile> = {}): PortfolioProfile => ({
  totalValue: 500000,
  assetAllocation: { stocks: 60, bonds: 30, cash: 10 },
  holdings: [],
  performanceTargets: { annualReturn: 0.08, maxDrawdown: 0.15, sharpeRatio: 1.2, volatility: 0.12 },
  rebalancingRules: [],
  ...overrides
});

/**
 * Creates a mock holdings batch for testing
 */
export const createMockHoldingsBatch = (count: number = 2): Holding[] => {
  const holdings: Holding[] = [];
  const baseHoldings = [
    { symbol: 'AAPL', quantity: 100, currentPrice: 150.00, costBasis: 120.00, sector: 'Technology', currency: 'USD', lastUpdated: '2024-01-01' },
    { symbol: 'GOOGL', quantity: 50, currentPrice: 2800.00, costBasis: 2500.00, sector: 'Technology', currency: 'USD', lastUpdated: '2024-01-01' },
    { symbol: 'MSFT', quantity: 75, currentPrice: 400.00, costBasis: 350.00, sector: 'Technology', currency: 'USD', lastUpdated: '2024-01-01' },
    { symbol: 'TSLA', quantity: 25, currentPrice: 800.00, costBasis: 700.00, sector: 'Automotive', currency: 'USD', lastUpdated: '2024-01-01' }
  ];
  
  for (let i = 0; i < count && i < baseHoldings.length; i++) {
    holdings.push(baseHoldings[i]);
  }
  
  return holdings;
};

/**
 * Creates mock market data for testing
 */
export const createMockMarketData = () => ({
  indices: {
    sp500: { value: 4500, change: 0.02 },
    nasdaq: { value: 15000, change: 0.015 }
  },
  commodities: {
    gold: { price: 1800, change: -0.01 },
    oil: { price: 70, change: 0.03 }
  }
});

/**
 * Creates a mock security threat for testing
 */
export const createMockSecurityThreat = (overrides = {}) => ({
  id: 'threat-789',
  type: 'unauthorized_access' as const,
  severity: 'high' as const,
  source: 'external',
  target: 'api_endpoint',
  description: 'Suspicious login attempts',
  detected: true,
  mitigated: false,
  timestamp: new Date(),
  confidence: 0.85,
  affectedSystems: ['auth_system'],
  recommendedActions: ['block_ip', 'review_logs'],
  detectedAt: new Date().toISOString(),
  ...overrides
});

/**
 * Mock performance timer for testing
 */
export class MockPerformanceTimer {
  private startTime: number = Date.now();
  
  start(): void {
    this.startTime = Date.now();
  }
  
  stop(): number {
    return Date.now() - this.startTime;
  }
  
  measure(): number {
    return Date.now() - this.startTime;
  }
  
  reset(): void {
    this.startTime = Date.now();
  }
}

/**
 * Asserts that an agent is properly initialized
 */
export const assertAgentInitialization = (agent: any, expectedType: string) => {
  expect(agent).toBeDefined();
  expect(agent.agentType).toBe(expectedType);
  expect(agent.agentId).toBeDefined();
  expect(agent.status).toBe('active');
};

/**
 * Asserts performance metrics are within expected ranges
 */
export const assertPerformanceMetrics = (metrics: any, expectations: any = {}) => {
  expect(metrics).toBeDefined();
  expect(typeof (metrics.responseTime || metrics.responseTimeMs)).toBe('number');
  expect(metrics.responseTime || metrics.responseTimeMs).toBeGreaterThanOrEqual(0);
  
  if (expectations.maxResponseTime || expectations.responseTimeMs) {
    const responseTime = metrics.responseTime || metrics.responseTimeMs;
    const maxTime = expectations.maxResponseTime || expectations.responseTimeMs;
    expect(responseTime).toBeLessThanOrEqual(maxTime);
  }
  
  if (expectations.minSuccessRate) {
    expect(metrics.successRate || 0).toBeGreaterThanOrEqual(expectations.minSuccessRate);
  }
};

/**
 * @deprecated Use executiveContextMockFactory.create() instead
 * Creates a complete mock ExecutiveContext with proper preferences
 */
export const createMockExecutiveContext = (overrides: MockOverrides<ExecutiveContext> = {}) => {
  console.warn('createMockExecutiveContext is deprecated. Use executiveContextMockFactory.create() instead.');
  return executiveContextMockFactory.create(overrides);
};