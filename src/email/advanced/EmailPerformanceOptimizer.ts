/**
 * Email Performance Optimizer - WBS 1.4.3
 * Advanced performance optimization for email processing
 */

import { EmailContent } from '../intelligence/EmailIntelligenceEngine';
import { EmailThread } from './UnifiedInboxManager';
import { PEAEmailContext } from './PEAEmailIntegrationLayer';

export interface PerformanceMetrics {
  processingTime: number; // milliseconds
  memoryUsage: number;    // bytes
  throughput: number;     // emails per second
  cacheHitRate: number;   // percentage
  errorRate: number;      // percentage
}

export interface OptimizationConfig {
  maxCacheSize: number;
  batchProcessingSize: number;
  concurrentProcessingLimit: number;
  enableLazyLoading: boolean;
  enablePredictivePrefetch: boolean;
  performanceTarget: number; // target processing time in ms
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  priority: number;
}

export interface ProcessingBatch {
  id: string;
  emails: EmailContent[];
  priority: number;
  estimatedProcessingTime: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
}

/**
 * Email Performance Optimizer
 * Provides advanced caching, batching, and performance monitoring
 */
export class EmailPerformanceOptimizer {
  private config: OptimizationConfig;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private processingQueue: ProcessingBatch[] = [];
  private metrics: PerformanceMetrics = {
    processingTime: 0,
    memoryUsage: 0,
    throughput: 0,
    cacheHitRate: 0,
    errorRate: 0
  };
  private performanceHistory: PerformanceMetrics[] = [];
  private concurrentProcessingCount = 0;

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      maxCacheSize: 1000,
      batchProcessingSize: 50,
      concurrentProcessingLimit: 5,
      enableLazyLoading: true,
      enablePredictivePrefetch: true,
      performanceTarget: 75, // 75ms target
      ...config
    };

    // Start periodic cache cleanup
    this.startCacheCleanup();
    
    console.log(`⚡ Email Performance Optimizer initialized with target: ${this.config.performanceTarget}ms`);
  }

  /**
   * Optimize email processing with caching and batching
   */
  async optimizeEmailProcessing<T>(
    emails: EmailContent[],
    processor: (email: EmailContent) => Promise<T>,
    cacheKey?: string
  ): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      if (cacheKey && this.config.enableLazyLoading) {
        const cached = this.getFromCache<T[]>(cacheKey);
        if (cached) {
          this.updateMetrics(Date.now() - startTime, true);
          return cached;
        }
      }

      // Create processing batches
      const batches = this.createProcessingBatches(emails);
      
      // Process batches with concurrency control
      const results = await this.processBatchesConcurrently(batches, processor);
      
      // Cache results if cache key provided
      if (cacheKey) {
        this.addToCache(cacheKey, results, this.calculateCachePriority(results.length));
      }

      const processingTime = Date.now() - startTime;
      this.updateMetrics(processingTime, false);
      
      console.log(`⚡ Optimized processing: ${emails.length} emails in ${processingTime}ms`);
      
      return results;
    } catch (error) {
      this.updateMetrics(Date.now() - startTime, false, true);
      throw error;
    }
  }

  /**
   * Optimize thread processing with predictive prefetching
   */
  async optimizeThreadProcessing(
    threads: EmailThread[],
    processor: (thread: EmailThread) => Promise<PEAEmailContext>
  ): Promise<PEAEmailContext[]> {
    const startTime = Date.now();
    
    // Sort threads by priority for optimal processing order
    const sortedThreads = this.prioritizeThreads(threads);
    
    // Enable predictive prefetching
    if (this.config.enablePredictivePrefetch) {
      this.prefetchRelatedData(sortedThreads);
    }

    const results: PEAEmailContext[] = [];
    const concurrentLimit = Math.min(this.config.concurrentProcessingLimit, sortedThreads.length);
    
    // Process threads in controlled concurrent batches
    for (let i = 0; i < sortedThreads.length; i += concurrentLimit) {
      const batch = sortedThreads.slice(i, i + concurrentLimit);
      const batchPromises = batch.map(async (thread) => {
        const cacheKey = `thread_context_${thread.id}`;
        const cached = this.getFromCache<PEAEmailContext>(cacheKey);
        
        if (cached) {
          return cached;
        }
        
        const result = await processor(thread);
        this.addToCache(cacheKey, result, this.calculateThreadPriority(thread));
        return result;
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const processingTime = Date.now() - startTime;
    this.updateMetrics(processingTime, false);
    
    console.log(`🧵 Optimized thread processing: ${threads.length} threads in ${processingTime}ms`);
    
    return results;
  }

  /**
   * Intelligent email batching based on processing characteristics
   */
  createProcessingBatches(emails: EmailContent[]): ProcessingBatch[] {
    const batches: ProcessingBatch[] = [];
    const batchSize = this.config.batchProcessingSize;
    
    // Group emails by processing complexity
    const complexityGroups = this.groupEmailsByComplexity(emails);
    
    Object.entries(complexityGroups).forEach(([complexity, groupEmails]) => {
      for (let i = 0; i < groupEmails.length; i += batchSize) {
        const batchEmails = groupEmails.slice(i, i + batchSize);
        const batch: ProcessingBatch = {
          id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          emails: batchEmails,
          priority: this.calculateBatchPriority(complexity, batchEmails),
          estimatedProcessingTime: this.estimateBatchProcessingTime(complexity, batchEmails.length),
          status: 'pending'
        };
        batches.push(batch);
      }
    });

    // Sort batches by priority
    return batches.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Process batches with concurrency control
   */
  private async processBatchesConcurrently<T>(
    batches: ProcessingBatch[],
    processor: (email: EmailContent) => Promise<T>
  ): Promise<T[]> {
    const results: T[] = [];
    const activeBatches: Promise<T[]>[] = [];

    for (const batch of batches) {
      // Wait if we've reached the concurrency limit
      if (activeBatches.length >= this.config.concurrentProcessingLimit) {
        const completedBatch = await Promise.race(activeBatches);
        results.push(...completedBatch);
        const completedIndex = activeBatches.findIndex(p => p === Promise.resolve(completedBatch));
        activeBatches.splice(completedIndex, 1);
      }

      // Process batch
      const batchPromise = this.processBatch(batch, processor);
      activeBatches.push(batchPromise);
    }

    // Wait for remaining batches
    const remainingResults = await Promise.all(activeBatches);
    remainingResults.forEach(batchResult => results.push(...batchResult));

    return results;
  }

  /**
   * Process individual batch
   */
  private async processBatch<T>(
    batch: ProcessingBatch,
    processor: (email: EmailContent) => Promise<T>
  ): Promise<T[]> {
    batch.status = 'processing';
    batch.startTime = Date.now();
    this.concurrentProcessingCount++;

    try {
      const results = await Promise.all(
        batch.emails.map(email => processor(email))
      );
      
      batch.status = 'completed';
      batch.endTime = Date.now();
      
      return results;
    } catch (error) {
      batch.status = 'failed';
      batch.endTime = Date.now();
      throw error;
    } finally {
      this.concurrentProcessingCount--;
    }
  }

  /**
   * Smart caching with LRU eviction and priority-based retention
   */
  addToCache<T>(key: string, data: T, priority: number = 1): void {
    // Check cache size limit
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictLowPriorityEntries();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
      priority
    };

    this.cache.set(key, entry);
  }

  /**
   * Retrieve from cache with access tracking
   */
  getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>;
    if (!entry) {
      return null;
    }

    // Check if entry is still valid (24 hour TTL)
    if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) {
      this.cache.delete(key);
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccess = Date.now();
    entry.priority = Math.min(entry.priority + 0.1, 10); // Boost priority on access

    return entry.data;
  }

  /**
   * Predictive prefetching based on patterns
   */
  private async prefetchRelatedData(threads: EmailThread[]): Promise<void> {
    const prefetchPromises: Promise<void>[] = [];

    threads.forEach(thread => {
      // Prefetch related threads with similar participants
      const relatedThreadKeys = this.findRelatedThreadKeys(thread);
      relatedThreadKeys.forEach(key => {
        if (!this.cache.has(key)) {
          // This would trigger background prefetching
          prefetchPromises.push(this.backgroundPrefetch(key));
        }
      });
    });

    // Don't wait for prefetching to complete
    Promise.all(prefetchPromises).catch(error => {
      console.warn('Prefetching failed:', error);
    });
  }

  /**
   * Background prefetching
   */
  private async backgroundPrefetch(key: string): Promise<void> {
    // Implementation would depend on the specific data being prefetched
    // This is a placeholder for the prefetching logic
    console.log(`🔮 Background prefetching: ${key}`);
  }

  /**
   * Performance monitoring and metrics collection
   */
  private updateMetrics(processingTime: number, cacheHit: boolean, error: boolean = false): void {
    this.metrics.processingTime = processingTime;
    this.metrics.memoryUsage = this.estimateMemoryUsage();
    this.metrics.cacheHitRate = this.calculateCacheHitRate(cacheHit);
    this.metrics.errorRate = this.calculateErrorRate(error);
    this.metrics.throughput = 1000 / processingTime; // emails per second

    // Store in history for trend analysis
    this.performanceHistory.push({ ...this.metrics });
    
    // Keep only last 100 entries
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }

    // Log performance warnings
    if (processingTime > this.config.performanceTarget) {
      console.warn(`⚠️ Performance target exceeded: ${processingTime}ms > ${this.config.performanceTarget}ms`);
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance trend analysis
   */
  getPerformanceTrends(): {
    averageProcessingTime: number;
    performanceImprovement: number;
    cacheEfficiency: number;
    reliabilityScore: number;
  } {
    if (this.performanceHistory.length < 2) {
      return {
        averageProcessingTime: this.metrics.processingTime,
        performanceImprovement: 0,
        cacheEfficiency: this.metrics.cacheHitRate,
        reliabilityScore: 100 - this.metrics.errorRate
      };
    }

    const recent = this.performanceHistory.slice(-10);
    const older = this.performanceHistory.slice(-20, -10);

    const recentAvg = recent.reduce((sum, m) => sum + m.processingTime, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, m) => sum + m.processingTime, 0) / older.length : recentAvg;

    return {
      averageProcessingTime: recentAvg,
      performanceImprovement: ((olderAvg - recentAvg) / olderAvg) * 100,
      cacheEfficiency: recent.reduce((sum, m) => sum + m.cacheHitRate, 0) / recent.length,
      reliabilityScore: 100 - (recent.reduce((sum, m) => sum + m.errorRate, 0) / recent.length)
    };
  }

  /**
   * Optimize cache configuration based on usage patterns
   */
  optimizeCacheConfiguration(): void {
    const trends = this.getPerformanceTrends();
    
    // Adjust cache size based on hit rate
    if (trends.cacheEfficiency < 50) {
      this.config.maxCacheSize = Math.min(this.config.maxCacheSize * 1.2, 2000);
      console.log(`📈 Increased cache size to ${this.config.maxCacheSize}`);
    } else if (trends.cacheEfficiency > 90) {
      this.config.maxCacheSize = Math.max(this.config.maxCacheSize * 0.9, 500);
      console.log(`📉 Decreased cache size to ${this.config.maxCacheSize}`);
    }

    // Adjust batch size based on processing time
    if (trends.averageProcessingTime > this.config.performanceTarget * 1.5) {
      this.config.batchProcessingSize = Math.max(this.config.batchProcessingSize * 0.8, 10);
      console.log(`🔧 Reduced batch size to ${this.config.batchProcessingSize}`);
    } else if (trends.averageProcessingTime < this.config.performanceTarget * 0.7) {
      this.config.batchProcessingSize = Math.min(this.config.batchProcessingSize * 1.2, 100);
      console.log(`🔧 Increased batch size to ${this.config.batchProcessingSize}`);
    }
  }

  // Helper methods

  private groupEmailsByComplexity(emails: EmailContent[]): { [complexity: string]: EmailContent[] } {
    const groups = { simple: [], medium: [], complex: [] } as { [key: string]: EmailContent[] };

    emails.forEach(email => {
      const complexity = this.assessEmailComplexity(email);
      groups[complexity].push(email);
    });

    return groups;
  }

  private assessEmailComplexity(email: EmailContent): 'simple' | 'medium' | 'complex' {
    const factors = [
      email.body.length > 1000,
      email.to.length > 5,
      (email.cc?.length || 0) > 3,
      (email.attachments?.length || 0) > 0,
      email.subject.length > 100
    ];

    const complexityScore = factors.filter(Boolean).length;
    if (complexityScore >= 3) return 'complex';
    if (complexityScore >= 1) return 'medium';
    return 'simple';
  }

  private calculateBatchPriority(complexity: string, emails: EmailContent[]): number {
    const complexityScore = { simple: 1, medium: 2, complex: 3 }[complexity] || 1;
    const sizeScore = Math.min(emails.length / 10, 5);
    return complexityScore + sizeScore;
  }

  private estimateBatchProcessingTime(complexity: string, emailCount: number): number {
    const baseTime = { simple: 10, medium: 25, complex: 50 }[complexity] || 25;
    return baseTime * emailCount;
  }

  private prioritizeThreads(threads: EmailThread[]): EmailThread[] {
    return threads.sort((a, b) => {
      const priorityA = this.calculateThreadPriority(a);
      const priorityB = this.calculateThreadPriority(b);
      return priorityB - priorityA;
    });
  }

  private calculateThreadPriority(thread: EmailThread): number {
    let priority = thread.priority || 0;
    
    // Boost priority for recent activity
    const hoursSinceActivity = (Date.now() - thread.lastActivity.getTime()) / (1000 * 60 * 60);
    if (hoursSinceActivity < 1) priority += 5;
    else if (hoursSinceActivity < 24) priority += 2;
    
    // Boost for thread complexity
    priority += Math.min(thread.messages.length / 5, 3);
    priority += Math.min(thread.participants.length / 3, 2);
    
    return priority;
  }

  private calculateCachePriority(dataSize: number): number {
    // Higher priority for larger result sets (more expensive to recompute)
    return Math.min(dataSize / 10, 10);
  }

  private evictLowPriorityEntries(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by priority (lower first) and last access time
    entries.sort(([, a], [, b]) => {
      const priorityDiff = a.priority - b.priority;
      if (priorityDiff !== 0) return priorityDiff;
      return a.lastAccess - b.lastAccess;
    });

    // Remove lowest priority entries (25% of cache)
    const removeCount = Math.floor(this.config.maxCacheSize * 0.25);
    for (let i = 0; i < removeCount && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }

    console.log(`🗑️ Evicted ${removeCount} cache entries`);
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      this.optimizeCacheConfiguration();
      
      // Clean up expired entries
      const now = Date.now();
      const expiredKeys: string[] = [];
      
      this.cache.forEach((entry, key) => {
        if (now - entry.timestamp > 24 * 60 * 60 * 1000) { // 24 hours
          expiredKeys.push(key);
        }
      });
      
      expiredKeys.forEach(key => this.cache.delete(key));
      
      if (expiredKeys.length > 0) {
        console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private findRelatedThreadKeys(thread: EmailThread): string[] {
    // Find threads with overlapping participants
    return thread.participants.map(participant => `thread_by_participant_${participant}`);
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    this.cache.forEach(entry => {
      // Rough estimation of memory usage
      totalSize += JSON.stringify(entry.data).length * 2; // 2 bytes per character
    });
    return totalSize;
  }

  private calculateCacheHitRate(wasHit: boolean): number {
    // Simple running average - in production, use more sophisticated tracking
    const weight = 0.1;
    const hitValue = wasHit ? 100 : 0;
    return this.metrics.cacheHitRate * (1 - weight) + hitValue * weight;
  }

  private calculateErrorRate(hadError: boolean): number {
    // Simple running average - in production, use more sophisticated tracking
    const weight = 0.1;
    const errorValue = hadError ? 100 : 0;
    return this.metrics.errorRate * (1 - weight) + errorValue * weight;
  }

  /**
   * Clear cache for testing or memory management
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    memoryUsage: number;
    hitRate: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);
    
    return {
      size: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
      hitRate: this.metrics.cacheHitRate,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };
  }
}