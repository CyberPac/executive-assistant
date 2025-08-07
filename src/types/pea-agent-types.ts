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
    parameters?: Record<string, any>
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
    data: any,
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
  protected async getCoordinationData(pattern: string): Promise<any[]> {
    try {
      // This is a mock implementation - in reality would query memory
      return [];
    } catch (error) {
      console.error(`Failed to get coordination data for pattern ${pattern}:`, error);
      return [];
    }
  }
}

export enum PEAAgentType {
  // Tier 1: Executive Orchestration Layer (1 agent)
  EXECUTIVE_ORCHESTRATOR = 'executive-orchestrator',
  
  // Tier 2: Core Intelligence Agents (8 agents)
  CALENDAR_INTELLIGENCE = 'calendar-intelligence', 
  COMMUNICATION_MANAGER = 'communication-manager',
  TRAVEL_LOGISTICS = 'travel-logistics',
  DOCUMENT_INTELLIGENCE = 'document-intelligence',
  FINANCIAL_MANAGEMENT = 'financial-management',
  CULTURAL_INTELLIGENCE = 'cultural-intelligence',
  CRISIS_MANAGEMENT = 'crisis-management',
  RESEARCH_INTELLIGENCE = 'research-intelligence',
  
  // Tier 3: Specialized Intelligence Agents (4 agents)
  LEGAL_INTELLIGENCE = 'legal-intelligence',
  HEALTH_WELLNESS = 'health-wellness',
  STAKEHOLDER_RELATIONS = 'stakeholder-relations',
  STRATEGIC_PLANNING = 'strategic-planning',
  
  // Tier 4: System & Security Agents (3 agents)
  SECURITY_PRIVACY = 'security-privacy',
  SYSTEM_INTEGRATION = 'system-integration',
  PERFORMANCE_OPTIMIZATION = 'performance-optimization'
}

// Using centralized AgentStatus from swarm/types.ts to avoid conflicts
export { AgentStatus } from '../swarm/types';

export enum SecurityLevel {
  EXECUTIVE_PERSONAL = 'executive-personal',
  STRATEGIC_CONFIDENTIAL = 'strategic-confidential',
  BUSINESS_SENSITIVE = 'business-sensitive',
  OPERATIONAL = 'operational',
  ADMINISTRATIVE = 'administrative'
}

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
  parameters: Record<string, any>;
}

export interface ExecutiveContext {
  executiveId: string;
  sessionId: string;
  preferences: ExecutivePreferences;
  currentPriority: 'low' | 'medium' | 'high' | 'critical';
  culturalContext?: CulturalContext;
  stakeholders: StakeholderContext[];
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

export enum TaskType {
  SCHEDULING = 'scheduling',
  COMMUNICATION = 'communication',
  DOCUMENT_ANALYSIS = 'document-analysis',
  DECISION_SUPPORT = 'decision-support',
  CRISIS_MANAGEMENT = 'crisis-management',
  CULTURAL_ADAPTATION = 'cultural-adaptation',
  SECURITY_MONITORING = 'security-monitoring'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  AWAITING_CONSENSUS = 'awaiting-consensus',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

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

export interface ClaudeFlowMCPIntegration {
  swarmInit: (topology: string, maxAgents: number, strategy: string) => Promise<any>;
  agentSpawn: (type: string, name: string, capabilities: string[]) => Promise<any>;
  taskOrchestrate: (task: string, strategy: string, priority: string) => Promise<any>;
  memoryUsage: (action: string, key: string, value: string, namespace?: string) => Promise<any>;
  neuralTrain: (patternType: string, trainingData: string, epochs?: number) => Promise<any>;
  neuralPatterns: (action: string, operation: string, metadata: any) => Promise<any>;
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