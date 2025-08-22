/**
 * CRYSTALS-Dilithium Performance Benchmark - WBS 2.3.2.3
 * Comprehensive performance testing and optimization analysis
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * Performance benchmarking for quantum-resistant digital signatures
 */

import { CRYSTALSDilithium, DilithiumKeyPair } from '../CRYSTALSDilithium';
import { DilithiumHSMIntegration } from '../DilithiumHSMIntegration';
import { HSMInterface } from '../../hsm/HSMInterface';

export interface BenchmarkConfig {
  readonly iterations: number;
  readonly variants: string[];
  readonly messageSizes: number[];
  readonly concurrency: number;
  readonly warmupRounds: number;
  readonly targetLatency: number; // milliseconds
}

export interface BenchmarkResult {
  readonly variant: string;
  readonly operation: string;
  readonly messageSize?: number;
  readonly iterations: number;
  readonly totalTime: number;
  readonly averageTime: number;
  readonly medianTime: number;
  readonly minTime: number;
  readonly maxTime: number;
  readonly standardDeviation: number;
  readonly throughput: number; // operations per second
  readonly successRate: number;
  readonly targetMet: boolean;
}

export interface BenchmarkSuite {
  readonly config: BenchmarkConfig;
  readonly results: BenchmarkResult[];
  readonly summary: BenchmarkSummary;
  readonly timestamp: Date;
  readonly environment: BenchmarkEnvironment;
}

export interface BenchmarkSummary {
  readonly totalOperations: number;
  readonly totalTime: number;
  readonly overallThroughput: number;
  readonly targetsMet: number;
  readonly targetsTotal: number;
  readonly performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  readonly recommendations: string[];
}

export interface BenchmarkEnvironment {
  readonly nodeVersion: string;
  readonly platform: string;
  readonly cpuCores: number;
  readonly memoryMB: number;
  readonly hsmMode: 'production' | 'simulation';
}

/**
 * Dilithium Performance Benchmark Suite
 */
export class DilithiumBenchmark {
  private readonly dilithium: CRYSTALSDilithium;
  private readonly hsmIntegration?: DilithiumHSMIntegration;
  private readonly config: BenchmarkConfig;

  constructor(config: BenchmarkConfig, hsmIntegration?: DilithiumHSMIntegration) {
    this.dilithium = new CRYSTALSDilithium();
    this.hsmIntegration = hsmIntegration;
    this.config = config;
    
    console.log('🚀 Dilithium Benchmark Suite initialized');
  }

  /**
   * Run complete benchmark suite
   */
  async runBenchmarkSuite(): Promise<BenchmarkSuite> {
    console.log('🏁 Starting Dilithium benchmark suite...');
    
    const startTime = Date.now();
    const results: BenchmarkResult[] = [];

    // Warmup rounds
    await this.performWarmup();

    // Benchmark key generation
    for (const variant of this.config.variants) {
      const keyGenResult = await this.benchmarkKeyGeneration(variant);
      results.push(keyGenResult);
    }

    // Benchmark signing operations
    for (const variant of this.config.variants) {
      for (const messageSize of this.config.messageSizes) {
        const signResult = await this.benchmarkSigning(variant, messageSize);
        results.push(signResult);
      }
    }

    // Benchmark verification operations
    for (const variant of this.config.variants) {
      for (const messageSize of this.config.messageSizes) {
        const verifyResult = await this.benchmarkVerification(variant, messageSize);
        results.push(verifyResult);
      }
    }

    // HSM benchmarks if available
    if (this.hsmIntegration) {
      const hsmResults = await this.benchmarkHSMOperations();
      results.push(...hsmResults);
    }

    const totalTime = Date.now() - startTime;
    const summary = this.generateSummary(results, totalTime);
    const environment = await this.getEnvironmentInfo();

    const suite: BenchmarkSuite = {
      config: this.config,
      results,
      summary,
      timestamp: new Date(),
      environment
    };

    console.log(`✅ Benchmark suite completed in ${totalTime}ms`);
    this.printSummary(suite);

    return suite;
  }

