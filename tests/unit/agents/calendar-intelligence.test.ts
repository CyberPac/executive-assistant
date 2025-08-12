import { CalendarIntelligenceAgent } from '../../../src/agents/calendar-intelligence/CalendarIntelligenceAgent';
import { SecurityLevel, AgentStatus as _AgentStatus, PEAAgentType } from '../../../src/types/enums';

const mockMcpIntegration = {
  swarmInit: jest.fn().mockResolvedValue({}),
  agentSpawn: jest.fn().mockResolvedValue({}),
  taskOrchestrate: jest.fn().mockResolvedValue({}),
  memoryUsage: jest.fn().mockResolvedValue({}),
  neuralTrain: jest.fn().mockResolvedValue({}),
  neuralPatterns: jest.fn().mockResolvedValue({})
};

describe('CalendarIntelligenceAgent', () => {
  let agent: CalendarIntelligenceAgent;

  beforeEach(() => {
    agent = new CalendarIntelligenceAgent(
      mockMcpIntegration
    );
  });

  test('should initialize with correct type', () => {
    expect(agent.type).toBe(PEAAgentType.CALENDAR_INTELLIGENCE);
  });

  test('should have proper security level', () => {
    expect(agent.securityLevel).toBe(SecurityLevel.OPERATIONAL);
  });
});