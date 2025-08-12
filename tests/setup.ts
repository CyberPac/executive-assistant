// Jest setup file for global test configuration

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Set test timeout
jest.setTimeout(10000);

// Mock environment variables for tests
process.env.NODE_ENV = 'test';

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidAgent(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidAgent(received: any) {
    const pass = received && 
                 typeof received.id === 'string' &&
                 typeof received.name === 'string' &&
                 typeof received.capabilities === 'object';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid agent`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid agent with id, name, and capabilities`,
        pass: false,
      };
    }
  },
});

// Cleanup after tests
afterEach(() => {
  jest.clearAllMocks();
});