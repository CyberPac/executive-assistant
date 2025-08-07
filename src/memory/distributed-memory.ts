/**
 * Distributed Memory System - Cross-Agent Memory Management
 * Provides persistent and distributed memory capabilities for agent coordination
 */

export interface MemoryEntry {
  id: string;
  key: string;
  value: any;
  timestamp: Date;
  ttl?: number; // Time to live in milliseconds
  namespace?: string;
  agentId?: string;
  metadata?: Record<string, any>;
}

export interface MemoryQuery {
  namespace?: string;
  agentId?: string;
  keyPattern?: string;
  fromTimestamp?: Date;
  toTimestamp?: Date;
  limit?: number;
  orderBy?: 'timestamp' | 'key';
  orderDirection?: 'asc' | 'desc';
}

export interface MemoryStats {
  totalEntries: number;
  namespaceCounts: Record<string, number>;
  agentCounts: Record<string, number>;
  memoryUsage: number;
  expiredEntries: number;
}

export interface DistributedMemoryConfig {
  enablePersistence: boolean;
  persistencePath?: string;
  maxMemorySize: number;
  defaultTTL?: number;
  cleanupInterval: number;
  enableCompression: boolean;
  enableEncryption: boolean;
}

/**
 * Distributed Memory System Implementation
 */
export class DistributedMemorySystem {
  private memory: Map<string, MemoryEntry> = new Map();
  private config: DistributedMemoryConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<DistributedMemoryConfig> = {}) {
    this.config = {
      enablePersistence: true,
      maxMemorySize: 100 * 1024 * 1024, // 100MB default
      cleanupInterval: 60000, // 1 minute
      enableCompression: false,
      enableEncryption: false,
      ...config
    };

    this.startCleanupTimer();
  }

  /**
   * Store a value in distributed memory
   */
  async store(key: string, value: any, options?: {
    ttl?: number;
    namespace?: string;
    agentId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const entry: MemoryEntry = {
      id: this.generateId(),
      key,
      value: this.config.enableCompression ? this.compress(value) : value,
      timestamp: new Date(),
      ttl: options?.ttl || this.config.defaultTTL,
      namespace: options?.namespace || 'default',
      agentId: options?.agentId,
      metadata: options?.metadata
    };

    this.memory.set(this.getStorageKey(key, entry.namespace), entry);

    if (this.config.enablePersistence) {
      await this.persistEntry(entry);
    }
  }

  /**
   * Retrieve a value from distributed memory
   */
  async retrieve(key: string, namespace?: string): Promise<any> {
    const storageKey = this.getStorageKey(key, namespace || 'default');
    const entry = this.memory.get(storageKey);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.memory.delete(storageKey);
      return null;
    }

    return this.config.enableCompression ? this.decompress(entry.value) : entry.value;
  }

  /**
   * Query memory entries
   */
  async query(query: MemoryQuery): Promise<MemoryEntry[]> {
    const entries = Array.from(this.memory.values());
    let filtered = entries;

    // Apply filters
    if (query.namespace) {
      filtered = filtered.filter(entry => entry.namespace === query.namespace);
    }

    if (query.agentId) {
      filtered = filtered.filter(entry => entry.agentId === query.agentId);
    }

    if (query.keyPattern) {
      const regex = new RegExp(query.keyPattern);
      filtered = filtered.filter(entry => regex.test(entry.key));
    }

    if (query.fromTimestamp) {
      filtered = filtered.filter(entry => entry.timestamp >= query.fromTimestamp!);
    }

    if (query.toTimestamp) {
      filtered = filtered.filter(entry => entry.timestamp <= query.toTimestamp!);
    }

    // Sort results
    if (query.orderBy) {
      filtered.sort((a, b) => {
        const aValue = query.orderBy === 'timestamp' ? a.timestamp.getTime() : a.key;
        const bValue = query.orderBy === 'timestamp' ? b.timestamp.getTime() : b.key;
        
        if (query.orderDirection === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // Apply limit
    if (query.limit) {
      filtered = filtered.slice(0, query.limit);
    }

    return filtered.filter(entry => !this.isExpired(entry));
  }

  /**
   * Delete an entry from memory
   */
  async delete(key: string, namespace?: string): Promise<boolean> {
    const storageKey = this.getStorageKey(key, namespace || 'default');
    return this.memory.delete(storageKey);
  }

  /**
   * Clear all entries in a namespace
   */
  async clearNamespace(namespace: string): Promise<number> {
    let deletedCount = 0;
    
    for (const [storageKey, entry] of this.memory.entries()) {
      if (entry.namespace === namespace) {
        this.memory.delete(storageKey);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<MemoryStats> {
    const entries = Array.from(this.memory.values());
    const namespaceCounts: Record<string, number> = {};
    const agentCounts: Record<string, number> = {};
    let expiredEntries = 0;
    let memoryUsage = 0;

    entries.forEach(entry => {
      // Count by namespace
      const namespace = entry.namespace || 'default';
      namespaceCounts[namespace] = (namespaceCounts[namespace] || 0) + 1;

      // Count by agent
      if (entry.agentId) {
        agentCounts[entry.agentId] = (agentCounts[entry.agentId] || 0) + 1;
      }

      // Check for expired entries
      if (this.isExpired(entry)) {
        expiredEntries++;
      }

      // Estimate memory usage
      memoryUsage += JSON.stringify(entry).length;
    });

    return {
      totalEntries: entries.length,
      namespaceCounts,
      agentCounts,
      memoryUsage,
      expiredEntries
    };
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<number> {
    let cleanedCount = 0;

    for (const [storageKey, entry] of this.memory.entries()) {
      if (this.isExpired(entry)) {
        this.memory.delete(storageKey);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Backup memory to external storage
   */
  async backup(): Promise<string> {
    const entries = Array.from(this.memory.values());
    const backup = {
      timestamp: new Date(),
      version: '1.0',
      entries: entries.filter(entry => !this.isExpired(entry))
    };

    return JSON.stringify(backup);
  }

  /**
   * Restore memory from backup
   */
  async restore(backupData: string): Promise<number> {
    try {
      const backup = JSON.parse(backupData);
      let restoredCount = 0;

      for (const entry of backup.entries) {
        const storageKey = this.getStorageKey(entry.key, entry.namespace);
        this.memory.set(storageKey, {
          ...entry,
          timestamp: new Date(entry.timestamp)
        });
        restoredCount++;
      }

      return restoredCount;
    } catch (error) {
      throw new Error(`Failed to restore memory: ${error}`);
    }
  }

  /**
   * Shutdown the memory system
   */
  async shutdown(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    if (this.config.enablePersistence) {
      await this.persistAllEntries();
    }
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStorageKey(key: string, namespace: string): string {
    return `${namespace}:${key}`;
  }

  private isExpired(entry: MemoryEntry): boolean {
    if (!entry.ttl) return false;
    return Date.now() > entry.timestamp.getTime() + entry.ttl;
  }

  private compress(value: any): any {
    // Compression implementation would go here
    return value;
  }

  private decompress(value: any): any {
    // Decompression implementation would go here
    return value;
  }

  private async persistEntry(entry: MemoryEntry): Promise<void> {
    // Persistence implementation would go here
  }

  private async persistAllEntries(): Promise<void> {
    // Bulk persistence implementation would go here
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanup();
    }, this.config.cleanupInterval);
  }
}

// Default distributed memory instance
export const defaultDistributedMemory = new DistributedMemorySystem();