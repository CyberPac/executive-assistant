/**
 * Basic Infrastructure Tests
 * Tests that don't require full TypeScript compilation
 */

describe('Test Infrastructure Validation', () => {
  test('Jest is working correctly', () => {
    expect(true).toBe(true);
    expect(typeof jest).toBe('object');
    expect(typeof describe).toBe('function');
    expect(typeof test).toBe('function');
    expect(typeof expect).toBe('function');
  });

  test('Node.js environment is available', () => {
    expect(typeof process).toBe('object');
    expect(typeof require).toBe('function');
    expect(process.env.NODE_ENV).toBeDefined();
  });

  test('Mock functions work correctly', () => {
    const mockFn = jest.fn();
    mockFn('test');
    
    expect(mockFn).toHaveBeenCalled();
    expect(mockFn).toHaveBeenCalledWith('test');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('Async testing works', async () => {
    const asyncFunction = jest.fn().mockResolvedValue('async result');
    const result = await asyncFunction();
    
    expect(result).toBe('async result');
    expect(asyncFunction).toHaveBeenCalled();
  });

  test('Error handling works', () => {
    const errorFn = () => {
      throw new Error('Test error');
    };
    
    expect(errorFn).toThrow('Test error');
    expect(errorFn).toThrow(Error);
  });

  test('Timeout handling works', async () => {
    const slowFunction = () => new Promise(resolve => {
      setTimeout(() => resolve('completed'), 100);
    });
    
    const result = await slowFunction();
    expect(result).toBe('completed');
  }, 1000);

  test('Array and object matchers work', () => {
    const testArray = [1, 2, 3, 4, 5];
    const testObject = { name: 'test', value: 42 };
    
    expect(testArray).toHaveLength(5);
    expect(testArray).toContain(3);
    expect(testArray).toEqual(expect.arrayContaining([1, 2, 3]));
    
    expect(testObject).toHaveProperty('name');
    expect(testObject).toHaveProperty('value', 42);
    expect(testObject).toMatchObject({ name: 'test' });
  });
});

describe('Module System Tests', () => {
  test('Can require Node.js built-in modules', () => {
    const fs = require('fs');
    const path = require('path');
    const util = require('util');
    
    expect(typeof fs).toBe('object');
    expect(typeof path).toBe('object');
    expect(typeof util).toBe('object');
    
    expect(typeof fs.existsSync).toBe('function');
    expect(typeof path.join).toBe('function');
    expect(typeof util.format).toBe('function');
  });

  test('Package.json is accessible', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson).toBeDefined();
    expect(packageJson.name).toBe('personal-executive-assistant');
    expect(packageJson.version).toBe('2.0.0-phase2');
    expect(packageJson.scripts).toHaveProperty('test');
  });

  test('Basic file system operations work', () => {
    const fs = require('fs');
    const path = require('path');
    
    const projectRoot = path.join(__dirname, '..');
    const packageJsonPath = path.join(projectRoot, 'package.json');
    
    expect(fs.existsSync(projectRoot)).toBe(true);
    expect(fs.existsSync(packageJsonPath)).toBe(true);
    
    const srcDir = path.join(projectRoot, 'src');
    expect(fs.existsSync(srcDir)).toBe(true);
  });
});

describe('Mock Configuration Tests', () => {
  test('better-sqlite3 mock is working', () => {
    const Database = require('better-sqlite3');
    const db = new Database();
    
    expect(db).toBeDefined();
    expect(typeof db.prepare).toBe('function');
    expect(typeof db.close).toBe('function');
    
    const stmt = db.prepare('SELECT * FROM test');
    expect(stmt).toBeDefined();
    expect(typeof stmt.run).toBe('function');
  });

  test('WebSocket mock is working', () => {
    const { WebSocket } = require('ws');
    const ws = new WebSocket();
    
    expect(ws).toBeDefined();
    expect(typeof ws.on).toBe('function');
    expect(typeof ws.send).toBe('function');
    expect(typeof ws.close).toBe('function');
    expect(ws.readyState).toBe(1);
  });

  test('nanoid mock is working', () => {
    const { nanoid } = require('nanoid');
    const id = nanoid();
    
    expect(id).toBe('test-id-123');
    expect(typeof nanoid).toBe('function');
  });
});

describe('Test Utilities Validation', () => {
  test('Custom matchers are available', () => {
    const testNumber = 5;
    expect(testNumber).toBeWithinRange(1, 10);
    
    expect(() => {
      expect(15).toBeWithinRange(1, 10);
    }).toThrow();
  });

  test('Console mocks are working', () => {
    console.log('This should be mocked');
    console.warn('This should be mocked');
    console.error('This should be mocked');
    
    expect(console.log).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  test('Jest cleanup works between tests', () => {
    const mockFn = jest.fn();
    mockFn('first call');
    
    // This should not interfere with other tests due to afterEach cleanup
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe('Performance Testing Infrastructure', () => {
  test('Performance timing works', () => {
    const start = performance.now();
    
    // Simulate some work
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += i;
    }
    
    const duration = performance.now() - start;
    
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThan(1000); // Should complete quickly
    expect(sum).toBe(499500); // Verify the work actually happened
  });

  test('Memory usage tracking works', () => {
    const initialMemory = process.memoryUsage();
    
    // Create some objects to use memory
    const largeArray = Array(10000).fill(0).map((_, i) => ({ id: i, data: 'test data' }));
    
    const finalMemory = process.memoryUsage();
    
    expect(initialMemory).toHaveProperty('heapUsed');
    expect(finalMemory).toHaveProperty('heapUsed');
    expect(finalMemory.heapUsed).toBeGreaterThan(initialMemory.heapUsed);
    
    // Clean up
    largeArray.length = 0;
  });
});