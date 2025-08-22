/**
 * Optimized Threat Detection Configuration for <1s Latency
 * 
 * PERFORMANCE TARGETS:
 * - <1000ms total detection latency (SLA requirement)
 * - <500ms average detection latency (performance target)
 * - >90% SLA compliance rate
 * - >95% accuracy with <5% false positive rate
 * 
 * OPTIMIZATION CONFIGURATION:
 * - Component latency budgets for parallel processing
 * - Caching strategies for intelligence and patterns
 * - SIMD acceleration and vectorization settings
 * - Connection pooling and resource optimization
 * - Executive priority queuing and real-time response
 * 
 * @version 4.0.0
 * @author Executive Assistant Security Team
 */

import { UltraFastConfig } from './UltraFastThreatDetectionEngine';

// === PRODUCTION OPTIMIZED CONFIGURATIONS ===

export const ULTRA_FAST_PRODUCTION_CONFIG: UltraFastConfig = {
  // Core latency targets
  targetLatency: 1000, // 1 second SLA requirement
  streamBufferSize: 100,
  parallelProcessors: 4,
  
  // Advanced optimization settings
  optimization: {
    vectorization: true,
    simdAcceleration: true,
    parallelExecution: true,
    memoryMapping: true,
    connectionPooling: true,
    adaptiveBatching: true
  },
  
  // Component latency budgets (total: 900ms, 100ms buffer)
  performance: {
    maxConcurrentOperations: 50,
    componentLatencyBudgets: {
      streamProcessing: 85,      // Stream event processing
      mlInference: 165,          // ML prediction with SIMD
      behaviorAnalysis: 135,     // Behavior pattern analysis
      networkAnalysis: 75,       // Network traffic analysis
      cryptoValidation: 220,     // HSM cryptographic validation
      executiveAssessment: 85,   // Executive risk assessment
      alertGeneration: 35,       // Real-time alert generation
      responseExecution: 45      // Security response execution
    },
    resourceLimits: {
      maxMemoryMB: 512,
      maxCpuUtilization: 70,
      maxConcurrentConnections: 25,
      maxCacheSize: 50000
    },
    scalingPolicy: {
      autoScaling: true,
      scaleUpThreshold: 0.8,
      scaleDownThreshold: 0.3,
      maxInstances: 10
    }
  },
  
  // High-performance caching configuration
  caching: {
    enabled: true,
    strategy: 'lru',
    ttlMs: 300000, // 5 minutes
    maxEntries: 10000,
    preloadPatterns: true,
    compressionEnabled: true
  },
  
  // Real-time monitoring configuration
  monitoring: {
    realTimeMetrics: true,
    latencyTracking: true,
    performanceAlerting: true,
    bottleneckDetection: true,
    regressionDetection: true
  },
  
  // Ultra-fast specific optimizations
  ultraOptimization: {
    precomputedPatterns: true,
    predictivePreloading: true,
    adaptiveThrottling: true,
    executivePriorityQueuing: true,
    realTimeOptimization: true
  },
  
  // Streaming configuration
  streaming: {
    eventStreamBufferSize: 200,
    batchOptimizationEnabled: true,
    priorityBasedProcessing: true,
    concurrentStreamProcessors: 4
  },
  
  // Threat intelligence optimization
  intelligence: {
    preloadedThreatSignatures: 50000,
    intelligenceUpdateFrequency: 60000, // 1 minute
    correlationCacheSize: 25000,
    geoLocationCacheSize: 10000
  }
};

export const DEVELOPMENT_CONFIG: UltraFastConfig = {
  ...ULTRA_FAST_PRODUCTION_CONFIG,
  targetLatency: 1500, // Slightly relaxed for development
  performance: {
    ...ULTRA_FAST_PRODUCTION_CONFIG.performance,
    resourceLimits: {
      maxMemoryMB: 256,
      maxCpuUtilization: 85,
      maxConcurrentConnections: 15,
      maxCacheSize: 25000
    }
  },
  monitoring: {
    ...ULTRA_FAST_PRODUCTION_CONFIG.monitoring,
    realTimeMetrics: false // Reduced monitoring overhead in dev
  }
};

export const EXECUTIVE_PROTECTION_CONFIG: UltraFastConfig = {
  ...ULTRA_FAST_PRODUCTION_CONFIG,
  targetLatency: 500, // Ultra-fast for executive protection
  performance: {
    ...ULTRA_FAST_PRODUCTION_CONFIG.performance,
    componentLatencyBudgets: {
      streamProcessing: 50,      // Ultra-fast stream processing
      mlInference: 120,          // Optimized ML for executives
      behaviorAnalysis: 80,      // Fast behavior analysis
      networkAnalysis: 45,       // Rapid network analysis
      cryptoValidation: 150,     // Optimized HSM operations
      executiveAssessment: 50,   // Executive-specific assessment
      alertGeneration: 25,       // Immediate alert generation
      responseExecution: 30      // Rapid response execution
    },
    maxConcurrentOperations: 100 // Higher capacity for executives
  },
  ultraOptimization: {
    precomputedPatterns: true,
    predictivePreloading: true,
    adaptiveThrottling: false, // No throttling for executives
    executivePriorityQueuing: true,
    realTimeOptimization: true
  }
};

