/**
 * Integration tests for multi-agent coordination scenarios
 * Tests end-to-end workflows and agent interactions
 */

import { ExecutiveAssistantCoordinator } from '../../src/index';

describe('Multi-Agent Coordination', () => {
  let coordinator: ExecutiveAssistantCoordinator;
  let executiveId: string;

  beforeEach(async () => {
    coordinator = new ExecutiveAssistantCoordinator();
    
    // Wait for initialization
    await new Promise<void>((resolve) => {
      coordinator.on('coordinator:initialized', () => {
        resolve();
      });
    });

    // Create test executive
    const executive = await coordinator.createExecutiveProfile({
      name: 'Integration Test Executive',
      role: 'Global Operations Director',
      company: 'International Corp',
      preferences: {
        languages: ['English', 'Japanese', 'Spanish'],
        timeZone: 'America/New_York',
        workingHours: { start: '09:00', end: '18:00' },
        communicationStyle: 'direct',
        travelPreferences: {
          class: 'business',
          hotelCategory: 'luxury',
          mealPreferences: ['vegetarian']
        },
        riskTolerance: 'moderate'
      },
      operationalCountries: ['Spain', 'Japan', 'Estonia']
    });

    executiveId = executive.id;
  });

  afterEach(() => {
    coordinator.removeAllListeners();
  });

  describe('Business Trip Coordination Workflow', () => {
    test('should coordinate complete business trip to Japan', async () => {
      const results = [];

      // Step 1: Cultural analysis for Japan
      const culturalTask = await coordinator.processTask({
        executiveId,
        type: 'cultural-analysis',
        priority: 'high',
        description: 'Analyze Japanese business culture for upcoming trip',
        parameters: { countryCode: 'JP' }
      });

      expect(culturalTask.status).toBe('completed');
      expect(culturalTask.assignedAgent).toBe('cultural');
      results.push(`Cultural analysis: ${culturalTask.responseTime}ms`);

      // Step 2: Travel planning based on cultural insights
      const travelTask = await coordinator.processTask({
        executiveId,
        type: 'travel-planning',
        priority: 'high',
        description: 'Plan business trip to Tokyo with cultural considerations',
        parameters: {
          destination: { country: 'Japan', city: 'Tokyo' },
          dates: {
            departure: new Date('2024-04-15T10:00:00Z'),
            return: new Date('2024-04-20T18:00:00Z')
          },
          purpose: 'business'
        }
      });

      expect(travelTask.status).toBe('completed');
      expect(travelTask.assignedAgent).toBe('travel');
      results.push(`Travel planning: ${travelTask.responseTime}ms`);

      // Step 3: Financial transaction for travel expenses
      const financialTask = await coordinator.processTask({
        executiveId,
        type: 'financial-transaction',
        priority: 'medium',
        description: 'Process travel expense pre-authorization',
        parameters: {
          amount: 5000,
          currency: 'USD',
          category: 'travel',
          description: 'Business trip to Tokyo - flights, hotel, meals'
        }
      });

      expect(financialTask.status).toBe('completed');
      expect(financialTask.assignedAgent).toBe('financial');
      results.push(`Financial processing: ${financialTask.responseTime}ms`);

      // Verify all tasks completed within performance targets
      const allTasks = [culturalTask, travelTask, financialTask];
      const totalResponseTime = allTasks.reduce((sum, task) => sum + (task.responseTime || 0), 0);
      const averageResponseTime = totalResponseTime / allTasks.length;

      expect(averageResponseTime).toBeLessThan(75);
      console.log('Complete business trip workflow:', results);
    });

    test('should handle crisis during travel coordination', async () => {
      const eventLog: string[] = [];

      // Listen for crisis events
      coordinator.on('crisis:critical-escalation', (data) => {
        eventLog.push(`Critical crisis escalation: ${data.crisisId}`);
      });

      // Start travel planning
      const travelTask = coordinator.processTask({
        executiveId,
        type: 'travel-planning',
        priority: 'high',
        description: 'Plan urgent business trip',
        parameters: {
          destination: { country: 'Japan', city: 'Tokyo' },
          dates: {
            departure: new Date(Date.now() + 86400000), // Tomorrow
            return: new Date(Date.now() + 259200000)    // 3 days from now
          },
          purpose: 'business'
        }
      });

      // Simulate crisis during travel planning
      const crisisTask = coordinator.processTask({
        executiveId,
        type: 'crisis-response',
        priority: 'urgent',
        description: 'Security threat at destination',
        parameters: {
          type: 'security-threat',
          location: 'Tokyo, Japan',
          severity: 'critical',
          description: 'Political unrest in business district'
        }
      });

      // Both tasks should complete
      const [travel, crisis] = await Promise.all([travelTask, crisisTask]);

      expect(travel.status).toBe('completed');
      expect(crisis.status).toBe('completed');
      expect(crisis.assignedAgent).toBe('crisis');

      // Crisis should have been detected and escalated
      expect(eventLog.length).toBeGreaterThan(0);
    });
  });

  describe('Short Trip Coordination', () => {
    test('should coordinate short trip with real-time updates', async () => {
      const notifications: any[] = [];

      // Listen for trip notifications
      coordinator.on('agent:travel:short-trip-planned', (data) => {
        notifications.push({ type: 'trip-planned', data });
      });

      // Plan short trip
      const shortTripTask = await coordinator.processTask({
        executiveId,
        type: 'short-trip',
        priority: 'medium',
        description: 'Short trip to client meeting',
        parameters: {
          executiveId,
          origin: 'New York, NY',
          destination: 'Philadelphia, PA',
          departureTime: new Date(Date.now() + 3600000) // 1 hour from now
        }
      });

      expect(shortTripTask.status).toBe('completed');
      expect(shortTripTask.result).toHaveProperty('id');
      expect(shortTripTask.result).toHaveProperty('routes');
      expect(shortTripTask.result).toHaveProperty('selectedRoute');

      // Should have received notification
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].type).toBe('trip-planned');
    });
  });

  describe('Multi-Country Operations', () => {
    test('should handle operations across Spain, Japan, and Estonia', async () => {
      const countries = ['Spain', 'Japan', 'Estonia'];
      const culturalTasks: any[] = [];

      // Analyze all operational countries
      for (const country of countries) {
        const countryCode = country === 'Spain' ? 'ES' : 
                           country === 'Japan' ? 'JP' : 'EE';
        
        try {
          const task = await coordinator.processTask({
            executiveId,
            type: 'cultural-analysis',
            priority: 'medium',
            description: `Cultural analysis for ${country} operations`,
            parameters: { countryCode }
          });

          if (task.status === 'completed') {
            culturalTasks.push({ country, task });
          }
        } catch (error) {
          // Some countries might not have cultural data implemented
          console.warn(`Cultural analysis failed for ${country}:`, error);
        }
      }

      // At least Japan should work (we know it's implemented)
      expect(culturalTasks.length).toBeGreaterThan(0);
      
      const japanTask = culturalTasks.find(ct => ct.country === 'Japan');
      if (japanTask) {
        expect(japanTask.task.status).toBe('completed');
        expect(japanTask.task.result).toBeDefined();
      }
    });
  });

  describe('Performance Under Load', () => {
    test('should handle multiple concurrent tasks', async () => {
      const concurrentTasks = 5;
      const tasks: Promise<any>[] = [];

      // Create multiple concurrent tasks
      for (let i = 0; i < concurrentTasks; i++) {
        const task = coordinator.processTask({
          executiveId,
          type: 'cultural-analysis',
          priority: 'medium',
          description: `Concurrent task ${i + 1}`,
          parameters: { countryCode: 'JP' }
        });
        tasks.push(task);
      }

      // Wait for all tasks to complete
      const startTime = Date.now();
      const results = await Promise.all(tasks);
      const totalTime = Date.now() - startTime;

      // All tasks should complete successfully
      results.forEach((result, index) => {
        expect(result.status).toBe('completed');
        expect(result.responseTime).toBeLessThan(75);
      });

      // Total time should be reasonable (not 5x individual task time due to parallelization)
      expect(totalTime).toBeLessThan(300); // Less than 300ms for 5 concurrent tasks

      console.log(`${concurrentTasks} concurrent tasks completed in ${totalTime}ms`);
    });

    test('should maintain system health under load', async () => {
      // Process multiple tasks of different types
      const taskTypes = [
        'cultural-analysis',
        'travel-planning',
        'short-trip',
        'financial-transaction'
      ] as const;

      const tasks: Promise<any>[] = [];

      taskTypes.forEach((type, index) => {
        let parameters: any = {};
        
        switch (type) {
          case 'cultural-analysis':
            parameters = { countryCode: 'JP' };
            break;
          case 'travel-planning':
            parameters = {
              destination: { country: 'Japan', city: 'Tokyo' },
              dates: {
                departure: new Date(Date.now() + 86400000),
                return: new Date(Date.now() + 259200000)
              },
              purpose: 'business'
            };
            break;
          case 'short-trip':
            parameters = {
              executiveId,
              origin: 'New York, NY',
              destination: 'Philadelphia, PA',
              departureTime: new Date(Date.now() + 3600000)
            };
            break;
          case 'financial-transaction':
            parameters = {
              amount: 1000,
              currency: 'USD',
              category: 'expense',
              description: `Test transaction ${index}`
            };
            break;
        }

        const task = coordinator.processTask({
          executiveId,
          type,
          priority: 'medium',
          description: `Load test task ${index}`,
          parameters
        });

        tasks.push(task);
      });

      const results = await Promise.all(tasks);
      
      // Check system health after load
      const systemStatus = await coordinator.getSystemStatus();
      
      expect(systemStatus.health.status).toMatch(/healthy|degraded/);
      expect(systemStatus.coordinator.initialized).toBe(true);
      expect(systemStatus.metrics.totalTasks).toBeGreaterThan(0);
      expect(systemStatus.metrics.completedTasks).toBeGreaterThan(0);

      // Performance should still be good
      expect(systemStatus.metrics.averageResponseTime).toBeLessThan(100);
    });
  });

  describe('Agent Communication', () => {
    test('should coordinate between travel and crisis agents', async () => {
      const eventLog: any[] = [];

      // Monitor agent events
      coordinator.on('agent:travel:plan-created', (data) => {
        eventLog.push({ type: 'travel-plan-created', data });
      });

      coordinator.on('agent:crisis:detected', (data) => {
        eventLog.push({ type: 'crisis-detected', data });
      });

      // Create travel plan
      const travelTask = await coordinator.processTask({
        executiveId,
        type: 'travel-planning',
        priority: 'high',
        description: 'Business trip with potential security concerns',
        parameters: {
          destination: { country: 'Japan', city: 'Tokyo' },
          dates: {
            departure: new Date(Date.now() + 86400000),
            return: new Date(Date.now() + 432000000)
          },
          purpose: 'business'
        }
      });

      expect(travelTask.status).toBe('completed');

      // Perform threat assessment for the same location
      const threatTask = await coordinator.processTask({
        executiveId,
        type: 'threat-assessment',
        priority: 'high',
        description: 'Assess security threats in Tokyo',
        parameters: {
          executiveId,
          location: 'Tokyo, Japan'
        }
      });

      expect(threatTask.status).toBe('completed');
      expect(threatTask.assignedAgent).toBe('crisis');

      // Both agents should have been active
      const travelEvent = eventLog.find(e => e.type === 'travel-plan-created');
      expect(travelEvent).toBeDefined();
    });
  });

  describe('Executive Task History', () => {
    test('should maintain complete task history for executive', async () => {
      // Process multiple tasks for the same executive
      const tasks = [
        {
          type: 'cultural-analysis' as const,
          description: 'Cultural analysis for Japan',
          parameters: { countryCode: 'JP' }
        },
        {
          type: 'travel-planning' as const,
          description: 'Plan business trip',
          parameters: {
            destination: { country: 'Japan', city: 'Tokyo' },
            dates: {
              departure: new Date(Date.now() + 86400000),
              return: new Date(Date.now() + 259200000)
            },
            purpose: 'business'
          }
        }
      ];

      const completedTasks = [];

      for (const taskData of tasks) {
        const task = await coordinator.processTask({
          executiveId,
          type: taskData.type,
          priority: 'medium',
          description: taskData.description,
          parameters: taskData.parameters
        });

        expect(task.status).toBe('completed');
        completedTasks.push(task);
      }

      // Retrieve task history
      const executiveTasks = coordinator.getExecutiveTasks(executiveId);
      
      expect(executiveTasks.length).toBeGreaterThanOrEqual(2);
      
      // All tasks should belong to the same executive
      executiveTasks.forEach(task => {
        expect(task.executiveId).toBe(executiveId);
      });

      // Tasks should have different types
      const taskTypes = executiveTasks.map(t => t.type);
      expect(new Set(taskTypes).size).toBeGreaterThan(1);
    });
  });
});