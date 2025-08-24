/**
 * Test-specific type exports and utilities
 * Central location for all test-related type definitions
 */

// Re-export all types needed for testing from main type files
export type {
  // Core PEA Agent Types
  PEAAgentInterface,
  PEAAgentBase,
  PEAAgentType,
  AgentStatus,
  SecurityLevel,
  TaskType,
  TaskStatus,
  
  // Performance and Coordination Types
  PerformanceMetrics,
  CoordinationProtocol,
  
  // Context Types
  ExecutiveContext,
  CulturalContext,
  StakeholderContext,
  
  // Response Types for Mock Integration
  SwarmResponse,
  AgentSpawnResponse,
  TaskResponse,
  MemoryResponse,
  NeuralResponse,
  
  // MCP Integration Types
  ClaudeFlowMCPIntegration
} from './pea-agent-types';

// Re-export Financial Types
export type {
  FinancialContext,
  PortfolioProfile,
  TaxProfile,
  Holding,
  PerformanceTargets,
  RebalancingRule,
  TaxHarvestingRule,
  RetirementAccount,
  FinancialAlert,
  MarketData
} from '../agents/financial-intelligence/FinancialIntelligenceAgent';

// Test-specific utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type MockOverrides<T> = DeepPartial<T>;

// Import SecurityLevel for internal use
import { SecurityLevel as InternalSecurityLevel } from './pea-agent-types';

// Test execution context
export interface TestExecutionContext {
  testSuite: string;
  testName: string;
  startTime: number;
  agentId?: string;
  securityLevel?: InternalSecurityLevel;
}

// Mock validation types
export interface MockValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}