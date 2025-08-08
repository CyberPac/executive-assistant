/**
 * SAMPLE TEST SUITE - AgentManager Critical Components
 * Demonstrates comprehensive testing approach for Executive Assistant
 * 
 * This serves as a blueprint for testing the most critical system components
 * with proper mocking, performance validation, and integration testing.
 */

import { AgentManager, AgentManagerConfig } from '../../src/agents/agent-manager';
import { AgentStatus, AgentType } from '../../src/swarm/types';
import { 
  MockMCPIntegration, 
  MockLogger, 
  MockEventBus,
  AgentTestFactory,
  PerformanceTestUtils,
  LoadTestUtils,
  IntegrationTestUtils,
  TestDataGenerator,
  setupTestEnvironment,
  cleanupTestEnvironment
} from './test-infrastructure-setup';

// Test setup
let agentManager: AgentManager;
let mockMCP: MockMCPIntegration;
let mockLogger: MockLogger;
let mockEventBus: MockEventBus;
let mockMemory: any;

const performanceBaseline = PerformanceTestUtils.createPerformanceBaseline();

describe('AgentManager - Critical System Component Tests', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });

  beforeEach(() => {
    // Initialize mocks
    mockMCP = new MockMCPIntegration();
    mockLogger = new MockLogger();
    mockEventBus = new MockEventBus();
    mockMemory = {
      store: jest.fn().mockResolvedValue({ success: true }),
      retrieve: jest.fn().mockResolvedValue({ data: '{}' }),
      deleteEntry: jest.fn().mockResolvedValue({ success: true })
    };

    // Create agent manager with test configuration
    const testConfig: Partial<AgentManagerConfig> = {
      maxAgents: 10,
      defaultTimeout: 5000,
      heartbeatInterval: 1000,
      healthCheckInterval: 2000,
      autoRestart: true,
      resourceLimits: {
        memory: 100 * 1024 * 1024, // 100MB for testing
        cpu: 0.5,
        disk: 500 * 1024 * 1024 // 500MB
      }
    };

    agentManager = new AgentManager(
      testConfig,
      mockLogger,
      mockEventBus,
      mockMemory
    );
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  // ===== UNIT TESTS - Agent Lifecycle =====
  
  describe('Agent Lifecycle Management', () => {
    test('should initialize agent manager successfully', async () => {
      const { result, executionTime } = await PerformanceTestUtils.measureExecutionTime(
        () => agentManager.initialize()
      );

      expect(executionTime).toBeWithinPerformanceThreshold(performanceBaseline.agentInitialization);
      expect(mockEventBus.getHandlerCount('agent:heartbeat')).toBeGreaterThan(0);
      expect(mockEventBus.getHandlerCount('agent:error')).toBeGreaterThan(0);
    });

    test('should create agent with valid template', async () => {
      await agentManager.initialize();

      const agentId = await agentManager.createAgent('researcher', {
        name: 'Test Research Agent'
      });

      expect(agentId).toMatch(/^agent-/);
      
      const agent = agentManager.getAgent(agentId);
      expect(agent).toHaveValidAgentStructure();
      expect(agent?.type).toBe(AgentType.RESEARCHER);
      expect(agent?.name).toBe('Test Research Agent');
      expect(agent?.status).toBe(AgentStatus.INITIALIZING);
    });

    test('should reject agent creation when at capacity', async () => {
      await agentManager.initialize();

      // Create agents up to limit
      const promises = Array.from({ length: 10 }, (_, i) => 
        agentManager.createAgent('researcher', { name: `Agent ${i}` })
      );
      
      await Promise.all(promises);

      // Should reject 11th agent
      await expect(
        agentManager.createAgent('researcher')
      ).rejects.toThrow('Maximum agent limit reached');
    });

    test('should start agent successfully', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');

      const { executionTime } = await PerformanceTestUtils.measureExecutionTime(
        () => agentManager.startAgent(agentId)
      );

      const agent = agentManager.getAgent(agentId);
      expect(agent?.status).toBe(AgentStatus.IDLE);
      expect(executionTime).toBeWithinPerformanceThreshold(3000); // 3s max for agent startup
    });

    test('should handle agent startup failure gracefully', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');

      // Mock process spawn failure
      jest.spyOn(agentManager as any, 'spawnAgentProcess').mockRejectedValue(
        new Error('Failed to spawn process')
      );

      await expect(agentManager.startAgent(agentId)).rejects.toThrow();

      const agent = agentManager.getAgent(agentId);
      expect(agent?.status).toBe(AgentStatus.ERROR);
      expect(agent?.errorHistory).toHaveLength(1);
    });

    test('should stop agent gracefully', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');
      await agentManager.startAgent(agentId);

      const { executionTime } = await PerformanceTestUtils.measureExecutionTime(
        () => agentManager.stopAgent(agentId, 'test_shutdown')
      );

      const agent = agentManager.getAgent(agentId);
      expect(agent?.status).toBe(AgentStatus.TERMINATED);
      expect(executionTime).toBeWithinPerformanceThreshold(6000); // 6s max including timeout
    });

    test('should restart agent successfully', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');
      await agentManager.startAgent(agentId);

      await agentManager.restartAgent(agentId, 'test_restart');

      const agent = agentManager.getAgent(agentId);
      expect(agent?.status).toBe(AgentStatus.IDLE);
      expect(mockEventBus.emit).toHaveBeenCalledWith('agent:restarted', 
        expect.objectContaining({ agentId, reason: 'test_restart' })
      );
    });

    test('should remove agent completely', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');

      await agentManager.removeAgent(agentId);

      expect(agentManager.getAgent(agentId)).toBeUndefined();
      expect(mockMemory.deleteEntry).toHaveBeenCalledWith(`agent:${agentId}`);
    });
  });

  // ===== UNIT TESTS - Agent Pools =====

  describe('Agent Pool Management', () => {
    test('should create agent pool with minimum agents', async () => {
      await agentManager.initialize();

      const poolId = await agentManager.createAgentPool(
        'Test Pool',
        'researcher',
        { minSize: 3, maxSize: 8, autoScale: true }
      );

      const pool = agentManager.getPool(poolId);
      expect(pool).toBeDefined();
      expect(pool?.currentSize).toBe(3);
      expect(pool?.availableAgents).toHaveLength(3);
      expect(pool?.autoScale).toBe(true);
    });

    test('should scale pool up and down', async () => {
      await agentManager.initialize();
      const poolId = await agentManager.createAgentPool(
        'Scalable Pool',
        'researcher',
        { minSize: 2, maxSize: 6 }
      );

      // Scale up
      await agentManager.scalePool(poolId, 5);
      let pool = agentManager.getPool(poolId);
      expect(pool?.currentSize).toBe(5);

      // Scale down
      await agentManager.scalePool(poolId, 3);
      pool = agentManager.getPool(poolId);
      expect(pool?.currentSize).toBe(3);
    });

    test('should reject scaling outside pool limits', async () => {
      await agentManager.initialize();
      const poolId = await agentManager.createAgentPool(
        'Limited Pool',
        'researcher',
        { minSize: 2, maxSize: 5 }
      );

      await expect(agentManager.scalePool(poolId, 8)).rejects.toThrow(
        'Target size 8 outside pool limits [2, 5]'
      );
    });
  });

  // ===== UNIT TESTS - Health Monitoring =====

  describe('Health Monitoring', () => {
    test('should detect unhealthy agents', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');
      await agentManager.startAgent(agentId);

      // Simulate agent becoming unresponsive
      const agent = agentManager.getAgent(agentId)!;
      agent.lastHeartbeat = new Date(Date.now() - 30000); // 30 seconds ago

      // Trigger health check
      await (agentManager as any).checkAgentHealth(agentId);

      const health = agentManager.getAgentHealth(agentId);
      expect(health?.overall).toBeLessThan(0.5);
      expect(health?.components.responsiveness).toBe(0);
    });

    test('should auto-restart critically unhealthy agents', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');
      await agentManager.startAgent(agentId);

      // Mock critically low health
      jest.spyOn(agentManager as any, 'calculatePerformanceScore').mockReturnValue(0.1);
      jest.spyOn(agentManager as any, 'calculateReliabilityScore').mockReturnValue(0.1);
      jest.spyOn(agentManager as any, 'calculateResourceScore').mockReturnValue(0.1);
      jest.spyOn(agentManager as any, 'checkResponsiveness').mockResolvedValue(0.1);

      const restartSpy = jest.spyOn(agentManager, 'restartAgent');

      await (agentManager as any).checkAgentHealth(agentId);

      expect(restartSpy).toHaveBeenCalledWith(agentId, 'health_critical');
    });
  });

  // ===== PERFORMANCE TESTS =====

  describe('Performance Validation', () => {
    test('should handle concurrent agent creation', async () => {
      await agentManager.initialize();

      const { successful, failed, totalTime } = await LoadTestUtils.concurrentOperations(
        () => agentManager.createAgent('researcher'),
        5, // 5 concurrent creations
        10000 // 10s timeout
      );

      expect(successful).toBe(5);
      expect(failed).toBe(0);
      expect(totalTime).toBeWithinPerformanceThreshold(8000); // Should complete within 8s
    });

    test('should maintain performance under load', async () => {
      await agentManager.initialize();

      // Create baseline agents
      const agentIds = await Promise.all(
        Array.from({ length: 5 }, () => agentManager.createAgent('researcher'))
      );

      // Start all agents and measure performance
      const { executionTime } = await PerformanceTestUtils.measureExecutionTime(async () => {
        await Promise.all(agentIds.map(id => agentManager.startAgent(id)));
      });

      expect(executionTime).toBeWithinPerformanceThreshold(10000); // 10s for 5 agents
    });

    test('should not leak memory during agent lifecycle', async () => {
      await agentManager.initialize();

      const { memoryDelta } = await PerformanceTestUtils.measureMemoryUsage(async () => {
        // Create, start, stop, and remove 20 agents
        for (let i = 0; i < 20; i++) {
          const agentId = await agentManager.createAgent('researcher');
          await agentManager.startAgent(agentId);
          await agentManager.stopAgent(agentId);
          await agentManager.removeAgent(agentId);
        }
      });

      // Should not increase memory by more than 20MB for 20 agent lifecycles
      expect(memoryDelta).toBeLessThan(20 * 1024 * 1024);
    });
  });

  // ===== INTEGRATION TESTS =====

  describe('Event Integration', () => {
    test('should handle heartbeat events correctly', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');
      await agentManager.startAgent(agentId);

      const eventTracker = IntegrationTestUtils.createEventSequenceTracker();
      mockEventBus.emit.mockImplementation((event, data) => {
        eventTracker.track(event, data);
      });

      // Simulate heartbeat
      mockEventBus.emit('agent:heartbeat', {
        agentId,
        timestamp: new Date(),
        metrics: AgentTestFactory.createMockPerformanceMetrics()
      });

      const agent = agentManager.getAgent(agentId);
      expect(agent?.status).toBe(AgentStatus.IDLE); // Should remain healthy
    });

    test('should handle agent errors appropriately', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');
      await agentManager.startAgent(agentId);

      const testError = {
        id: 'error-test-123',
        agentId,
        name: 'TestError',
        message: 'Test error for integration testing',
        timestamp: new Date(),
        type: 'EXECUTION_ERROR' as const,
        context: { test: true },
        severity: 'critical' as const
      };

      mockEventBus.emit('agent:error', { agentId, error: testError });

      const agent = agentManager.getAgent(agentId);
      expect(agent?.status).toBe(AgentStatus.ERROR);
      expect(agent?.errorHistory).toContainEqual(testError);
    });

    test('should coordinate task assignments', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');
      await agentManager.startAgent(agentId);

      // Simulate task assignment
      mockEventBus.emit('task:assigned', { agentId });

      const agent = agentManager.getAgent(agentId);
      expect(agent?.workload.currentTasks).toBe(1);
      expect(agent?.workload.utilizationRate).toBeGreaterThan(0);
    });
  });

  // ===== ERROR HANDLING TESTS =====

  describe('Error Handling & Resilience', () => {
    test('should handle initialization failures gracefully', async () => {
      // Mock memory store failure
      mockMemory.store.mockRejectedValueOnce(new Error('Memory store failed'));

      await expect(agentManager.initialize()).rejects.toThrow();
      
      // Should still be able to retry initialization
      mockMemory.store.mockResolvedValue({ success: true });
      await expect(agentManager.initialize()).resolves.not.toThrow();
    });

    test('should handle agent template not found', async () => {
      await agentManager.initialize();

      await expect(
        agentManager.createAgent('nonexistent-template')
      ).rejects.toThrow('Template nonexistent-template not found');
    });

    test('should handle process spawn failures', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');

      // Mock spawn failure
      jest.spyOn(agentManager as any, 'spawnAgentProcess').mockRejectedValue(
        new Error('Process spawn failed')
      );

      await expect(agentManager.startAgent(agentId)).rejects.toThrow();

      const agent = agentManager.getAgent(agentId);
      expect(agent?.status).toBe(AgentStatus.ERROR);
    });
  });

  // ===== SYSTEM MONITORING TESTS =====

  describe('System Monitoring & Metrics', () => {
    test('should provide accurate system statistics', async () => {
      await agentManager.initialize();

      // Create and start several agents
      const agentIds = await Promise.all([
        agentManager.createAgent('researcher'),
        agentManager.createAgent('coder'),
        agentManager.createAgent('analyst')
      ]);

      await Promise.all(agentIds.map(id => agentManager.startAgent(id)));

      const stats = agentManager.getSystemStats();

      expect(stats.totalAgents).toBe(3);
      expect(stats.activeAgents).toBe(3);
      expect(stats.averageHealth).toBeGreaterThan(0.5);
      expect(stats.pools).toBe(0);
      expect(stats.clusters).toBe(0);
    });

    test('should track performance metrics over time', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');
      await agentManager.startAgent(agentId);

      // Simulate multiple heartbeats with metrics
      const metrics1 = { ...AgentTestFactory.createMockPerformanceMetrics(), responseTimeMs: 100 };
      const metrics2 = { ...AgentTestFactory.createMockPerformanceMetrics(), responseTimeMs: 150 };

      mockEventBus.emit('agent:heartbeat', { agentId, timestamp: new Date(), metrics: metrics1 });
      mockEventBus.emit('agent:heartbeat', { agentId, timestamp: new Date(), metrics: metrics2 });

      const agent = agentManager.getAgent(agentId);
      expect(agent?.metrics.responseTimeMs).toBe(150); // Should have latest metrics
    });
  });

  // ===== EDGE CASES =====

  describe('Edge Cases & Boundary Conditions', () => {
    test('should handle empty agent manager operations', async () => {
      await agentManager.initialize();

      expect(agentManager.getAllAgents()).toHaveLength(0);
      expect(agentManager.getSystemStats().totalAgents).toBe(0);
      expect(agentManager.getAgentsByType(AgentType.RESEARCHER)).toHaveLength(0);
    });

    test('should handle concurrent agent removal', async () => {
      await agentManager.initialize();
      const agentId = await agentManager.createAgent('researcher');
      await agentManager.startAgent(agentId);

      // Attempt concurrent removal
      const removalPromises = [
        agentManager.removeAgent(agentId),
        agentManager.removeAgent(agentId)
      ];

      // First should succeed, second should handle gracefully
      const results = await Promise.allSettled(removalPromises);
      expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    });

    test('should handle maximum resource utilization', async () => {
      await agentManager.initialize();
      
      // Create agents up to resource limits
      const agentIds = await Promise.all(
        Array.from({ length: 10 }, () => agentManager.createAgent('researcher'))
      );

      // All should be created successfully
      expect(agentIds).toHaveLength(10);
      expect(agentManager.getAllAgents()).toHaveLength(10);
    });
  });
});

// ===== CUSTOM TEST MATCHERS =====
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinPerformanceThreshold(threshold: number): R;
      toHaveValidAgentStructure(): R;
    }
  }
}