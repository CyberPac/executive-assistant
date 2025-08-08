/**
 * Swarm Types - Agent Coordination Type Definitions
 * Provides type definitions for swarm-based agent coordination
 */

export type AgentId = string;

export enum AgentType {
  COORDINATOR = 'coordinator',
  RESEARCHER = 'researcher', 
  CODER = 'coder',
  ANALYST = 'analyst',
  TESTER = 'tester',
  ORCHESTRATOR = 'orchestrator',
  SPECIALIST = 'specialist'
}

export enum AgentStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  IDLE = 'idle',
  BUSY = 'busy',
  ERROR = 'error',
  TERMINATED = 'terminated',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance'
}

export interface AgentState {
  id: AgentId;
  name: string;
  type: AgentType;
  status: AgentStatus;
  currentTask?: string;
  performance: AgentMetrics;
  metrics: AgentMetrics;
  lastActivity: Date;
  lastHeartbeat: Date;
  health: AgentHealth;
  workload: AgentWorkload;
  environment: AgentEnvironment;
  config: AgentConfig;
  capabilities: AgentCapabilities;
  errorHistory: AgentError[];
}

export interface AgentCapabilities {
  skills: string[];
  maxConcurrentTasks: number;
  supportedTaskTypes: string[];
  specializations: string[];
  codeGeneration: boolean;
  codeReview?: boolean;
  testing?: boolean;
  documentation?: boolean;
  research?: boolean;
  analysis?: boolean;
  webSearch?: boolean;
  apiIntegration?: boolean;
  fileSystem?: boolean;
  terminalAccess?: boolean;
  languages?: string[];
  frameworks?: string[];
  domains?: string[];
  tools?: string[];
  maxMemoryUsage?: number;
  maxExecutionTime?: number;
  reliability?: number;
  speed?: number;
  quality?: number;
}

export interface AgentConfig {
  id: AgentId;
  type: AgentType;
  capabilities: AgentCapabilities;
  environment: AgentEnvironment;
  settings: Record<string, any>;
  autonomyLevel: number;
  learningEnabled: boolean;
  adaptationEnabled: boolean;
  maxTasksPerHour: number;
  maxConcurrentTasks: number;
  timeoutThreshold: number;
  reportingInterval: number;
  heartbeatInterval: number;
  permissions: string[];
  trustedAgents: string[];
  expertise: string[];
  preferences: Record<string, any>;
}

export interface AgentEnvironment {
  resourceLimits: {
    memory: number;
    cpu: number;
    networkBandwidth: number;
  };
  permissions: string[];
  accessTokens: Record<string, string>;
  runtime: string;
  version: string;
  workingDirectory: string;
  tempDirectory: string;
  logDirectory: string;
  apiEndpoints: Record<string, string>;
  credentials: Record<string, string>;
  availableTools: string[];
  toolConfigs: Record<string, any>;
}

export interface AgentMetrics {
  tasksCompleted: number;
  averageResponseTime: number;
  averageExecutionTime: number;
  successRate: number;
  errorRate: number;
  lastUpdated: Date;
  tasksFailed: number;
}

export interface AgentError extends Error {
  id: string;
  agentId: AgentId;
  type: 'INITIALIZATION_ERROR' | 'EXECUTION_ERROR' | 'COMMUNICATION_ERROR' | 'RESOURCE_ERROR';
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AgentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  issues: string[];
  overall?: number;
  components?: {
    responsiveness: number;
    performance: number;
    reliability: number;
    resourceUsage: number;
  };
  trend?: 'improving' | 'stable' | 'degrading';
}

export interface AgentWorkload {
  currentTasks: number;
  maxTasks: number;
  utilizationRate: number;
  tasksQueued?: number;
  averageTaskTime?: number;
}

export interface SwarmConfiguration {
  topology: 'hierarchical' | 'mesh' | 'ring' | 'star';
  maxAgents: number;
  coordinationStrategy: 'centralized' | 'distributed' | 'hybrid';
  consensusAlgorithm: 'majority' | 'unanimity' | 'weighted';
}

export interface TaskRequest {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  parameters: Record<string, any>;
  constraints: TaskConstraints;
  assignedAgent?: AgentId;
}

export interface TaskConstraints {
  deadline?: Date;
  resourceLimits?: {
    maxMemory?: number;
    maxDuration?: number;
  };
  dependencies?: string[];
  requiredCapabilities?: string[];
}

export interface TaskResult {
  taskId: string;
  agentId: AgentId;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
  metrics: {
    executionTime: number;
    resourcesUsed: Record<string, number>;
  };
}