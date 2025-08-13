/**
 * MCP Integration Mock Factory
 * Type-safe mock factory for ClaudeFlowMCPIntegration testing
 */

import { BaseMockFactory } from '../base/MockFactory';
import {
  ClaudeFlowMCPIntegration,
  SwarmResponse,
  AgentSpawnResponse,
  TaskResponse,
  MemoryResponse,
  NeuralResponse,
  DeepPartial
} from '../../../../src/types/test-types';

/**
 * Specialized mock factory for MCP Integration
 * Provides realistic defaults and proper typing
 */
export class MCPIntegrationMockFactory extends BaseMockFactory<ClaudeFlowMCPIntegration> {
  
  create(overrides?: DeepPartial<ClaudeFlowMCPIntegration>): jest.Mocked<ClaudeFlowMCPIntegration> {
    const defaults: ClaudeFlowMCPIntegration = {
      swarmInit: async (topology: string, maxAgents: number, _strategy: string) => ({
        swarmId: `swarm-${Date.now()}`,
        topology,
        maxAgents,
        status: 'active'
      }),
      
      agentSpawn: async (type: string, name: string, _capabilities: string[]) => ({
        agentId: `agent-${Date.now()}`,
        type,
        name,
        status: 'active'
      }),
      
      taskOrchestrate: async (_task: string, _strategy: string, _priority: string) => ({
        taskId: `task-${Date.now()}`,
        status: 'assigned',
        assignedAgents: [`agent-${Date.now()}`]
      }),
      
      memoryUsage: async (_action: string, key: string, value?: string, _namespace?: string) => ({
        success: true,
        key,
        value: value || 'test-value'
      }),
      
      neuralTrain: async (_pattern: string, _data: string, _epochs?: number) => ({
        success: true,
        patternId: `pattern-${Date.now()}`,
        accuracy: 0.95
      }),
      
      neuralPatterns: async (_action: string, _pattern: string, _metadata: Record<string, unknown>) => ({
        success: true,
        patternId: `pattern-${Date.now()}`,
        accuracy: 0.92
      })
    };
    
    // Merge with configured defaults and overrides
    const mergedDefaults = this.mergeValues(defaults, this.defaults);
    const finalValues = this.mergeValues(mergedDefaults, overrides);
    
    // Create mock implementation
    const mock: jest.Mocked<ClaudeFlowMCPIntegration> = {
      swarmInit: this.createMockFunction<[string, number, string], Promise<SwarmResponse>>(
        finalValues.swarmInit
      ),
      
      agentSpawn: this.createMockFunction<[string, string, string[]], Promise<AgentSpawnResponse>>(
        finalValues.agentSpawn
      ),
      
      taskOrchestrate: this.createMockFunction<[string, string, string], Promise<TaskResponse>>(
        finalValues.taskOrchestrate
      ),
      
      memoryUsage: this.createMockFunction<[string, string, string?, string?], Promise<MemoryResponse>>(
        finalValues.memoryUsage
      ),
      
      neuralTrain: this.createMockFunction<[string, string, number?], Promise<NeuralResponse>>(
        finalValues.neuralTrain
      ),
      
      neuralPatterns: this.createMockFunction<[string, string, Record<string, unknown>], Promise<NeuralResponse>>(
        finalValues.neuralPatterns
      )
    };
    
    return this.trackMock(mock);
  }
  
  protected getExpectedInterface(): Record<string, string> {
    return {
      swarmInit: 'function',
      agentSpawn: 'function',
      taskOrchestrate: 'function',
      memoryUsage: 'function',
      neuralTrain: 'function',
      neuralPatterns: 'function'
    };
  }
  
