// TypeScript declarations for Jest test environment

declare class MockPerformanceTimer {
  start(): void;
  end(): number;
  measure(): number;
  reset(): void;
}

declare function assertAgentInitialization(agent: any, expectedType?: any): void;
declare function assertPerformanceMetrics(metrics: any, expectedMetrics?: any): void;

interface MockSecurityThreatOptions {
  id?: string;
  type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  source?: string;
  timestamp?: Date;
  indicators?: any[];
  affected_systems?: string[];
  status?: string;
}

declare function createMockSecurityThreat(overrides?: MockSecurityThreatOptions): any;

declare global {
  const MockPerformanceTimer: typeof MockPerformanceTimer;
  const assertAgentInitialization: typeof assertAgentInitialization;
  const assertPerformanceMetrics: typeof assertPerformanceMetrics;
  const createMockSecurityThreat: typeof createMockSecurityThreat;
}