export const STRESS_TEST_CONFIG: UltraFastConfig = {
  ...ULTRA_FAST_PRODUCTION_CONFIG,
  performance: {
    ...ULTRA_FAST_PRODUCTION_CONFIG.performance,
    maxConcurrentOperations: 200,
    resourceLimits: {
      maxMemoryMB: 1024,
      maxCpuUtilization: 90,
      maxConcurrentConnections: 100,
      maxCacheSize: 100000
    }
  },
  streaming: {
    eventStreamBufferSize: 500,
    batchOptimizationEnabled: true,
    priorityBasedProcessing: true,
    concurrentStreamProcessors: 8
  }
};

// === PERFORMANCE BENCHMARK CONFIGURATIONS ===

export interface BenchmarkConfig {
  readonly name: string;
  readonly config: UltraFastConfig;
  readonly testScenarios: BenchmarkScenario[];
}

export interface BenchmarkScenario {
  readonly name: string;
  readonly concurrentRequests: number;
  readonly duration: number; // seconds
  readonly executiveRatio: number; // 0-1, percentage of executive requests
  readonly threatRatio: number; // 0-1, percentage of threat scenarios
}

export const PERFORMANCE_BENCHMARKS: BenchmarkConfig[] = [
  {
    name: 'Standard Load',
    config: ULTRA_FAST_PRODUCTION_CONFIG,
    testScenarios: [
      {
        name: 'Normal Operations',
        concurrentRequests: 50,
        duration: 60,
        executiveRatio: 0.1,
        threatRatio: 0.05
      },
      {
        name: 'Peak Hours',
        concurrentRequests: 100,
        duration: 120,
        executiveRatio: 0.15,
        threatRatio: 0.1
      }
    ]
  },
  {
    name: 'Executive Protection',
    config: EXECUTIVE_PROTECTION_CONFIG,
    testScenarios: [
      {
        name: 'Executive Focus',
        concurrentRequests: 25,
        duration: 60,
        executiveRatio: 0.8,
        threatRatio: 0.15
      },
      {
        name: 'Executive High Threat',
        concurrentRequests: 30,
        duration: 90,
        executiveRatio: 0.9,
        threatRatio: 0.3
      }
    ]
  },
  {
    name: 'Stress Testing',
    config: STRESS_TEST_CONFIG,
    testScenarios: [
      {
        name: 'High Concurrency',
        concurrentRequests: 200,
        duration: 180,
        executiveRatio: 0.2,
        threatRatio: 0.2
      },
      {
        name: 'Extreme Load',
        concurrentRequests: 500,
        duration: 300,
        executiveRatio: 0.3,
        threatRatio: 0.4
      }
    ]
  }
];

// === SLA COMPLIANCE THRESHOLDS ===

export interface SLAThresholds {
  readonly latency: {
    readonly p50: number; // 50th percentile
    readonly p95: number; // 95th percentile
    readonly p99: number; // 99th percentile
    readonly max: number; // Maximum allowed
  };
  readonly throughput: {
    readonly minRequestsPerSecond: number;
    readonly targetRequestsPerSecond: number;
  };
  readonly accuracy: {
    readonly minDetectionRate: number; // %
    readonly maxFalsePositiveRate: number; // %
    readonly minConfidenceScore: number;
  };
  readonly availability: {
    readonly minUptime: number; // %
    readonly maxMTTR: number; // seconds
  };
}

export const PRODUCTION_SLA_THRESHOLDS: SLAThresholds = {
  latency: {
    p50: 400,  // 400ms median
    p95: 800,  // 800ms 95th percentile
    p99: 950,  // 950ms 99th percentile
    max: 1000  // 1 second maximum
  },
  throughput: {
    minRequestsPerSecond: 50,
    targetRequestsPerSecond: 200
  },
  accuracy: {
    minDetectionRate: 90,     // 90% minimum detection rate
    maxFalsePositiveRate: 5,  // 5% maximum false positive rate
    minConfidenceScore: 0.8   // 80% minimum confidence
  },
  availability: {
    minUptime: 99.9,  // 99.9% uptime
    maxMTTR: 300      // 5 minutes maximum time to recovery
  }
};

