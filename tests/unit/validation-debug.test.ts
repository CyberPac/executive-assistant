/**
 * Debug validation test
 */

import { mcpIntegrationMockFactory } from '../utils/mock-factories/mcp/MCPIntegrationMockFactory';

describe('Validation Debug', () => {
  it('should debug validation result for empty object', () => {
    const invalidMock: any = {};
    const validation = mcpIntegrationMockFactory.validate(invalidMock);
    
    console.log('Validation result:', JSON.stringify(validation, null, 2));
    
    expect(validation).toBeDefined();
  });
});