/**
 * Simplified Jest test setup configuration (JavaScript)
 * Emergency infrastructure repair for test execution
 */

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock external dependencies
jest.mock('better-sqlite3', () => {
  return jest.fn(() => ({
    prepare: jest.fn(() => ({
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn()
    })),
    close: jest.fn(),
    exec: jest.fn()
  }));
});

// Mock WebSocket
jest.mock('ws', () => ({
  WebSocket: jest.fn(() => ({
    on: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    readyState: 1
  }))
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: () => 'test-id-123'
}));

// Custom matchers
expect.extend({
  toBeWithinRange(received, min, max) {
    const pass = received >= min && received <= max;
    return {
      message: () => `expected ${received} to be within range ${min} - ${max}`,
      pass: pass
    };
  }
});

// Cleanup after tests
afterEach(() => {
  jest.clearAllMocks();
});