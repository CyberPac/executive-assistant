/**
 * Centralized Enums for PEA System
 * Single source of truth for all system enumerations
 */

export enum SecurityLevel {
  EXECUTIVE_PERSONAL = 'executive-personal',
  STRATEGIC_CONFIDENTIAL = 'strategic-confidential',
  BUSINESS_SENSITIVE = 'business-sensitive',
  OPERATIONAL = 'operational',
  ADMINISTRATIVE = 'administrative'
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

export enum AgentStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  IDLE = 'idle',
  BUSY = 'busy',
  ERROR = 'error',
  FAILED = 'failed',
  TERMINATED = 'terminated',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance'
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