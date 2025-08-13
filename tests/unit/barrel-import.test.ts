/**
 * Test Barrel Import from index.ts
 */

import { mcpIntegrationMockFactory, resetAllMockFactories } from '../utils/mock-factories';

describe('Barrel Import Test', () => {
  it('should import from barrel export successfully', () => {
    expect(mcpIntegrationMockFactory).toBeDefined();
    expect(resetAllMockFactories).toBeDefined();
  });

  it('should reset all factories', () => {
    expect(() => {
      resetAllMockFactories();
    }).not.toThrow();
  });
});