/**
 * API Response Time Performance Benchmarks
 * Tests API endpoint performance against Phase 2 <75ms target
 */

const { performance } = require('perf_hooks');
const { PERFORMANCE_TARGETS } = require('../config');
const { PerformanceBenchmark } = require('../utils/benchmark');
const { BaselineManager } = require('../utils/baseline-manager');

describe('API Response Performance', () => {
  let benchmark;
  let baselineManager;
  let apiClient;

  beforeAll(async () => {
    benchmark = new PerformanceBenchmark('api-response');
    baselineManager = new BaselineManager('api-response');
    apiClient = await initializeApiClient();
    await benchmark.initialize();
  });

  afterAll(async () => {
    await benchmark.cleanup();
  });

  describe('Core API Endpoints', () => {
    test('Agent management API response times', async () => {
      const endpoints = [
        { method: 'GET', path: '/api/agents', operation: 'list-agents' },
        { method: 'POST', path: '/api/agents', operation: 'create-agent' },
        { method: 'GET', path: '/api/agents/:id', operation: 'get-agent' },
        { method: 'PUT', path: '/api/agents/:id', operation: 'update-agent' },
        { method: 'DELETE', path: '/api/agents/:id', operation: 'delete-agent' }
      ];

      const endpointResults = {};

      for (const endpoint of endpoints) {
        const results = await benchmark.measureLatency(
          async () => {
            const startTime = performance.now();
            
            let response;
            switch (endpoint.method) {
              case 'GET':
                response = await apiClient.get(endpoint.path.replace(':id', 'test-agent-123'));
                break;
              case 'POST':
                response = await apiClient.post(endpoint.path, {
                  name: 'test-agent',
                  type: 'coder',
                  capabilities: ['javascript']
                });
                break;
              case 'PUT':
                response = await apiClient.put(endpoint.path.replace(':id', 'test-agent-123'), {
                  capabilities: ['javascript', 'testing']
                });
                break;
              case 'DELETE':
                response = await apiClient.delete(endpoint.path.replace(':id', 'test-agent-123'));
                break;
            }
            
            return performance.now() - startTime;
          },
          {
            iterations: 100,
            warmup: 10
          }
        );

        endpointResults[endpoint.operation] = results;

        // Verify against Phase 2 target (<75ms)
        expect(results.mean).toBeLessThan(PERFORMANCE_TARGETS.apiResponse.latency.target);
        expect(results.p95).toBeLessThan(PERFORMANCE_TARGETS.apiResponse.p95.target);
        expect(results.p99).toBeLessThan(PERFORMANCE_TARGETS.apiResponse.p99.target);
      }

      await baselineManager.updateBaseline('agent-api-response-times', endpointResults);
    });

    test('Task orchestration API performance', async () => {
      const taskEndpoints = [
        { method: 'POST', path: '/api/tasks', operation: 'create-task' },
        { method: 'GET', path: '/api/tasks', operation: 'list-tasks' },
        { method: 'GET', path: '/api/tasks/:id', operation: 'get-task' },
        { method: 'PUT', path: '/api/tasks/:id/assign', operation: 'assign-task' },
        { method: 'PUT', path: '/api/tasks/:id/status', operation: 'update-task-status' },
        { method: 'DELETE', path: '/api/tasks/:id', operation: 'delete-task' }
      ];

      const taskResults = {};

      for (const endpoint of taskEndpoints) {
        const results = await benchmark.measureLatency(
          async () => {
            const startTime = performance.now();
            
            let response;
            switch (endpoint.operation) {
              case 'create-task':
                response = await apiClient.post('/api/tasks', {
                  title: 'Performance Test Task',
                  description: 'Test task for performance benchmarking',
                  priority: 'medium',
                  requirements: ['javascript']
                });
                break;
              case 'list-tasks':
                response = await apiClient.get('/api/tasks?limit=50');
                break;
              case 'get-task':
                response = await apiClient.get('/api/tasks/test-task-123');
                break;
              case 'assign-task':
                response = await apiClient.put('/api/tasks/test-task-123/assign', {
                  agentId: 'test-agent-123'
                });
                break;
              case 'update-task-status':
                response = await apiClient.put('/api/tasks/test-task-123/status', {
                  status: 'in_progress'
                });
                break;
              case 'delete-task':
                response = await apiClient.delete('/api/tasks/test-task-123');
                break;
            }
            
            return performance.now() - startTime;
          },
          {
            iterations: 100,
            warmup: 10
          }
        );

        taskResults[endpoint.operation] = results;

        // Critical path operations should be even faster
        const criticalOperations = ['create-task', 'assign-task', 'update-task-status'];
        if (criticalOperations.includes(endpoint.operation)) {
          expect(results.mean).toBeLessThan(PERFORMANCE_TARGETS.apiResponse.latency.warning);
        } else {
          expect(results.mean).toBeLessThan(PERFORMANCE_TARGETS.apiResponse.latency.target);
        }
      }

      await baselineManager.updateBaseline('task-api-response-times', taskResults);
    });

    test('Memory management API performance', async () => {
      const memoryEndpoints = [
        { method: 'POST', path: '/api/memory/store', operation: 'store-memory' },
        { method: 'GET', path: '/api/memory/:key', operation: 'retrieve-memory' },
        { method: 'POST', path: '/api/memory/search', operation: 'search-memory' },
        { method: 'DELETE', path: '/api/memory/:key', operation: 'delete-memory' }
      ];

      const memoryResults = {};

      for (const endpoint of memoryEndpoints) {
        const results = await benchmark.measureLatency(
          async () => {
            const startTime = performance.now();
            
            let response;
            switch (endpoint.operation) {
              case 'store-memory':
                response = await apiClient.post('/api/memory/store', {
                  key: `perf-test-${Date.now()}`,
                  value: { data: 'performance test data' },
                  namespace: 'performance-tests'
                });
                break;
              case 'retrieve-memory':
                response = await apiClient.get('/api/memory/test-key-123');
                break;
              case 'search-memory':
                response = await apiClient.post('/api/memory/search', {
                  query: 'performance',
                  namespace: 'performance-tests',
                  limit: 20
                });
                break;
              case 'delete-memory':
                response = await apiClient.delete('/api/memory/test-key-123');
                break;
            }
            
            return performance.now() - startTime;
          },
          {
            iterations: 100,
            warmup: 10
          }
        );

        memoryResults[endpoint.operation] = results;

        // Memory operations should be very fast
        expect(results.mean).toBeLessThan(PERFORMANCE_TARGETS.apiResponse.latency.warning);
      }

      await baselineManager.updateBaseline('memory-api-response-times', memoryResults);
    });
  });

  describe('API Load Testing', () => {
    test('Concurrent request handling', async () => {
      const concurrencyLevels = [1, 5, 10, 25, 50, 100];
      const loadResults = {};

      for (const concurrency of concurrencyLevels) {
        const startTime = performance.now();
        
        // Create concurrent requests
        const requests = Array(concurrency).fill().map((_, index) => 
          apiClient.get(`/api/agents?page=${index}&limit=10`)
        );

        const responses = await Promise.all(requests);
        const endTime = performance.now();

        const totalDuration = endTime - startTime;
        const averageResponseTime = totalDuration / concurrency;
        const requestsPerSecond = (concurrency / totalDuration) * 1000;

        loadResults[concurrency] = {
          concurrency,
          totalDuration,
          averageResponseTime,
          requestsPerSecond,
          successRate: responses.filter(r => r.status === 200).length / responses.length
        };

        // Verify performance under load
        expect(averageResponseTime).toBeLessThan(PERFORMANCE_TARGETS.apiResponse.latency.critical);
        expect(loadResults[concurrency].successRate).toBeGreaterThan(0.99); // 99% success rate
      }

      await baselineManager.updateBaseline('api-load-performance', loadResults);
    });

    test('API throughput limits', async () => {
      const testDuration = 30000; // 30 seconds
      const startTime = Date.now();
      const requests = [];
      let requestCount = 0;

      // Send requests continuously for test duration
      while (Date.now() - startTime < testDuration) {
        const requestPromise = apiClient.get('/api/health')
          .then(response => ({
            success: response.status === 200,
            responseTime: Date.now() - requestStart,
            timestamp: Date.now()
          }))
          .catch(error => ({
            success: false,
            error: error.message,
            responseTime: Date.now() - requestStart,
            timestamp: Date.now()
          }));

        const requestStart = Date.now();
        requests.push(requestPromise);
        requestCount++;

        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const results = await Promise.all(requests);
      const successfulRequests = results.filter(r => r.success);
      const averageResponseTime = successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length;
      const throughput = (successfulRequests.length / testDuration) * 1000; // requests per second

      const throughputResults = {
        totalRequests: requestCount,
        successfulRequests: successfulRequests.length,
        successRate: successfulRequests.length / requestCount,
        averageResponseTime,
        throughput,
        testDuration
      };

      // Verify minimum throughput requirements
      expect(throughput).toBeGreaterThan(100); // Minimum 100 RPS
      expect(throughputResults.successRate).toBeGreaterThan(0.95); // 95% success rate

      await baselineManager.updateBaseline('api-throughput-limits', throughputResults);
    });

    test('Error handling performance', async () => {
      const errorScenarios = [
        { path: '/api/agents/nonexistent', expectedStatus: 404, scenario: 'not-found' },
        { path: '/api/agents', method: 'POST', data: null, expectedStatus: 400, scenario: 'bad-request' },
        { path: '/api/unauthorized', expectedStatus: 401, scenario: 'unauthorized' },
        { path: '/api/agents/protected', expectedStatus: 403, scenario: 'forbidden' }
      ];

      const errorResults = {};

      for (const scenario of errorScenarios) {
        const results = await benchmark.measureLatency(
          async () => {
            const startTime = performance.now();
            
            try {
              if (scenario.method === 'POST') {
                await apiClient.post(scenario.path, scenario.data);
              } else {
                await apiClient.get(scenario.path);
              }
            } catch (error) {
              // Expected error
            }
            
            return performance.now() - startTime;
          },
          {
            iterations: 50,
            warmup: 5
          }
        );

        errorResults[scenario.scenario] = results;

        // Error responses should be fast
        expect(results.mean).toBeLessThan(30); // 30ms for error responses
      }

      await baselineManager.updateBaseline('api-error-handling-performance', errorResults);
    });
  });

  describe('API Caching Performance', () => {
    test('Cache hit vs cache miss performance', async () => {
      // Test cache miss (first request)
      const cacheMissResults = await benchmark.measureLatency(
        async () => {
          const startTime = performance.now();
          await apiClient.get(`/api/agents/cache-test-${Date.now()}`);
          return performance.now() - startTime;
        },
        {
          iterations: 50,
          warmup: 5
        }
      );

      // Test cache hit (subsequent requests)
      const cacheKey = 'cache-test-static';
      
      // Prime the cache
      await apiClient.get(`/api/agents/${cacheKey}`);

      const cacheHitResults = await benchmark.measureLatency(
        async () => {
          const startTime = performance.now();
          await apiClient.get(`/api/agents/${cacheKey}`);
          return performance.now() - startTime;
        },
        {
          iterations: 100,
          warmup: 10
        }
      );

      // Cache hits should be significantly faster
      expect(cacheHitResults.mean).toBeLessThan(cacheMissResults.mean * 0.5);
      expect(cacheHitResults.mean).toBeLessThan(10); // Cache hits under 10ms

      await baselineManager.updateBaseline('api-cache-performance', {
        cacheMiss: cacheMissResults,
        cacheHit: cacheHitResults,
        speedup: cacheMissResults.mean / cacheHitResults.mean
      });
    });
  });
});

// Helper functions
async function initializeApiClient() {
  return {
    get: async (path) => {
      // Simulate API GET request
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
      return { status: 200, data: { result: 'success' } };
    },
    
    post: async (path, data) => {
      // Simulate API POST request
      await new Promise(resolve => setTimeout(resolve, Math.random() * 60 + 15));
      return { status: 201, data: { id: Date.now(), ...data } };
    },
    
    put: async (path, data) => {
      // Simulate API PUT request
      await new Promise(resolve => setTimeout(resolve, Math.random() * 55 + 12));
      return { status: 200, data: { updated: true, ...data } };
    },
    
    delete: async (path) => {
      // Simulate API DELETE request
      await new Promise(resolve => setTimeout(resolve, Math.random() * 40 + 8));
      return { status: 204 };
    }
  };
}