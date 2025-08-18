/**
 * Comprehensive Unit Tests for Logger System
 * Testing logging functionality, levels, contexts, and history management
 */

import {
  Logger,
  ILogger,
  LogLevel,
  LogEntry,
  LoggerConfig,
  defaultLogger,
  createLogger
} from '../../../src/core/logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger();
    // Spy on console methods to verify output
    consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    logger.clearHistory();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const log = new Logger();
      expect(log.getLevel()).toBe(LogLevel.INFO);
      expect(log.getHistory()).toEqual([]);
    });

    it('should initialize with custom configuration', () => {
      const config: Partial<LoggerConfig> = {
        level: LogLevel.DEBUG,
        enableConsole: false,
        enableFile: true,
        enableJson: true,
        enableColors: false,
        filePath: './test.log',
        maxFileSize: 1024,
        maxFiles: 5
      };

      const log = new Logger(config);
      expect(log.getLevel()).toBe(LogLevel.DEBUG);
    });

    it('should initialize with context', () => {
      const context = { agentId: 'test-agent', taskId: 'task-123' };
      const log = new Logger({}, context);
      
      log.info('Test message');
      const history = log.getHistory();
      
      expect(history[0].context).toMatchObject(context);
      expect(history[0].agentId).toBe('test-agent');
      expect(history[0].taskId).toBe('task-123');
    });

    it('should merge configuration with defaults', () => {
      const config: Partial<LoggerConfig> = {
        level: LogLevel.WARN,
        enableColors: false
      };

      const log = new Logger(config);
      expect(log.getLevel()).toBe(LogLevel.WARN);
    });
  });

  describe('Log Levels', () => {
    it('should have correct log level hierarchy', () => {
      expect(LogLevel.TRACE).toBe(0);
      expect(LogLevel.DEBUG).toBe(1);
      expect(LogLevel.INFO).toBe(2);
      expect(LogLevel.WARN).toBe(3);
      expect(LogLevel.ERROR).toBe(4);
      expect(LogLevel.FATAL).toBe(5);
    });

    it('should respect minimum log level', () => {
      logger.setLevel(LogLevel.WARN);
      
      logger.trace('trace message');
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      const history = logger.getHistory();
      expect(history).toHaveLength(2); // Only warn and error
      expect(history[0].level).toBe(LogLevel.ERROR);
      expect(history[1].level).toBe(LogLevel.WARN);
    });

    it('should log all levels when set to TRACE', () => {
      logger.setLevel(LogLevel.TRACE);
      
      logger.trace('trace message');
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      logger.fatal('fatal message');
      
      const history = logger.getHistory();
      expect(history).toHaveLength(6);
    });

    it('should support setting and getting log level', () => {
      expect(logger.getLevel()).toBe(LogLevel.INFO);
      
      logger.setLevel(LogLevel.DEBUG);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
      
      logger.setLevel(LogLevel.ERROR);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });
  });

  describe('Log Methods', () => {
    beforeEach(() => {
      logger.setLevel(LogLevel.TRACE); // Allow all log levels
    });

    it('should log trace messages', () => {
      const message = 'Trace message';
      const context = { detail: 'trace detail' };
      
      logger.trace(message, context);
      
      const history = logger.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].level).toBe(LogLevel.TRACE);
      expect(history[0].message).toBe(message);
      expect(history[0].context).toMatchObject(context);
    });

    it('should log debug messages', () => {
      const message = 'Debug message';
      const context = { variable: 'value' };
      
      logger.debug(message, context);
      
      const history = logger.getHistory();
      expect(history[0].level).toBe(LogLevel.DEBUG);
      expect(history[0].message).toBe(message);
      expect(history[0].context).toMatchObject(context);
    });

    it('should log info messages', () => {
      const message = 'Info message';
      
      logger.info(message);
      
      const history = logger.getHistory();
      expect(history[0].level).toBe(LogLevel.INFO);
      expect(history[0].message).toBe(message);
    });

    it('should log warning messages', () => {
      const message = 'Warning message';
      const context = { warning: 'deprecation' };
      
      logger.warn(message, context);
      
      const history = logger.getHistory();
      expect(history[0].level).toBe(LogLevel.WARN);
      expect(history[0].message).toBe(message);
      expect(history[0].context).toMatchObject(context);
    });

    it('should log error messages with Error object', () => {
      const message = 'Error occurred';
      const error = new Error('Test error');
      const context = { operation: 'test' };
      
      logger.error(message, error, context);
      
      const history = logger.getHistory();
      expect(history[0].level).toBe(LogLevel.ERROR);
      expect(history[0].message).toBe(message);
      expect(history[0].context?.error).toBe(error.message);
      expect(history[0].context?.stack).toBe(error.stack);
      expect(history[0].context?.operation).toBe('test');
    });

    it('should log error messages without Error object', () => {
      const message = 'Simple error';
      
      logger.error(message);
      
      const history = logger.getHistory();
      expect(history[0].level).toBe(LogLevel.ERROR);
      expect(history[0].message).toBe(message);
    });

    it('should log fatal messages with Error object', () => {
      const message = 'Fatal error';
      const error = new Error('Fatal test error');
      
      logger.fatal(message, error);
      
      const history = logger.getHistory();
      expect(history[0].level).toBe(LogLevel.FATAL);
      expect(history[0].message).toBe(message);
      expect(history[0].context?.error).toBe(error.message);
      expect(history[0].context?.stack).toBe(error.stack);
    });

    it('should include timestamp in log entries', () => {
      const beforeLog = new Date();
      logger.info('Test message');
      const afterLog = new Date();
      
      const history = logger.getHistory();
      const logTime = history[0].timestamp;
      
      expect(logTime).toBeInstanceOf(Date);
      expect(logTime.getTime()).toBeGreaterThanOrEqual(beforeLog.getTime());
      expect(logTime.getTime()).toBeLessThanOrEqual(afterLog.getTime());
    });

    it('should merge context with existing logger context', () => {
      const baseContext = { agentId: 'agent-123', component: 'test' };
      const contextLogger = new Logger({}, baseContext);
      
      const additionalContext = { operation: 'test-operation' };
      contextLogger.info('Test message', additionalContext);
      
      const history = contextLogger.getHistory();
      expect(history[0].context).toMatchObject({
        ...baseContext,
        ...additionalContext
      });
    });
  });

  describe('Child Logger', () => {
    it('should create child logger with additional context', () => {
      const parentContext = { service: 'parent' };
      const parentLogger = new Logger({}, parentContext);
      
      const childContext = { operation: 'child-op' };
      const childLogger = parentLogger.child(childContext);
      
      childLogger.info('Child message');
      
      const history = childLogger.getHistory();
      expect(history[0].context).toMatchObject({
        ...parentContext,
        ...childContext
      });
    });

    it('should inherit configuration from parent', () => {
      const config: Partial<LoggerConfig> = {
        level: LogLevel.ERROR,
        enableColors: false
      };
      
      const parentLogger = new Logger(config);
      const childLogger = parentLogger.child({ childId: 'test' });
      
      expect(childLogger.getLevel()).toBe(LogLevel.ERROR);
    });

    it('should create independent history for child logger', () => {
      const parentLogger = new Logger();
      const childLogger = parentLogger.child({ child: true });
      
      parentLogger.info('Parent message');
      childLogger.info('Child message');
      
      expect(parentLogger.getHistory()).toHaveLength(1);
      expect(childLogger.getHistory()).toHaveLength(1);
      expect(parentLogger.getHistory()[0].message).toBe('Parent message');
      expect(childLogger.getHistory()[0].message).toBe('Child message');
    });

    it('should support nested child loggers', () => {
      const rootLogger = new Logger({}, { root: true });
      const childLogger = rootLogger.child({ level: 1 });
      const grandChildLogger = childLogger.child({ level: 2 });
      
      grandChildLogger.info('Nested message');
      
      const history = grandChildLogger.getHistory();
      expect(history[0].context).toMatchObject({
        root: true,
        level: 2
      });
    });
  });

  describe('History Management', () => {
    beforeEach(() => {
      logger.setLevel(LogLevel.TRACE);
    });

    it('should maintain log history', () => {
      logger.info('Message 1');
      logger.warn('Message 2');
      logger.error('Message 3');
      
      const history = logger.getHistory();
      expect(history).toHaveLength(3);
      expect(history[0].message).toBe('Message 3'); // Most recent first
      expect(history[1].message).toBe('Message 2');
      expect(history[2].message).toBe('Message 1');
    });

    it('should filter history by log level', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      const errorAndAbove = logger.getHistory(LogLevel.ERROR);
      expect(errorAndAbove).toHaveLength(1);
      expect(errorAndAbove[0].level).toBe(LogLevel.ERROR);
      
      const warnAndAbove = logger.getHistory(LogLevel.WARN);
      expect(warnAndAbove).toHaveLength(2);
      expect(warnAndAbove[0].level).toBe(LogLevel.ERROR);
      expect(warnAndAbove[1].level).toBe(LogLevel.WARN);
    });

    it('should limit history results', () => {
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }
      
      const limitedHistory = logger.getHistory(undefined, 5);
      expect(limitedHistory).toHaveLength(5);
      
      // Should return most recent
      expect(limitedHistory[0].message).toBe('Message 9');
      expect(limitedHistory[4].message).toBe('Message 5');
    });

    it('should combine level filter and limit', () => {
      for (let i = 0; i < 5; i++) {
        logger.info(`Info ${i}`);
        logger.error(`Error ${i}`);
      }
      
      const filteredLimited = logger.getHistory(LogLevel.ERROR, 3);
      expect(filteredLimited).toHaveLength(3);
      filteredLimited.forEach(entry => {
        expect(entry.level).toBe(LogLevel.ERROR);
      });
    });

    it('should maintain maximum history size', () => {
      // Create logger with small history limit (internal maxHistorySize is 1000)
      const entries = 1200;
      
      for (let i = 0; i < entries; i++) {
        logger.info(`Message ${i}`);
      }
      
      const history = logger.getHistory();
      expect(history.length).toBeLessThanOrEqual(1000);
      
      // Should contain most recent entries
      expect(history[0].message).toBe('Message 1199');
    });

    it('should clear history', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      expect(logger.getHistory()).toHaveLength(2);
      
      logger.clearHistory();
      expect(logger.getHistory()).toHaveLength(0);
    });

    it('should sort history by timestamp descending', () => {
      const now = Date.now();
      
      logger.info('First message');
      
      // Mock different timestamp
      jest.spyOn(Date, 'now').mockReturnValue(now + 1000);
      logger.info('Second message');
      
      jest.spyOn(Date, 'now').mockReturnValue(now + 2000);
      logger.info('Third message');
      
      const history = logger.getHistory();
      expect(history[0].message).toBe('Third message'); // Most recent
      expect(history[1].message).toBe('Second message');
      expect(history[2].message).toBe('First message'); // Oldest
      
      jest.restoreAllMocks();
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      logger.setLevel(LogLevel.TRACE);
    });

    it('should provide accurate statistics', () => {
      logger.trace('Trace 1');
      logger.debug('Debug 1');
      logger.debug('Debug 2');
      logger.info('Info 1');
      logger.warn('Warn 1');
      logger.error('Error 1');
      logger.fatal('Fatal 1');
      
      const stats = logger.getStats();
      
      expect(stats.totalLogs).toBe(7);
      expect(stats.logsByLevel.TRACE).toBe(1);
      expect(stats.logsByLevel.DEBUG).toBe(2);
      expect(stats.logsByLevel.INFO).toBe(1);
      expect(stats.logsByLevel.WARN).toBe(1);
      expect(stats.logsByLevel.ERROR).toBe(1);
      expect(stats.logsByLevel.FATAL).toBe(1);
      expect(stats.historySize).toBe(7);
    });

    it('should handle empty statistics', () => {
      const stats = logger.getStats();
      
      expect(stats.totalLogs).toBe(0);
      expect(stats.logsByLevel).toEqual({});
      expect(stats.historySize).toBe(0);
    });

    it('should update statistics as logs are added', () => {
      logger.info('First message');
      let stats = logger.getStats();
      expect(stats.totalLogs).toBe(1);
      
      logger.error('Second message');
      stats = logger.getStats();
      expect(stats.totalLogs).toBe(2);
      expect(stats.logsByLevel.INFO).toBe(1);
      expect(stats.logsByLevel.ERROR).toBe(1);
    });
  });

  describe('Console Output', () => {
    it('should output to console when enabled', () => {
      const config: Partial<LoggerConfig> = {
        enableConsole: true,
        level: LogLevel.TRACE
      };
      const consoleLogger = new Logger(config);
      
      consoleLogger.info('Test info message');
      
      expect(console.info).toHaveBeenCalledTimes(1);
      const output = (console.info as jest.Mock).mock.calls[0][0];
      expect(output).toContain('INFO');
      expect(output).toContain('Test info message');
    });

    it('should not output to console when disabled', () => {
      const config: Partial<LoggerConfig> = {
        enableConsole: false
      };
      const consoleLogger = new Logger(config);
      
      consoleLogger.info('Test message');
      
      expect(console.info).not.toHaveBeenCalled();
    });

    it('should use appropriate console methods for different levels', () => {
      const config: Partial<LoggerConfig> = {
        enableConsole: true,
        level: LogLevel.TRACE
      };
      const consoleLogger = new Logger(config);
      
      jest.spyOn(console, 'debug').mockImplementation();
      jest.spyOn(console, 'info').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();
      
      consoleLogger.trace('Trace message');
      consoleLogger.debug('Debug message');
      consoleLogger.info('Info message');
      consoleLogger.warn('Warn message');
      consoleLogger.error('Error message');
      consoleLogger.fatal('Fatal message');
      
      expect(console.debug).toHaveBeenCalledTimes(2); // trace and debug
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(2); // error and fatal
    });

    it('should include context in console output', () => {
      const config: Partial<LoggerConfig> = {
        enableConsole: true
      };
      const consoleLogger = new Logger(config);
      
      consoleLogger.info('Test message', { context: 'test', value: 42 });
      
      const output = (console.info as jest.Mock).mock.calls[0][0];
      expect(output).toContain('Test message');
      expect(output).toContain('context');
      expect(output).toContain('test');
      expect(output).toContain('42');
    });

    it('should format timestamp in console output', () => {
      const config: Partial<LoggerConfig> = {
        enableConsole: true
      };
      const consoleLogger = new Logger(config);
      
      consoleLogger.info('Test message');
      
      const output = (console.info as jest.Mock).mock.calls[0][0];
      expect(output).toMatch(/^\[[\d-T:.Z]+\]/); // ISO timestamp format
    });
  });

  describe('Default Logger and Factory', () => {
    it('should provide default logger instance', () => {
      expect(defaultLogger).toBeInstanceOf(Logger);
      expect(defaultLogger.getLevel()).toBe(LogLevel.INFO);
    });

    it('should create logger with factory function', () => {
      const context = { component: 'test' };
      const config = { level: LogLevel.DEBUG };
      
      const factoryLogger = createLogger(context, config);
      
      expect(factoryLogger).toBeInstanceOf(Logger);
      expect(factoryLogger.getLevel()).toBe(LogLevel.DEBUG);
      
      factoryLogger.info('Test message');
      const history = factoryLogger.getHistory();
      expect(history[0].context).toMatchObject(context);
    });

    it('should create logger with factory function using defaults', () => {
      const context = { service: 'test-service' };
      const factoryLogger = createLogger(context);
      
      expect(factoryLogger.getLevel()).toBe(LogLevel.INFO);
      
      factoryLogger.info('Test message');
      const history = factoryLogger.getHistory();
      expect(history[0].context).toMatchObject(context);
    });
  });

  describe('Interface Compliance', () => {
    it('should implement ILogger interface', () => {
      const log: ILogger = new Logger();
      
      expect(typeof log.trace).toBe('function');
      expect(typeof log.debug).toBe('function');
      expect(typeof log.info).toBe('function');
      expect(typeof log.warn).toBe('function');
      expect(typeof log.error).toBe('function');
      expect(typeof log.fatal).toBe('function');
      expect(typeof log.child).toBe('function');
      expect(typeof log.setLevel).toBe('function');
      expect(typeof log.getLevel).toBe('function');
    });

    it('should maintain interface contract for child loggers', () => {
      const parentLogger: ILogger = new Logger();
      const childLogger: ILogger = parentLogger.child({ test: true });
      
      expect(childLogger).toBeInstanceOf(Logger);
      expect(typeof childLogger.info).toBe('function');
      expect(typeof childLogger.child).toBe('function');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined messages', () => {
      expect(() => {
        logger.info(null as any);
        logger.info(undefined as any);
      }).not.toThrow();
      
      const history = logger.getHistory();
      expect(history).toHaveLength(2);
    });

    it('should handle complex context objects', () => {
      const complexContext = {
        nested: { deep: { value: 42 } },
        array: [1, 2, 3],
        date: new Date(),
        regexp: /test/gi,
        func: () => 'test'
      };
      
      logger.info('Complex context', complexContext);
      
      const history = logger.getHistory();
      expect(history[0].context).toMatchObject({
        nested: { deep: { value: 42 } },
        array: [1, 2, 3]
      });
    });

    it('should handle circular references in context', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      expect(() => {
        logger.info('Circular reference test', circular);
      }).not.toThrow();
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(10000);
      
      expect(() => {
        logger.info(longMessage);
      }).not.toThrow();
      
      const history = logger.getHistory();
      expect(history[0].message).toBe(longMessage);
    });

    it('should handle invalid log levels gracefully', () => {
      expect(() => {
        logger.setLevel(-1 as LogLevel);
        logger.setLevel(999 as LogLevel);
      }).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle high-frequency logging efficiently', () => {
      logger.setLevel(LogLevel.TRACE);
      
      const startTime = Date.now();
      const logCount = 1000;
      
      for (let i = 0; i < logCount; i++) {
        logger.info(`Message ${i}`, { index: i });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
      expect(logger.getHistory()).toHaveLength(logCount);
    });

    it('should not impact performance when logging below threshold', () => {
      logger.setLevel(LogLevel.ERROR);
      
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        logger.debug(`Debug message ${i}`); // Below threshold
        logger.info(`Info message ${i}`);   // Below threshold
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should be very fast
      expect(logger.getHistory()).toHaveLength(0); // No logs should be recorded
    });
  });
});