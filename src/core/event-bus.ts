/**
 * Event Bus Interface - Core Event Management System
 * Provides centralized event handling for agent coordination
 */

import { EventEmitter } from 'events';

export interface IEventBus {
  /**
   * Subscribe to an event
   */
  on(event: string, listener: (...args: any[]) => void): void;
  
  /**
   * Subscribe to an event once
   */
  once(event: string, listener: (...args: any[]) => void): void;
  
  /**
   * Unsubscribe from an event
   */
  off(event: string, listener: (...args: any[]) => void): void;
  
  /**
   * Emit an event
   */
  emit(event: string, ...args: any[]): boolean;
  
  /**
   * Get all listeners for an event
   */
  listeners(event: string): Function[];
  
  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void;
}

export interface EventPayload {
  id: string;
  timestamp: Date;
  source: string;
  type: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EventSubscription {
  eventType: string;
  subscriber: string;
  callback: Function;
  options: {
    once?: boolean;
    priority?: number;
    filter?: (payload: EventPayload) => boolean;
  };
}

/**
 * Enhanced Event Bus Implementation
 */
export class EventBus extends EventEmitter implements IEventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventHistory: EventPayload[] = [];
  private maxHistorySize: number = 1000;

  constructor(options?: { maxHistorySize?: number }) {
    super();
    if (options?.maxHistorySize) {
      this.maxHistorySize = options.maxHistorySize;
    }
  }

  /**
   * Enhanced emit with payload tracking
   */
  emitEvent(eventType: string, data: any, source: string, priority: EventPayload['priority'] = 'medium'): boolean {
    const payload: EventPayload = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      source,
      type: eventType,
      data,
      priority
    };

    // Add to history
    this.addToHistory(payload);

    // Emit the event with payload
    return this.emit(eventType, payload);
  }

  /**
   * Subscribe with enhanced options
   */
  subscribe(eventType: string, subscriber: string, callback: (payload: EventPayload) => void, options: EventSubscription['options'] = {}): void {
    const subscription: EventSubscription = {
      eventType,
      subscriber,
      callback,
      options
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType)!.push(subscription);

    // Add listener to EventEmitter
    if (options.once) {
      this.once(eventType, callback);
    } else {
      this.on(eventType, callback);
    }
  }

  /**
   * Unsubscribe specific subscriber
   */
  unsubscribe(eventType: string, subscriber: string): void {
    const subscriptions = this.subscriptions.get(eventType);
    if (subscriptions) {
      const filtered = subscriptions.filter(sub => sub.subscriber !== subscriber);
      if (filtered.length === 0) {
        this.subscriptions.delete(eventType);
      } else {
        this.subscriptions.set(eventType, filtered);
      }

      // Remove listeners from EventEmitter
      subscriptions
        .filter(sub => sub.subscriber === subscriber)
        .forEach(sub => this.off(eventType, sub.callback as any));
    }
  }

  /**
   * Get event history
   */
  getEventHistory(eventType?: string, limit?: number): EventPayload[] {
    let history = this.eventHistory;
    
    if (eventType) {
      history = history.filter(event => event.type === eventType);
    }
    
    if (limit) {
      history = history.slice(-limit);
    }
    
    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get active subscriptions
   */
  getSubscriptions(eventType?: string): EventSubscription[] {
    if (eventType) {
      return this.subscriptions.get(eventType) || [];
    }
    
    const allSubscriptions: EventSubscription[] = [];
    this.subscriptions.forEach(subs => allSubscriptions.push(...subs));
    return allSubscriptions;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get event bus statistics
   */
  getStats(): {
    totalEvents: number;
    eventTypes: string[];
    activeSubscriptions: number;
    historySize: number;
  } {
    const eventTypes = Array.from(new Set(this.eventHistory.map(event => event.type)));
    const activeSubscriptions = Array.from(this.subscriptions.values()).reduce((count, subs) => count + subs.length, 0);

    return {
      totalEvents: this.eventHistory.length,
      eventTypes,
      activeSubscriptions,
      historySize: this.eventHistory.length
    };
  }

  private addToHistory(payload: EventPayload): void {
    this.eventHistory.push(payload);
    
    // Trim history if it exceeds max size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
}

// Default event bus instance
export const defaultEventBus = new EventBus();

// Common event types
export const EVENT_TYPES = {
  AGENT_STARTED: 'agent.started',
  AGENT_STOPPED: 'agent.stopped',
  AGENT_ERROR: 'agent.error',
  TASK_CREATED: 'task.created',
  TASK_ASSIGNED: 'task.assigned',
  TASK_COMPLETED: 'task.completed',
  TASK_FAILED: 'task.failed',
  COORDINATION_UPDATE: 'coordination.update',
  PERFORMANCE_METRIC: 'performance.metric',
  MEMORY_UPDATE: 'memory.update',
  SYSTEM_ALERT: 'system.alert'
} as const;