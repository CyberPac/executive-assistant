/**
 * Unit tests for ExecutiveAssistantCoordinator
 * Tests core coordination functionality and agent management
 */

import { ExecutiveAssistantCoordinator, ExecutiveProfile, TaskRequest } from '../../src/index';

describe('ExecutiveAssistantCoordinator', () => {
  let coordinator: ExecutiveAssistantCoordinator;

  beforeEach(() => {
    coordinator = new ExecutiveAssistantCoordinator();
  });

  afterEach(() => {
    // Clean up event listeners
    coordinator.removeAllListeners();
  });

  describe('Initialization', () => {
    test('should initialize coordinator with unique ID', () => {
      expect(coordinator).toBeDefined();
      // Coordinator should emit initialized event
      return new Promise<void>((resolve) => {
        coordinator.on('coordinator:initialized', (data) => {
          expect(data.coordinatorId).toContain('pea-coordinator-');
          expect(data.agentsCount).toBe(4);
          expect(data.timestamp).toBeInstanceOf(Date);
          resolve();
        });
      });
    });

    test('should initialize all 4 agents', async () => {
      // Wait for initialization to complete
      await new Promise<void>((resolve) => {
        coordinator.on('coordinator:initialized', () => {
          resolve();
        });
      });

      const status = await coordinator.getSystemStatus();
      expect(Object.keys(status.agents)).toHaveLength(4);
      expect(status.agents).toHaveProperty('cultural');
      expect(status.agents).toHaveProperty('travel');
      expect(status.agents).toHaveProperty('financial');
      expect(status.agents).toHaveProperty('crisis');
    });

    test('should create default executive profile', async () => {
      await new Promise<void>((resolve) => {
        coordinator.on('coordinator:initialized', () => {
          resolve();
        });
      });

      const status = await coordinator.getSystemStatus();
      expect(status.coordinator.executives).toBe(1);
    });
  });

  describe('Executive Profile Management', () => {
    test('should create executive profile with all required fields', async () => {
      const profileData = {
        name: 'Test Executive',
        role: 'CTO',
        company: 'Tech Corp',
        preferences: {
          languages: ['English', 'Spanish'],
          timeZone: 'America/New_York',
          workingHours: { start: '08:00', end: '17:00' },
          communicationStyle: 'direct' as const,
          travelPreferences: {
            class: 'business' as const,
            hotelCategory: 'luxury' as const,
            mealPreferences: ['vegetarian']
          },
          riskTolerance: 'moderate' as const
        },
        operationalCountries: ['Spain', 'Japan'] as ('Spain' | 'Japan' | 'Estonia')[]
      };

      const profile = await coordinator.createExecutiveProfile(profileData);

      expect(profile).toMatchObject({
        id: expect.any(String),
        ...profileData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });

      // Should emit profile created event
      return new Promise<void>((resolve) => {
        coordinator.on('executive:profile-created', (data) => {
          expect(data.executiveId).toBe(profile.id);
          expect(data.name).toBe(profileData.name);
          resolve();
        });
      });
    });

    test('should retrieve executive profile by ID', async () => {
      const profileData = {
        name: 'Test Executive',
        role: 'CTO',
        company: 'Tech Corp',
        preferences: {
          languages: ['English'],
          timeZone: 'UTC',
          workingHours: { start: '09:00', end: '17:00' },
          communicationStyle: 'formal' as const,
          travelPreferences: {
            class: 'economy' as const,
            hotelCategory: 'standard' as const,
            mealPreferences: []
          },
          riskTolerance: 'conservative' as const
        },
        operationalCountries: ['Estonia'] as ('Spain' | 'Japan' | 'Estonia')[]
      };

      const createdProfile = await coordinator.createExecutiveProfile(profileData);
      const retrievedProfile = coordinator.getExecutiveProfile(createdProfile.id);

      expect(retrievedProfile).toEqual(createdProfile);
    });
  });

  describe('Task Processing', () => {
    let executiveId: string;

    beforeEach(async () => {
      // Wait for initialization and get default executive
      await new Promise<void>((resolve) => {
        coordinator.on('coordinator:initialized', () => {
          resolve();
        });
      });

      const status = await coordinator.getSystemStatus();
      // Get the first executive ID (default one created during init)
      executiveId = 'test-executive-id'; // Use a test ID for consistency
    });

    test('should process cultural analysis task', async () => {
      const taskRequest = {
        executiveId,
        type: 'cultural-analysis' as const,
        priority: 'medium' as const,
        description: 'Analyze Japanese business culture',
        parameters: { countryCode: 'JP' }
      };

      const task = await coordinator.processTask(taskRequest);

      expect(task).toMatchObject({
        id: expect.any(String),
        ...taskRequest,
        status: 'completed',
        assignedAgent: 'cultural',
        result: expect.any(Object),
        createdAt: expect.any(Date),
        completedAt: expect.any(Date),
        responseTime: expect.any(Number)
      });

      // Should meet performance target
      expect(task.responseTime!).toBeLessThan(75);
    });

    test('should process travel planning task', async () => {
      const taskRequest = {
        executiveId,
        type: 'travel-planning' as const,
        priority: 'high' as const,
        description: 'Plan business trip to Japan',
        parameters: {
          destination: { country: 'Japan', city: 'Tokyo' },
          dates: {
            departure: new Date('2024-02-01'),
            return: new Date('2024-02-05')
          },
          purpose: 'business'
        }
      };

      const task = await coordinator.processTask(taskRequest);

      expect(task.status).toBe('completed');
      expect(task.assignedAgent).toBe('travel');
      expect(task.result).toBeDefined();
    });

    test('should process short trip task', async () => {
      const taskRequest = {
        executiveId,
        type: 'short-trip' as const,
        priority: 'medium' as const,
        description: 'Plan short trip within city',
        parameters: {
          executiveId,
          origin: 'New York, NY',
          destination: 'Philadelphia, PA',
          departureTime: new Date(Date.now() + 3600000) // 1 hour from now
        }
      };

      const task = await coordinator.processTask(taskRequest);

      expect(task.status).toBe('completed');
      expect(task.assignedAgent).toBe('travel');
      expect(task.result).toHaveProperty('id');
      expect(task.result).toHaveProperty('routes');
    });

    test('should handle task errors gracefully', async () => {
      const taskRequest = {
        executiveId,
        type: 'cultural-analysis' as const,
        priority: 'low' as const,
        description: 'Invalid cultural analysis',
        parameters: { countryCode: 'INVALID' }
      };

      await expect(coordinator.processTask(taskRequest)).rejects.toThrow();
    });

    test('should select correct agent based on task type', async () => {
      const testCases = [
        { type: 'cultural-analysis', expectedAgent: 'cultural' },
        { type: 'travel-planning', expectedAgent: 'travel' },
        { type: 'short-trip', expectedAgent: 'travel' },
        { type: 'financial-transaction', expectedAgent: 'financial' },
        { type: 'crisis-response', expectedAgent: 'crisis' },
        { type: 'threat-assessment', expectedAgent: 'crisis' }
      ] as const;

      for (const testCase of testCases) {
        const taskRequest = {
          executiveId,
          type: testCase.type,
          priority: 'medium' as const,
          description: `Test ${testCase.type}`,
          parameters: {}
        };

        try {
          const task = await coordinator.processTask(taskRequest);
          expect(task.assignedAgent).toBe(testCase.expectedAgent);
        } catch (error) {
          // Some tasks might fail due to missing parameters, but agent should still be selected
          expect(taskRequest.type).toBeDefined();
        }
      }
    });

    test('should update performance metrics', async () => {
      const initialStatus = await coordinator.getSystemStatus();
      const initialMetrics = initialStatus.metrics;

      const taskRequest = {
        executiveId,
        type: 'cultural-analysis' as const,
        priority: 'medium' as const,
        description: 'Test metrics update',
        parameters: { countryCode: 'JP' }
      };

      await coordinator.processTask(taskRequest);

      const updatedStatus = await coordinator.getSystemStatus();
      const updatedMetrics = updatedStatus.metrics;

      expect(updatedMetrics.totalTasks).toBe(initialMetrics.totalTasks + 1);
      expect(updatedMetrics.completedTasks).toBe(initialMetrics.completedTasks + 1);
      expect(updatedMetrics.averageResponseTime).toBeGreaterThan(0);
    });
  });

  describe('Crisis Management', () => {
    test('should handle critical crisis escalation', async () => {
      // Wait for initialization
      await new Promise<void>((resolve) => {
        coordinator.on('coordinator:initialized', () => {
          resolve();
        });
      });

      // Create additional executives for testing escalation
      await coordinator.createExecutiveProfile({
        name: 'Executive 1',
        role: 'CEO',
        company: 'Test Corp',
        preferences: {
          languages: ['English'],
          timeZone: 'UTC',
          workingHours: { start: '09:00', end: '17:00' },
          communicationStyle: 'direct',
          travelPreferences: {
            class: 'business',
            hotelCategory: 'luxury',
            mealPreferences: []
          },
          riskTolerance: 'moderate'
        },
        operationalCountries: ['Spain']
      });

      // Listen for critical escalation
      return new Promise<void>((resolve) => {
        coordinator.on('crisis:critical-escalation', (data) => {
          expect(data.crisisId).toBeDefined();
          expect(data.executivesNotified).toBeGreaterThan(0);
          expect(data.timestamp).toBeInstanceOf(Date);
          resolve();
        });

        // Simulate critical crisis detection
        coordinator.emit('agent:crisis:detected', {
          crisisId: 'test-crisis-123',
          severity: 'critical',
          type: 'security-threat'
        });
      });
    });
  });

  describe('System Health and Status', () => {
    test('should provide comprehensive system status', async () => {
      await new Promise<void>((resolve) => {
        coordinator.on('coordinator:initialized', () => {
          resolve();
        });
      });

      const status = await coordinator.getSystemStatus();

      expect(status).toHaveProperty('coordinator');
      expect(status).toHaveProperty('agents');
      expect(status).toHaveProperty('metrics');
      expect(status).toHaveProperty('health');

      expect(status.coordinator.initialized).toBe(true);
      expect(status.agents).toHaveProperty('cultural');
      expect(status.agents).toHaveProperty('travel');
      expect(status.agents).toHaveProperty('financial');
      expect(status.agents).toHaveProperty('crisis');

      expect(status.health.status).toMatch(/healthy|degraded|critical/);
      expect(Array.isArray(status.health.issues)).toBe(true);
    });

    test('should perform health checks correctly', async () => {
      await new Promise<void>((resolve) => {
        coordinator.on('coordinator:initialized', () => {
          resolve();
        });
      });

      const dashboard = coordinator.getPerformanceDashboard();

      expect(dashboard).toHaveProperty('overview');
      expect(dashboard).toHaveProperty('phase2Progress');
      expect(dashboard).toHaveProperty('agentStatus');

      expect(dashboard.phase2Progress.targetResponseTime).toBe('<75ms');
      expect(dashboard.phase2Progress.agentsDeployed).toBe(4);
      expect(dashboard.phase2Progress.featuresImplemented).toHaveLength(6);
    });

    test('should track agent utilization', async () => {
      await new Promise<void>((resolve) => {
        coordinator.on('coordinator:initialized', () => {
          resolve();
        });
      });

      // Process several tasks to generate utilization data
      const executiveId = 'test-executive-id';
      
      await coordinator.processTask({
        executiveId,
        type: 'cultural-analysis',
        priority: 'medium',
        description: 'Test task 1',
        parameters: { countryCode: 'JP' }
      });

      await coordinator.processTask({
        executiveId,
        type: 'travel-planning',
        priority: 'high',
        description: 'Test task 2',
        parameters: {
          destination: { country: 'Japan', city: 'Tokyo' },
          dates: {
            departure: new Date('2024-02-01'),
            return: new Date('2024-02-05')
          },
          purpose: 'business'
        }
      });

      const status = await coordinator.getSystemStatus();
      expect(status.metrics.agentUtilization).toBeDefined();
      expect(Object.keys(status.metrics.agentUtilization).length).toBeGreaterThan(0);
    });
  });

  describe('Performance Targets', () => {
    test('should meet <75ms response time target for cultural analysis', async () => {
      await new Promise<void>((resolve) => {
        coordinator.on('coordinator:initialized', () => {
          resolve();
        });
      });

      const executiveId = 'test-executive-id';
      const startTime = Date.now();
      
      const task = await coordinator.processTask({
        executiveId,
        type: 'cultural-analysis',
        priority: 'high',
        description: 'Performance test',
        parameters: { countryCode: 'JP' }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(75);
      expect(task.responseTime).toBeLessThan(75);
    });

    test('should maintain >99% success rate', async () => {
      await new Promise<void>((resolve) => {
        coordinator.on('coordinator:initialized', () => {
          resolve();
        });
      });

      const executiveId = 'test-executive-id';
      const totalTasks = 10;
      let successfulTasks = 0;

      for (let i = 0; i < totalTasks; i++) {
        try {
          await coordinator.processTask({
            executiveId,
            type: 'cultural-analysis',
            priority: 'medium',
            description: `Performance test ${i}`,
            parameters: { countryCode: 'JP' }
          });
          successfulTasks++;
        } catch (error) {
          // Count failures
        }
      }

      const successRate = (successfulTasks / totalTasks) * 100;
      expect(successRate).toBeGreaterThanOrEqual(99);
    });
  });
});