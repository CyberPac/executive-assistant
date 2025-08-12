/**
 * PEA (Personal Executive Assistant) Agent Type Definitions
 * Phase 2 Intelligence Expansion - Complete 15-Agent LEASA Architecture
 * 
 * Based on:
 * - PEA-DETAILED-ARCHITECTURE.md
 * - PEA-Phase2-Implementation-Roadmap.md
 * - LEASA (LocalExecutive AI Swarm Architecture) v2.0
 * - Claude Flow v2.0+ MCP coordination
 * 
 * Architecture Tiers:
 * - Tier 1: Executive Orchestration (1 agent)
 * - Tier 2: Core Intelligence (8 agents)
 * - Tier 3: Specialized Intelligence (4 agents)
 * - Tier 4: System & Security (3 agents)
 * Total: 15 agents with hierarchical coordination
 */

// Import centralized enums first
import { SecurityLevel, TaskType, TaskStatus, PEAAgentType, AgentStatus } from './enums';

// Re-export for consumers
export { SecurityLevel, TaskType, TaskStatus, PEAAgentType, AgentStatus };

export interface PEAAgentInterface {
  id: string;
  name: string;
  type: PEAAgentType;
  status: AgentStatus;
  capabilities: string[];
  performanceMetrics: PerformanceMetrics;
  coordinationProtocols: CoordinationProtocol[];
  securityLevel: SecurityLevel;
}

/**
 * Base class for all PEA agents with common functionality
 */
export abstract class PEAAgentBase implements PEAAgentInterface {
  public id: string;
  public name: string;
  public type: PEAAgentType;
  public status: AgentStatus = AgentStatus.INITIALIZING;
  public capabilities: string[] = [];
  public performanceMetrics: PerformanceMetrics;
  public coordinationProtocols: CoordinationProtocol[] = [];
  public securityLevel: SecurityLevel = SecurityLevel.OPERATIONAL;
  protected mcpIntegration: ClaudeFlowMCPIntegration;

  constructor(
    id: string,
    type: PEAAgentType,
    name: string,
    mcpIntegration: ClaudeFlowMCPIntegration,
    securityLevel: SecurityLevel = SecurityLevel.OPERATIONAL
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.mcpIntegration = mcpIntegration;
    this.securityLevel = securityLevel;
    
    // Initialize default performance metrics
    this.performanceMetrics = {
      responseTimeMs: 0,
      accuracyScore: 0.9,
      throughputPerHour: 0,
      consensusSuccessRate: 0.95,
      errorRate: 0.01,
      lastUpdated: new Date().toISOString()
    };

    // Initialize default coordination protocols
    this.coordinationProtocols = [
      {
        type: 'byzantine-fault-tolerance',
        enabled: true,
        parameters: { toleranceLevel: 2, consensusThreshold: 0.75 }
      },
      {
        type: 'consensus-validation',
        enabled: true,
        parameters: { validationAlgorithm: 'pbft' }
      }
    ];
  }

  /**
   * Abstract method that must be implemented by all agents
   */
  abstract initialize(): Promise<void>;

