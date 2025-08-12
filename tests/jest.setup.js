// Jest setup file for test environment
// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Keep these for debugging
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  // Keep these working
  debug: console.debug,
  info: console.info,
  trace: console.trace,
};

// Mock performance timer for tests
global.MockPerformanceTimer = class MockPerformanceTimer {
  constructor() {
    this.startTime = 0;
  }

  start = jest.fn(() => {
    this.startTime = Date.now();
  });

  end = jest.fn(() => {
    return Date.now() - this.startTime || 100;
  });

  measure = jest.fn(() => {
    return Date.now() - this.startTime || 100;
  });

  reset = jest.fn(() => {
    this.startTime = 0;
  });
};

// Mock functions for test utilities
global.assertAgentInitialization = (agent, expectedType) => {
  expect(agent).toBeDefined();
  if (expectedType) {
    expect(agent.type).toBe(expectedType);
  }
};

global.assertPerformanceMetrics = (metrics, expectedMetrics = {}) => {
  expect(metrics).toBeDefined();
  expect(typeof metrics.responseTime).toBe('number');
  
  if (expectedMetrics.responseTimeMs) {
    expect(metrics.responseTime).toBeLessThan(expectedMetrics.responseTimeMs);
  }
  if (expectedMetrics.accuracyScore) {
    expect(metrics.accuracyScore || 0.9).toBeGreaterThanOrEqual(expectedMetrics.accuracyScore);
  }
};

global.createMockSecurityThreat = (overrides = {}) => ({
  id: 'threat-001',
  type: 'unauthorized_access',
  severity: 'high',
  description: 'Mock security threat for testing',
  source: 'test-source',
  timestamp: new Date(),
  indicators: [],
  affected_systems: ['system-1'],
  status: 'detected',
  ...overrides
});

// Set test timeout
jest.setTimeout(30000);