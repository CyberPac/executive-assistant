import { PEACoordinationSystem } from '../../src/agents/PEACoordinationSystem';
import { SecurityLevel } from '../../src/types/enums';

// Mock Claude Flow MCP Integration
const mockMcpIntegration = {
  swarmInit: jest.fn().mockResolvedValue({}),
  agentSpawn: jest.fn().mockResolvedValue({}),
  taskOrchestrate: jest.fn().mockResolvedValue({}),
  memoryUsage: jest.fn().mockResolvedValue({}),
  neuralTrain: jest.fn().mockResolvedValue({}),
  neuralPatterns: jest.fn().mockResolvedValue({})
};

describe('PEACoordinationSystem', () => {
  let coordinationSystem: PEACoordinationSystem;

  beforeEach(() => {
    coordinationSystem = new PEACoordinationSystem(
      mockMcpIntegration,
      SecurityLevel.OPERATIONAL
    );
  });

  test('should initialize successfully', () => {
    expect(coordinationSystem).toBeInstanceOf(PEACoordinationSystem);
  });

  test('should have proper security level', () => {
    expect(coordinationSystem.securityLevel).toBe(SecurityLevel.OPERATIONAL);
  });
});