/**
 * MCP (Model Context Protocol) Integration Types
 * Claude Flow v2.0+ Integration for PEA System
 */

export interface MCPIntegration {
  swarmInit: (topology: string, maxAgents: number, strategy: string) => Promise<SwarmResponse>;
  agentSpawn: (type: string, name: string, capabilities: string[]) => Promise<AgentSpawnResponse>;
  taskOrchestrate: (task: string, strategy: string, priority: string) => Promise<TaskResponse>;
  memoryUsage: (action: string, key: string, value: string, namespace?: string) => Promise<MemoryResponse>;
  neuralTrain: (patternType: string, trainingData: string, epochs?: number) => Promise<NeuralResponse>;
  neuralPatterns: (action: string, operation: string, metadata: Record<string, unknown>) => Promise<NeuralResponse>;
  request: (endpoint: string, params: any) => Promise<any>;
}

export interface SwarmResponse {
  swarmId: string;
  topology: string;
  maxAgents: number;
  status: string;
}

export interface AgentSpawnResponse {
  agentId: string;
  type: string;
  name: string;
  status: string;
}

export interface TaskResponse {
  taskId: string;
  status: string;
  assignedAgents: string[];
}

export interface MemoryResponse {
  success: boolean;
  key: string;
  value?: string;
}

export interface NeuralResponse {
  success: boolean;
  patternId?: string;
  accuracy?: number;
}