/**
 * Mock Agent Types and Base Classes for Testing
 */

import { EventEmitter } from 'events';

// Base Agent Interface
export interface IAgent {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'busy' | 'error';
  capabilities: string[];
  initialize(): Promise<void>;
  executeTask(task: any): Promise<any>;
  shutdown(): Promise<void>;
}

// Base Agent Class
export class BaseAgent extends EventEmitter implements IAgent {
  public id: string;
  public name: string;
  public type: string;
  public status: 'idle' | 'busy' | 'error' = 'idle';
  public capabilities: string[] = [];

  constructor(id: string, name: string, type: string) {
    super();
    this.id = id;
    this.name = name;
    this.type = type;
  }

  async initialize(): Promise<void> {
    this.status = 'idle';
    this.emit('initialized', this.id);
  }

  async executeTask(task: any): Promise<any> {
    this.status = 'busy';
    this.emit('taskStarted', { agentId: this.id, task });
    
    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, 10));
    
    this.status = 'idle';
    const result = { success: true, result: 'mock-result', taskId: task.id };
    this.emit('taskCompleted', { agentId: this.id, result });
    
    return result;
  }

  async shutdown(): Promise<void> {
    this.status = 'idle';
    this.removeAllListeners();
    this.emit('shutdown', this.id);
  }
}

// Crisis Management Types
export enum CrisisLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum CrisisType {
  SECURITY = 'security',
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  REPUTATION = 'reputation',
  COMPLIANCE = 'compliance'
}

export enum ResponseStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface CrisisEvent {
  id: string;
  type: CrisisType;
  level: CrisisLevel;
  description: string;
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
}

export interface CrisisResponse {
  id: string;
  crisisId: string;
  actions: string[];
  status: ResponseStatus;
  assignedAgents: string[];
  timeline: Date[];
}

// Crisis Management Agent Mock
export class CrisisManagementAgent extends BaseAgent {
  constructor(id: string = 'crisis-agent-1') {
    super(id, 'Crisis Management Agent', 'crisis-management');
    this.capabilities = [
      'threat-assessment',
      'response-coordination',
      'stakeholder-communication',
      'incident-documentation'
    ];
  }

  async assessCrisis(event: CrisisEvent): Promise<any> {
    return {
      assessment: {
        level: event.level,
        priority: event.level === CrisisLevel.CRITICAL ? 'immediate' : 'standard',
        requiredActions: ['assess', 'contain', 'communicate'],
        estimatedResolutionTime: '2-4 hours'
      }
    };
  }

  async coordinateResponse(crisis: CrisisEvent): Promise<CrisisResponse> {
    return {
      id: 'response-' + Date.now(),
      crisisId: crisis.id,
      actions: ['emergency-protocols', 'stakeholder-alert', 'damage-assessment'],
      status: ResponseStatus.IN_PROGRESS,
      assignedAgents: [this.id],
      timeline: [new Date()]
    };
  }

  async generateReport(crisisId: string): Promise<any> {
    return {
      crisisId,
      summary: 'Crisis handled successfully',
      actions: ['assessment', 'response', 'resolution'],
      outcome: 'resolved',
      lessonsLearned: ['improved-monitoring', 'faster-response-time']
    };
  }
}

// Agent Manager Types
export interface AgentConfig {
  id: string;
  type: string;
  name: string;
  capabilities: string[];
  maxConcurrentTasks?: number;
  priority?: number;
}

export class AgentManager extends EventEmitter {
  private agents: Map<string, IAgent> = new Map();

  async registerAgent(config: AgentConfig): Promise<IAgent> {
    const agent = new BaseAgent(config.id, config.name, config.type);
    agent.capabilities = config.capabilities;
    
    await agent.initialize();
    this.agents.set(config.id, agent);
    
    this.emit('agentRegistered', { agentId: config.id, config });
    return agent;
  }

  async getAgent(id: string): Promise<IAgent | undefined> {
    return this.agents.get(id);
  }

  async getAllAgents(): Promise<IAgent[]> {
    return Array.from(this.agents.values());
  }

  async removeAgent(id: string): Promise<boolean> {
    const agent = this.agents.get(id);
    if (agent) {
      await agent.shutdown();
      this.agents.delete(id);
      this.emit('agentRemoved', { agentId: id });
      return true;
    }
    return false;
  }

  async shutdown(): Promise<void> {
    for (const agent of this.agents.values()) {
      await agent.shutdown();
    }
    this.agents.clear();
    this.removeAllListeners();
  }
}

// Default exports for commonjs compatibility
module.exports = {
  IAgent,
  BaseAgent,
  CrisisLevel,
  CrisisType,
  ResponseStatus,
  CrisisManagementAgent,
  AgentManager
};