  /**
   * Benchmark key generation performance
   */
  async benchmarkKeyGeneration(variant: string): Promise<BenchmarkResult> {
    console.log(`🔑 Benchmarking key generation: ${variant}`);
    
    const times: number[] = [];
    let successCount = 0;

    for (let i = 0; i < this.config.iterations; i++) {
      try {
        const startTime = Date.now();
        
        await this.dilithium.generateKeyPair({
          variant: variant as any,
          classification: 'executive'
        });
        
        const duration = Date.now() - startTime;
        times.push(duration);
        successCount++;
        
      } catch (error) {
        console.warn(`Key generation failed for ${variant}: ${error.message}`);
      }
    }

    return this.calculateBenchmarkResult({
      variant,
      operation: 'key_generation',
      times,
      successCount,
      totalIterations: this.config.iterations
    });
  }

  /**
   * Benchmark signing performance
   */
  async benchmarkSigning(variant: string, messageSize: number): Promise<BenchmarkResult> {
    console.log(`✍️ Benchmarking signing: ${variant} (${messageSize} bytes)`);
    
    // Generate key pair for testing
    const keyPair = await this.dilithium.generateKeyPair({
      variant: variant as any,
      classification: 'executive'
    });

    // Generate test message
    const message = new Uint8Array(messageSize);
    crypto.getRandomValues(message);

    const times: number[] = [];
    let successCount = 0;

    for (let i = 0; i < this.config.iterations; i++) {
      try {
        const startTime = Date.now();
        
        await this.dilithium.sign(message, keyPair.privateKey, keyPair.keyId);
        
        const duration = Date.now() - startTime;
        times.push(duration);
        successCount++;
        
      } catch (error) {
        console.warn(`Signing failed for ${variant}: ${error.message}`);
      }
    }

    return this.calculateBenchmarkResult({
      variant,
      operation: 'signing',
      messageSize,
      times,
      successCount,
      totalIterations: this.config.iterations
    });
  }

  /**
   * Benchmark verification performance
   */
  async benchmarkVerification(variant: string, messageSize: number): Promise<BenchmarkResult> {
    console.log(`🔍 Benchmarking verification: ${variant} (${messageSize} bytes)`);
    
    // Generate key pair and signature for testing
    const keyPair = await this.dilithium.generateKeyPair({
      variant: variant as any,
      classification: 'executive'
    });

    const message = new Uint8Array(messageSize);
    crypto.getRandomValues(message);

    const signResult = await this.dilithium.sign(message, keyPair.privateKey, keyPair.keyId);

    const times: number[] = [];
    let successCount = 0;

    for (let i = 0; i < this.config.iterations; i++) {
      try {
        const startTime = Date.now();
        
        await this.dilithium.verify(message, signResult.signature, keyPair.publicKey, keyPair.keyId);
        
        const duration = Date.now() - startTime;
        times.push(duration);
        successCount++;
        
      } catch (error) {
        console.warn(`Verification failed for ${variant}: ${error.message}`);
      }
    }

    return this.calculateBenchmarkResult({
      variant,
      operation: 'verification',
      messageSize,
      times,
      successCount,
      totalIterations: this.config.iterations
    });
  }

  /**
   * Benchmark HSM operations
   */
  async benchmarkHSMOperations(): Promise<BenchmarkResult[]> {
    if (!this.hsmIntegration) {
      return [];
    }

    console.log('🏭 Benchmarking HSM operations...');
    
    const results: BenchmarkResult[] = [];

    // HSM Key Generation
    const hsmKeyGenTimes: number[] = [];
    let hsmKeyGenSuccess = 0;

    for (let i = 0; i < Math.min(this.config.iterations, 10); i++) {
      try {
        const startTime = Date.now();
        
        await this.hsmIntegration.generateHSMKeyPair({
          variant: 'Dilithium5',
          classification: 'executive'
        });
        
        const duration = Date.now() - startTime;
        hsmKeyGenTimes.push(duration);
        hsmKeyGenSuccess++;
        
      } catch (error) {
        console.warn(`HSM key generation failed: ${error.message}`);
      }
    }

    if (hsmKeyGenTimes.length > 0) {
      results.push(this.calculateBenchmarkResult({
        variant: 'HSM-Dilithium5',
        operation: 'hsm_key_generation',
        times: hsmKeyGenTimes,
        successCount: hsmKeyGenSuccess,
        totalIterations: Math.min(this.config.iterations, 10)
      }));
    }

    return results;
  }

