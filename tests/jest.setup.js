/**
 * Jest Setup for Executive Assistant Test Suite
 * Handles async cleanup, mocks, and test environment configuration
 */

// Global test timeout
jest.setTimeout(60000);

// Mock console to reduce noise in tests but preserve errors
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = jest.fn();
console.info = jest.fn();
console.warn = jest.fn((message) => {
  // Only show warnings for actual test issues
  if (typeof message === 'string' && message.includes('Warning')) {
    originalConsoleWarn(message);
  }
});
console.error = jest.fn((message) => {
  // Always show errors
  originalConsoleError(message);
});

// Global cleanup handlers
const cleanupHandlers = new Set();

global.addCleanupHandler = (handler) => {
  cleanupHandlers.add(handler);
};

// Clean up after each test
afterEach(async () => {
  // Run all cleanup handlers
  for (const handler of cleanupHandlers) {
    try {
      await handler();
    } catch (error) {
      console.error('Cleanup handler failed:', error);
    }
  }
  cleanupHandlers.clear();
  
  // Clear all timers
  jest.clearAllTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Global cleanup before exit
afterAll(async () => {
  // Force cleanup of any remaining resources
  if (global.gc) {
    global.gc();
  }
  
  // Small delay to allow cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Handle process cleanup
process.on('exit', () => {
  // Final cleanup
  cleanupHandlers.clear();
});

// Mock timers by default for predictable tests
jest.useFakeTimers();

// Setup global test environment
global.TEST_MODE = true;
global.NODE_ENV = 'test';

// Mock WebSocket to prevent connection attempts
jest.mock('ws', () => {
  const EventEmitter = require('events');
  
  class MockWebSocket extends EventEmitter {
    constructor() {
      super();
      this.readyState = 1; // OPEN
      this.OPEN = 1;
      this.CLOSED = 3;
      
      // Simulate connection after next tick
      process.nextTick(() => {
        this.emit('open');
      });
    }
    
    send(data) {
      // Mock send - do nothing
    }
    
    close() {
      this.readyState = 3; // CLOSED
      this.emit('close');
    }
    
    terminate() {
      this.close();
    }
  }
  
  return MockWebSocket;
});

// Mock better-sqlite3 to prevent file system operations
jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => ({
    prepare: jest.fn().mockReturnValue({
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn().mockReturnValue([]),
    }),
    exec: jest.fn(),
    close: jest.fn(),
    pragma: jest.fn(),
  }));
});

// Mock nanoid for consistent test values
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-' + Math.floor(Math.random() * 1000)),
}));

// Global error handler to catch unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Ensure proper cleanup of Node.js internals
const originalExit = process.exit;
process.exit = (code) => {
  // Run final cleanup
  cleanupHandlers.clear();
  originalExit(code);
};