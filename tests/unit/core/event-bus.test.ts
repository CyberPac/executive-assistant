/**
 * Comprehensive Unit Tests for EventBus System
 * Testing event emission, subscription, history, and payload management
 */

import {
  EventBus,
  IEventBus,
  EventPayload,
  defaultEventBus,
  EVENT_TYPES
} from '../../../src/core/event-bus';

describe('EventBus', () => {
  let eventBus: EventBus;
  let mockCallback: jest.Mock;
  let mockSubscriber: string;

  beforeEach(() => {
    eventBus = new EventBus();
    mockCallback = jest.fn();
    mockSubscriber = 'test-subscriber';
    jest.clearAllMocks();
  });

  afterEach(() => {
    eventBus.removeAllListeners();
    eventBus.clearHistory();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const bus = new EventBus();
      expect(bus).toBeInstanceOf(EventBus);
      expect(bus.getEventHistory()).toEqual([]);
      expect(bus.getSubscriptions()).toEqual([]);
    });

    it('should initialize with custom max history size', () => {
      const customMaxSize = 500;
      const bus = new EventBus({ maxHistorySize: customMaxSize });
      
      // Fill beyond default but within custom limit
      for (let i = 0; i < 600; i++) {
        bus.emitEvent('test-event', { index: i }, 'test-source');
      }
      
      const history = bus.getEventHistory();
      expect(history.length).toBe(customMaxSize);
    });

    it('should default event bus instance be available', () => {
      expect(defaultEventBus).toBeInstanceOf(EventBus);
      expect(defaultEventBus).toBeDefined();
    });

    it('should have predefined event types', () => {
      expect(EVENT_TYPES.AGENT_STARTED).toBe('agent.started');
      expect(EVENT_TYPES.AGENT_STOPPED).toBe('agent.stopped');
      expect(EVENT_TYPES.TASK_CREATED).toBe('task.created');
      expect(EVENT_TYPES.SYSTEM_ALERT).toBe('system.alert');
    });
  });

  describe('Event Emission', () => {
    it('should emit simple events', () => {
      const result = eventBus.emit('test-event', 'test-data');
      expect(result).toBe(false); // No listeners yet
    });

    it('should emit events with payload tracking', () => {
      const testData = { message: 'test message', value: 42 };
      const source = 'test-agent';
      const priority = 'high';

      const result = eventBus.emitEvent('test-event', testData, source, priority);
      expect(result).toBe(false); // No listeners yet

      const history = eventBus.getEventHistory();
      expect(history).toHaveLength(1);
      
      const event = history[0];
      expect(event.type).toBe('test-event');
      expect(event.data).toEqual(testData);
      expect(event.source).toBe(source);
      expect(event.priority).toBe(priority);
      expect(event.id).toMatch(/^event_\d+_[a-z0-9]+$/);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should emit events with default priority', () => {
      eventBus.emitEvent('test-event', 'test-data', 'test-source');
      
      const history = eventBus.getEventHistory();
      expect(history[0].priority).toBe('medium');
    });

    it('should handle different priority levels', () => {
      const priorities: Array<EventPayload['priority']> = ['low', 'medium', 'high', 'critical'];
      
      priorities.forEach((priority, index) => {
        eventBus.emitEvent(`test-event-${index}`, `data-${index}`, 'test-source', priority);
      });

      const history = eventBus.getEventHistory();
      expect(history).toHaveLength(4);
      
      priorities.forEach((priority, index) => {
        const event = history.find(e => e.type === `test-event-${index}`);
        expect(event?.priority).toBe(priority);
      });
    });

    it('should emit events to subscribers', () => {
      eventBus.subscribe('test-event', mockSubscriber, mockCallback);
      
      const result = eventBus.emitEvent('test-event', 'test-data', 'test-source');
      expect(result).toBe(true); // Has listeners
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      const callArgs = mockCallback.mock.calls[0][0];
      expect(callArgs.type).toBe('test-event');
      expect(callArgs.data).toBe('test-data');
      expect(callArgs.source).toBe('test-source');
    });
  });

  describe('Event Subscription', () => {
    it('should subscribe to events', () => {
      eventBus.subscribe('test-event', mockSubscriber, mockCallback);
      
      const subscriptions = eventBus.getSubscriptions('test-event');
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].eventType).toBe('test-event');
      expect(subscriptions[0].subscriber).toBe(mockSubscriber);
      expect(subscriptions[0].callback).toBe(mockCallback);
    });

    it('should subscribe with options', () => {
      const options = {
        once: true,
        priority: 1,
        filter: (payload: EventPayload) => payload.priority === 'high'
      };

      eventBus.subscribe('test-event', mockSubscriber, mockCallback, options);
      
      const subscriptions = eventBus.getSubscriptions('test-event');
      expect(subscriptions[0].options).toEqual(options);
    });

    it('should handle once subscriptions', () => {
      eventBus.subscribe('test-event', mockSubscriber, mockCallback, { once: true });
      
      eventBus.emitEvent('test-event', 'data1', 'source');
      eventBus.emitEvent('test-event', 'data2', 'source');
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should support multiple subscribers for same event', () => {
      const mockCallback2 = jest.fn();
      const subscriber2 = 'subscriber-2';

      eventBus.subscribe('test-event', mockSubscriber, mockCallback);
      eventBus.subscribe('test-event', subscriber2, mockCallback2);
      
      eventBus.emitEvent('test-event', 'test-data', 'source');
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
      
      const subscriptions = eventBus.getSubscriptions('test-event');
      expect(subscriptions).toHaveLength(2);
    });

    it('should support multiple events for same subscriber', () => {
      eventBus.subscribe('event-1', mockSubscriber, mockCallback);
      eventBus.subscribe('event-2', mockSubscriber, mockCallback);
      
      eventBus.emitEvent('event-1', 'data1', 'source');
      eventBus.emitEvent('event-2', 'data2', 'source');
      
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Unsubscription', () => {
    beforeEach(() => {
      eventBus.subscribe('test-event', mockSubscriber, mockCallback);
    });

    it('should unsubscribe specific subscriber', () => {
      expect(eventBus.getSubscriptions('test-event')).toHaveLength(1);
      
      eventBus.unsubscribe('test-event', mockSubscriber);
      
      expect(eventBus.getSubscriptions('test-event')).toHaveLength(0);
    });

    it('should not affect other subscribers when unsubscribing', () => {
      const mockCallback2 = jest.fn();
      const subscriber2 = 'subscriber-2';
      
      eventBus.subscribe('test-event', subscriber2, mockCallback2);
      expect(eventBus.getSubscriptions('test-event')).toHaveLength(2);
      
      eventBus.unsubscribe('test-event', mockSubscriber);
      
      const remainingSubscriptions = eventBus.getSubscriptions('test-event');
      expect(remainingSubscriptions).toHaveLength(1);
      expect(remainingSubscriptions[0].subscriber).toBe(subscriber2);
    });

    it('should handle unsubscribing non-existent subscriber', () => {
      eventBus.unsubscribe('test-event', 'non-existent-subscriber');
      
      expect(eventBus.getSubscriptions('test-event')).toHaveLength(1);
    });

    it('should handle unsubscribing from non-existent event', () => {
      expect(() => {
        eventBus.unsubscribe('non-existent-event', mockSubscriber);
      }).not.toThrow();
    });

    it('should remove all listeners', () => {
      eventBus.subscribe('event-1', mockSubscriber, mockCallback);
      eventBus.subscribe('event-2', 'subscriber-2', jest.fn());
      
      eventBus.removeAllListeners();
      
      // Note: removeAllListeners only removes EventEmitter listeners, not our subscription tracking
      // The subscriptions map is separate and would need custom cleanup
      expect(eventBus.listeners('event-1')).toHaveLength(0);
      expect(eventBus.listeners('event-2')).toHaveLength(0);
    });

    it('should remove listeners for specific event', () => {
      eventBus.subscribe('event-1', mockSubscriber, mockCallback);
      eventBus.subscribe('event-2', mockSubscriber, mockCallback);
      
      eventBus.removeAllListeners('event-1');
      
      expect(eventBus.listeners('event-1')).toHaveLength(0);
      expect(eventBus.listeners('event-2')).toHaveLength(1);
    });
  });

  describe('Event History Management', () => {
    it('should track event history', () => {
      eventBus.emitEvent('event-1', 'data1', 'source1');
      eventBus.emitEvent('event-2', 'data2', 'source2');
      
      const history = eventBus.getEventHistory();
      expect(history).toHaveLength(2);
      // History is sorted by timestamp descending, so most recent first
      expect(history[0].type).toBe('event-2'); // Most recent first
      expect(history[1].type).toBe('event-1');
    });

    it('should filter history by event type', () => {
      eventBus.emitEvent('event-1', 'data1', 'source');
      eventBus.emitEvent('event-2', 'data2', 'source');
      eventBus.emitEvent('event-1', 'data3', 'source');
      
      const filteredHistory = eventBus.getEventHistory('event-1');
      expect(filteredHistory).toHaveLength(2);
      filteredHistory.forEach(event => {
        expect(event.type).toBe('event-1');
      });
    });

    it('should limit history results', () => {
      for (let i = 0; i < 10; i++) {
        eventBus.emitEvent('test-event', `data-${i}`, 'source');
      }
      
      const limitedHistory = eventBus.getEventHistory(undefined, 5);
      expect(limitedHistory).toHaveLength(5);
    });

    it('should combine event type filter and limit', () => {
      for (let i = 0; i < 10; i++) {
        eventBus.emitEvent('event-1', `data1-${i}`, 'source');
        eventBus.emitEvent('event-2', `data2-${i}`, 'source');
      }
      
      const filteredLimitedHistory = eventBus.getEventHistory('event-1', 3);
      expect(filteredLimitedHistory).toHaveLength(3);
      filteredLimitedHistory.forEach(event => {
        expect(event.type).toBe('event-1');
      });
    });

    it('should maintain max history size', () => {
      const maxSize = 5;
      const customBus = new EventBus({ maxHistorySize: maxSize });
      
      for (let i = 0; i < 10; i++) {
        customBus.emitEvent('test-event', `data-${i}`, 'source');
      }
      
      const history = customBus.getEventHistory();
      expect(history).toHaveLength(maxSize);
      
      // Should contain the most recent events
      const dataValues = history.map(event => event.data);
      expect(dataValues).toContain('data-9');
      expect(dataValues).toContain('data-8');
      expect(dataValues).not.toContain('data-0');
    });

    it('should clear event history', () => {
      eventBus.emitEvent('test-event', 'data', 'source');
      expect(eventBus.getEventHistory()).toHaveLength(1);
      
      eventBus.clearHistory();
      expect(eventBus.getEventHistory()).toHaveLength(0);
    });

    it('should sort history by timestamp', () => {
      // Clear any existing history first
      eventBus.clearHistory();
      
      const now = Date.now();
      
      // Emit events with slight delays to ensure different timestamps
      eventBus.emitEvent('event-1', 'data1', 'source');
      
      // Simulate different timestamp
      jest.spyOn(Date, 'now').mockReturnValue(now + 1000);
      eventBus.emitEvent('event-2', 'data2', 'source');
      
      jest.spyOn(Date, 'now').mockReturnValue(now + 2000);
      eventBus.emitEvent('event-3', 'data3', 'source');
      
      const history = eventBus.getEventHistory();
      expect(history[0].type).toBe('event-3'); // Most recent
      expect(history[1].type).toBe('event-2');
      expect(history[2].type).toBe('event-1'); // Oldest
      
      jest.restoreAllMocks();
    });
  });

  describe('Subscription Management', () => {
    it('should get all subscriptions', () => {
      eventBus.subscribe('event-1', 'subscriber-1', jest.fn());
      eventBus.subscribe('event-2', 'subscriber-2', jest.fn());
      eventBus.subscribe('event-1', 'subscriber-3', jest.fn());
      
      const allSubscriptions = eventBus.getSubscriptions();
      expect(allSubscriptions).toHaveLength(3);
    });

    it('should get subscriptions for specific event', () => {
      eventBus.subscribe('event-1', 'subscriber-1', jest.fn());
      eventBus.subscribe('event-2', 'subscriber-2', jest.fn());
      eventBus.subscribe('event-1', 'subscriber-3', jest.fn());
      
      const event1Subscriptions = eventBus.getSubscriptions('event-1');
      expect(event1Subscriptions).toHaveLength(2);
      event1Subscriptions.forEach(sub => {
        expect(sub.eventType).toBe('event-1');
      });
    });

    it('should return empty array for non-existent event subscriptions', () => {
      const subscriptions = eventBus.getSubscriptions('non-existent-event');
      expect(subscriptions).toEqual([]);
    });
  });

  describe('Event Bus Statistics', () => {
    it('should provide comprehensive statistics', () => {
      // Add some events and subscriptions
      eventBus.subscribe('event-1', 'subscriber-1', jest.fn());
      eventBus.subscribe('event-2', 'subscriber-2', jest.fn());
      eventBus.subscribe('event-1', 'subscriber-3', jest.fn());
      
      eventBus.emitEvent('event-1', 'data1', 'source');
      eventBus.emitEvent('event-2', 'data2', 'source');
      eventBus.emitEvent('event-1', 'data3', 'source');
      eventBus.emitEvent('event-3', 'data4', 'source');
      
      const stats = eventBus.getStats();
      
      expect(stats.totalEvents).toBe(4);
      expect(stats.eventTypes).toContain('event-1');
      expect(stats.eventTypes).toContain('event-2');
      expect(stats.eventTypes).toContain('event-3');
      expect(stats.eventTypes).toHaveLength(3);
      expect(stats.activeSubscriptions).toBe(3);
      expect(stats.historySize).toBe(4);
    });

    it('should handle empty statistics', () => {
      const stats = eventBus.getStats();
      
      expect(stats.totalEvents).toBe(0);
      expect(stats.eventTypes).toEqual([]);
      expect(stats.activeSubscriptions).toBe(0);
      expect(stats.historySize).toBe(0);
    });
  });

  describe('Interface Compliance', () => {
    it('should implement IEventBus interface', () => {
      const bus: IEventBus = new EventBus();
      
      expect(typeof bus.on).toBe('function');
      expect(typeof bus.once).toBe('function');
      expect(typeof bus.off).toBe('function');
      expect(typeof bus.emit).toBe('function');
      expect(typeof bus.listeners).toBe('function');
      expect(typeof bus.removeAllListeners).toBe('function');
    });

    it('should support standard EventEmitter methods', () => {
      eventBus.on('test-event', mockCallback);
      expect(eventBus.listeners('test-event')).toContain(mockCallback);
      
      eventBus.emit('test-event', 'data');
      expect(mockCallback).toHaveBeenCalledWith('data');
      
      eventBus.off('test-event', mockCallback);
      expect(eventBus.listeners('test-event')).not.toContain(mockCallback);
    });

    it('should support once method', () => {
      eventBus.once('test-event', mockCallback);
      
      eventBus.emit('test-event', 'data1');
      eventBus.emit('test-event', 'data2');
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith('data1');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined data', () => {
      eventBus.clearHistory(); // Clear before test
      
      expect(() => {
        eventBus.emitEvent('test-event', null, 'source');
        eventBus.emitEvent('test-event', undefined, 'source');
      }).not.toThrow();
      
      const history = eventBus.getEventHistory();
      expect(history).toHaveLength(2);
      expect(history[0].data).toBeUndefined();
      expect(history[1].data).toBeNull();
    });

    it('should handle complex data objects', () => {
      const complexData = {
        nested: { deep: { value: 42 } },
        array: [1, 2, 3],
        date: new Date(),
        function: () => 'test',
        regexp: /test/gi
      };
      
      eventBus.emitEvent('test-event', complexData, 'source');
      
      const history = eventBus.getEventHistory();
      expect(history[0].data).toEqual(complexData);
    });

    it('should handle subscription with null callback', () => {
      expect(() => {
        eventBus.subscribe('test-event', mockSubscriber, null as any);
      }).toThrow();
    });

    it('should handle empty event type', () => {
      expect(() => {
        eventBus.emitEvent('', 'data', 'source');
        eventBus.subscribe('', mockSubscriber, mockCallback);
      }).not.toThrow();
    });

    it('should handle very long event history', () => {
      const largeEventCount = 2000;
      const customBus = new EventBus({ maxHistorySize: 1000 });
      
      for (let i = 0; i < largeEventCount; i++) {
        customBus.emitEvent('test-event', `data-${i}`, 'source');
      }
      
      const history = customBus.getEventHistory();
      expect(history).toHaveLength(1000);
      
      // Should maintain most recent events (last 1000)
      expect(history[0].data).toBe('data-1999');
      expect(history[999].data).toBe('data-1000');
    });
  });

  describe('Performance Considerations', () => {
    it('should handle high-frequency events efficiently', () => {
      const startTime = Date.now();
      const eventCount = 1000;
      
      for (let i = 0; i < eventCount; i++) {
        eventBus.emitEvent('high-freq-event', `data-${i}`, 'source');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
      expect(eventBus.getEventHistory()).toHaveLength(eventCount);
    });

    it('should handle many subscribers efficiently', () => {
      const subscriberCount = 100;
      const callbacks: jest.Mock[] = [];
      
      // Add many subscribers
      for (let i = 0; i < subscriberCount; i++) {
        const callback = jest.fn();
        callbacks.push(callback);
        eventBus.subscribe('test-event', `subscriber-${i}`, callback);
      }
      
      const startTime = Date.now();
      eventBus.emitEvent('test-event', 'broadcast-data', 'source');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
      callbacks.forEach(callback => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });
});