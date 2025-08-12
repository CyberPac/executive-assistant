import { CommunicationManagerAgent } from '../../../src/agents/communication-manager/CommunicationManagerAgent';
import { SecurityLevel, AgentStatus as _AgentStatus, PEAAgentType } from '../../../src/types/enums';

const mockMcpIntegration = {
  swarmInit: jest.fn().mockResolvedValue({}),
  agentSpawn: jest.fn().mockResolvedValue({}),
  taskOrchestrate: jest.fn().mockResolvedValue({}),
  memoryUsage: jest.fn().mockResolvedValue({}),
  neuralTrain: jest.fn().mockResolvedValue({}),
  neuralPatterns: jest.fn().mockResolvedValue({})
};

describe('CommunicationManagerAgent', () => {
  let agent: CommunicationManagerAgent;

  beforeEach(() => {
    agent = new CommunicationManagerAgent(
      mockMcpIntegration
    );
  });

  test('should initialize with correct type', () => {
    expect(agent.type).toBe(PEAAgentType.COMMUNICATION_MANAGER);
  });

  test('should have proper security level', () => {
    expect(agent.securityLevel).toBe(SecurityLevel.OPERATIONAL);
  });
});