  /**
   * Benchmark concurrent operations
   */
  async benchmarkConcurrentOperations(): Promise<BenchmarkResult> {
    console.log(`🚀 Benchmarking concurrent operations (${this.config.concurrency} workers)`);
    
    const keyPair = await this.dilithium.generateKeyPair({
      variant: 'Dilithium3',
      classification: 'executive'
    });

    const message = new Uint8Array(1024);
    crypto.getRandomValues(message);

    const times: number[] = [];
    const batchSize = Math.ceil(this.config.iterations / this.config.concurrency);
    
    const startTime = Date.now();
    
    const promises = Array.from({ length: this.config.concurrency }, async () => {
      const batchTimes: number[] = [];
      
      for (let i = 0; i < batchSize; i++) {
        const operationStart = Date.now();
        
        try {
          await this.dilithium.sign(message, keyPair.privateKey, keyPair.keyId);
          batchTimes.push(Date.now() - operationStart);
        } catch (error) {
          console.warn(`Concurrent operation failed: ${error.message}`);
        }
      }
      
      return batchTimes;
    });

    const results = await Promise.all(promises);
    results.forEach(batchTimes => times.push(...batchTimes));
    
    const totalTime = Date.now() - startTime;
    const successCount = times.length;

    return {
      variant: 'Dilithium3',
      operation: 'concurrent_signing',
      iterations: successCount,
      totalTime,
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      medianTime: this.calculateMedian(times),
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      standardDeviation: this.calculateStandardDeviation(times),
      throughput: (successCount / totalTime) * 1000,
      successRate: (successCount / this.config.iterations) * 100,
      targetMet: times.reduce((sum, time) => sum + time, 0) / times.length < this.config.targetLatency
    };
  }

  /**
   * Memory usage benchmark
   */
  async benchmarkMemoryUsage(): Promise<{
    keyPairMemory: number;
    signatureMemory: number;
    peakMemory: number;
    recommendations: string[];
  }> {
    console.log('💾 Benchmarking memory usage...');
    
    const initialMemory = this.getMemoryUsage();
    
    // Generate multiple key pairs
    const keyPairs: DilithiumKeyPair[] = [];
    for (let i = 0; i < 10; i++) {
      const keyPair = await this.dilithium.generateKeyPair({
        variant: 'Dilithium5',
        classification: 'executive'
      });
      keyPairs.push(keyPair);
    }
    
    const keyPairMemory = this.getMemoryUsage() - initialMemory;
    
    // Generate multiple signatures
    const message = new Uint8Array(1024);
    crypto.getRandomValues(message);
    
    const signatures = [];
    for (const keyPair of keyPairs) {
      const signature = await this.dilithium.sign(message, keyPair.privateKey, keyPair.keyId);
      signatures.push(signature);
    }
    
    const signatureMemory = this.getMemoryUsage() - initialMemory - keyPairMemory;
    const peakMemory = this.getMemoryUsage();
    
    const recommendations: string[] = [];
    
    if (keyPairMemory > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Consider key pair caching optimization');
    }
    
    if (signatureMemory > 20 * 1024 * 1024) { // 20MB
      recommendations.push('Implement signature streaming for large batches');
    }
    
    if (peakMemory > 100 * 1024 * 1024) { // 100MB
      recommendations.push('Memory usage exceeds recommended limits');
    }

    return {
      keyPairMemory,
      signatureMemory,
      peakMemory,
      recommendations
    };
  }

  // Private helper methods

  private async performWarmup(): Promise<void> {
    console.log('🔥 Performing warmup rounds...');
    
    for (let i = 0; i < this.config.warmupRounds; i++) {
      try {
        const keyPair = await this.dilithium.generateKeyPair({
          variant: 'Dilithium3',
          classification: 'executive'
        });
        
        const message = new Uint8Array(512);
        crypto.getRandomValues(message);
        
        const signature = await this.dilithium.sign(message, keyPair.privateKey, keyPair.keyId);
        await this.dilithium.verify(message, signature.signature, keyPair.publicKey, keyPair.keyId);
        
      } catch (error) {
        console.warn(`Warmup round ${i + 1} failed: ${error.message}`);
      }
    }
    
    console.log('✅ Warmup completed');
  }

