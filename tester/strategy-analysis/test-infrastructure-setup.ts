/**
 * Test Infrastructure Setup for Executive Assistant
 * Provides mocks, factories, and utilities for comprehensive testing
 */

import { 
  ClaudeFlowMCPIntegration, 
  PEAAgentBase, 
  AgentStatus, 
  ExecutiveContext,
  PerformanceMetrics,
  SecurityLevel,
  PEAAgentType
} from '../../src/types/pea-agent-types';
import { ILogger } from '../../src/core/logger';
import { IEventBus } from '../../src/core/event-bus';

// ===== MOCK IMPLEMENTATIONS =====

export class MockMCPIntegration implements ClaudeFlowMCPIntegration {
  swarmInit = jest.fn().mockResolvedValue({ 
    swarmId: 'test-swarm-12345',
    success: true,
    agentCount: 0
  });

  taskOrchestrate = jest.fn().mockResolvedValue({
    taskId: 'task-12345',
    success: true,
    executionTime: 150,
    agentsInvolved: ['agent-1', 'agent-2']
  });

  neuralTrain = jest.fn().mockResolvedValue({
    modelId: 'model-12345',
    trained: true,
    accuracy: 0.95,
    trainingTime: 1000
  });

  neuralPatterns = jest.fn().mockResolvedValue({
    patterns: ['pattern1', 'pattern2'],
    confidence: 0.92,
    analysis: 'Pattern analysis complete'
  });

  memoryUsage = jest.fn().mockResolvedValue({
    stored: true,
    key: 'test-key',
    size: 1024
  });

  swarmStatus = jest.fn().mockResolvedValue({
    swarmId: 'test-swarm-12345',
    status: 'operational',
    agentCount: 5,
    health: 0.95
  });

  agentList = jest.fn().mockResolvedValue({
    agents: [
      { id: 'agent-1', type: 'researcher', status: 'active' },
      { id: 'agent-2', type: 'coder', status: 'active' }
    ]
  });
}

export class MockLogger implements ILogger {
  info = jest.fn();
  error = jest.fn();
  warn = jest.fn();
  debug = jest.fn();
}

export class MockEventBus implements IEventBus {
  private handlers = new Map<string, Function[]>();

  on = jest.fn((event: string, handler: Function) => {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)?.push(handler);
  });

  off = jest.fn((event: string, handler: Function) => {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  });

  emit = jest.fn((event: string, data: any) => {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  });

  // Utility method for testing
  getHandlerCount(event: string): number {
    return this.handlers.get(event)?.length || 0;
  }

  clear(): void {
    this.handlers.clear();
  }
}

// ===== TEST FACTORIES =====

export class AgentTestFactory {
  static createMockPerformanceMetrics(): PerformanceMetrics {
    return {
      responseTimeMs: 100,
      throughputPerHour: 50,
      errorRate: 0.01,
      consensusSuccessRate: 0.95,
      lastUpdated: new Date()
    };
  }

  static createMockExecutiveContext(): ExecutiveContext {
    return {
      executiveId: 'exec-test-001',
      preferences: {
        communicationStyle: 'direct',
        languages: ['en', 'fr'],
        timeZone: 'America/New_York',
        workingHours: {
          start: '09:00',
          end: '17:00',
          timezone: 'America/New_York'
        },
        urgencyThresholds: {
          low: 24,
          medium: 4,
          high: 1
        }
      },
      currentTask: undefined,
      stakeholders: [
        {
          id: 'stakeholder-1',
          name: 'Board Member',
          role: 'board',
          contactInfo: 'board@company.com',
          priority: 'critical'
        }
      ],
      timeZone: 'America/New_York',
      location: 'New York, NY',
      securityClearance: SecurityLevel.EXECUTIVE_PERSONAL,
      culturalContext: {
        primaryCountry: 'US',
        workingLanguages: ['en']
      }
    };
  }

  static createMockAgent(
    id: string = 'test-agent-001',
    type: PEAAgentType = PEAAgentType.RESEARCHER
  ): Partial<PEAAgentBase> {
    return {
      id,
      type,
      name: `Test ${type} Agent`,
      status: AgentStatus.ACTIVE,
      capabilities: ['test-capability-1', 'test-capability-2'],
      performanceMetrics: this.createMockPerformanceMetrics(),
      initialize: jest.fn().mockResolvedValue(undefined),
      shutdown: jest.fn().mockResolvedValue(undefined)
    };
  }
}

// ===== PERFORMANCE TESTING UTILITIES =====

export class PerformanceTestUtils {
  static async measureExecutionTime<T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; executionTime: number }> {
    const startTime = Date.now();
    const result = await operation();
    const executionTime = Date.now() - startTime;
    return { result, executionTime };
  }

  static async measureMemoryUsage<T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; memoryDelta: number }> {
    // Force garbage collection if available
    if (global.gc) global.gc();
    
    const initialMemory = process.memoryUsage().heapUsed;
    const result = await operation();
    
    // Force garbage collection again
    if (global.gc) global.gc();
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDelta = finalMemory - initialMemory;
    
    return { result, memoryDelta };
  }

  static createPerformanceBaseline() {
    return {
      agentInitialization: 2000, // 2 seconds max
      crisisDetection: 500, // 500ms max
      taskOrchestration: 5000, // 5 seconds max
      memoryUsagePerAgent: 50 * 1024 * 1024, // 50MB max
      concurrentAgentLimit: 50
    };
  }
}

