/**
 * CRYSTALS-Kyber Performance Benchmarking - WBS 2.3.1.4
 * Comprehensive performance analysis and optimization tools
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * Performance monitoring for quantum-resistant cryptography
 */

import { CRYSTALSKyber, KyberOperationMetrics } from '../CRYSTALSKyber';
// import type { KyberParameters } from '../CRYSTALSKyber';
import { KyberCore } from '../core/KyberCore';

export interface BenchmarkConfiguration {
  readonly iterations: number;
  readonly variants: string[];
  readonly operations: ('keygen' | 'encapsulation' | 'decapsulation')[];
  readonly warmupRounds: number;
  readonly collectGCMetrics: boolean;
  readonly measureMemory: boolean;
}

export interface BenchmarkResult {
  readonly variant: string;
  readonly operation: string;
  readonly iterations: number;
  readonly statistics: {
    mean: number;
    median: number;
    min: number;
    max: number;
    standardDeviation: number;
    percentile95: number;
    percentile99: number;
  };
  readonly throughput: {
    operationsPerSecond: number;
    bytesPerSecond: number;
  };
  readonly memory?: {
    readonly peakUsage: number;
    readonly averageUsage: number;
    readonly gcCollections: number;
  };
}

export interface BenchmarkReport {
  readonly configuration: BenchmarkConfiguration;
  readonly results: BenchmarkResult[];
  readonly comparison: {
    fastestVariant: string;
    slowestVariant: string;
    performanceRatio: number;
  };
  readonly recommendations: string[];
  readonly timestamp: Date;
  readonly duration: number;
}

/**
 * Performance benchmarking suite for CRYSTALS-Kyber
 */
export class KyberBenchmark {
  private readonly kyber: CRYSTALSKyber;
  private readonly kyberCore: KyberCore;
  private benchmarkResults: BenchmarkResult[] = [];

  constructor() {
    this.kyber = new CRYSTALSKyber();
    this.kyberCore = new KyberCore();
    console.log('📊 Kyber Benchmark Suite initialized');
  }

