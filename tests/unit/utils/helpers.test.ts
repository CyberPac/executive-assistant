/**
 * Comprehensive Unit Tests for Utility Helper Functions
 * Testing all utility functions for edge cases, error handling, and performance
 */

import {
  generateId,
  sleep,
  retry,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  isObject,
  formatBytes,
  formatDuration,
  isValidEmail,
  sanitizeFilename,
  simpleHash,
  parseDuration,
  timeout,
  chunk,
  unique,
  randomItem,
  shuffle
} from '../../../src/utils/helpers';

describe('Utility Helper Functions', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should generate IDs with prefix', () => {
      const prefix = 'test';
      const id = generateId(prefix);
      
      expect(id.startsWith(`${prefix}_`)).toBe(true);
    });

    it('should generate IDs without prefix', () => {
      const id = generateId();
      
      expect(id).toMatch(/^[a-z0-9]+_[a-z0-9]+$/);
    });

    it('should handle empty prefix', () => {
      const id = generateId('');
      
      expect(id.startsWith('_')).toBe(true);
    });

    it('should generate different IDs in rapid succession', () => {
      const ids = Array.from({ length: 100 }, () => generateId());
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(100);
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should resolve after specified milliseconds', async () => {
      const startTime = Date.now();
      await sleep(100);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
    });

    it('should handle zero milliseconds', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });

    it('should handle negative milliseconds', async () => {
      await expect(sleep(-100)).resolves.toBeUndefined();
    });

    it('should return a Promise', () => {
      const result = sleep(100);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('retry', () => {
    let attemptCount: number;
    let mockFunction: jest.Mock;

    beforeEach(() => {
      jest.useRealTimers();
      attemptCount = 0;
      mockFunction = jest.fn();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should succeed on first attempt', async () => {
      mockFunction.mockResolvedValue('success');
      
      const result = await retry(mockFunction);
      
      expect(result).toBe('success');
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      mockFunction
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValue('success');
      
      const result = await retry(mockFunction, { maxRetries: 3, initialDelay: 10 });
      
      expect(result).toBe('success');
      expect(mockFunction).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exceeded', async () => {
      const error = new Error('Persistent failure');
      mockFunction.mockRejectedValue(error);
      
      await expect(retry(mockFunction, { maxRetries: 2, initialDelay: 10 }))
        .rejects.toThrow('Persistent failure');
      
      expect(mockFunction).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      
      global.setTimeout = jest.fn((callback, delay) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0);
      });
      
      mockFunction
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');
      
      await retry(mockFunction, {
        maxRetries: 2,
        initialDelay: 100,
        backoffMultiplier: 2
      });
      
      expect(delays).toEqual([100, 200]);
      
      global.setTimeout = originalSetTimeout;
    });

    it('should respect max delay', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      
      global.setTimeout = jest.fn((callback, delay) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0);
      });
      
      mockFunction
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');
      
      await retry(mockFunction, {
        maxRetries: 2,
        initialDelay: 1000,
        backoffMultiplier: 3,
        maxDelay: 1500
      });
      
      expect(delays[0]).toBe(1000);
      expect(delays[1]).toBe(1500); // Capped at maxDelay
      
      global.setTimeout = originalSetTimeout;
    });

    it('should use default options', async () => {
      mockFunction.mockRejectedValue(new Error('Always fails'));
      
      await expect(retry(mockFunction)).rejects.toThrow('Always fails');
      
      expect(mockFunction).toHaveBeenCalledTimes(4); // Initial + 3 default retries
    });
  });

  describe('debounce', () => {
    let mockFunction: jest.Mock;
    let debouncedFunction: (...args: any[]) => void;

    beforeEach(() => {
      mockFunction = jest.fn();
      debouncedFunction = debounce(mockFunction, 100);
    });

    it('should delay function execution', () => {
      debouncedFunction('arg1', 'arg2');
      
      expect(mockFunction).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should cancel previous calls when called again', () => {
      debouncedFunction('first');
      jest.advanceTimersByTime(50);
      
      debouncedFunction('second');
      jest.advanceTimersByTime(50);
      
      expect(mockFunction).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50);
      
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockFunction).toHaveBeenCalledWith('second');
    });

    it('should handle multiple rapid calls', () => {
      for (let i = 0; i < 10; i++) {
        debouncedFunction(`call-${i}`);
        jest.advanceTimersByTime(10);
      }
      
      expect(mockFunction).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockFunction).toHaveBeenCalledWith('call-9');
    });

    it('should handle zero delay', () => {
      const zeroDebouncedFunction = debounce(mockFunction, 0);
      
      zeroDebouncedFunction('test');
      jest.advanceTimersByTime(0);
      
      expect(mockFunction).toHaveBeenCalledWith('test');
    });
  });

  describe('throttle', () => {
    let mockFunction: jest.Mock;
    let throttledFunction: (...args: any[]) => void;

    beforeEach(() => {
      mockFunction = jest.fn();
      throttledFunction = throttle(mockFunction, 100);
    });

    it('should call function immediately on first call', () => {
      throttledFunction('arg1');
      
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockFunction).toHaveBeenCalledWith('arg1');
    });

    it('should ignore subsequent calls during throttle period', () => {
      throttledFunction('first');
      throttledFunction('second');
      throttledFunction('third');
      
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockFunction).toHaveBeenCalledWith('first');
    });

    it('should allow calls after throttle period', () => {
      throttledFunction('first');
      expect(mockFunction).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(100);
      
      throttledFunction('second');
      expect(mockFunction).toHaveBeenCalledTimes(2);
      expect(mockFunction).toHaveBeenLastCalledWith('second');
    });

    it('should handle rapid calls correctly', () => {
      throttledFunction('call-1');
      
      for (let i = 2; i <= 10; i++) {
        jest.advanceTimersByTime(10);
        throttledFunction(`call-${i}`);
      }
      
      expect(mockFunction).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(50);
      throttledFunction('final-call');
      
      expect(mockFunction).toHaveBeenCalledTimes(2);
      expect(mockFunction).toHaveBeenLastCalledWith('final-call');
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('string')).toBe('string');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });

    it('should clone Date objects', () => {
      const date = new Date('2023-01-01');
      const cloned = deepClone(date);
      
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
      expect(cloned).toBeInstanceOf(Date);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, [3, 4], { a: 5 }];
      const cloned = deepClone(arr);
      
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[2]).not.toBe(arr[2]);
      expect(cloned[3]).not.toBe(arr[3]);
    });

    it('should clone objects deeply', () => {
      const obj = {
        a: 1,
        b: 'string',
        c: {
          d: [1, 2, 3],
          e: {
            f: 'deep'
          }
        }
      };
      
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.c).not.toBe(obj.c);
      expect(cloned.c.d).not.toBe(obj.c.d);
      expect(cloned.c.e).not.toBe(obj.c.e);
    });

    it('should handle circular references gracefully', () => {
      const obj: any = { a: 1 };
      obj.self = obj;
      
      // Should not throw but may not handle circular references perfectly
      expect(() => deepClone(obj)).not.toThrow();
    });

    it('should clone empty objects and arrays', () => {
      expect(deepClone({})).toEqual({});
      expect(deepClone([])).toEqual([]);
    });

    it('should preserve property descriptors', () => {
      const obj = {};
      Object.defineProperty(obj, 'prop', {
        value: 42,
        writable: false,
        enumerable: true,
        configurable: false
      });
      
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
    });
  });

  describe('deepMerge', () => {
    it('should merge simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      
      const result = deepMerge(target, source);
      
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
      expect(result).toBe(target); // Mutates target
    });

    it('should merge nested objects', () => {
      const target = {
        a: 1,
        nested: {
          x: 1,
          y: 2
        }
      };
      
      const source = {
        b: 2,
        nested: {
          y: 3,
          z: 4
        }
      };
      
      const result = deepMerge(target, source);
      
      expect(result).toEqual({
        a: 1,
        b: 2,
        nested: {
          x: 1,
          y: 3,
          z: 4
        }
      });
    });

    it('should handle multiple sources', () => {
      const target = { a: 1 };
      const source1 = { b: 2 };
      const source2 = { c: 3 };
      const source3 = { d: 4 };
      
      const result = deepMerge(target, source1, source2, source3);
      
      expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    it('should handle empty sources', () => {
      const target = { a: 1, b: 2 };
      const result = deepMerge(target);
      
      expect(result).toBe(target);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should handle non-object sources', () => {
      const target = { a: 1 };
      
      expect(() => deepMerge(target, null as any)).not.toThrow();
      expect(() => deepMerge(target, undefined as any)).not.toThrow();
      expect(() => deepMerge(target, 42 as any)).not.toThrow();
    });

    it('should create nested objects when target lacks them', () => {
      const target = { a: 1 };
      const source = { nested: { b: 2 } };
      
      const result = deepMerge(target, source);
      
      expect(result.nested).toEqual({ b: 2 });
    });
  });

  describe('isObject', () => {
    it('should identify objects correctly', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
      expect(isObject(new Date())).toBe(true);
      expect(isObject(/regex/)).toBe(true);
    });

    it('should reject non-objects', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject(42)).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject(() => {})).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isObject(Object.create(null))).toBe(true);
      expect(isObject(new String('test'))).toBe(true);
      expect(isObject(new Number(42))).toBe(true);
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
      expect(formatBytes(1099511627776)).toBe('1 TB');
    });

    it('should handle decimal values', () => {
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(1572864)).toBe('1.5 MB');
    });

    it('should respect decimal places parameter', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB');
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(1536, 3)).toBe('1.500 KB');
    });

    it('should handle large numbers', () => {
      expect(formatBytes(1125899906842624)).toBe('1 PB');
      expect(formatBytes(1152921504606846976)).toBe('1 EB');
    });

    it('should handle negative decimal places', () => {
      expect(formatBytes(1536, -1)).toBe('2 KB');
    });

    it('should handle small byte values', () => {
      expect(formatBytes(512)).toBe('512 Bytes');
      expect(formatBytes(1)).toBe('1 Bytes');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(999)).toBe('999ms');
    });

    it('should format seconds', () => {
      expect(formatDuration(1000)).toBe('1.0s');
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(59999)).toBe('60.0s');
    });

    it('should format minutes', () => {
      expect(formatDuration(60000)).toBe('1.0m');
      expect(formatDuration(90000)).toBe('1.5m');
      expect(formatDuration(3599999)).toBe('60.0m');
    });

    it('should format hours', () => {
      expect(formatDuration(3600000)).toBe('1.0h');
      expect(formatDuration(5400000)).toBe('1.5h');
      expect(formatDuration(86400000)).toBe('24.0h');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0ms');
    });

    it('should handle very large durations', () => {
      expect(formatDuration(86400000)).toBe('24.0h');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'firstname+lastname@example.org',
        'test123@test-domain.com',
        'a@b.co'
      ];
      
      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example',
        'test@.com',
        'test @example.com',
        '',
        'test@example..com'
      ];
      
      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('a@b.c')).toBe(true);
      expect(isValidEmail('1@2.3')).toBe(true);
      expect(isValidEmail('test@sub.domain.com')).toBe(true);
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filenames', () => {
      expect(sanitizeFilename('Hello World.txt')).toBe('hello_world.txt');
      expect(sanitizeFilename('file/with\\slashes.doc')).toBe('file_with_slashes.doc');
      expect(sanitizeFilename('special@#$%chars.pdf')).toBe('special____chars.pdf');
    });

    it('should preserve valid characters', () => {
      expect(sanitizeFilename('valid-file_name.123.txt')).toBe('valid-file_name.123.txt');
      expect(sanitizeFilename('UPPERCASE.TXT')).toBe('uppercase.txt');
    });

    it('should handle empty and special cases', () => {
      expect(sanitizeFilename('')).toBe('');
      expect(sanitizeFilename('...')).toBe('...');
      expect(sanitizeFilename('---')).toBe('---');
    });

    it('should handle unicode characters', () => {
      expect(sanitizeFilename('ñáéíóú.txt')).toBe('______.txt');
      expect(sanitizeFilename('файл.txt')).toBe('____.txt');
    });
  });

  describe('simpleHash', () => {
    it('should generate consistent hashes', () => {
      const input = 'test string';
      const hash1 = simpleHash(input);
      const hash2 = simpleHash(input);
      
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = simpleHash('string1');
      const hash2 = simpleHash('string2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', () => {
      const hash = simpleHash('');
      expect(typeof hash).toBe('string');
      expect(hash).toBe('0');
    });

    it('should handle long strings', () => {
      const longString = 'a'.repeat(10000);
      const hash = simpleHash(longString);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const specialString = '!@#$%^&*(){}[]|\\:";\'<>?,./-=_+`~';
      const hash = simpleHash(specialString);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('parseDuration', () => {
    it('should parse milliseconds', () => {
      expect(parseDuration('100ms')).toBe(100);
      expect(parseDuration('1500ms')).toBe(1500);
    });

    it('should parse seconds', () => {
      expect(parseDuration('5s')).toBe(5000);
      expect(parseDuration('30s')).toBe(30000);
    });

    it('should parse minutes', () => {
      expect(parseDuration('2m')).toBe(120000);
      expect(parseDuration('10m')).toBe(600000);
    });

    it('should parse hours', () => {
      expect(parseDuration('1h')).toBe(3600000);
      expect(parseDuration('24h')).toBe(86400000);
    });

    it('should parse days', () => {
      expect(parseDuration('1d')).toBe(86400000);
      expect(parseDuration('7d')).toBe(604800000);
    });

    it('should handle case insensitive units', () => {
      expect(parseDuration('5S')).toBe(5000);
      expect(parseDuration('2M')).toBe(120000);
      expect(parseDuration('1H')).toBe(3600000);
      expect(parseDuration('1D')).toBe(86400000);
    });

    it('should throw for invalid formats', () => {
      expect(() => parseDuration('invalid')).toThrow('Invalid duration format');
      expect(() => parseDuration('5')).toThrow('Invalid duration format');
      expect(() => parseDuration('5x')).toThrow('Unknown duration unit');
      expect(() => parseDuration('')).toThrow('Invalid duration format');
    });

    it('should handle zero values', () => {
      expect(parseDuration('0ms')).toBe(0);
      expect(parseDuration('0s')).toBe(0);
      expect(parseDuration('0m')).toBe(0);
    });
  });

  describe('timeout', () => {
    beforeEach(() => {
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should resolve when promise resolves before timeout', async () => {
      const fastPromise = Promise.resolve('success');
      
      const result = await timeout(fastPromise, 1000);
      expect(result).toBe('success');
    });

    it('should reject when timeout expires before promise resolves', async () => {
      const slowPromise = new Promise(resolve => setTimeout(() => resolve('late'), 200));
      
      await expect(timeout(slowPromise, 100))
        .rejects.toThrow('Operation timed out after 100ms');
    });

    it('should reject when promise rejects before timeout', async () => {
      const rejectingPromise = Promise.reject(new Error('promise error'));
      
      await expect(timeout(rejectingPromise, 1000))
        .rejects.toThrow('promise error');
    });

    it('should handle zero timeout', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('value'), 10));
      
      await expect(timeout(promise, 0))
        .rejects.toThrow('Operation timed out after 0ms');
    });
  });

  describe('chunk', () => {
    it('should chunk arrays correctly', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const chunked = chunk(array, 3);
      
      expect(chunked).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]);
    });

    it('should handle arrays not evenly divisible by chunk size', () => {
      const array = [1, 2, 3, 4, 5];
      const chunked = chunk(array, 3);
      
      expect(chunked).toEqual([
        [1, 2, 3],
        [4, 5]
      ]);
    });

    it('should handle empty arrays', () => {
      const chunked = chunk([], 3);
      expect(chunked).toEqual([]);
    });

    it('should handle chunk size larger than array', () => {
      const array = [1, 2, 3];
      const chunked = chunk(array, 5);
      
      expect(chunked).toEqual([[1, 2, 3]]);
    });

    it('should handle chunk size of 1', () => {
      const array = [1, 2, 3];
      const chunked = chunk(array, 1);
      
      expect(chunked).toEqual([[1], [2], [3]]);
    });

    it('should handle different data types', () => {
      const array = ['a', 'b', 'c', 'd'];
      const chunked = chunk(array, 2);
      
      expect(chunked).toEqual([['a', 'b'], ['c', 'd']]);
    });
  });

  describe('unique', () => {
    it('should remove duplicate primitives', () => {
      expect(unique([1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4]);
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
      expect(unique([true, false, true])).toEqual([true, false]);
    });

    it('should handle empty arrays', () => {
      expect(unique([])).toEqual([]);
    });

    it('should handle arrays with no duplicates', () => {
      expect(unique([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    it('should handle arrays with all duplicates', () => {
      expect(unique([1, 1, 1, 1])).toEqual([1]);
    });

    it('should handle mixed data types', () => {
      expect(unique([1, '1', 1, '1', true, 1])).toEqual([1, '1', true]);
    });

    it('should maintain original order', () => {
      expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
    });
  });

  describe('randomItem', () => {
    it('should return an item from the array', () => {
      const array = [1, 2, 3, 4, 5];
      const item = randomItem(array);
      
      expect(array).toContain(item);
    });

    it('should return the only item in single-item array', () => {
      const array = ['only'];
      const item = randomItem(array);
      
      expect(item).toBe('only');
    });

    it('should handle different data types', () => {
      const array = [1, 'string', true, { obj: true }, [1, 2, 3]];
      const item = randomItem(array);
      
      expect(array).toContain(item);
    });

    it('should be reasonably random', () => {
      const array = [1, 2, 3, 4, 5];
      const results = new Set();
      
      // Run many times to check randomness
      for (let i = 0; i < 100; i++) {
        results.add(randomItem(array));
      }
      
      // Should have selected multiple different items
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('shuffle', () => {
    it('should return array with same elements', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffle(array);
      
      expect(shuffled).toHaveLength(array.length);
      array.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });

    it('should not modify original array', () => {
      const array = [1, 2, 3, 4, 5];
      const original = [...array];
      const shuffled = shuffle(array);
      
      expect(array).toEqual(original);
      expect(shuffled).not.toBe(array);
    });

    it('should handle empty arrays', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('should handle single-item arrays', () => {
      expect(shuffle([1])).toEqual([1]);
    });

    it('should be reasonably random', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffles = [];
      
      // Generate multiple shuffles
      for (let i = 0; i < 20; i++) {
        shuffles.push(shuffle(array).join(','));
      }
      
      // Should produce different arrangements
      const uniqueShuffles = new Set(shuffles);
      expect(uniqueShuffles.size).toBeGreaterThan(1);
    });

    it('should handle different data types', () => {
      const array = [1, 'string', true, { obj: true }, [1, 2, 3]];
      const shuffled = shuffle(array);
      
      expect(shuffled).toHaveLength(array.length);
      array.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle very large arrays efficiently', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      
      const startTime = Date.now();
      
      const chunked = chunk(largeArray, 100);
      const uniqued = unique(largeArray.concat(largeArray));
      const shuffled = shuffle(largeArray);
      
      const endTime = Date.now();
      
      expect(chunked).toHaveLength(100);
      expect(uniqued).toHaveLength(10000);
      expect(shuffled).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(1000); // Should be fast
    });

    it('should handle null and undefined gracefully', () => {
      expect(() => formatBytes(null as any)).not.toThrow();
      expect(() => formatDuration(undefined as any)).not.toThrow();
      expect(() => isValidEmail(null as any)).not.toThrow();
      expect(() => sanitizeFilename(undefined as any)).not.toThrow();
    });

    it('should handle extreme numeric values', () => {
      expect(formatBytes(Number.MAX_SAFE_INTEGER)).toBeTruthy();
      expect(formatDuration(Number.MAX_SAFE_INTEGER)).toBeTruthy();
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatDuration(0)).toBe('0ms');
    });
  });
});