  private calculateBenchmarkResult(params: {
    variant: string;
    operation: string;
    messageSize?: number;
    times: number[];
    successCount: number;
    totalIterations: number;
  }): BenchmarkResult {
    const { variant, operation, messageSize, times, successCount, totalIterations } = params;
    
    if (times.length === 0) {
      return {
        variant,
        operation,
        messageSize,
        iterations: totalIterations,
        totalTime: 0,
        averageTime: 0,
        medianTime: 0,
        minTime: 0,
        maxTime: 0,
        standardDeviation: 0,
        throughput: 0,
        successRate: 0,
        targetMet: false
      };
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / times.length;
    const medianTime = this.calculateMedian(times);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const standardDeviation = this.calculateStandardDeviation(times);
    const throughput = (times.length / totalTime) * 1000; // ops per second
    const successRate = (successCount / totalIterations) * 100;
    const targetMet = averageTime < this.config.targetLatency;

    return {
      variant,
      operation,
      messageSize,
      iterations: times.length,
      totalTime,
      averageTime,
      medianTime,
      minTime,
      maxTime,
      standardDeviation,
      throughput,
      successRate,
      targetMet
    };
  }

  private generateSummary(results: BenchmarkResult[], totalTime: number): BenchmarkSummary {
    const totalOperations = results.reduce((sum, result) => sum + result.iterations, 0);
    const overallThroughput = (totalOperations / totalTime) * 1000;
    const targetsMet = results.filter(result => result.targetMet).length;
    const targetsTotal = results.length;

    // Calculate performance grade
    const targetPercentage = (targetsMet / targetsTotal) * 100;
    let performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    
    if (targetPercentage >= 90) performanceGrade = 'A';
    else if (targetPercentage >= 80) performanceGrade = 'B';
    else if (targetPercentage >= 70) performanceGrade = 'C';
    else if (targetPercentage >= 60) performanceGrade = 'D';
    else performanceGrade = 'F';

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (performanceGrade === 'F') {
      recommendations.push('Critical performance issues detected - review implementation');
    } else if (performanceGrade === 'D') {
      recommendations.push('Performance below acceptable levels - optimization required');
    }
    
    const slowOperations = results.filter(r => !r.targetMet);
    if (slowOperations.length > 0) {
      const slowOps = slowOperations.map(r => `${r.operation}(${r.variant})`).join(', ');
      recommendations.push(`Optimize slow operations: ${slowOps}`);
    }
    
    if (overallThroughput < 100) {
      recommendations.push('Overall throughput below 100 ops/sec - consider parallel processing');
    }

    return {
      totalOperations,
      totalTime,
      overallThroughput,
      targetsMet,
      targetsTotal,
      performanceGrade,
      recommendations
    };
  }

  private async getEnvironmentInfo(): Promise<BenchmarkEnvironment> {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      cpuCores: require('os').cpus().length,
      memoryMB: Math.round(require('os').totalmem() / 1024 / 1024),
      hsmMode: this.hsmIntegration ? 'production' : 'simulation'
    };
  }

  private getMemoryUsage(): number {
    return process.memoryUsage().heapUsed;
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  private calculateStandardDeviation(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  private printSummary(suite: BenchmarkSuite): void {
    console.log('\n📊 DILITHIUM BENCHMARK SUMMARY');
    console.log('='.repeat(50));
    console.log(`Performance Grade: ${suite.summary.performanceGrade}`);
    console.log(`Total Operations: ${suite.summary.totalOperations}`);
    console.log(`Overall Throughput: ${suite.summary.overallThroughput.toFixed(2)} ops/sec`);
    console.log(`Targets Met: ${suite.summary.targetsMet}/${suite.summary.targetsTotal}`);
    console.log(`Environment: ${suite.environment.platform} (${suite.environment.cpuCores} cores)`);
    
    if (suite.summary.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      suite.summary.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
    
    console.log('\n📈 TOP PERFORMERS:');
    const sortedResults = [...suite.results].sort((a, b) => b.throughput - a.throughput);
    sortedResults.slice(0, 5).forEach(result => {
      console.log(`  ${result.operation}(${result.variant}): ${result.throughput.toFixed(2)} ops/sec`);
    });
  }
}

/**
 * Create default benchmark configuration
 */
export function createDefaultBenchmarkConfig(): BenchmarkConfig {
  return {
    iterations: 100,
    variants: ['Dilithium2', 'Dilithium3', 'Dilithium5'],
    messageSizes: [32, 256, 1024, 4096],
    concurrency: 4,
    warmupRounds: 10,
    targetLatency: 100 // 100ms target
  };
}

/**
 * Executive-grade benchmark configuration
 */
export function createExecutiveBenchmarkConfig(): BenchmarkConfig {
  return {
    iterations: 500,
    variants: ['Dilithium3', 'Dilithium5'],
    messageSizes: [256, 1024, 4096, 16384],
    concurrency: 8,
    warmupRounds: 50,
    targetLatency: 50 // 50ms target for executive grade
  };
}