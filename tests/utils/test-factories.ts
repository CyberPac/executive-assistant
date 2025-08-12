import { ClaudeFlowMCPIntegration } from '../../src/types/pea-agent-types';
// Unused imports for future expansion:
// SwarmResponse, AgentSpawnResponse, TaskResponse, MemoryResponse, NeuralResponse

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

/**
 * Creates a mock MCP integration for testing agent communication
 */
export const createMockMCPIntegration = (overrides: Partial<ClaudeFlowMCPIntegration> = {}): jest.Mocked<ClaudeFlowMCPIntegration> => {
  const mockIntegration = {
    swarmInit: jest.fn<Promise<SwarmResponse>, [string, number, string]>().mockResolvedValue({
      swarmId: 'test-swarm-123',
      topology: 'hierarchical',
      agentCount: 5,
      success: true
    }),
    
    agentSpawn: jest.fn<Promise<AgentSpawnResponse>, [string, string, string[]]>().mockResolvedValue({
      agentId: 'test-agent-456',
      agentType: 'researcher',
      capabilities: ['analysis', 'research'],
      status: 'active'
    }),
    
    taskOrchestrate: jest.fn<Promise<TaskResponse>, [string, string, string]>().mockResolvedValue({
      taskId: 'test-task-789',
      status: 'assigned',
      assignedAgents: ['test-agent-456'],
      estimatedCompletion: new Date()
    }),
    
    memoryUsage: jest.fn<Promise<MemoryResponse>, [string, string, string, string?]>().mockResolvedValue({
      stored: true,
      key: 'test-key',
      timestamp: new Date(),
      namespace: 'test'
    }),
    
    neuralTrain: jest.fn<Promise<NeuralResponse>, [string, string, number?]>().mockResolvedValue({
      modelId: 'test-model-101',
      trainingComplete: true,
      accuracy: 0.95,
      epochs: 50
    }),
    
    neuralPatterns: jest.fn<Promise<NeuralResponse>, [string, string, Record<string, unknown>]>().mockResolvedValue({
      patternId: 'test-pattern-202',
      patterns: ['coordination', 'optimization'],
      confidence: 0.92
    }),
    
    // Additional mock methods
    swarmStatus: jest.fn().mockResolvedValue({
      swarmId: 'test-swarm-123',
      agentCount: 5,
      activeAgents: 4,
      status: 'operational'
    }),
    
    agentMetrics: jest.fn().mockResolvedValue({
      agentId: 'test-agent-456',
      responseTime: 150,
      successRate: 0.97,
      taskCount: 25
    }),
    
    // Override any provided methods
    ...overrides
  };
  
  return mockIntegration as jest.Mocked<ClaudeFlowMCPIntegration>;
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
export const createMockAgentConfig = (overrides = {}) => ({
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