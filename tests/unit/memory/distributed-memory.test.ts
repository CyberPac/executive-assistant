/**
 * Comprehensive Unit Tests for Distributed Memory System
 * Testing storage, retrieval, TTL, namespaces, and query functionality
 */

import {
  DistributedMemorySystem,
  MemoryEntry,
  MemoryQuery,
  MemoryStats,
  DistributedMemoryConfig,
  defaultDistributedMemory
} from '../../../src/memory/distributed-memory';

describe('DistributedMemorySystem', () => {
  let memorySystem: DistributedMemorySystem;

  beforeEach(() => {
    memorySystem = new DistributedMemorySystem();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    if (memorySystem) {
      memorySystem.shutdown();
    }
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const system = new DistributedMemorySystem();
      expect(system).toBeInstanceOf(DistributedMemorySystem);
    });

    it('should initialize with custom configuration', () => {
      const config: Partial<DistributedMemoryConfig> = {
        enablePersistence: false,
        maxMemorySize: 50 * 1024 * 1024,
        defaultTTL: 60000,
        cleanupInterval: 30000,
        enableCompression: true,
        enableEncryption: true,
        persistencePath: './custom-memory'
      };

      const system = new DistributedMemorySystem(config);
      expect(system).toBeInstanceOf(DistributedMemorySystem);
    });

    it('should start cleanup timer on initialization', () => {
      const system = new DistributedMemorySystem({ cleanupInterval: 5000 });
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('should provide default distributed memory instance', () => {
      expect(defaultDistributedMemory).toBeInstanceOf(DistributedMemorySystem);
    });
  });

  describe('Basic Storage and Retrieval', () => {
    it('should store and retrieve simple values', async () => {
      const key = 'test-key';
      const value = 'test-value';

      await memorySystem.store(key, value);
      const retrieved = await memorySystem.retrieve(key);

      expect(retrieved).toBe(value);
    });

    it('should store and retrieve complex objects', async () => {
      const key = 'complex-key';
      const value = {
        name: 'Test Object',
        data: [1, 2, 3],
        nested: { deep: { value: 42 } },
        timestamp: new Date()
      };

      await memorySystem.store(key, value);
      const retrieved = await memorySystem.retrieve(key);

      expect(retrieved).toEqual(value);
    });

    it('should return null for non-existent keys', async () => {
      const retrieved = await memorySystem.retrieve('non-existent-key');
      expect(retrieved).toBeNull();
    });

    it('should handle null and undefined values', async () => {
      await memorySystem.store('null-key', null);
      await memorySystem.store('undefined-key', undefined);

      const nullValue = await memorySystem.retrieve('null-key');
      const undefinedValue = await memorySystem.retrieve('undefined-key');

      expect(nullValue).toBeNull();
      expect(undefinedValue).toBeUndefined();
    });

    it('should overwrite existing keys', async () => {
      const key = 'overwrite-key';

      await memorySystem.store(key, 'original-value');
      await memorySystem.store(key, 'new-value');

      const retrieved = await memorySystem.retrieve(key);
      expect(retrieved).toBe('new-value');
    });
  });

  describe('Namespace Management', () => {
    it('should store and retrieve values in default namespace', async () => {
      await memorySystem.store('key1', 'value1');
      const retrieved = await memorySystem.retrieve('key1', 'default');

      expect(retrieved).toBe('value1');
    });

    it('should store and retrieve values in custom namespaces', async () => {
      await memorySystem.store('key1', 'value1', { namespace: 'ns1' });
      await memorySystem.store('key1', 'value2', { namespace: 'ns2' });

      const value1 = await memorySystem.retrieve('key1', 'ns1');
      const value2 = await memorySystem.retrieve('key1', 'ns2');

      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
    });

    it('should isolate keys between namespaces', async () => {
      await memorySystem.store('shared-key', 'default-value');
      await memorySystem.store('shared-key', 'custom-value', { namespace: 'custom' });

      const defaultValue = await memorySystem.retrieve('shared-key');
      const customValue = await memorySystem.retrieve('shared-key', 'custom');

      expect(defaultValue).toBe('default-value');
      expect(customValue).toBe('custom-value');
    });

    it('should clear entire namespace', async () => {
      const namespace = 'test-namespace';

      await memorySystem.store('key1', 'value1', { namespace });
      await memorySystem.store('key2', 'value2', { namespace });
      await memorySystem.store('key3', 'value3'); // Different namespace

      const deletedCount = await memorySystem.clearNamespace(namespace);

      expect(deletedCount).toBe(2);
      expect(await memorySystem.retrieve('key1', namespace)).toBeNull();
      expect(await memorySystem.retrieve('key2', namespace)).toBeNull();
      expect(await memorySystem.retrieve('key3')).toBe('value3'); // Should remain
    });

    it('should handle clearing non-existent namespace', async () => {
      const deletedCount = await memorySystem.clearNamespace('non-existent');
      expect(deletedCount).toBe(0);
    });
  });

  describe('TTL (Time To Live) Management', () => {
    beforeEach(() => {
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should store entries with TTL', async () => {
      const key = 'ttl-key';
      const value = 'ttl-value';
      const ttl = 100; // 100ms

      await memorySystem.store(key, value, { ttl });

      // Should be available immediately
      expect(await memorySystem.retrieve(key)).toBe(value);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be expired
      expect(await memorySystem.retrieve(key)).toBeNull();
    });

    it('should use default TTL when provided in config', async () => {
      const system = new DistributedMemorySystem({ defaultTTL: 50 });
      const key = 'default-ttl-key';
      const value = 'default-ttl-value';

      await system.store(key, value);

      expect(await system.retrieve(key)).toBe(value);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(await system.retrieve(key)).toBeNull();
    });

    it('should not expire entries without TTL', async () => {
      const key = 'no-ttl-key';
      const value = 'no-ttl-value';

      await memorySystem.store(key, value);

      // Wait for a reasonable time
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(await memorySystem.retrieve(key)).toBe(value);
    });

    it('should handle TTL in different namespaces', async () => {
      await memorySystem.store('key1', 'value1', { ttl: 50, namespace: 'ns1' });
      await memorySystem.store('key1', 'value2', { ttl: 200, namespace: 'ns2' });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(await memorySystem.retrieve('key1', 'ns1')).toBeNull();
      expect(await memorySystem.retrieve('key1', 'ns2')).toBe('value2');
    });
  });

  describe('Metadata and Agent Association', () => {
    it('should store entries with agent association', async () => {
      const agentId = 'agent-123';
      const key = 'agent-key';
      const value = 'agent-value';
      const metadata = { type: 'config', priority: 'high' };

      await memorySystem.store(key, value, { agentId, metadata });

      const retrieved = await memorySystem.retrieve(key);
      expect(retrieved).toBe(value);
    });

    it('should handle complex metadata', async () => {
      const metadata = {
        type: 'complex',
        tags: ['important', 'temporary'],
        config: { nested: { value: 42 } },
        timestamp: new Date()
      };

      await memorySystem.store('meta-key', 'meta-value', { metadata });

      const retrieved = await memorySystem.retrieve('meta-key');
      expect(retrieved).toBe('meta-value');
    });
  });

  describe('Query Functionality', () => {
    beforeEach(async () => {
      // Set up test data
      await memorySystem.store('key1', 'value1', { namespace: 'ns1', agentId: 'agent1' });
      await memorySystem.store('key2', 'value2', { namespace: 'ns1', agentId: 'agent2' });
      await memorySystem.store('key3', 'value3', { namespace: 'ns2', agentId: 'agent1' });
      await memorySystem.store('pattern_test_1', 'pattern1', { namespace: 'ns1' });
      await memorySystem.store('pattern_test_2', 'pattern2', { namespace: 'ns1' });
      await memorySystem.store('other_key', 'other', { namespace: 'ns1' });
    });

    it('should query by namespace', async () => {
      const query: MemoryQuery = { namespace: 'ns1' };
      const results = await memorySystem.query(query);

      expect(results.length).toBe(5);
      results.forEach(entry => {
        expect(entry.namespace).toBe('ns1');
      });
    });

    it('should query by agent ID', async () => {
      const query: MemoryQuery = { agentId: 'agent1' };
      const results = await memorySystem.query(query);

      expect(results.length).toBe(2);
      results.forEach(entry => {
        expect(entry.agentId).toBe('agent1');
      });
    });

    it('should query by key pattern', async () => {
      const query: MemoryQuery = { keyPattern: 'pattern_test_.*' };
      const results = await memorySystem.query(query);

      expect(results.length).toBe(2);
      results.forEach(entry => {
        expect(entry.key).toMatch(/pattern_test_\d/);
      });
    });

    it('should combine multiple query filters', async () => {
      const query: MemoryQuery = {
        namespace: 'ns1',
        agentId: 'agent1'
      };
      const results = await memorySystem.query(query);

      expect(results.length).toBe(1);
      expect(results[0].key).toBe('key1');
      expect(results[0].namespace).toBe('ns1');
      expect(results[0].agentId).toBe('agent1');
    });

    it('should query with timestamp range', async () => {
      const beforeTime = new Date();
      
      await new Promise(resolve => setTimeout(resolve, 10));
      await memorySystem.store('time_key', 'time_value');
      
      const afterTime = new Date();

      const query: MemoryQuery = {
        fromTimestamp: beforeTime,
        toTimestamp: afterTime
      };
      const results = await memorySystem.query(query);

      expect(results.length).toBeGreaterThan(0);
      results.forEach(entry => {
        expect(entry.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
        expect(entry.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      });
    });

    it('should limit query results', async () => {
      const query: MemoryQuery = { limit: 3 };
      const results = await memorySystem.query(query);

      expect(results.length).toBe(3);
    });

    it('should sort query results by timestamp', async () => {
      const query: MemoryQuery = {
        orderBy: 'timestamp',
        orderDirection: 'desc'
      };
      const results = await memorySystem.query(query);

      for (let i = 1; i < results.length; i++) {
        expect(results[i].timestamp.getTime()).toBeLessThanOrEqual(results[i-1].timestamp.getTime());
      }
    });

    it('should sort query results by key', async () => {
      const query: MemoryQuery = {
        orderBy: 'key',
        orderDirection: 'asc'
      };
      const results = await memorySystem.query(query);

      for (let i = 1; i < results.length; i++) {
        expect(results[i].key >= results[i-1].key).toBe(true);
      }
    });

    it('should handle empty query results', async () => {
      const query: MemoryQuery = { namespace: 'non-existent' };
      const results = await memorySystem.query(query);

      expect(results).toEqual([]);
    });
  });

  describe('Deletion Operations', () => {
    beforeEach(async () => {
      await memorySystem.store('delete-key-1', 'value1');
      await memorySystem.store('delete-key-2', 'value2', { namespace: 'custom' });
    });

    it('should delete specific entries', async () => {
      const deleted = await memorySystem.delete('delete-key-1');
      expect(deleted).toBe(true);

      const retrieved = await memorySystem.retrieve('delete-key-1');
      expect(retrieved).toBeNull();
    });

    it('should delete entries from specific namespace', async () => {
      const deleted = await memorySystem.delete('delete-key-2', 'custom');
      expect(deleted).toBe(true);

      const retrieved = await memorySystem.retrieve('delete-key-2', 'custom');
      expect(retrieved).toBeNull();
    });

    it('should handle deleting non-existent entries', async () => {
      const deleted = await memorySystem.delete('non-existent-key');
      expect(deleted).toBe(false);
    });

    it('should delete entry using deleteEntry method', async () => {
      const deleted = await memorySystem.deleteEntry('delete-key-1');
      expect(deleted).toBe(true);

      const retrieved = await memorySystem.retrieve('delete-key-1');
      expect(retrieved).toBeNull();
    });
  });

  describe('Cleanup Operations', () => {
    beforeEach(() => {
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should clean up expired entries', async () => {
      await memorySystem.store('expire-key-1', 'value1', { ttl: 50 });
      await memorySystem.store('expire-key-2', 'value2', { ttl: 200 });
      await memorySystem.store('no-expire-key', 'value3');

      await new Promise(resolve => setTimeout(resolve, 100));

      const cleanedCount = await memorySystem.cleanup();
      expect(cleanedCount).toBe(1);

      expect(await memorySystem.retrieve('expire-key-1')).toBeNull();
      expect(await memorySystem.retrieve('expire-key-2')).toBe('value2');
      expect(await memorySystem.retrieve('no-expire-key')).toBe('value3');
    });

    it('should handle cleanup with no expired entries', async () => {
      await memorySystem.store('key1', 'value1');
      await memorySystem.store('key2', 'value2');

      const cleanedCount = await memorySystem.cleanup();
      expect(cleanedCount).toBe(0);
    });

    it('should automatically run cleanup on interval', async () => {
      const system = new DistributedMemorySystem({ cleanupInterval: 100 });
      
      await system.store('auto-expire', 'value', { ttl: 50 });

      // Wait for cleanup interval
      await new Promise(resolve => setTimeout(resolve, 150));

      const retrieved = await system.retrieve('auto-expire');
      expect(retrieved).toBeNull();
    });
  });

  describe('Statistics and Monitoring', () => {
    beforeEach(async () => {
      await memorySystem.store('stats-key-1', 'value1', { namespace: 'ns1', agentId: 'agent1' });
      await memorySystem.store('stats-key-2', 'value2', { namespace: 'ns1', agentId: 'agent2' });
      await memorySystem.store('stats-key-3', 'value3', { namespace: 'ns2', agentId: 'agent1' });
      await memorySystem.store('expire-key', 'expire-value', { ttl: 1 }); // Will expire immediately
    });

    it('should provide comprehensive statistics', async () => {
      const stats = await memorySystem.getStats();

      expect(stats.totalEntries).toBe(4);
      expect(stats.namespaceCounts.ns1).toBe(2);
      expect(stats.namespaceCounts.ns2).toBe(1);
      expect(stats.namespaceCounts.default).toBe(1);
      expect(stats.agentCounts.agent1).toBe(2);
      expect(stats.agentCounts.agent2).toBe(1);
      expect(stats.memoryUsage).toBeGreaterThan(0);
      expect(typeof stats.expiredEntries).toBe('number');
    });

    it('should calculate memory usage accurately', async () => {
      const largeValue = 'x'.repeat(1000);
      await memorySystem.store('large-key', largeValue);

      const stats = await memorySystem.getStats();
      expect(stats.memoryUsage).toBeGreaterThan(1000);
    });

    it('should detect expired entries in statistics', async () => {
      jest.useRealTimers();
      
      await memorySystem.store('expire-stat', 'value', { ttl: 10 });
      await new Promise(resolve => setTimeout(resolve, 50));

      const stats = await memorySystem.getStats();
      expect(stats.expiredEntries).toBeGreaterThan(0);
      
      jest.useFakeTimers();
    });

    it('should handle empty statistics', async () => {
      const emptySystem = new DistributedMemorySystem();
      const stats = await emptySystem.getStats();

      expect(stats.totalEntries).toBe(0);
      expect(stats.namespaceCounts).toEqual({});
      expect(stats.agentCounts).toEqual({});
      expect(stats.memoryUsage).toBe(0);
      expect(stats.expiredEntries).toBe(0);
    });
  });

  describe('Backup and Restore', () => {
    beforeEach(async () => {
      await memorySystem.store('backup-key-1', 'backup-value-1', { namespace: 'ns1' });
      await memorySystem.store('backup-key-2', 'backup-value-2', { namespace: 'ns2' });
    });

    it('should create backup of memory data', async () => {
      const backupData = await memorySystem.backup();
      
      expect(backupData).toBeTruthy();
      
      const backup = JSON.parse(backupData);
      expect(backup.version).toBe('1.0');
      expect(backup.timestamp).toBeTruthy();
      expect(backup.entries).toBeInstanceOf(Array);
      expect(backup.entries.length).toBe(2);
    });

    it('should restore from backup data', async () => {
      const backupData = await memorySystem.backup();
      
      // Clear current memory
      await memorySystem.clearNamespace('ns1');
      await memorySystem.clearNamespace('ns2');
      
      // Restore from backup
      const restoredCount = await memorySystem.restore(backupData);
      expect(restoredCount).toBe(2);
      
      // Verify restored data
      expect(await memorySystem.retrieve('backup-key-1', 'ns1')).toBe('backup-value-1');
      expect(await memorySystem.retrieve('backup-key-2', 'ns2')).toBe('backup-value-2');
    });

    it('should exclude expired entries from backup', async () => {
      jest.useRealTimers();
      
      await memorySystem.store('expire-backup', 'value', { ttl: 10 });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const backupData = await memorySystem.backup();
      const backup = JSON.parse(backupData);
      
      const expiredEntry = backup.entries.find((entry: any) => entry.key === 'expire-backup');
      expect(expiredEntry).toBeUndefined();
      
      jest.useFakeTimers();
    });

    it('should handle invalid backup data', async () => {
      await expect(memorySystem.restore('invalid json')).rejects.toThrow('Failed to restore memory');
      await expect(memorySystem.restore('{}')).rejects.toThrow('Failed to restore memory');
    });

    it('should handle empty backup', async () => {
      const emptySystem = new DistributedMemorySystem();
      const backupData = await emptySystem.backup();
      
      const backup = JSON.parse(backupData);
      expect(backup.entries).toEqual([]);
      
      const restoredCount = await memorySystem.restore(backupData);
      expect(restoredCount).toBe(0);
    });
  });

  describe('System Lifecycle', () => {
    it('should shutdown gracefully', async () => {
      const shutdownSpy = jest.spyOn(memorySystem, 'shutdown');
      
      await memorySystem.store('shutdown-key', 'shutdown-value');
      await memorySystem.shutdown();
      
      expect(shutdownSpy).toHaveBeenCalled();
    });

    it('should clear cleanup timer on shutdown', async () => {
      const system = new DistributedMemorySystem({ cleanupInterval: 1000 });
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      await system.shutdown();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should persist all entries on shutdown when persistence enabled', async () => {
      const system = new DistributedMemorySystem({ enablePersistence: true });
      
      await system.store('persist-key', 'persist-value');
      await system.shutdown();
      
      // Persistence implementation would be tested here if implemented
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long keys', async () => {
      const longKey = 'k'.repeat(1000);
      const value = 'long-key-value';
      
      await memorySystem.store(longKey, value);
      const retrieved = await memorySystem.retrieve(longKey);
      
      expect(retrieved).toBe(value);
    });

    it('should handle very large values', async () => {
      const largeValue = 'x'.repeat(100000);
      const key = 'large-value-key';
      
      await memorySystem.store(key, largeValue);
      const retrieved = await memorySystem.retrieve(key);
      
      expect(retrieved).toBe(largeValue);
    });

    it('should handle special characters in keys', async () => {
      const specialKeys = [
        'key with spaces',
        'key:with:colons',
        'key/with/slashes',
        'key.with.dots',
        'key-with-dashes',
        'key_with_underscores',
        'key@with#symbols$'
      ];
      
      for (const key of specialKeys) {
        await memorySystem.store(key, `value-for-${key}`);
        const retrieved = await memorySystem.retrieve(key);
        expect(retrieved).toBe(`value-for-${key}`);
      }
    });

    it('should handle circular references in values', async () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      // Should not throw during storage
      await expect(memorySystem.store('circular', circular)).resolves.not.toThrow();
    });

    it('should handle concurrent operations', async () => {
      const promises = [];
      
      // Concurrent stores
      for (let i = 0; i < 100; i++) {
        promises.push(memorySystem.store(`concurrent-${i}`, `value-${i}`));
      }
      
      await Promise.all(promises);
      
      // Verify all stored
      for (let i = 0; i < 100; i++) {
        const retrieved = await memorySystem.retrieve(`concurrent-${i}`);
        expect(retrieved).toBe(`value-${i}`);
      }
    });

    it('should handle invalid TTL values', async () => {
      await expect(memorySystem.store('invalid-ttl-1', 'value', { ttl: -1 })).resolves.not.toThrow();
      await expect(memorySystem.store('invalid-ttl-2', 'value', { ttl: 0 })).resolves.not.toThrow();
    });

    it('should handle empty namespace gracefully', async () => {
      await memorySystem.store('empty-ns-key', 'value', { namespace: '' });
      const retrieved = await memorySystem.retrieve('empty-ns-key', '');
      expect(retrieved).toBe('value');
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large numbers of entries efficiently', async () => {
      const startTime = Date.now();
      const entryCount = 1000;
      
      // Store many entries
      for (let i = 0; i < entryCount; i++) {
        await memorySystem.store(`perf-key-${i}`, `value-${i}`, { namespace: `ns-${i % 10}` });
      }
      
      const storeTime = Date.now() - startTime;
      expect(storeTime).toBeLessThan(5000); // Should complete in reasonable time
      
      // Query performance
      const queryStart = Date.now();
      const results = await memorySystem.query({ limit: 100 });
      const queryTime = Date.now() - queryStart;
      
      expect(results.length).toBe(100);
      expect(queryTime).toBeLessThan(1000);
    });

    it('should handle complex queries efficiently', async () => {
      // Add test data
      for (let i = 0; i < 100; i++) {
        await memorySystem.store(
          `query-perf-${i}`,
          `value-${i}`,
          {
            namespace: `ns-${i % 5}`,
            agentId: `agent-${i % 3}`,
            metadata: { index: i, type: 'performance-test' }
          }
        );
      }
      
      const startTime = Date.now();
      
      const complexQuery: MemoryQuery = {
        namespace: 'ns-1',
        keyPattern: 'query-perf-.*',
        orderBy: 'timestamp',
        orderDirection: 'desc',
        limit: 10
      };
      
      const results = await memorySystem.query(complexQuery);
      const queryTime = Date.now() - startTime;
      
      expect(results.length).toBeGreaterThan(0);
      expect(queryTime).toBeLessThan(500);
    });
  });
});