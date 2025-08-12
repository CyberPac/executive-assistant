/**
 * Logger Interface - Core Logging System
 * Provides structured logging capabilities for the PEA system
 */

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  source?: string;
  agentId?: string;
  taskId?: string;
  error?: Error;
}

export interface ILogger {
  /**
   * Log a trace message
   */
  trace(message: string, context?: Record<string, any>): void;
  
  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>): void;
  
  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>): void;
  
  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>): void;
  
  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: Record<string, any>): void;
  
  /**
   * Log a fatal error message
   */
  fatal(message: string, error?: Error, context?: Record<string, any>): void;
  
  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, any>): ILogger;
  
  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void;
  
  /**
   * Get current log level
   */
  getLevel(): LogLevel;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
  enableJson: boolean;
  enableColors: boolean;
  timestampFormat?: string;
}

/**
 * Enhanced Logger Implementation
 */
export class Logger implements ILogger {
  private config: LoggerConfig;
  private context: Record<string, any>;
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 1000;

  constructor(config: Partial<LoggerConfig> = {}, context: Record<string, any> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableJson: false,
      enableColors: true,
      timestampFormat: 'ISO',
      ...config
    };
    this.context = context;
  }

  trace(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, { ...context, error: error?.message, stack: error?.stack });
  }

  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, { ...context, error: error?.message, stack: error?.stack });
  }

  child(context: Record<string, any>): ILogger {
    return new Logger(this.config, { ...this.context, ...context });
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  getLevel(): LogLevel {
    return this.config.level;
  }

  /**
   * Get log history
   */
  getHistory(level?: LogLevel, limit?: number): LogEntry[] {
    let history = this.logHistory;
    
    if (level !== undefined) {
      history = history.filter(entry => entry.level >= level);
    }
    
    if (limit) {
      history = history.slice(-limit);
    }
    
    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Get logger statistics
   */
  getStats(): {
    totalLogs: number;
    logsByLevel: Record<string, number>;
    historySize: number;
  } {
    const logsByLevel: Record<string, number> = {};
    
    this.logHistory.forEach(entry => {
      const levelName = LogLevel[entry.level];
      logsByLevel[levelName] = (logsByLevel[levelName] || 0) + 1;
    });

    return {
      totalLogs: this.logHistory.length,
      logsByLevel,
      historySize: this.logHistory.length
    };
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: { ...this.context, ...context },
      source: this.context.source,
      agentId: this.context.agentId,
      taskId: this.context.taskId
    };

    // Add to history
    this.addToHistory(entry);

    // Output to console if enabled
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Output to file if enabled
    if (this.config.enableFile && this.config.filePath) {
      this.outputToFile(entry);
    }
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    
    // Trim history if it exceeds max size
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.maxHistorySize);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context && Object.keys(entry.context).length > 0 
      ? ` ${JSON.stringify(entry.context)}` 
      : '';

    let output = `[${timestamp}] ${levelName}: ${entry.message}${contextStr}`;

    // Add colors if enabled
    if (this.config.enableColors) {
      output = this.colorizeOutput(output, entry.level);
    }

    // Use appropriate console method
    switch (entry.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      case LogLevel.INFO:
        console.info(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(output);
        break;
    }
  }

  private outputToFile(_entry: LogEntry): void {
    // File output would be implemented here
    // For now, just a placeholder
  }

  private colorizeOutput(output: string, level: LogLevel): string {
    const colors = {
      [LogLevel.TRACE]: '\x1b[37m', // white
      [LogLevel.DEBUG]: '\x1b[36m', // cyan
      [LogLevel.INFO]: '\x1b[32m',  // green
      [LogLevel.WARN]: '\x1b[33m',  // yellow
      [LogLevel.ERROR]: '\x1b[31m', // red
      [LogLevel.FATAL]: '\x1b[35m'  // magenta
    };

    const reset = '\x1b[0m';
    return `${colors[level]}${output}${reset}`;
  }
}

// Default logger instance
export const defaultLogger = new Logger({
  level: LogLevel.INFO,
  enableConsole: true,
  enableColors: true
});

// Helper function to create context-aware loggers
export function createLogger(context: Record<string, any>, config?: Partial<LoggerConfig>): ILogger {
  return new Logger(config, context);
}