export const EXECUTIVE_SLA_THRESHOLDS: SLAThresholds = {
  latency: {
    p50: 250,  // 250ms median for executives
    p95: 400,  // 400ms 95th percentile
    p99: 475,  // 475ms 99th percentile
    max: 500   // 500ms maximum for executives
  },
  throughput: {
    minRequestsPerSecond: 25,
    targetRequestsPerSecond: 100
  },
  accuracy: {
    minDetectionRate: 95,     // 95% minimum for executives
    maxFalsePositiveRate: 2,  // 2% maximum false positive rate
    minConfidenceScore: 0.9   // 90% minimum confidence
  },
  availability: {
    minUptime: 99.95, // 99.95% uptime for executives
    maxMTTR: 120      // 2 minutes maximum time to recovery
  }
};

// === CONFIGURATION FACTORY ===

export class ThreatDetectionConfigFactory {
  static createConfig(environment: 'development' | 'production' | 'executive' | 'stress'): UltraFastConfig {
    switch (environment) {
      case 'development':
        return DEVELOPMENT_CONFIG;
      case 'production':
        return ULTRA_FAST_PRODUCTION_CONFIG;
      case 'executive':
        return EXECUTIVE_PROTECTION_CONFIG;
      case 'stress':
        return STRESS_TEST_CONFIG;
      default:
        return ULTRA_FAST_PRODUCTION_CONFIG;
    }
  }
  
  static getSLAThresholds(environment: 'production' | 'executive'): SLAThresholds {
    switch (environment) {
      case 'executive':
        return EXECUTIVE_SLA_THRESHOLDS;
      case 'production':
      default:
        return PRODUCTION_SLA_THRESHOLDS;
    }
  }
  
  static createCustomConfig(
    baseEnvironment: 'development' | 'production' | 'executive' | 'stress',
    overrides: Partial<UltraFastConfig>
  ): UltraFastConfig {
    const baseConfig = this.createConfig(baseEnvironment);
    return {
      ...baseConfig,
      ...overrides,
      performance: {
        ...baseConfig.performance,
        ...(overrides.performance || {})
      },
      optimization: {
        ...baseConfig.optimization,
        ...(overrides.optimization || {})
      },
      caching: {
        ...baseConfig.caching,
        ...(overrides.caching || {})
      }
    };
  }
}

// === PERFORMANCE VALIDATION HELPERS ===

export class PerformanceValidator {
  static validateLatencyBudgets(config: UltraFastConfig): {
    valid: boolean;
    totalBudget: number;
    remainingBuffer: number;
    warnings: string[];
  } {
    const budgets = config.performance.componentLatencyBudgets;
    const totalBudget = Object.values(budgets).reduce((sum, budget) => sum + budget, 0);
    const remainingBuffer = config.targetLatency - totalBudget;
    const warnings: string[] = [];
    
    // Check if total budget exceeds target latency
    if (totalBudget >= config.targetLatency) {
      warnings.push(`Total budget (${totalBudget}ms) exceeds target latency (${config.targetLatency}ms)`);
    }
    
    // Check if buffer is too small
    if (remainingBuffer < 50) {
      warnings.push(`Remaining buffer (${remainingBuffer}ms) is very small, risk of SLA violations`);
    }
    
    // Check individual component budgets
    if (budgets.mlInference > 200) {
      warnings.push(`ML inference budget (${budgets.mlInference}ms) exceeds recommended maximum (200ms)`);
    }
    
    if (budgets.cryptoValidation > 250) {
      warnings.push(`Crypto validation budget (${budgets.cryptoValidation}ms) exceeds recommended maximum (250ms)`);
    }
    
    return {
      valid: warnings.length === 0,
      totalBudget,
      remainingBuffer,
      warnings
    };
  }
  
  static validateResourceLimits(config: UltraFastConfig): {
    valid: boolean;
    warnings: string[];
  } {
    const limits = config.performance.resourceLimits;
    const warnings: string[] = [];
    
    // Memory checks
    if (limits.maxMemoryMB < 256) {
      warnings.push(`Memory limit (${limits.maxMemoryMB}MB) may be too low for optimal performance`);
    }
    
    if (limits.maxMemoryMB > 2048) {
      warnings.push(`Memory limit (${limits.maxMemoryMB}MB) may be excessive`);
    }
    
    // CPU checks
    if (limits.maxCpuUtilization > 90) {
      warnings.push(`CPU utilization limit (${limits.maxCpuUtilization}%) is very high, risk of system instability`);
    }
    
    // Cache size checks
    if (limits.maxCacheSize < 10000) {
      warnings.push(`Cache size (${limits.maxCacheSize}) may be too small for effective caching`);
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }
}
