/**
 * Mock Core Modules for Testing
 * Provides mock implementations for core system modules
 */

import { EventEmitter } from 'events';

// Logger Mock
export class Logger extends EventEmitter {
  private logLevel: string = 'info';
  private logs: Array<{ level: string; message: string; timestamp: Date; metadata?: any }> = [];

  constructor(context?: string) {
    super();
    this.context = context || 'test';
  }

  private context: string;

  setLevel(level: string): void {
    this.logLevel = level;
  }

  private log(level: string, message: string, metadata?: any): void {
    const entry = {
      level,
      message,
      timestamp: new Date(),
      context: this.context,
      metadata
    };
    
    this.logs.push(entry);
    this.emit('log', entry);
  }

  debug(message: string, metadata?: any): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: any): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: any): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: any): void {
    this.log('error', message, metadata);
  }

  getLogs(): typeof this.logs {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Event Bus Mock
export class EventBus extends EventEmitter {
  private subscribers: Map<string, Set<Function>> = new Map();
  private eventHistory: Array<{ event: string; data: any; timestamp: Date }> = [];

  constructor() {
    super();
    this.setMaxListeners(100); // Increase limit for testing
  }

  subscribe(event: string, callback: Function): void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(callback);
    this.on(event, callback as any);
  }

  unsubscribe(event: string, callback: Function): void {
    const subscribers = this.subscribers.get(event);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(event);
      }
    }
    this.off(event, callback as any);
  }

  publish(event: string, data?: any): void {
    this.eventHistory.push({
      event,
      data,
      timestamp: new Date()
    });
    this.emit(event, data);
  }

  getEventHistory(): typeof this.eventHistory {
    return [...this.eventHistory];
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  getSubscribersCount(event: string): number {
    return this.subscribers.get(event)?.size || 0;
  }

  async shutdown(): Promise<void> {
    this.removeAllListeners();
    this.subscribers.clear();
    this.eventHistory = [];
  }
}

// Configuration Manager Mock
export class ConfigManager {
  private config: Map<string, any> = new Map();
  private defaults: Map<string, any> = new Map();

  constructor(initialConfig?: Record<string, any>) {
    if (initialConfig) {
      Object.entries(initialConfig).forEach(([key, value]) => {
        this.config.set(key, value);
      });
    }

    // Set test defaults
    this.setDefaults({
      'app.environment': 'test',
      'app.debug': true,
      'database.url': 'sqlite://memory',
      'security.enabled': false,
      'logging.level': 'debug'
    });
  }

  setDefaults(defaults: Record<string, any>): void {
    Object.entries(defaults).forEach(([key, value]) => {
      this.defaults.set(key, value);
    });
  }

  get<T = any>(key: string, defaultValue?: T): T {
    if (this.config.has(key)) {
      return this.config.get(key);
    }
    if (this.defaults.has(key)) {
      return this.defaults.get(key);
    }
    return defaultValue as T;
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
  }

  has(key: string): boolean {
    return this.config.has(key) || this.defaults.has(key);
  }

  delete(key: string): boolean {
    return this.config.delete(key);
  }

  clear(): void {
    this.config.clear();
  }

  getAllConfig(): Record<string, any> {
    const result: Record<string, any> = {};
    
    // Add defaults first
    this.defaults.forEach((value, key) => {
      result[key] = value;
    });
    
    // Override with actual config
    this.config.forEach((value, key) => {
      result[key] = value;
    });
    
    return result;
  }
}

// Health Check Mock
export class HealthChecker {
  private checks: Map<string, Function> = new Map();
  private lastResults: Map<string, any> = new Map();

  addCheck(name: string, checkFn: Function): void {
    this.checks.set(name, checkFn);
  }

  removeCheck(name: string): boolean {
    return this.checks.delete(name);
  }

  async runCheck(name: string): Promise<any> {
    const checkFn = this.checks.get(name);
    if (!checkFn) {
      return { status: 'error', message: `Check '${name}' not found` };
    }

    try {
      const result = await checkFn();
      this.lastResults.set(name, { ...result, timestamp: new Date() });
      return result;
    } catch (error) {
      const errorResult = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
      this.lastResults.set(name, errorResult);
      return errorResult;
    }
  }

  async runAllChecks(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (const [name] of this.checks) {
      results[name] = await this.runCheck(name);
    }
    
    return results;
  }

  getLastResults(): Record<string, any> {
    const results: Record<string, any> = {};
    this.lastResults.forEach((value, key) => {
      results[key] = value;
    });
    return results;
  }

  isHealthy(): boolean {
    for (const [, result] of this.lastResults) {
      if (result.status !== 'ok' && result.status !== 'healthy') {
        return false;
      }
    }
    return true;
  }
}

// Default exports for commonjs compatibility
module.exports = {
  Logger,
  EventBus,
  ConfigManager,
  HealthChecker
};