  /**
   * Create a mock with realistic swarm coordination behavior
   */
  createWithSwarmBehavior(overrides?: DeepPartial<ClaudeFlowMCPIntegration>): jest.Mocked<ClaudeFlowMCPIntegration> {
    let swarmAgents: string[] = [];
    let swarmTasks: { id: string; status: string; agents: string[] }[] = [];
    
    const behaviorOverrides: DeepPartial<ClaudeFlowMCPIntegration> = {
      swarmInit: async (topology: string, maxAgents: number, _strategy: string) => {
        swarmAgents = [];
        swarmTasks = [];
        return {
          swarmId: `swarm-${Date.now()}`,
          topology,
          maxAgents,
          status: 'active'
        };
      },
      
      agentSpawn: async (type: string, name: string, _capabilities: string[]) => {
        const agentId = `agent-${type}-${Date.now()}`;
        swarmAgents.push(agentId);
        return {
          agentId,
          type,
          name,
          status: 'active'
        };
      },
      
      taskOrchestrate: async (_task: string, _strategy: string, _priority: string) => {
        const taskId = `task-${Date.now()}`;
        const assignedAgents = swarmAgents.slice(0, Math.min(2, swarmAgents.length));
        
        const taskObj = {
          id: taskId,
          status: 'assigned',
          agents: assignedAgents
        };
        swarmTasks.push(taskObj);
        
        return {
          taskId,
          status: 'assigned',
          assignedAgents
        };
      }
    };
    
    const finalOverrides = this.mergeValues(behaviorOverrides, overrides || {});
    return this.create(finalOverrides);
  }
  
  /**
   * Create a mock with simulated latency for performance testing
   */
  createWithLatency(
    latencyMs: number = 100,
    overrides?: DeepPartial<ClaudeFlowMCPIntegration>
  ): jest.Mocked<ClaudeFlowMCPIntegration> {
    const addLatency = <T>(originalFn: (...args: any[]) => Promise<T>) => {
      return async (...args: any[]): Promise<T> => {
        await new Promise(resolve => setTimeout(resolve, latencyMs));
        return originalFn(...args);
      };
    };
    
    const latencyOverrides: DeepPartial<ClaudeFlowMCPIntegration> = {
      swarmInit: addLatency(async (topology: string, maxAgents: number, _strategy: string) => ({
        swarmId: `swarm-${Date.now()}`,
        topology,
        maxAgents,
        status: 'active'
      })),
      
      agentSpawn: addLatency(async (type: string, name: string, _capabilities: string[]) => ({
        agentId: `agent-${Date.now()}`,
        type,
        name,
        status: 'active'
      })),
      
      taskOrchestrate: addLatency(async (_task: string, _strategy: string, _priority: string) => ({
        taskId: `task-${Date.now()}`,
        status: 'assigned',
        assignedAgents: [`agent-${Date.now()}`]
      }))
    };
    
    const finalOverrides = this.mergeValues(latencyOverrides, overrides || {});
    return this.create(finalOverrides);
  }
  
  /**
   * Create a mock that simulates failures for error handling testing
   */
  createWithFailures(
    failureRate: number = 0.1,
    overrides?: DeepPartial<ClaudeFlowMCPIntegration>
  ): jest.Mocked<ClaudeFlowMCPIntegration> {
    const addFailureChance = <T>(originalFn: (...args: any[]) => Promise<T>) => {
      return async (...args: any[]): Promise<T> => {
        if (Math.random() < failureRate) {
          throw new Error(`Simulated MCP failure (${failureRate * 100}% failure rate)`);
        }
        return originalFn(...args);
      };
    };
    
    const failureOverrides: DeepPartial<ClaudeFlowMCPIntegration> = {
      swarmInit: addFailureChance(async (topology: string, maxAgents: number, _strategy: string) => ({
        swarmId: `swarm-${Date.now()}`,
        topology,
        maxAgents,
        status: 'active'
      })),
      
      agentSpawn: addFailureChance(async (type: string, name: string, _capabilities: string[]) => ({
        agentId: `agent-${Date.now()}`,
        type,
        name,
        status: 'active'
      }))
    };
    
    const finalOverrides = this.mergeValues(failureOverrides, overrides || {});
    return this.create(finalOverrides);
  }
}

// Singleton instance for global use
export const mcpIntegrationMockFactory = new MCPIntegrationMockFactory();