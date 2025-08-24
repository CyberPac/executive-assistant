/**
 * Mock Memory Modules for Testing
 * Provides mock implementations for distributed memory systems
 */

import { EventEmitter } from 'events';

// Distributed Memory System Mock
export class DistributedMemorySystem extends EventEmitter {
  private memory: Map<string, any> = new Map();
  private metadata: Map<string, { ttl?: number; created: Date; accessed: Date }> = new Map();
  private namespaces: Set<string> = new Set();

  constructor() {
    super();
    this.setupCleanupInterval();
  }

  private setupCleanupInterval(): void {
    // Mock cleanup interval for testing
    setInterval(() => {
      this.cleanup();
    }, 10000); // 10 seconds in tests
  }

  async initialize(): Promise<void> {
    this.emit('initialized');
  }

  async store(key: string, value: any, options?: { ttl?: number; namespace?: string }): Promise<void> {
    const fullKey = options?.namespace ? `${options.namespace}:${key}` : key;
    
    this.memory.set(fullKey, value);
    this.metadata.set(fullKey, {
      ttl: options?.ttl,
      created: new Date(),
      accessed: new Date()
    });

    if (options?.namespace) {
      this.namespaces.add(options.namespace);
    }

    this.emit('stored', { key: fullKey, value, options });
  }

  async retrieve(key: string, namespace?: string): Promise<any> {
    const fullKey = namespace ? `${namespace}:${key}` : key;
    
    const metadata = this.metadata.get(fullKey);
    if (metadata) {
      // Check TTL
      if (metadata.ttl && (Date.now() - metadata.created.getTime()) > metadata.ttl * 1000) {
        this.memory.delete(fullKey);
        this.metadata.delete(fullKey);
        return undefined;
      }
      
      // Update access time
      metadata.accessed = new Date();
    }

    const value = this.memory.get(fullKey);
    this.emit('retrieved', { key: fullKey, value, found: value !== undefined });
    
    return value;
  }

  async delete(key: string, namespace?: string): Promise<boolean> {
    const fullKey = namespace ? `${namespace}:${key}` : key;
    
    const existed = this.memory.has(fullKey);
    this.memory.delete(fullKey);
    this.metadata.delete(fullKey);
    
    this.emit('deleted', { key: fullKey, existed });
    return existed;
  }

  async exists(key: string, namespace?: string): Promise<boolean> {
    const fullKey = namespace ? `${namespace}:${key}` : key;
    return this.memory.has(fullKey);
  }

  async list(namespace?: string): Promise<string[]> {
    const keys = Array.from(this.memory.keys());
    
    if (namespace) {
      const prefix = `${namespace}:`;
      return keys
        .filter(key => key.startsWith(prefix))
        .map(key => key.substring(prefix.length));
    }
    
    return keys;
  }

  async search(pattern: string, namespace?: string): Promise<Array<{ key: string; value: any }>> {
    const results: Array<{ key: string; value: any }> = [];
    const regex = new RegExp(pattern, 'i');
    
    for (const [fullKey, value] of this.memory) {
      const key = namespace ? fullKey.replace(`${namespace}:`, '') : fullKey;
      
      if (namespace && !fullKey.startsWith(`${namespace}:`)) {
        continue;
      }
      
      if (regex.test(key) || regex.test(JSON.stringify(value))) {
        results.push({ key, value });
      }
    }
    
    this.emit('searched', { pattern, namespace, results: results.length });
    return results;
  }

  async clear(namespace?: string): Promise<void> {
    if (namespace) {
      const prefix = `${namespace}:`;
      const keysToDelete = Array.from(this.memory.keys()).filter(key => key.startsWith(prefix));
      
      for (const key of keysToDelete) {
        this.memory.delete(key);
        this.metadata.delete(key);
      }
      
      this.namespaces.delete(namespace);
    } else {
      this.memory.clear();
      this.metadata.clear();
      this.namespaces.clear();
    }
    
    this.emit('cleared', { namespace });
  }

  async getStats(): Promise<{
    totalKeys: number;
    totalSize: number;
    namespaces: string[];
    oldestEntry?: Date;
    newestEntry?: Date;
  }> {
    const metadataValues = Array.from(this.metadata.values());
    
    return {
      totalKeys: this.memory.size,
      totalSize: JSON.stringify(Array.from(this.memory.values())).length,
      namespaces: Array.from(this.namespaces),
      oldestEntry: metadataValues.length > 0 ? 
        new Date(Math.min(...metadataValues.map(m => m.created.getTime()))) : undefined,
      newestEntry: metadataValues.length > 0 ?
        new Date(Math.max(...metadataValues.map(m => m.created.getTime()))) : undefined
    };
  }

  async backup(): Promise<{ memory: any; metadata: any; timestamp: Date }> {
    return {
      memory: Object.fromEntries(this.memory),
      metadata: Object.fromEntries(
        Array.from(this.metadata).map(([key, value]) => [key, {
          ...value,
          created: value.created.toISOString(),
          accessed: value.accessed.toISOString()
        }])
      ),
      timestamp: new Date()
    };
  }

  async restore(backup: { memory: any; metadata: any }): Promise<void> {
    this.memory.clear();
    this.metadata.clear();
    this.namespaces.clear();
    
    // Restore memory
    Object.entries(backup.memory).forEach(([key, value]) => {
      this.memory.set(key, value);
    });
    
    // Restore metadata
    Object.entries(backup.metadata).forEach(([key, value]: [string, any]) => {
      this.metadata.set(key, {
        ...value,
        created: new Date(value.created),
        accessed: new Date(value.accessed)
      });
      
      // Extract namespace
      const colonIndex = key.indexOf(':');
      if (colonIndex > 0) {
        this.namespaces.add(key.substring(0, colonIndex));
      }
    });
    
    this.emit('restored', { keys: this.memory.size });
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, metadata] of this.metadata) {
      if (metadata.ttl && (now - metadata.created.getTime()) > metadata.ttl * 1000) {
        toDelete.push(key);
      }
    }
    
    for (const key of toDelete) {
      this.memory.delete(key);
      this.metadata.delete(key);
    }
    
    if (toDelete.length > 0) {
      this.emit('cleanup', { deleted: toDelete.length });
    }
  }

  async shutdown(): Promise<void> {
    this.removeAllListeners();
    this.memory.clear();
    this.metadata.clear();
    this.namespaces.clear();
    this.emit('shutdown');
  }
}

// Memory Pool Mock
export class MemoryPool {
  private pools: Map<string, DistributedMemorySystem> = new Map();

  async getPool(name: string): Promise<DistributedMemorySystem> {
    if (!this.pools.has(name)) {
      const pool = new DistributedMemorySystem();
      await pool.initialize();
      this.pools.set(name, pool);
    }
    return this.pools.get(name)!;
  }

  async removePool(name: string): Promise<boolean> {
    const pool = this.pools.get(name);
    if (pool) {
      await pool.shutdown();
      this.pools.delete(name);
      return true;
    }
    return false;
  }

  async getAllPools(): Promise<string[]> {
    return Array.from(this.pools.keys());
  }

  async shutdown(): Promise<void> {
    for (const [, pool] of this.pools) {
      await pool.shutdown();
    }
    this.pools.clear();
  }
}

// Default exports for commonjs compatibility
module.exports = {
  DistributedMemorySystem,
  MemoryPool
};