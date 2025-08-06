/**
 * Jest test setup file
 * Configures global test environment and mocks
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.GOOGLE_MAPS_API_KEY = 'test-google-maps-key';
process.env.WAZE_API_KEY = 'test-waze-key';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Comment out the line below if you want to see console outputs during tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock nanoid for consistent test results
jest.mock('nanoid', () => ({
  nanoid: () => 'test-id-123'
}));