  /**
   * Update agent performance metrics
   */
  protected updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = {
      ...this.performanceMetrics,
      ...metrics,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get current agent health status
   */
  public getHealthStatus(): { status: AgentStatus; metrics: PerformanceMetrics; uptime: number } {
    return {
      status: this.status,
      metrics: this.performanceMetrics,
      uptime: Date.now() - new Date(this.performanceMetrics.lastUpdated).getTime()
    };
  }

  /**
   * Enable or disable coordination protocols
   */
  public configureCoordinationProtocol(
    type: CoordinationProtocol['type'],
    enabled: boolean,
    parameters?: Record<string, unknown>
  ): void {
    const existingProtocol = this.coordinationProtocols.find(p => p.type === type);
    
    if (existingProtocol) {
      existingProtocol.enabled = enabled;
      if (parameters) {
        existingProtocol.parameters = { ...existingProtocol.parameters, ...parameters };
      }
    } else {
      this.coordinationProtocols.push({
        type,
        enabled,
        parameters: parameters || {}
      });
    }
  }

  /**
   * Store agent activity in memory for coordination
   */
  protected async storeActivity(
    activityType: string,
    data: unknown,
    namespace: string = 'pea_foundation'
  ): Promise<void> {
    await this.mcpIntegration.memoryUsage(
      'store',
      `agent_activity/${this.id}/${activityType}/${Date.now()}`,
      JSON.stringify({
        agentId: this.id,
        agentType: this.type,
        activityType,
        data,
        timestamp: new Date().toISOString()
      }),
      namespace
    );
  }

  /**
   * Get coordination data from other agents
   */
  protected async getCoordinationData(pattern: string): Promise<unknown[]> {
    try {
      // This is a mock implementation - in reality would query memory
      return [];
    } catch (error) {
      console.error(`Failed to get coordination data for pattern ${pattern}:`, error);
      throw error; // Re-throw to avoid unreachable code
    }
  }
}

// Centralized enums already imported above

export interface PerformanceMetrics {
  responseTimeMs: number;
  accuracyScore: number;
  throughputPerHour: number;
  consensusSuccessRate: number;
  errorRate: number;
  lastUpdated: string;
}

export interface CoordinationProtocol {
  type: 'byzantine-fault-tolerance' | 'consensus-validation' | 'crisis-escalation' | 'memory-coordination';
  enabled: boolean;
  parameters: Record<string, unknown>;
}

export interface ExecutiveContext {
  executiveId: string;
  sessionId: string;
  preferences: ExecutivePreferences;
  currentPriority: 'low' | 'medium' | 'high' | 'critical';
  culturalContext?: CulturalContext;
  stakeholders: StakeholderContext[];
  deadline?: Date;
  timeZone: string;
  confidentialityLevel: SecurityLevel;
}

export interface ExecutivePreferences {
  communicationStyle: 'formal' | 'diplomatic' | 'direct' | 'collaborative';
  decisionThreshold: number; // 0-1 scale for consensus requirements
  privacyLevel: SecurityLevel;
  timeZone: string;
  languages: string[];
  culturalAdaptation: boolean;
}

export interface CulturalContext {
  country: string;
  region?: string;
  businessProtocols: string[];
  communicationPreferences: string[];
  appropriatenessScore: number;
}

export interface StakeholderContext {
  id: string;
  name: string;
  relationship: 'family' | 'board' | 'executive' | 'employee' | 'client' | 'partner';
  priority: 'low' | 'medium' | 'high' | 'critical';
  communicationHistory: CommunicationEvent[];
  culturalProfile?: CulturalContext;
}

export interface CommunicationEvent {
  timestamp: string;
  type: 'email' | 'call' | 'meeting' | 'text' | 'document';
  sentiment: 'positive' | 'neutral' | 'negative';
  effectiveness: number; // 0-1 scale
  outcomes: string[];
}

export interface ConsensusRequest {
  id: string;
  decisionPoint: string;
  domain: string;
  stakeholderImpact: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresConsensus: boolean;
  agents: string[];
  timestamp: string;
}

export interface ConsensusResult {
  id: string;
  consensus: boolean;
  confidence: number; // 0-1 scale
  agentVotes: AgentVote[];
  byzantineToleranceApplied: boolean;
  recommendation: string;
  reasoning: string[];
  participatingAgents: number;
  timestamp: string;
}

export interface AgentVote {
  agentId: string;
  agentType: PEAAgentType;
  vote: 'approve' | 'reject' | 'abstain';
  confidence: number;
  reasoning: string;
}

export interface PEATask {
  id: string;
  description: string;
  type: TaskType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgents: string[];
  dependencies: string[];
  status: TaskStatus;
  context: ExecutiveContext;
  performanceTargets: PerformanceTargets;
  createdAt: string;
  completedAt?: string;
}

// All task-related enums imported from centralized enums

export interface PerformanceTargets {
  maxResponseTimeMs: number;
  minAccuracy: number;
  minConsensusScore: number;
  maxErrorRate: number;
}

export interface DocumentAnalysisRequest {
  id: string;
  documents: DocumentItem[];
  analysisDepth: 'basic' | 'comprehensive' | 'expert';
  executiveContext: ExecutiveContext;
  extractionTargets: string[];
  synthesisRequired: boolean;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'video' | 'email';
  size: number;
  content?: Buffer;
  url?: string;
  classification: SecurityLevel;
}

export interface SecurityThreat {
  id: string;
  type: 'behavioral-anomaly' | 'access-violation' | 'data-breach' | 'system-intrusion' | 'unauthorized_access' | 'privilege_escalation' | 'malware' | 'phishing' | 'insider_threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  affectedSystems: string[];
  recommendedActions: string[];
  detectedAt: string;
  responseImplemented?: boolean;
}

// MCP Integration Response Types
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

export interface ClaudeFlowMCPIntegration {
  swarmInit: (topology: string, maxAgents: number, strategy: string) => Promise<SwarmResponse>;
  agentSpawn: (type: string, name: string, capabilities: string[]) => Promise<AgentSpawnResponse>;
  taskOrchestrate: (task: string, strategy: string, priority: string) => Promise<TaskResponse>;
  memoryUsage: (action: string, key: string, value: string, namespace?: string) => Promise<MemoryResponse>;
  neuralTrain: (patternType: string, trainingData: string, epochs?: number) => Promise<NeuralResponse>;
  neuralPatterns: (action: string, operation: string, metadata: Record<string, unknown>) => Promise<NeuralResponse>;
}

export interface ByzantineFaultTolerance {
  toleranceLevel: number; // Number of faulty agents system can handle
  consensusThreshold: number; // 0-1 scale for agreement requirement
  validationAlgorithm: 'pbft' | 'raft' | 'pow' | 'pos';
  faultDetection: boolean;
  automaticRecovery: boolean;
}

export interface NeuralPatternLearning {
  patternType: 'coordination' | 'optimization' | 'prediction';
  learningRate: number;
  epochs: number;
  accuracy: number;
  lastTraining: string;
  patterns: LearnedPattern[];
}

export interface LearnedPattern {
  id: string;
  pattern: string;
  frequency: number;
  effectiveness: number;
  context: string[];
  lastUsed: string;
}