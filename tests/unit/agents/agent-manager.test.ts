/**
 * Comprehensive Unit Tests for Agent Manager System
 * Testing agent lifecycle, health monitoring, pools, scaling, and resource management
 */

import {
  AgentManager,
  AgentManagerConfig,
  AgentTemplate,
  AgentCluster,
  AgentPool,
  HealthIssue
} from '../../../src/agents/agent-manager';
import { Logger } from '../../../src/core/logger';
import { EventBus } from '../../../src/core/event-bus';
import { DistributedMemorySystem } from '../../../src/memory/distributed-memory';
import {
  AgentType,
  AgentStatus,
  AgentState,
  AgentMetrics,
  AgentHealth
} from '../../../src/swarm/types';

// Mock child_process
jest.mock('node:child_process', () => ({
  spawn: jest.fn(() => ({
    on: jest.fn(),
    kill: jest.fn(),
    killed: false,
    pid: 12345
  }))
}));

describe('AgentManager', () => {
  let agentManager: AgentManager;
  let mockLogger: jest.Mocked<Logger>;
  let mockEventBus: jest.Mocked<EventBus>;
  let mockMemory: jest.Mocked<DistributedMemorySystem>;
  let config: Partial<AgentManagerConfig>;

  beforeEach(() => {
    // Create mocks
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
      child: jest.fn().mockReturnThis(),
      setLevel: jest.fn(),
      getLevel: jest.fn(),
      getHistory: jest.fn(),
      clearHistory: jest.fn(),
      getStats: jest.fn()
    } as any;

    mockEventBus = {
      on: jest.fn(),
      off: jest.fn(),
      once: jest.fn(),
      emit: jest.fn(),
      emitEvent: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      listeners: jest.fn(),
      removeAllListeners: jest.fn(),
      getEventHistory: jest.fn(),
      getSubscriptions: jest.fn(),
      getStats: jest.fn(),
      clearHistory: jest.fn()
    } as any;

    mockMemory = {
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
      query: jest.fn(),
      clearNamespace: jest.fn(),
      getStats: jest.fn(),
      cleanup: jest.fn(),
      backup: jest.fn(),
      restore: jest.fn(),
      shutdown: jest.fn(),
      deleteEntry: jest.fn()
    } as any;

    config = {
      maxAgents: 10,
      defaultTimeout: 5000,
      heartbeatInterval: 1000,
      healthCheckInterval: 2000,
      autoRestart: true,
      resourceLimits: {
        memory: 256 * 1024 * 1024,
        cpu: 0.5,
        disk: 512 * 1024 * 1024
      }
    };

    agentManager = new AgentManager(config, mockLogger, mockEventBus, mockMemory);

    // Mock timers for intervals
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(agentManager).toBeInstanceOf(AgentManager);
      expect(mockEventBus.on).toHaveBeenCalledWith('agent:heartbeat', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('agent:error', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('task:assigned', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('task:completed', expect.any(Function));
    });

    it('should initialize with default configuration when not provided', () => {
      const defaultManager = new AgentManager({}, mockLogger, mockEventBus, mockMemory);
      expect(defaultManager).toBeInstanceOf(AgentManager);
    });

    it('should set up default agent templates on initialization', () => {
      const templates = agentManager.getAgentTemplates();
      expect(templates.length).toBeGreaterThan(0);
      
      const templateNames = templates.map(t => t.name);
      expect(templateNames).toContain('Research Agent');
      expect(templateNames).toContain('Developer Agent');
      expect(templateNames).toContain('Analyzer Agent');
    });

    it('should start monitoring intervals on initialize', async () => {
      await agentManager.initialize();
      
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), config.healthCheckInterval);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), config.heartbeatInterval);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Initializing agent manager',
        expect.objectContaining({ maxAgents: config.maxAgents })
      );
    });
  });

  describe('Agent Creation', () => {
    beforeEach(async () => {
      await agentManager.initialize();
    });

    it('should create agent from template', async () => {
      const agentId = await agentManager.createAgent('researcher');
      
      expect(agentId).toBeTruthy();
      expect(typeof agentId).toBe('string');
      expect(agentId.startsWith('agent_')).toBe(true);
      
      const agent = agentManager.getAgent(agentId);
      expect(agent).toBeDefined();
      expect(agent?.type).toBe(AgentType.RESEARCHER);
      expect(agent?.status).toBe(AgentStatus.INITIALIZING);
    });

    it('should create agent with custom name and overrides', async () => {
      const customName = 'Custom Research Agent';
      const agentId = await agentManager.createAgent('researcher', {
        name: customName,
        config: { autonomyLevel: 0.9 },
        environment: { runtime: 'node' }
      });
      
      const agent = agentManager.getAgent(agentId);
      expect(agent?.name).toBe(customName);
      expect(agent?.config.autonomyLevel).toBe(0.9);
    });

    it('should throw error for non-existent template', async () => {
      await expect(agentManager.createAgent('non-existent-template'))
        .rejects.toThrow('Template non-existent-template not found');
    });

    it('should throw error when max agents limit reached', async () => {
      // Create agents up to the limit
      for (let i = 0; i < config.maxAgents!; i++) {
        await agentManager.createAgent('researcher');
      }
      
      // Should throw when trying to create one more
      await expect(agentManager.createAgent('researcher'))
        .rejects.toThrow('Maximum agent limit reached');
    });

    it('should store agent in memory on creation', async () => {
      const agentId = await agentManager.createAgent('researcher');
      
      expect(mockMemory.store).toHaveBeenCalledWith(
        `agent:${agentId}`,
        expect.any(Object),
        expect.objectContaining({
          ttl: 86400000,
          namespace: 'agents',
          agentId,
          metadata: expect.objectContaining({
            type: 'agent-state',
            tags: expect.arrayContaining(['RESEARCHER', 'active'])
          })
        })
      );
    });
  });

  describe('Agent Lifecycle Management', () => {
    let agentId: string;

    beforeEach(async () => {
      await agentManager.initialize();
      agentId = await agentManager.createAgent('researcher');
    });

    it('should start agent successfully', async () => {
      // Mock spawn to return a process
      const { spawn } = require('node:child_process');
      const mockProcess = {
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
        pid: 12345
      };
      spawn.mockReturnValue(mockProcess);

      // Mock the ready event to simulate agent startup
      setTimeout(() => {
        const onReadyCallback = mockEventBus.on.mock.calls
          .find(call => call[0] === 'agent:ready')?.[1];
        if (onReadyCallback) {
          onReadyCallback({ agentId });
        }
      }, 100);

      await agentManager.startAgent(agentId);
      
      const agent = agentManager.getAgent(agentId);
      expect(agent?.status).toBe(AgentStatus.IDLE);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Started agent',
        expect.objectContaining({ agentId })
      );
    });

    it('should handle agent startup failure', async () => {
      // Mock spawn to throw error
      const { spawn } = require('node:child_process');
      spawn.mockImplementation(() => {
        throw new Error('Spawn failed');
      });

      await expect(agentManager.startAgent(agentId))
        .rejects.toThrow('Spawn failed');
      
      const agent = agentManager.getAgent(agentId);
      expect(agent?.status).toBe(AgentStatus.ERROR);
      expect(agent?.errorHistory.length).toBeGreaterThan(0);
    });

    it('should stop agent gracefully', async () => {
      // Start agent first
      const { spawn } = require('node:child_process');
      const mockProcess = {
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
        pid: 12345
      };
      spawn.mockReturnValue(mockProcess);

      // Simulate agent ready
      setTimeout(() => {
        const onReadyCallback = mockEventBus.on.mock.calls
          .find(call => call[0] === 'agent:ready')?.[1];
        if (onReadyCallback) {
          onReadyCallback({ agentId });
        }
      }, 50);

      await agentManager.startAgent(agentId);
      
      // Now stop the agent
      await agentManager.stopAgent(agentId, 'test stop');
      
      const agent = agentManager.getAgent(agentId);
      expect(agent?.status).toBe(AgentStatus.TERMINATED);
      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
    });

    it('should restart agent', async () => {
      // Mock successful start/stop cycle
      const { spawn } = require('node:child_process');
      const mockProcess = {
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
        pid: 12345
      };
      spawn.mockReturnValue(mockProcess);

      // Mock ready events
      let readyCallCount = 0;
      setTimeout(() => {
        const onReadyCallback = mockEventBus.on.mock.calls
          .find(call => call[0] === 'agent:ready')?.[1];
        if (onReadyCallback) {
          readyCallCount++;
          onReadyCallback({ agentId });
          
          // Simulate second ready after restart
          if (readyCallCount === 1) {
            setTimeout(() => onReadyCallback({ agentId }), 100);
          }
        }
      }, 50);

      await agentManager.startAgent(agentId);
      await agentManager.restartAgent(agentId, 'test restart');
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Restarting agent',
        expect.objectContaining({ agentId, reason: 'test restart' })
      );
    });

    it('should remove agent completely', async () => {
      await agentManager.removeAgent(agentId);
      
      expect(agentManager.getAgent(agentId)).toBeUndefined();
      expect(mockMemory.deleteEntry).toHaveBeenCalledWith(`agent:${agentId}`);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Removed agent',
        expect.objectContaining({ agentId })
      );
    });

    it('should not start agent from invalid status', async () => {
      // Set agent to running status first
      const agent = agentManager.getAgent(agentId)!;
      agent.status = AgentStatus.BUSY;

      await expect(agentManager.startAgent(agentId))
        .rejects.toThrow(`Agent ${agentId} cannot be started from status ${AgentStatus.BUSY}`);
    });
  });

  describe('Agent Pool Management', () => {
    beforeEach(async () => {
      await agentManager.initialize();
    });

    it('should create agent pool with minimum agents', async () => {
      // Mock spawn for pool agents
      const { spawn } = require('node:child_process');
      const mockProcess = {
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
        pid: 12345
      };
      spawn.mockReturnValue(mockProcess);

      // Mock ready events for all agents
      setTimeout(() => {
        const onReadyCallback = mockEventBus.on.mock.calls
          .find(call => call[0] === 'agent:ready')?.[1];
        if (onReadyCallback) {
          // Simulate multiple agents becoming ready
          for (let i = 0; i < 3; i++) {
            onReadyCallback({ agentId: `agent_${i}` });
          }
        }
      }, 50);

      const poolId = await agentManager.createAgentPool('test-pool', 'researcher', {
        minSize: 3,
        maxSize: 10,
        autoScale: true
      });
      
      expect(poolId).toBeTruthy();
      
      const pool = agentManager.getPool(poolId);
      expect(pool?.currentSize).toBe(3);
      expect(pool?.availableAgents.length).toBe(3);
      expect(pool?.name).toBe('test-pool');
    });

    it('should scale pool up', async () => {
      // Mock spawn
      const { spawn } = require('node:child_process');
      const mockProcess = {
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
        pid: 12345
      };
      spawn.mockReturnValue(mockProcess);

      // Mock ready events
      setTimeout(() => {
        const onReadyCallback = mockEventBus.on.mock.calls
          .find(call => call[0] === 'agent:ready')?.[1];
        if (onReadyCallback) {
          // Simulate agents becoming ready
          for (let i = 0; i < 10; i++) {
            onReadyCallback({ agentId: `agent_${i}` });
          }
        }
      }, 50);

      const poolId = await agentManager.createAgentPool('scale-pool', 'researcher', {
        minSize: 2,
        maxSize: 10
      });
      
      await agentManager.scalePool(poolId, 5);
      
      const pool = agentManager.getPool(poolId);
      expect(pool?.currentSize).toBe(5);
      expect(pool?.availableAgents.length).toBe(5);
    });

    it('should scale pool down', async () => {
      // Create pool with more agents first
      const { spawn } = require('node:child_process');
      const mockProcess = {
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
        pid: 12345
      };
      spawn.mockReturnValue(mockProcess);

      setTimeout(() => {
        const onReadyCallback = mockEventBus.on.mock.calls
          .find(call => call[0] === 'agent:ready')?.[1];
        if (onReadyCallback) {
          for (let i = 0; i < 5; i++) {
            onReadyCallback({ agentId: `agent_${i}` });
          }
        }
      }, 50);

      const poolId = await agentManager.createAgentPool('scale-down-pool', 'researcher', {
        minSize: 5,
        maxSize: 10
      });
      
      // Scale down
      await agentManager.scalePool(poolId, 3);
      
      const pool = agentManager.getPool(poolId);
      expect(pool?.currentSize).toBe(3);
    });

    it('should throw error when scaling outside limits', async () => {
      const poolId = await agentManager.createAgentPool('limit-pool', 'researcher', {
        minSize: 2,
        maxSize: 5
      });
      
      await expect(agentManager.scalePool(poolId, 10))
        .rejects.toThrow('Target size 10 outside pool limits [2, 5]');
      
      await expect(agentManager.scalePool(poolId, 1))
        .rejects.toThrow('Target size 1 outside pool limits [2, 5]');
    });

    it('should list all pools', async () => {
      await agentManager.createAgentPool('pool1', 'researcher', { minSize: 1, maxSize: 5 });
      await agentManager.createAgentPool('pool2', 'coder', { minSize: 2, maxSize: 8 });
      
      const pools = agentManager.getAllPools();
      expect(pools.length).toBe(2);
      expect(pools.map(p => p.name)).toContain('pool1');
      expect(pools.map(p => p.name)).toContain('pool2');
    });
  });

  describe('Health Monitoring', () => {
    let agentId: string;

    beforeEach(async () => {
      await agentManager.initialize();
      agentId = await agentManager.createAgent('researcher');
    });

    it('should perform health checks on interval', async () => {
      // Advance time to trigger health check
      jest.advanceTimersByTime(config.healthCheckInterval!);
      
      // Health check should have been called
      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        config.healthCheckInterval
      );
    });

    it('should check agent responsiveness', async () => {
      const agent = agentManager.getAgent(agentId)!;
      
      // Simulate recent heartbeat
      agent.lastHeartbeat = new Date();
      
      // Trigger health check manually
      const healthCheckCallback = (setInterval as jest.Mock).mock.calls
        .find(call => call[1] === config.healthCheckInterval)?.[0];
      
      if (healthCheckCallback) {
        healthCheckCallback();
      }
      
      const health = agentManager.getAgentHealth(agentId);
      expect(health).toBeDefined();
      expect(health?.overall).toBeGreaterThan(0);
    });

    it('should detect heartbeat timeout', async () => {
      const agent = agentManager.getAgent(agentId)!;
      agent.status = AgentStatus.IDLE;
      
      // Set old heartbeat
      agent.lastHeartbeat = new Date(Date.now() - 10000);
      
      // Trigger heartbeat check
      jest.advanceTimersByTime(config.heartbeatInterval! * 4);
      
      const heartbeatCallback = (setInterval as jest.Mock).mock.calls
        .find(call => call[1] === config.heartbeatInterval)?.[0];
      
      if (heartbeatCallback) {
        heartbeatCallback();
      }
      
      expect(agent.status).toBe(AgentStatus.ERROR);
      expect(agent.errorHistory.length).toBeGreaterThan(0);
    });

    it('should auto-restart unhealthy agents', async () => {
      const agent = agentManager.getAgent(agentId)!;
      const health = agentManager.getAgentHealth(agentId)!;
      
      // Simulate critical health failure
      health.overall = 0.2;
      
      // Mock restart method
      const restartSpy = jest.spyOn(agentManager, 'restartAgent')
        .mockResolvedValue();
      
      // Trigger health check
      const healthCheckCallback = (setInterval as jest.Mock).mock.calls
        .find(call => call[1] === config.healthCheckInterval)?.[0];
      
      if (healthCheckCallback) {
        await healthCheckCallback();
      }
      
      expect(restartSpy).toHaveBeenCalledWith(agentId, 'health_critical');
    });

    it('should get health status for agent', () => {
      const health = agentManager.getAgentHealth(agentId);
      
      expect(health).toBeDefined();
      expect(health?.status).toBe('healthy');
      expect(health?.overall).toBe(1.0);
      expect(health?.components).toBeDefined();
    });
  });

  describe('Event Handling', () => {
    let agentId: string;

    beforeEach(async () => {
      await agentManager.initialize();
      agentId = await agentManager.createAgent('researcher');
    });

    it('should handle heartbeat events', () => {
      const heartbeatData = {
        agentId,
        timestamp: new Date(),
        metrics: {
          tasksCompleted: 5,
          tasksFailed: 1,
          averageResponseTime: 100,
          averageExecutionTime: 1000,
          successRate: 0.8,
          errorRate: 0.2,
          lastUpdated: new Date()
        }
      };
      
      // Get the heartbeat handler
      const heartbeatHandler = mockEventBus.on.mock.calls
        .find(call => call[0] === 'agent:heartbeat')?.[1];
      
      expect(heartbeatHandler).toBeDefined();
      
      if (heartbeatHandler) {
        heartbeatHandler(heartbeatData);
      }
      
      const agent = agentManager.getAgent(agentId)!;
      expect(agent.lastHeartbeat).toEqual(heartbeatData.timestamp);
      expect(agent.metrics.tasksCompleted).toBe(5);
    });

    it('should handle task assignment events', () => {
      const taskData = { agentId };
      
      const taskHandler = mockEventBus.on.mock.calls
        .find(call => call[0] === 'task:assigned')?.[1];
      
      if (taskHandler) {
        taskHandler(taskData);
      }
      
      const agent = agentManager.getAgent(agentId)!;
      expect(agent.workload.currentTasks).toBe(1);
    });

    it('should handle task completion events', () => {
      const agent = agentManager.getAgent(agentId)!;
      agent.workload.currentTasks = 2; // Set initial workload
      
      const completionData = {
        agentId,
        metrics: {
          tasksCompleted: 10,
          tasksFailed: 2,
          averageResponseTime: 150,
          averageExecutionTime: 1200,
          successRate: 0.83,
          errorRate: 0.17,
          lastUpdated: new Date()
        }
      };
      
      const completionHandler = mockEventBus.on.mock.calls
        .find(call => call[0] === 'task:completed')?.[1];
      
      if (completionHandler) {
        completionHandler(completionData);
      }
      
      expect(agent.workload.currentTasks).toBe(1); // Reduced by 1
      expect(agent.metrics.tasksCompleted).toBe(10);
    });

    it('should handle agent error events', () => {
      const errorData = {
        agentId,
        error: {
          id: 'error-123',
          agentId,
          name: 'TestError',
          message: 'Test error message',
          type: 'EXECUTION_ERROR' as const,
          timestamp: new Date(),
          severity: 'critical' as const,
          context: { test: true }
        }
      };
      
      const errorHandler = mockEventBus.on.mock.calls
        .find(call => call[0] === 'agent:error')?.[1];
      
      if (errorHandler) {
        errorHandler(errorData);
      }
      
      const agent = agentManager.getAgent(agentId)!;
      expect(agent.status).toBe(AgentStatus.ERROR);
      expect(agent.errorHistory.length).toBe(1);
      expect(agent.errorHistory[0].message).toBe('Test error message');
    });
  });

  describe('Agent Queries and Statistics', () => {
    let agentIds: string[];

    beforeEach(async () => {
      await agentManager.initialize();
      
      agentIds = [];
      agentIds.push(await agentManager.createAgent('researcher'));
      agentIds.push(await agentManager.createAgent('coder'));
      agentIds.push(await agentManager.createAgent('analyst'));
    });

    it('should get all agents', () => {
      const agents = agentManager.getAllAgents();
      expect(agents.length).toBe(3);
      expect(agents.map(a => a.id)).toEqual(expect.arrayContaining(agentIds));
    });

    it('should get agents by type', () => {
      const researchers = agentManager.getAgentsByType(AgentType.RESEARCHER);
      expect(researchers.length).toBe(1);
      expect(researchers[0].type).toBe(AgentType.RESEARCHER);
      
      const coders = agentManager.getAgentsByType(AgentType.CODER);
      expect(coders.length).toBe(1);
      expect(coders[0].type).toBe(AgentType.CODER);
    });

    it('should get agents by status', () => {
      const initializingAgents = agentManager.getAgentsByStatus(AgentStatus.INITIALIZING);
      expect(initializingAgents.length).toBe(3);
      
      // Change one agent status
      const agent = agentManager.getAgent(agentIds[0])!;
      agent.status = AgentStatus.IDLE;
      
      const idleAgents = agentManager.getAgentsByStatus(AgentStatus.IDLE);
      expect(idleAgents.length).toBe(1);
    });

    it('should provide system statistics', () => {
      const stats = agentManager.getSystemStats();
      
      expect(stats.totalAgents).toBe(3);
      expect(stats.activeAgents).toBe(0); // All are INITIALIZING
      expect(stats.healthyAgents).toBe(3); // All start healthy
      expect(stats.pools).toBe(0);
      expect(stats.clusters).toBe(0);
      expect(stats.averageHealth).toBe(1.0);
      expect(stats.resourceUtilization).toBeDefined();
    });

    it('should get agent templates', () => {
      const templates = agentManager.getAgentTemplates();
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.find(t => t.name === 'Research Agent')).toBeDefined();
      expect(templates.find(t => t.name === 'Developer Agent')).toBeDefined();
      expect(templates.find(t => t.name === 'Analyzer Agent')).toBeDefined();
    });
  });

  describe('Resource Management', () => {
    let agentId: string;

    beforeEach(async () => {
      await agentManager.initialize();
      agentId = await agentManager.createAgent('researcher');
    });

    it('should track resource usage', () => {
      const resourceData = {
        agentId,
        usage: {
          cpu: 0.3,
          memory: 128 * 1024 * 1024,
          disk: 100 * 1024 * 1024
        }
      };
      
      const resourceHandler = mockEventBus.on.mock.calls
        .find(call => call[0] === 'resource:usage')?.[1];
      
      if (resourceHandler) {
        resourceHandler(resourceData);
      }
      
      const stats = agentManager.getSystemStats();
      expect(stats.resourceUtilization.cpu).toBe(0.3);
      expect(stats.resourceUtilization.memory).toBe(128 * 1024 * 1024);
    });

    it('should calculate resource scores in health checks', () => {
      // Set resource usage
      const resourceData = {
        agentId,
        usage: {
          cpu: 0.8, // High CPU usage
          memory: 200 * 1024 * 1024, // High memory usage
          disk: 50 * 1024 * 1024
        }
      };
      
      const resourceHandler = mockEventBus.on.mock.calls
        .find(call => call[0] === 'resource:usage')?.[1];
      
      if (resourceHandler) {
        resourceHandler(resourceData);
      }
      
      // Trigger health check
      const healthCheckCallback = (setInterval as jest.Mock).mock.calls
        .find(call => call[1] === config.healthCheckInterval)?.[0];
      
      if (healthCheckCallback) {
        healthCheckCallback();
      }
      
      const health = agentManager.getAgentHealth(agentId);
      expect(health?.components.resourceUsage).toBeLessThan(1.0);
    });
  });

  describe('Shutdown and Cleanup', () => {
    beforeEach(async () => {
      await agentManager.initialize();
    });

    it('should shutdown gracefully', async () => {
      const agentId = await agentManager.createAgent('researcher');
      
      const stopSpy = jest.spyOn(agentManager, 'stopAgent')
        .mockResolvedValue();
      
      await agentManager.shutdown();
      
      expect(clearInterval).toHaveBeenCalledTimes(2); // Health and heartbeat intervals
      expect(stopSpy).toHaveBeenCalledWith(agentId, 'shutdown');
      expect(mockLogger.info).toHaveBeenCalledWith('Shutting down agent manager');
    });

    it('should clean up intervals on shutdown', async () => {
      await agentManager.shutdown();
      
      expect(clearInterval).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(async () => {
      await agentManager.initialize();
    });

    it('should handle agent not found errors', () => {
      expect(agentManager.getAgent('non-existent-id')).toBeUndefined();
      expect(agentManager.getAgentHealth('non-existent-id')).toBeUndefined();
    });

    it('should handle invalid pool operations', async () => {
      await expect(agentManager.scalePool('non-existent-pool', 5))
        .rejects.toThrow('Pool non-existent-pool not found');
    });

    it('should handle process spawn failures gracefully', async () => {
      const agentId = await agentManager.createAgent('researcher');
      
      const { spawn } = require('node:child_process');
      spawn.mockImplementation(() => {
        throw new Error('Process spawn failed');
      });
      
      await expect(agentManager.startAgent(agentId))
        .rejects.toThrow('Process spawn failed');
      
      const agent = agentManager.getAgent(agentId);
      expect(agent?.status).toBe(AgentStatus.ERROR);
    });

    it('should handle concurrent operations safely', async () => {
      const promises = [];
      
      // Create multiple agents concurrently
      for (let i = 0; i < 5; i++) {
        promises.push(agentManager.createAgent('researcher'));
      }
      
      const agentIds = await Promise.all(promises);
      expect(agentIds.length).toBe(5);
      expect(new Set(agentIds).size).toBe(5); // All unique
    });

    it('should handle memory store failures', async () => {
      mockMemory.store.mockRejectedValue(new Error('Memory store failed'));
      
      // Should still create agent even if memory store fails
      await expect(agentManager.createAgent('researcher'))
        .resolves.toBeTruthy();
    });

    it('should handle empty agent list operations', () => {
      const emptyManager = new AgentManager({}, mockLogger, mockEventBus, mockMemory);
      
      expect(emptyManager.getAllAgents()).toEqual([]);
      expect(emptyManager.getAgentsByType(AgentType.RESEARCHER)).toEqual([]);
      expect(emptyManager.getAgentsByStatus(AgentStatus.IDLE)).toEqual([]);
      
      const stats = emptyManager.getSystemStats();
      expect(stats.totalAgents).toBe(0);
      expect(stats.averageHealth).toBe(1);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large numbers of agents efficiently', async () => {
      await agentManager.initialize();
      
      const startTime = Date.now();
      
      // Create many agents
      const promises = [];
      for (let i = 0; i < 50 && i < config.maxAgents!; i++) {
        promises.push(agentManager.createAgent('researcher'));
      }
      
      await Promise.all(promises);
      
      const creationTime = Date.now() - startTime;
      expect(creationTime).toBeLessThan(5000); // Should complete in reasonable time
      
      // Test querying performance
      const queryStart = Date.now();
      const allAgents = agentManager.getAllAgents();
      const stats = agentManager.getSystemStats();
      const queryTime = Date.now() - queryStart;
      
      expect(allAgents.length).toBe(Math.min(50, config.maxAgents!));
      expect(queryTime).toBeLessThan(100); // Should be very fast
      expect(stats.totalAgents).toBe(allAgents.length);
    });

    it('should handle frequent health checks efficiently', async () => {
      await agentManager.initialize();
      
      // Create some agents
      for (let i = 0; i < 10; i++) {
        await agentManager.createAgent('researcher');
      }
      
      const startTime = Date.now();
      
      // Trigger multiple health checks rapidly
      const healthCheckCallback = (setInterval as jest.Mock).mock.calls
        .find(call => call[1] === config.healthCheckInterval)?.[0];
      
      if (healthCheckCallback) {
        for (let i = 0; i < 10; i++) {
          await healthCheckCallback();
        }
      }
      
      const healthCheckTime = Date.now() - startTime;
      expect(healthCheckTime).toBeLessThan(2000); // Should be efficient
    });
  });
});