// ===== LOAD TESTING UTILITIES =====

export class LoadTestUtils {
  static async concurrentOperations<T>(
    operation: () => Promise<T>,
    concurrency: number,
    timeout: number = 30000
  ): Promise<{
    successful: number;
    failed: number;
    results: Array<T | Error>;
    totalTime: number;
  }> {
    const startTime = Date.now();
    const promises = Array.from({ length: concurrency }, () => 
      Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ])
    );

    const results = await Promise.allSettled(promises);
    const totalTime = Date.now() - startTime;

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - successful;

    return {
      successful,
      failed,
      results: results.map(r => 
        r.status === 'fulfilled' ? r.value : new Error(r.reason)
      ),
      totalTime
    };
  }

  static async rampUpTest<T>(
    operation: () => Promise<T>,
    maxConcurrency: number,
    rampUpTimeMs: number,
    testDurationMs: number
  ): Promise<Array<{
    concurrency: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
  }>> {
    const results: Array<any> = [];
    const stepSize = Math.ceil(maxConcurrency / 10); // 10 steps
    const stepDuration = rampUpTimeMs / 10;

    for (let concurrency = stepSize; concurrency <= maxConcurrency; concurrency += stepSize) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      const stepResult = await this.concurrentOperations(
        operation,
        concurrency,
        testDurationMs
      );

      results.push({
        concurrency,
        successful: stepResult.successful,
        failed: stepResult.failed,
        avgResponseTime: stepResult.totalTime / concurrency
      });
    }

    return results;
  }
}

// ===== INTEGRATION TEST UTILITIES =====

export class IntegrationTestUtils {
  static async waitForCondition(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms timeout`);
  }

  static createEventSequenceTracker() {
    const events: Array<{ event: string; timestamp: number; data: any }> = [];
    
    return {
      track: (event: string, data?: any) => {
        events.push({
          event,
          timestamp: Date.now(),
          data
        });
      },
      
      getEvents: () => [...events],
      
      getSequence: () => events.map(e => e.event),
      
      clear: () => {
        events.length = 0;
      },
      
      waitForSequence: async (expectedSequence: string[], timeout: number = 5000) => {
        await IntegrationTestUtils.waitForCondition(
          () => {
            const actualSequence = events.map(e => e.event);
            return expectedSequence.every((expected, index) => 
              actualSequence[index] === expected
            );
          },
          timeout
        );
      }
    };
  }
}

// ===== TEST DATA GENERATORS =====

export class TestDataGenerator {
  static generateCrisisEvent() {
    return {
      id: `crisis-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'business_continuity',
      severity: 'high',
      description: 'Test crisis event for automated testing',
      detectedAt: new Date().toISOString(),
      affectedStakeholders: ['stakeholder-1', 'stakeholder-2'],
      riskLevel: 'high' as const,
      estimatedImpact: {
        financial: 0.7,
        reputational: 0.8,
        operational: 0.6,
        strategic: 0.5
      },
      geographicScope: ['US', 'EU'],
      culturalConsiderations: ['communication-transparency', 'regulatory-compliance']
    };
  }

  static generateSecurityThreat() {
    return {
      id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'unauthorized_access',
      severity: 'medium',
      source: 'external',
      target: 'executive_calendar',
      description: 'Simulated security threat for testing',
      detectedAt: new Date().toISOString(),
      mitigated: false,
      affectedSystems: ['calendar', 'communication'],
      impact: ['data_exposure_risk'],
      responseRequired: true
    };
  }

  static generateTaskData() {
    return {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'executive_request',
      description: 'Test executive task for automated testing',
      priority: 'high',
      status: 'pending',
      context: {
        executiveId: 'exec-test-001',
        urgency: 'high',
        stakeholders: ['stakeholder-1'],
        requiredCapabilities: ['coordination', 'analysis'],
        currentPriority: 'high'
      },
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 86400000).toISOString() // 24 hours
    };
  }
}

// ===== CUSTOM JEST MATCHERS =====

export const customMatchers = {
  toBeWithinPerformanceThreshold: (received: number, threshold: number) => {
    const pass = received <= threshold;
    return {
      message: () => 
        pass 
          ? `Expected ${received} to be above threshold ${threshold}`
          : `Expected ${received} to be within threshold ${threshold}`,
      pass
    };
  },

  toHaveValidAgentStructure: (received: any) => {
    const requiredFields = ['id', 'type', 'name', 'status', 'capabilities'];
    const hasAllFields = requiredFields.every(field => 
      received.hasOwnProperty(field) && received[field] !== undefined
    );

    return {
      message: () => 
        hasAllFields
          ? `Expected agent to be missing required fields`
          : `Expected agent to have all required fields: ${requiredFields.join(', ')}`,
      pass: hasAllFields
    };
  }
};

// ===== SETUP UTILITIES =====

export function setupTestEnvironment() {
  // Add custom matchers to Jest
  expect.extend(customMatchers);

  // Set up global test configuration
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Reduce noise during testing
  
  // Mock console methods for cleaner test output
  global.console = {
    ...console,
    // Keep error and warn for important messages
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  };
}

export function cleanupTestEnvironment() {
  // Clean up any global state
  jest.clearAllMocks();
  jest.clearAllTimers();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
}