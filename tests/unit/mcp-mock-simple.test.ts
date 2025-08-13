/**
 * Simple MCP Mock Factory Test
 * Tests direct import of MCP mock factory
 */

import { mcpIntegrationMockFactory } from '../utils/mock-factories/mcp/MCPIntegrationMockFactory';

describe('Simple MCP Mock Factory Test', () => {
  it('should import mcpIntegrationMockFactory successfully', () => {
    expect(mcpIntegrationMockFactory).toBeDefined();
    expect(typeof mcpIntegrationMockFactory.create).toBe('function');
  });

  it('should create a basic mock', () => {
    const mock = mcpIntegrationMockFactory.create();
    
    expect(mock).toBeDefined();
    expect(mock.swarmInit).toBeDefined();
    expect(typeof mock.swarmInit).toBe('function');
  });
});