/**
 * Unit tests for TravelLogisticsAgent
 * Tests travel planning, short trip functionality, and traffic integration
 */

import TravelLogisticsAgent, { TravelPlan, ShortTripPlan } from '../../../agents/travel-logistics/index';

// Mock environment variables
process.env.GOOGLE_MAPS_API_KEY = 'test-google-maps-key';
process.env.WAZE_API_KEY = 'test-waze-key';

describe('TravelLogisticsAgent', () => {
  let agent: TravelLogisticsAgent;

  beforeEach(() => {
    agent = new TravelLogisticsAgent();
  });

  afterEach(() => {
    agent.removeAllListeners();
  });

  describe('Initialization', () => {
    test('should initialize agent with unique ID', () => {
      expect(agent).toBeDefined();
      
      return new Promise<void>((resolve) => {
        agent.on('agent:initialized', (data) => {
          expect(data.agentId).toContain('travel-logistics-');
          resolve();
        });
      });
    });

    test('should throw error if API keys are missing', () => {
      delete process.env.GOOGLE_MAPS_API_KEY;
      
      expect(() => {
        new TravelLogisticsAgent();
      }).toThrow('GOOGLE_MAPS_API_KEY environment variable is required');
      
      // Restore for other tests
      process.env.GOOGLE_MAPS_API_KEY = 'test-google-maps-key';
    });

    test('should initialize travel requirements database', () => {
      const metrics = agent.getPerformanceMetrics();
      expect(metrics.countriesCovered).toBeGreaterThan(0);
      expect(metrics.features.internationalTravel).toBe(true);
      expect(metrics.features.shortTripPlanning).toBe(true);
    });
  });

  describe('Travel Planning', () => {
    test('should create comprehensive travel plan for Japan', async () => {
      const request = {
        executiveId: 'test-executive-123',
        destination: {
          country: 'Japan',
          city: 'Tokyo'
        },
        dates: {
          departure: new Date('2024-03-01T08:00:00Z'),
          return: new Date('2024-03-05T18:00:00Z')
        },
        purpose: 'business'
      };

      const startTime = Date.now();
      const plan = await agent.createTravelPlan(request);
      const responseTime = Date.now() - startTime;

      expect(plan).toMatchObject({
        id: expect.any(String),
        executiveId: request.executiveId,
        type: 'international',
        destination: {
          country: 'Japan',
          city: 'Tokyo',
          timezone: 'Asia/Tokyo'
        },
        status: 'planning',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });

      // Should include travel requirements
      expect(plan.requirements).toBeDefined();
      expect(plan.requirements.visa.required).toBe(true);
      expect(plan.requirements.visa.type).toBe('Business Visa');

      // Should include recommendations
      expect(plan.recommendations.hotels).toBeDefined();
      expect(plan.recommendations.transportation).toBeDefined();
      expect(plan.recommendations.dining).toBeDefined();

      // Should include cultural briefing
      expect(plan.culturalBriefing.keyPoints).toBeDefined();
      expect(plan.culturalBriefing.businessEtiquette).toBeDefined();

      // Should meet performance target
      expect(responseTime).toBeLessThan(75);

      // Should emit plan created event
      return new Promise<void>((resolve) => {
        agent.on('travel:plan-created', (data) => {
          expect(data.planId).toBe(plan.id);
          expect(data.destination).toEqual(request.destination);
          resolve();
        });
      });
    });

    test('should create travel plan for United States', async () => {
      const request = {
        executiveId: 'test-executive-456',
        destination: {
          country: 'United States',
          city: 'New York'
        },
        dates: {
          departure: new Date('2024-04-15T10:00:00Z'),
          return: new Date('2024-04-20T16:00:00Z')
        },
        purpose: 'conference'
      };

      const plan = await agent.createTravelPlan(request);

      expect(plan.requirements.visa.type).toBe('B-1 Business Visa or ESTA');
      expect(plan.destination.timezone).toBe('America/New_York');
      expect(plan.culturalBriefing.keyPoints).toContain('Direct communication is valued');
    });

    test('should handle unknown country gracefully', async () => {
      const request = {
        executiveId: 'test-executive-789',
        destination: {
          country: 'Unknown Country',
          city: 'Unknown City'
        },
        dates: {
          departure: new Date('2024-05-01'),
          return: new Date('2024-05-05')
        },
        purpose: 'business'
      };

      await expect(agent.createTravelPlan(request)).rejects.toThrow('Travel requirements not available');
    });

    test('should update travel plan status', async () => {
      const request = {
        executiveId: 'test-executive-update',
        destination: { country: 'Japan', city: 'Tokyo' },
        dates: {
          departure: new Date('2024-06-01'),
          return: new Date('2024-06-05')
        },
        purpose: 'business'
      };

      const plan = await agent.createTravelPlan(request);
      expect(plan.status).toBe('planning');

      const updatedPlan = await agent.updateTravelPlanStatus(plan.id, 'approved');
      expect(updatedPlan.status).toBe('approved');
      expect(updatedPlan.updatedAt.getTime()).toBeGreaterThan(plan.createdAt.getTime());

      // Should emit status updated event
      return new Promise<void>((resolve) => {
        agent.on('travel:status-updated', (data) => {
          expect(data.planId).toBe(plan.id);
          expect(data.status).toBe('approved');
          resolve();
        });
      });
    });

    test('should retrieve travel plan by ID', async () => {
      const request = {
        executiveId: 'test-executive-retrieve',
        destination: { country: 'Japan', city: 'Tokyo' },
        dates: {
          departure: new Date('2024-07-01'),
          return: new Date('2024-07-05')
        },
        purpose: 'business'
      };

      const createdPlan = await agent.createTravelPlan(request);
      const retrievedPlan = agent.getTravelPlan(createdPlan.id);

      expect(retrievedPlan).toEqual(createdPlan);
    });
  });

  describe('Short Trip Planning', () => {
    test('should plan short trip with traffic integration', async () => {
      const request = {
        executiveId: 'test-exec-short-trip',
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
        departureTime: new Date(Date.now() + 3600000), // 1 hour from now
        vehicleType: 'executive-car' as const,
        driverRequired: true
      };

      const startTime = Date.now();
      const trip = await agent.planShortTrip(request);
      const responseTime = Date.now() - startTime;

      expect(trip).toMatchObject({
        id: expect.any(String),
        executiveId: request.executiveId,
        status: 'planning',
        vehicleType: 'executive-car',
        driverRequired: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });

      // Should have origin and destination coordinates
      expect(trip.origin.coordinates).toHaveProperty('lat');
      expect(trip.origin.coordinates).toHaveProperty('lng');
      expect(trip.destination.coordinates).toHaveProperty('lat');
      expect(trip.destination.coordinates).toHaveProperty('lng');

      // Should calculate distance
      expect(trip.distance.km).toBeGreaterThan(0);
      expect(trip.distance.miles).toBeGreaterThan(0);

      // Should have route options
      expect(trip.routes).toBeDefined();
      expect(trip.routes.length).toBeGreaterThan(0);
      expect(trip.selectedRoute).toBeDefined();

      // Should have estimated arrival time
      expect(trip.estimatedArrival).toBeInstanceOf(Date);
      expect(trip.estimatedArrival.getTime()).toBeGreaterThan(trip.departureTime.getTime());

      // Should meet performance target
      expect(responseTime).toBeLessThan(75);

      // Should emit short trip planned event
      return new Promise<void>((resolve) => {
        agent.on('short-trip:planned', (data) => {
          expect(data.tripId).toBe(trip.id);
          expect(data.distance).toBe(trip.distance.km);
          resolve();
        });
      });
    });

    test('should reject trip over 200km limit', async () => {
      const request = {
        executiveId: 'test-exec-long-trip',
        origin: 'New York, NY',
        destination: 'Boston, MA', // This would be over 200km in real calculation
        departureTime: new Date(Date.now() + 3600000)
      };

      // Mock the distance calculation to exceed limit
      const originalCalculateDistance = (agent as any).calculateDistance;
      (agent as any).calculateDistance = jest.fn().mockReturnValue({ km: 250, miles: 155.3 });

      await expect(agent.planShortTrip(request)).rejects.toThrow('exceeds 200km limit');

      // Restore original method
      (agent as any).calculateDistance = originalCalculateDistance;
    });

    test('should provide multiple route options with traffic data', async () => {
      const request = {
        executiveId: 'test-exec-routes',
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
        departureTime: new Date(Date.now() + 3600000)
      };

      const trip = await agent.planShortTrip(request);

      // Should have at least one route option
      expect(trip.routes.length).toBeGreaterThan(0);

      const route = trip.routes[0];
      expect(route).toHaveProperty('id');
      expect(route).toHaveProperty('provider');
      expect(route).toHaveProperty('distance');
      expect(route).toHaveProperty('duration');
      expect(route).toHaveProperty('traffic');
      expect(route).toHaveProperty('tollCosts');
      expect(route).toHaveProperty('fuelCost');
      expect(route).toHaveProperty('alternativeScore');

      // Traffic data should be included
      expect(route.traffic.currentConditions).toMatch(/light|moderate|heavy|severe/);
      expect(route.traffic.delays).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(route.traffic.incidents)).toBe(true);
    });

    test('should update short trip status', async () => {
      const request = {
        executiveId: 'test-exec-status-update',
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
        departureTime: new Date(Date.now() + 3600000)
      };

      const trip = await agent.planShortTrip(request);
      expect(trip.status).toBe('planning');

      const updatedTrip = await agent.updateShortTripStatus(trip.id, 'confirmed');
      expect(updatedTrip.status).toBe('confirmed');

      // Should emit status updated event
      return new Promise<void>((resolve) => {
        agent.on('short-trip:status-updated', (data) => {
          expect(data.tripId).toBe(trip.id);
          expect(data.status).toBe('confirmed');
          resolve();
        });
      });
    });

    test('should retrieve short trips for executive', async () => {
      const executiveId = 'test-exec-retrieve-trips';
      
      // Create multiple trips
      const trip1 = await agent.planShortTrip({
        executiveId,
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
        departureTime: new Date(Date.now() + 3600000)
      });

      const trip2 = await agent.planShortTrip({
        executiveId,
        origin: 'Boston, MA',
        destination: 'New York, NY',
        departureTime: new Date(Date.now() + 7200000)
      });

      const trips = agent.getShortTripsForExecutive(executiveId);
      
      expect(trips).toHaveLength(2);
      expect(trips.map(t => t.id)).toContain(trip1.id);
      expect(trips.map(t => t.id)).toContain(trip2.id);
    });
  });

  describe('Traffic Monitoring', () => {
    test('should start traffic monitoring for active trips', async () => {
      const request = {
        executiveId: 'test-exec-monitoring',
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
        departureTime: new Date(Date.now() + 3600000)
      };

      const trip = await agent.planShortTrip(request);

      // Traffic monitoring should be enabled
      expect(trip.notifications.trafficAlerts).toBe(true);
      expect(trip.notifications.weatherUpdates).toBe(true);
      expect(trip.notifications.routeChanges).toBe(true);
    });

    test('should handle route updates during monitoring', (done) => {
      const request = {
        executiveId: 'test-exec-route-update',
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
        departureTime: new Date(Date.now() + 3600000)
      };

      agent.planShortTrip(request).then(() => {
        // Listen for route updates
        agent.on('short-trip:route-updated', (data) => {
          expect(data.tripId).toBeDefined();
          expect(data.newRoute).toBeDefined();
          expect(data.reason).toBe('Traffic conditions changed');
          done();
        });

        // Simulate traffic condition change - this would happen in real monitoring
        // For testing, we just verify the event listener is set up correctly
      });
    });

    test('should send traffic alerts when incidents detected', (done) => {
      const request = {
        executiveId: 'test-exec-traffic-alert',
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
        departureTime: new Date(Date.now() + 3600000)
      };

      agent.planShortTrip(request).then(() => {
        // Listen for traffic alerts
        agent.on('short-trip:notification', (data) => {
          if (data.type === 'traffic-alert') {
            expect(data.tripId).toBeDefined();
            expect(data.message).toContain('Traffic incidents detected');
            done();
          }
        });
      });
    });
  });

  describe('Performance Metrics', () => {
    test('should track performance metrics accurately', async () => {
      const initialMetrics = agent.getPerformanceMetrics();
      const initialTotalPlans = initialMetrics.totalPlans;
      const initialShortTrips = initialMetrics.shortTrips;

      // Create a travel plan
      await agent.createTravelPlan({
        executiveId: 'test-exec-metrics',
        destination: { country: 'Japan', city: 'Tokyo' },
        dates: {
          departure: new Date('2024-08-01'),
          return: new Date('2024-08-05')
        },
        purpose: 'business'
      });

      // Create a short trip
      await agent.planShortTrip({
        executiveId: 'test-exec-metrics',
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
        departureTime: new Date(Date.now() + 3600000)
      });

      const updatedMetrics = agent.getPerformanceMetrics();
      
      expect(updatedMetrics.totalPlans).toBe(initialTotalPlans + 1);
      expect(updatedMetrics.shortTrips).toBe(initialShortTrips + 1);
      expect(updatedMetrics.averageResponseTime).toContain('ms');
      expect(parseFloat(updatedMetrics.averageResponseTime)).toBeLessThan(75);
    });

    test('should meet target response time <75ms', async () => {
      const startTime = Date.now();
      
      await agent.createTravelPlan({
        executiveId: 'test-exec-performance',
        destination: { country: 'Japan', city: 'Tokyo' },
        dates: {
          departure: new Date('2024-09-01'),
          return: new Date('2024-09-05')
        },
        purpose: 'business'
      });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(75);
    });

    test('should provide comprehensive feature list', () => {
      const metrics = agent.getPerformanceMetrics();
      
      expect(metrics.features.internationalTravel).toBe(true);
      expect(metrics.features.shortTripPlanning).toBe(true);
      expect(metrics.features.realTimeTraffic).toBe(true);
      expect(metrics.features.trafficMonitoring).toBe(true);
      expect(metrics.features.culturalBriefings).toBe(true);
      expect(metrics.features.multipleRouteProviders).toContain('Google Maps');
      expect(metrics.features.multipleRouteProviders).toContain('Waze');
    });
  });

  describe('Helper Functions', () => {
    test('should calculate distance correctly', () => {
      // Access private method for testing
      const calculateDistance = (agent as any).calculateDistance.bind(agent);
      
      const coord1 = { lat: 40.7128, lng: -74.0060 }; // New York
      const coord2 = { lat: 39.9526, lng: -75.1652 }; // Philadelphia
      
      const distance = calculateDistance(coord1, coord2);
      
      expect(distance.km).toBeGreaterThan(0);
      expect(distance.miles).toBeGreaterThan(0);
      expect(distance.miles).toBeLessThan(distance.km); // Miles should be less than km
    });

    test('should get traffic multiplier based on time', () => {
      const getTrafficMultiplier = (agent as any).getTrafficMultiplier.bind(agent);
      
      // Rush hour (8 AM weekday)
      const rushHour = new Date('2024-03-04T08:00:00'); // Monday
      const rushMultiplier = getTrafficMultiplier(rushHour);
      expect(rushMultiplier).toBeGreaterThan(1.5);
      
      // Weekend (8 AM Saturday)
      const weekend = new Date('2024-03-02T08:00:00'); // Saturday
      const weekendMultiplier = getTrafficMultiplier(weekend);
      expect(weekendMultiplier).toBeLessThan(1.2);
      
      // Night time (2 AM)
      const night = new Date('2024-03-04T02:00:00'); // Monday
      const nightMultiplier = getTrafficMultiplier(night);
      expect(nightMultiplier).toBe(1.0);
    });

    test('should estimate costs correctly', () => {
      const estimateTollCosts = (agent as any).estimateTollCosts.bind(agent);
      const estimateFuelCost = (agent as any).estimateFuelCost.bind(agent);
      
      const tollCosts = estimateTollCosts(100); // 100 km
      const fuelCosts = estimateFuelCost(100); // 100 km
      
      expect(tollCosts).toBeGreaterThan(0);
      expect(fuelCosts).toBeGreaterThan(0);
      expect(typeof tollCosts).toBe('number');
      expect(typeof fuelCosts).toBe('number');
    });
  });
});