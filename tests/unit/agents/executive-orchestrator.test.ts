import { ExecutiveOrchestratorAgent } from '../../../src/agents/executive-orchestrator/ExecutiveOrchestratorAgent';
import { SecurityLevel, AgentStatus, PEAAgentType } from '../../../src/types/enums';

// Mock Claude Flow MCP Integration
const mockMcpIntegration = {
  swarmInit: jest.fn().mockResolvedValue({}),
  agentSpawn: jest.fn().mockResolvedValue({}),
  taskOrchestrate: jest.fn().mockResolvedValue({}),
  memoryUsage: jest.fn().mockResolvedValue({}),
  neuralTrain: jest.fn().mockResolvedValue({}),
  neuralPatterns: jest.fn().mockResolvedValue({})
};

describe('ExecutiveOrchestratorAgent', () => {
  let agent: ExecutiveOrchestratorAgent;

  beforeEach(() => {
    agent = new ExecutiveOrchestratorAgent(
      'test-orchestrator-1',
      mockMcpIntegration,
      SecurityLevel.OPERATIONAL
    );
  });

  test('should initialize with correct type', () => {
    expect(agent.type).toBe(PEAAgentType.EXECUTIVE_ORCHESTRATOR);
  });

  test('should start with INITIALIZING status', () => {
    expect(agent.status).toBe(AgentStatus.INITIALIZING);
  });

  test('should have proper security level', () => {
    expect(agent.securityLevel).toBe(SecurityLevel.OPERATIONAL);
  });
});