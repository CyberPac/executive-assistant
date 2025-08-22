/**
 * Performance Testing Configuration
 * Defines thresholds, baselines, and test parameters
 */

const PERFORMANCE_TARGETS = {
  // Agent coordination performance targets
  agentCoordination: {
    latency: {
      target: 1,        // <1ms target
      warning: 0.8,     // 80% of target
      critical: 1.5     // 150% of target
    },
    throughput: {
      target: 10000,    // operations per second
      warning: 8000,
      critical: 5000
    }
  },

  // API response time targets
  apiResponse: {
    latency: {
      target: 75,       // <75ms Phase 2 target
      warning: 60,      // 80% of target
      critical: 100     // 133% of target
    },
    p95: {
      target: 150,      // 95th percentile
      warning: 120,
      critical: 200
    },
    p99: {
      target: 300,      // 99th percentile
      warning: 250,
      critical: 400
    }
  },

  // Memory operations targets
  memoryOperations: {
    latency: {
      target: 10,       // <10ms target
      warning: 8,
      critical: 15
    },
    throughput: {
      target: 50000,    // operations per second
      warning: 40000,
      critical: 25000
    }
  },

  // System performance targets
  system: {
    startup: {
      target: 5000,     // <5 seconds
      warning: 4000,
      critical: 7000
    },
    concurrentUsers: {
      target: 1000,     // concurrent users
      warning: 800,
      critical: 500
    },
    cpuUsage: {
      target: 70,       // max CPU usage %
      warning: 60,
      critical: 85
    },
    memoryUsage: {
      target: 80,       // max memory usage %
      warning: 70,
      critical: 90
    }
  }
};

const TEST_CONFIGURATIONS = {
  // Load testing configurations
  load: {
    rampUp: {
      duration: 30,     // seconds
      stages: [
        { duration: 10, target: 10 },
        { duration: 20, target: 100 },
        { duration: 30, target: 500 },
        { duration: 60, target: 1000 }
      ]
    },
    stress: {
      duration: 60,
      stages: [
        { duration: 30, target: 2000 },
        { duration: 60, target: 3000 },
        { duration: 30, target: 0 }
      ]
    },
    endurance: {
      duration: 600,    // 10 minutes
      target: 500
    }
  },

  // Benchmark configurations
  benchmark: {
    warmupIterations: 100,
    measurementIterations: 1000,
    samples: 10,
    timeout: 30000
  },

  // Regression detection
  regression: {
    baselineSamples: 50,
    comparisonSamples: 30,
    significanceThreshold: 0.05,  // 5% regression threshold
    minSampleSize: 10
  }
};

const BASELINE_STORAGE = {
  path: './tests/performance/baselines/',
  retention: 30,      // days
  format: 'json'
};

const REPORTING = {
  output: './tests/performance/reports/',
  formats: ['json', 'html', 'junit'],
  includeGraphs: true,
  includeHistograms: true
};

module.exports = {
  PERFORMANCE_TARGETS,
  TEST_CONFIGURATIONS,
  BASELINE_STORAGE,
  REPORTING
};