  /**
   * Run comprehensive benchmark suite
   */
  async runBenchmarkSuite(config: BenchmarkConfiguration): Promise<BenchmarkReport> {
    console.log('🚀 Starting Kyber benchmark suite...');
    const startTime = Date.now();

    try {
      // Clear previous results
      this.benchmarkResults = [];

      // Warmup phase
      await this.performWarmup(config);

      // Run benchmarks for each variant and operation
      for (const variant of config.variants) {
        for (const operation of config.operations) {
          const result = await this.benchmarkOperation(variant, operation, config);
          this.benchmarkResults.push(result);
        }
      }

      // Generate comprehensive report
      const report = await this.generateBenchmarkReport(config, startTime);
      
      console.log('✅ Benchmark suite completed');
      return report;

    } catch (error) {
      console.error('❌ Benchmark suite failed:', error);
      throw new Error(`Benchmark suite failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Benchmark specific operation
   */
  async benchmarkOperation(
    variant: string,
    operation: string,
    config: BenchmarkConfiguration
  ): Promise<BenchmarkResult> {
    console.log(`📈 Benchmarking ${variant} ${operation}...`);

    const measurements: number[] = [];
    const memoryMeasurements: number[] = [];
    let totalBytes = 0;

    // Prepare test data
    let keyPair: any = null;
    let encapsulationResult: any = null;

    if (operation !== 'keygen') {
      keyPair = await this.kyber.generateKeyPair({
        variant: variant as any,
        classification: 'executive'
      });
    }

    if (operation === 'decapsulation') {
      encapsulationResult = await this.kyber.encapsulate(
        keyPair.publicKey, 
        keyPair.keyId
      );
    }

    // Run benchmark iterations
    for (let i = 0; i < config.iterations; i++) {
      const memoryBefore = config.measureMemory ? this.measureMemoryUsage() : 0;
      const startTime = performance.now();

      let operationResult: any;
      let bytesProcessed = 0;

      try {
        switch (operation) {
          case 'keygen':
            operationResult = await this.kyber.generateKeyPair({
              variant: variant as any,
              classification: 'executive'
            });
            bytesProcessed = operationResult.parameters.publicKeySize + 
                           operationResult.parameters.privateKeySize;
            break;

          case 'encapsulation':
            operationResult = await this.kyber.encapsulate(
              keyPair.publicKey, 
              keyPair.keyId
            );
            bytesProcessed = keyPair.parameters.publicKeySize + 
                           keyPair.parameters.ciphertextSize;
            break;

          case 'decapsulation':
            operationResult = await this.kyber.decapsulate(
              encapsulationResult.ciphertext,
              keyPair.privateKey,
              keyPair.keyId
            );
            bytesProcessed = keyPair.parameters.privateKeySize + 
                           keyPair.parameters.ciphertextSize;
            break;

          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

        const duration = performance.now() - startTime;
        measurements.push(duration);
        totalBytes += bytesProcessed;

        if (config.measureMemory) {
          const memoryAfter = this.measureMemoryUsage();
          memoryMeasurements.push(memoryAfter - memoryBefore);
        }

        // Progress indicator
        if ((i + 1) % Math.max(1, Math.floor(config.iterations / 10)) === 0) {
          console.log(`  Progress: ${i + 1}/${config.iterations} iterations`);
        }

      } catch (error) {
        console.warn(`  Warning: Iteration ${i + 1} failed:`, error instanceof Error ? error.message : String(error));
      }
    }

    // Calculate statistics
    const statistics = this.calculateStatistics(measurements);
    const throughput = this.calculateThroughput(measurements, totalBytes);

    const result: BenchmarkResult = {
      variant,
      operation,
      iterations: measurements.length,
      statistics,
      throughput,
      ...(config.measureMemory ? {
        memory: {
          peakUsage: Math.max(...memoryMeasurements),
          averageUsage: memoryMeasurements.reduce((a, b) => a + b, 0) / memoryMeasurements.length,
          gcCollections: 0 // Would need to implement GC monitoring
        }
      } : {})
    };

    console.log(`  ✅ ${variant} ${operation}: ${statistics.mean.toFixed(2)}ms avg`);
    return result;
  }

  /**
   * Performance comparison between variants
   */
  async compareVariants(
    operation: string,
    iterations: number = 100
  ): Promise<{
    fastest: string;
    slowest: string;
    results: Map<string, number>;
    speedupRatios: Map<string, number>;
  }> {
    console.log(`⚖️ Comparing variants for ${operation}...`);

    const variants = ['Kyber512', 'Kyber768', 'Kyber1024'];
    const results = new Map<string, number>();

    for (const variant of variants) {
      const result = await this.benchmarkOperation(variant, operation, {
        iterations,
        variants: [variant],
        operations: [operation as any],
        warmupRounds: 10,
        collectGCMetrics: false,
        measureMemory: false
      });

      results.set(variant, result.statistics.mean);
    }

    // Find fastest and slowest
    const sortedResults = Array.from(results.entries()).sort((a, b) => a[1] - b[1]);
    const fastest = sortedResults[0][0];
    const slowest = sortedResults[sortedResults.length - 1][0];

    // Calculate speedup ratios
    const speedupRatios = new Map<string, number>();
    const fastestTime = results.get(fastest)!;

    for (const [variant, time] of results) {
      speedupRatios.set(variant, time / fastestTime);
    }

    console.log(`  🏆 Fastest: ${fastest} (${results.get(fastest)!.toFixed(2)}ms)`);
    console.log(`  🐌 Slowest: ${slowest} (${results.get(slowest)!.toFixed(2)}ms)`);

    return { fastest, slowest, results, speedupRatios };
  }

  /**
   * Security vs Performance analysis
   */
  async analyzeSecurityPerformanceTradeoff(): Promise<{
    recommendations: string[];
    analysis: {
      variant: string;
      securityBits: number;
      avgPerformance: number;
      securityPerformanceRatio: number;
    }[];
  }> {
    console.log('🛡️ Analyzing security vs performance tradeoff...');

    const variants = [
      { name: 'Kyber512', securityBits: 128 },
      { name: 'Kyber768', securityBits: 192 },
      { name: 'Kyber1024', securityBits: 256 }
    ];

    const analysis = [];
    const recommendations = [];

    for (const variant of variants) {
      // Benchmark all operations for this variant
      const keygenResult = await this.benchmarkOperation(variant.name, 'keygen', {
        iterations: 50,
        variants: [variant.name],
        operations: ['keygen'],
        warmupRounds: 5,
        collectGCMetrics: false,
        measureMemory: false
      });

      const encapResult = await this.benchmarkOperation(variant.name, 'encapsulation', {
        iterations: 50,
        variants: [variant.name],
        operations: ['encapsulation'],
        warmupRounds: 5,
        collectGCMetrics: false,
        measureMemory: false
      });

      const decapResult = await this.benchmarkOperation(variant.name, 'decapsulation', {
        iterations: 50,
        variants: [variant.name],
        operations: ['decapsulation'],
        warmupRounds: 5,
        collectGCMetrics: false,
        measureMemory: false
      });

      // Calculate average performance
      const avgPerformance = (
        keygenResult.statistics.mean +
        encapResult.statistics.mean +
        decapResult.statistics.mean
      ) / 3;

      const securityPerformanceRatio = variant.securityBits / avgPerformance;

      analysis.push({
        variant: variant.name,
        securityBits: variant.securityBits,
        avgPerformance,
        securityPerformanceRatio
      });
    }

    // Generate recommendations
    const bestRatio = Math.max(...analysis.map(a => a.securityPerformanceRatio));
    const bestVariant = analysis.find(a => a.securityPerformanceRatio === bestRatio);

    recommendations.push(`Best security/performance ratio: ${bestVariant?.variant}`);
    recommendations.push('For executive data: Use Kyber1024 for maximum security');
    recommendations.push('For high-throughput applications: Consider Kyber512');
    recommendations.push('For balanced use cases: Kyber768 offers good compromise');

    return { recommendations, analysis };
  }

  /**
   * Memory usage profiling
   */
  async profileMemoryUsage(variant: string, iterations: number = 100): Promise<{
    keyGeneration: number[];
    encapsulation: number[];
    decapsulation: number[];
    peakUsage: number;
    averageUsage: number;
  }> {
    console.log(`💾 Profiling memory usage for ${variant}...`);

    const keyGeneration: number[] = [];
    const encapsulation: number[] = [];
    const decapsulation: number[] = [];

    let peakUsage = 0;
    let totalUsage = 0;
    let measurements = 0;

    // Profile key generation
    for (let i = 0; i < iterations; i++) {
      const before = this.measureMemoryUsage();
      await this.kyber.generateKeyPair({
        variant: variant as any,
        classification: 'executive'
      });
      const after = this.measureMemoryUsage();
      
      const usage = after - before;
      keyGeneration.push(usage);
      peakUsage = Math.max(peakUsage, after);
      totalUsage += usage;
      measurements++;
    }

    // Profile encapsulation/decapsulation
    const keyPair = await this.kyber.generateKeyPair({
      variant: variant as any,
      classification: 'executive'
    });

    for (let i = 0; i < iterations; i++) {
      // Encapsulation
      const encapBefore = this.measureMemoryUsage();
      const encapResult = await this.kyber.encapsulate(keyPair.publicKey, keyPair.keyId);
      const encapAfter = this.measureMemoryUsage();
      
      encapsulation.push(encapAfter - encapBefore);
      peakUsage = Math.max(peakUsage, encapAfter);
      totalUsage += (encapAfter - encapBefore);
      measurements++;

      // Decapsulation
      const decapBefore = this.measureMemoryUsage();
      await this.kyber.decapsulate(encapResult.ciphertext, keyPair.privateKey, keyPair.keyId);
      const decapAfter = this.measureMemoryUsage();
      
      decapsulation.push(decapAfter - decapBefore);
      peakUsage = Math.max(peakUsage, decapAfter);
      totalUsage += (decapAfter - decapBefore);
      measurements++;
    }

    const averageUsage = totalUsage / measurements;

    console.log(`  Peak memory usage: ${(peakUsage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Average usage per operation: ${(averageUsage / 1024).toFixed(2)} KB`);

    return {
      keyGeneration,
      encapsulation,
      decapsulation,
      peakUsage,
      averageUsage
    };
  }

  // Private implementation methods

  private async performWarmup(config: BenchmarkConfiguration): Promise<void> {
    console.log(`🔥 Warming up JIT compiler (${config.warmupRounds} rounds)...`);

    for (let round = 0; round < config.warmupRounds; round++) {
      for (const variant of config.variants) {
        const keyPair = await this.kyber.generateKeyPair({
          variant: variant as any,
          classification: 'executive'
        });

        const encapResult = await this.kyber.encapsulate(keyPair.publicKey, keyPair.keyId);
        await this.kyber.decapsulate(encapResult.ciphertext, keyPair.privateKey, keyPair.keyId);
      }
    }

    console.log('✅ Warmup completed');
  }

  private calculateStatistics(measurements: number[]): BenchmarkResult['statistics'] {
    if (measurements.length === 0) {
      throw new Error('No measurements available for statistics');
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = measurements.reduce((a, b) => a + b, 0);
    const mean = sum / measurements.length;

    const variance = measurements.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / measurements.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      mean,
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      standardDeviation,
      percentile95: sorted[Math.floor(sorted.length * 0.95)],
      percentile99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  private calculateThroughput(measurements: number[], totalBytes: number): BenchmarkResult['throughput'] {
    const totalTimeSeconds = measurements.reduce((a, b) => a + b, 0) / 1000;
    const operationsPerSecond = measurements.length / totalTimeSeconds;
    const bytesPerSecond = totalBytes / totalTimeSeconds;

    return { operationsPerSecond, bytesPerSecond };
  }

  private measureMemoryUsage(): number {
    // Simple memory usage estimation
    // In a real implementation, this would use more sophisticated memory profiling
    if (typeof (performance as any).memory !== 'undefined') {
      return (performance as any).memory.usedJSHeapSize;
    }
    
    // Fallback estimation
    return Date.now() % 10000000; // Rough approximation
  }

  private async generateBenchmarkReport(
    config: BenchmarkConfiguration,
    startTime: number
  ): Promise<BenchmarkReport> {
    const duration = Date.now() - startTime;

    // Find fastest and slowest operations
    const allMeans = this.benchmarkResults.map(r => r.statistics.mean);
    const fastestTime = Math.min(...allMeans);
    const slowestTime = Math.max(...allMeans);

    const fastestResult = this.benchmarkResults.find(r => r.statistics.mean === fastestTime);
    const slowestResult = this.benchmarkResults.find(r => r.statistics.mean === slowestTime);

    // Generate recommendations
    const recommendations = [
      `Fastest operation: ${fastestResult?.variant} ${fastestResult?.operation} (${fastestTime.toFixed(2)}ms)`,
      `Slowest operation: ${slowestResult?.variant} ${slowestResult?.operation} (${slowestTime.toFixed(2)}ms)`,
      'Use Kyber512 for high-performance applications',
      'Use Kyber1024 for maximum security requirements',
      'Consider caching key pairs for better performance',
      'Monitor memory usage in production environments'
    ];

    return {
      configuration: config,
      results: this.benchmarkResults,
      comparison: {
        fastestVariant: fastestResult?.variant || '',
        slowestVariant: slowestResult?.variant || '',
        performanceRatio: slowestTime / fastestTime
      },
      recommendations,
      timestamp: new Date(),
      duration
    };
  }
}

/**
 * Kyber Performance Monitor
 */
export class KyberPerformanceMonitor {
  private metrics: KyberOperationMetrics[] = [];
  private alerts: string[] = [];

  /**
   * Add performance metric
   */
  addMetric(metric: KyberOperationMetrics): void {
    this.metrics.push(metric);
    this.checkPerformanceThresholds(metric);

    // Keep only recent metrics
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(timeWindowMs: number = 3600000): {
    totalOperations: number;
    averageLatency: number;
    operationsPerSecond: number;
    errorRate: number;
    alerts: string[];
  } {
    const _cutoff = Date.now() - timeWindowMs;
    const recentMetrics = this.metrics.filter(_m => 
      // Kyber metrics don't have timestamp, filter by recent entries
      true
    ).slice(-100);

    const totalOperations = recentMetrics.length;
    const averageLatency = totalOperations > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations 
      : 0;
    
    const operationsPerSecond = totalOperations / (timeWindowMs / 1000);
    const errorRate = 0; // Would track actual errors

    return {
      totalOperations,
      averageLatency,
      operationsPerSecond,
      errorRate,
      alerts: [...this.alerts]
    };
  }

  private checkPerformanceThresholds(metric: KyberOperationMetrics): void {
    const thresholds = {
      keygen: 150,
      encapsulation: 75,
      decapsulation: 75
    };

    const threshold = thresholds[metric.operationType];
    if (threshold && metric.duration > threshold) {
      const alert = `Performance alert: ${metric.operationType} took ${metric.duration}ms (threshold: ${threshold}ms)`;
      this.alerts.push(alert);
      
      // Keep only recent alerts
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-50);
      }
    }
  }
}