/**
 * Travel Logistics Agent - Phase 2
 * Manages international travel planning and logistics for executives
 */

import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

export interface TravelRequirement {
  destination: string;
  visa: {
    required: boolean;
    type?: string;
    processingTime?: string;
    documents?: string[];
  };
  vaccinations: {
    required: string[];
    recommended: string[];
  };
  documentation: {
    passport: {
      required: boolean;
      validityRequired: string;
    };
    businessInvitation?: boolean;
    travelInsurance?: boolean;
  };
}

export interface ShortTripPlan {
  id: string;
  executiveId: string;
  origin: {
    address: string;
    coordinates: { lat: number; lng: number };
    timezone: string;
  };
  destination: {
    address: string;
    coordinates: { lat: number; lng: number };
    timezone: string;
  };
  distance: {
    km: number;
    miles: number;
  };
  routes: RouteOption[];
  selectedRoute?: string;
  departureTime: Date;
  estimatedArrival: Date;
  vehicleType: 'executive-car' | 'personal-vehicle' | 'rental-car';
  driverRequired: boolean;
  status: 'planning' | 'confirmed' | 'in-transit' | 'completed' | 'cancelled';
  notifications: {
    trafficAlerts: boolean;
    weatherUpdates: boolean;
    routeChanges: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteOption {
  id: string;
  provider: 'google-maps' | 'waze' | 'apple-maps';
  distance: number;
  duration: number;
  traffic: {
    currentConditions: 'light' | 'moderate' | 'heavy' | 'severe';
    delays: number; // minutes
    incidents: TrafficIncident[];
  };
  tollCosts: number;
  fuelCost: number;
  route: {
    polyline: string;
    waypoints: Array<{ lat: number; lng: number; instruction: string }>;
  };
  alternativeScore: number; // 0-100, higher is better
  recommendationReason: string;
}

export interface TrafficIncident {
  type: 'accident' | 'construction' | 'road-closure' | 'weather' | 'event';
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  location: string;
  estimatedDelay: number;
  coordinates: { lat: number; lng: number };
}

export interface TravelPlan {
  id: string;
  executiveId: string;
  type: 'international' | 'domestic' | 'short-trip';
  destination: {
    country: string;
    city: string;
    timezone: string;
  };
  dates: {
    departure: Date;
    return: Date;
    duration: number;
  };
  purpose: 'business' | 'conference' | 'negotiation' | 'site-visit';
  requirements: TravelRequirement;
  recommendations: {
    hotels: string[];
    transportation: string[];
    dining: string[];
    networking: string[];
  };
  culturalBriefing: {
    keyPoints: string[];
    businessEtiquette: string[];
    warnings: string[];
  };
  emergencyProtocols: {
    embassy: string;
    emergencyContacts: string[];
    medicalFacilities: string[];
    evacuation: boolean;
  };
  shortTrip?: ShortTripPlan; // For trips under 200km by car
  status: 'planning' | 'approved' | 'booked' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface FlightPreference {
  class: 'economy' | 'business' | 'first';
  airline: string[];
  seatPreference: string;
  mealPreference: string;
  loyaltyPrograms: string[];
}

export class TravelLogisticsAgent extends EventEmitter {
  private agentId: string;
  private travelPlans: Map<string, TravelPlan>;
  private shortTrips: Map<string, ShortTripPlan>;
  private requirementsDatabase: Map<string, TravelRequirement>;
  private _flightPreferences: Map<string, FlightPreference>;
  private _trafficAPIKeys: {
    googleMaps: string;
    waze: string;
  };
  private performanceMetrics: {
    responseTimes: number[];
    successfulBookings: number;
    totalPlans: number;
    shortTrips: number;
  };

  constructor() {
    super();
    this.agentId = `travel-logistics-${nanoid()}`;
    this.travelPlans = new Map();
    this.shortTrips = new Map();
    this.requirementsDatabase = new Map();
    this._flightPreferences = new Map();
    this._trafficAPIKeys = {
      googleMaps: process.env.GOOGLE_MAPS_API_KEY || 'demo-key',
      waze: process.env.WAZE_API_KEY || 'demo-key'
    };
    this.performanceMetrics = {
      responseTimes: [],
      successfulBookings: 0,
      totalPlans: 0,
      shortTrips: 0
    };

    this.initializeTravelRequirements();
    this.emit('agent:initialized', { agentId: this.agentId });
  }

  /**
   * Initialize travel requirements database
   */
  private initializeTravelRequirements(): void {
    const requirements: Record<string, TravelRequirement> = {
      'JP': {
        destination: 'Japan',
        visa: {
          required: true,
          type: 'Business Visa',
          processingTime: '5-10 business days',
          documents: ['Passport', 'Application form', 'Business invitation', 'Financial proof']
        },
        vaccinations: {
          required: [],
          recommended: ['Hepatitis A', 'Hepatitis B', 'Japanese Encephalitis']
        },
        documentation: {
          passport: {
            required: true,
            validityRequired: '6 months beyond stay'
          },
          businessInvitation: true,
          travelInsurance: true
        }
      },
      'US': {
        destination: 'United States',
        visa: {
          required: true,
          type: 'B-1 Business Visa or ESTA',
          processingTime: '3-5 business days (ESTA) / 2-4 weeks (B-1)',
          documents: ['Passport', 'DS-160 form', 'Business documents']
        },
        vaccinations: {
          required: [],
          recommended: ['Standard vaccinations up to date']
        },
        documentation: {
          passport: {
            required: true,
            validityRequired: 'Valid for duration of stay + 6 months'
          },
          businessInvitation: false,
          travelInsurance: false
        }
      },
      'UK': {
        destination: 'United Kingdom',
        visa: {
          required: true,
          type: 'Standard Visitor Visa',
          processingTime: '3 weeks',
          documents: ['Passport', 'Application form', 'Financial documents', 'Travel itinerary']
        },
        vaccinations: {
          required: [],
          recommended: []
        },
        documentation: {
          passport: {
            required: true,
            validityRequired: 'Valid for duration of stay'
          },
          businessInvitation: false,
          travelInsurance: false
        }
      }
    };

    Object.entries(requirements).forEach(([code, requirement]) => {
      this.requirementsDatabase.set(code, requirement);
    });
  }

  /**
   * Plan short trip (under 200km) with real-time traffic integration
   */
  public async planShortTrip(request: {
    executiveId: string;
    origin: string;
    destination: string;
    departureTime: Date;
    vehicleType?: 'executive-car' | 'personal-vehicle' | 'rental-car';
    driverRequired?: boolean;
  }): Promise<ShortTripPlan> {
    const startTime = Date.now();

    try {
      // Geocode addresses
      const originCoords = await this.geocodeAddress(request.origin);
      const destinationCoords = await this.geocodeAddress(request.destination);

      // Calculate distance
      const distance = this.calculateDistance(originCoords, destinationCoords);
      
      if (distance.km > 200) {
        throw new Error(`Trip distance ${distance.km}km exceeds 200km limit for short trips`);
      }

      // Get multiple route options with traffic data
      const routes = await this.getRouteOptions(originCoords, destinationCoords, request.departureTime);

      // Select best route
      const bestRoute = this.selectBestRoute(routes);
      const estimatedArrival = new Date(request.departureTime.getTime() + (bestRoute.duration * 60 * 1000));

      const shortTrip: ShortTripPlan = {
        id: nanoid(),
        executiveId: request.executiveId,
        origin: {
          address: request.origin,
          coordinates: originCoords,
          timezone: this.getTimezoneFromCoords(originCoords)
        },
        destination: {
          address: request.destination,
          coordinates: destinationCoords,
          timezone: this.getTimezoneFromCoords(destinationCoords)
        },
        distance,
        routes,
        selectedRoute: bestRoute.id,
        departureTime: request.departureTime,
        estimatedArrival,
        vehicleType: request.vehicleType || 'executive-car',
        driverRequired: request.driverRequired || true,
        status: 'planning',
        notifications: {
          trafficAlerts: true,
          weatherUpdates: true,
          routeChanges: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.shortTrips.set(shortTrip.id, shortTrip);
      this.performanceMetrics.shortTrips++;

      const responseTime = Date.now() - startTime;
      this.performanceMetrics.responseTimes.push(responseTime);

      this.emit('short-trip:planned', {
        tripId: shortTrip.id,
        distance: distance.km,
        estimatedDuration: bestRoute.duration,
        responseTime
      });

      // Start monitoring traffic for the trip
      this.startTrafficMonitoring(shortTrip.id);

      return shortTrip;

    } catch (error) {
      this.emit('short-trip:error', { request, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get real-time route options with traffic data
   */
  private async getRouteOptions(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    departureTime: Date
  ): Promise<RouteOption[]> {
    const routes: RouteOption[] = [];

    // Get Google Maps route
    try {
      const googleRoute = await this.getGoogleMapsRoute(origin, destination, departureTime);
      routes.push(googleRoute);
    } catch (error) {
      console.warn('Google Maps route failed:', error instanceof Error ? error.message : String(error));
    }

    // Get Waze route
    try {
      const wazeRoute = await this.getWazeRoute(origin, destination, departureTime);
      routes.push(wazeRoute);
    } catch (error) {
      console.warn('Waze route failed:', error instanceof Error ? error.message : String(error));
    }

    // Fallback route if both APIs fail
    if (routes.length === 0) {
      routes.push(this.createFallbackRoute(origin, destination));
    }

    return routes;
  }

  /**
   * Get Google Maps route with traffic
   */
  private async getGoogleMapsRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    departureTime: Date
  ): Promise<RouteOption> {
    // Mock implementation - replace with actual Google Maps Directions API call
    const baseDistance = this.calculateDistance(origin, destination).km;
    const baseDuration = Math.round(baseDistance * 1.2); // ~50mph average
    
    // Simulate traffic conditions
    const trafficMultiplier = this.getTrafficMultiplier(departureTime);
    const actualDuration = Math.round(baseDuration * trafficMultiplier);
    const delays = actualDuration - baseDuration;

    return {
      id: `google-${nanoid()}`,
      provider: 'google-maps',
      distance: baseDistance,
      duration: actualDuration,
      traffic: {
        currentConditions: this.getTrafficCondition(trafficMultiplier),
        delays,
        incidents: await this.getTrafficIncidents(origin, destination)
      },
      tollCosts: this.estimateTollCosts(baseDistance),
      fuelCost: this.estimateFuelCost(baseDistance),
      route: {
        polyline: 'encoded_polyline_data',
        waypoints: this.generateWaypoints(origin, destination)
      },
      alternativeScore: Math.round(85 - (delays * 2)), // Score decreases with delays
      recommendationReason: delays > 15 ? 'Heavy traffic expected' : 'Optimal route with current traffic'
    };
  }

  /**
   * Get Waze route with traffic
   */
  private async getWazeRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    departureTime: Date
  ): Promise<RouteOption> {
    // Mock implementation - replace with actual Waze API call
    const baseDistance = this.calculateDistance(origin, destination).km;
    const baseDuration = Math.round(baseDistance * 1.1); // Waze typically faster
    
    const trafficMultiplier = this.getTrafficMultiplier(departureTime) * 0.9; // Waze better at avoiding traffic
    const actualDuration = Math.round(baseDuration * trafficMultiplier);
    const delays = Math.max(0, actualDuration - baseDuration);

    return {
      id: `waze-${nanoid()}`,
      provider: 'waze',
      distance: baseDistance * 1.05, // Might take slightly longer route to avoid traffic
      duration: actualDuration,
      traffic: {
        currentConditions: this.getTrafficCondition(trafficMultiplier),
        delays,
        incidents: await this.getTrafficIncidents(origin, destination)
      },
      tollCosts: this.estimateTollCosts(baseDistance * 1.05),
      fuelCost: this.estimateFuelCost(baseDistance * 1.05),
      route: {
        polyline: 'waze_encoded_polyline_data',
        waypoints: this.generateWaypoints(origin, destination)
      },
      alternativeScore: Math.round(90 - (delays * 1.5)), // Waze typically scores higher
      recommendationReason: delays < 10 ? 'Fastest route avoiding traffic' : 'Best available route with current conditions'
    };
  }

  /**
   * Create fallback route when APIs fail
   */
  private createFallbackRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): RouteOption {
    const distance = this.calculateDistance(origin, destination).km;
    const duration = Math.round(distance * 1.5); // Conservative estimate

    return {
      id: `fallback-${nanoid()}`,
      provider: 'google-maps',
      distance,
      duration,
      traffic: {
        currentConditions: 'moderate',
        delays: 0,
        incidents: []
      },
      tollCosts: this.estimateTollCosts(distance),
      fuelCost: this.estimateFuelCost(distance),
      route: {
        polyline: 'fallback_polyline',
        waypoints: this.generateWaypoints(origin, destination)
      },
      alternativeScore: 60,
      recommendationReason: 'Estimated route - real-time traffic data unavailable'
    };
  }

  /**
   * Select best route from available options
   */
  private selectBestRoute(routes: RouteOption[]): RouteOption {
    if (routes.length === 1) return routes[0];

    // Score routes based on multiple factors
    return routes.reduce((best, current) => {
      const bestScore = this.calculateRouteScore(best);
      const currentScore = this.calculateRouteScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Calculate route score for selection
   */
  private calculateRouteScore(route: RouteOption): number {
    let score = route.alternativeScore;
    
    // Bonus for less traffic delays
    score += Math.max(0, 30 - route.traffic.delays);
    
    // Bonus for lower fuel costs (environmental consideration)
    score += Math.max(0, 20 - route.fuelCost);
    
    // Penalty for severe traffic
    if (route.traffic.currentConditions === 'severe') score -= 20;
    if (route.traffic.currentConditions === 'heavy') score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * Start monitoring traffic for active trip
   */
  private startTrafficMonitoring(tripId: string): void {
    // Mock implementation - would integrate with real-time traffic APIs
    const monitoringInterval = 5 * 60 * 1000; // 5 minutes
    
    const monitor = setInterval(async () => {
      const trip = this.shortTrips.get(tripId);
      if (!trip || ['completed', 'cancelled'].includes(trip.status)) {
        clearInterval(monitor);
        return;
      }

      try {
        // Get updated route with current traffic
        const updatedRoutes = await this.getRouteOptions(
          trip.origin.coordinates,
          trip.destination.coordinates,
          new Date()
        );

        const currentBestRoute = this.selectBestRoute(updatedRoutes);
        const originalRoute = trip.routes.find(r => r.id === trip.selectedRoute);

        // Check if route should be updated
        if (this.shouldUpdateRoute(originalRoute || undefined, currentBestRoute)) {
          trip.selectedRoute = currentBestRoute.id;
          trip.routes = updatedRoutes;
          trip.estimatedArrival = new Date(Date.now() + (currentBestRoute.duration * 60 * 1000));
          trip.updatedAt = new Date();

          this.emit('short-trip:route-updated', {
            tripId,
            newRoute: currentBestRoute,
            reason: 'Traffic conditions changed'
          });

          // Send notification if enabled
          if (trip.notifications.routeChanges) {
            this.emit('short-trip:notification', {
              tripId,
              type: 'route-change',
              message: `Route updated due to traffic. New ETA: ${trip.estimatedArrival.toLocaleTimeString()}`
            });
          }
        }

        // Check for traffic incidents
        const hasNewIncidents = currentBestRoute.traffic.incidents.length > 0;
        if (hasNewIncidents && trip.notifications.trafficAlerts) {
          this.emit('short-trip:notification', {
            tripId,
            type: 'traffic-alert',
            message: `Traffic incidents detected on your route`,
            incidents: currentBestRoute.traffic.incidents
          });
        }

      } catch (error) {
        console.warn(`Traffic monitoring failed for trip ${tripId}:`, error instanceof Error ? error.message : String(error));
      }
    }, monitoringInterval);
  }

  /**
   * Determine if route should be updated
   */
  private shouldUpdateRoute(originalRoute: RouteOption | undefined, newRoute: RouteOption): boolean {
    if (!originalRoute) return true;
    
    // Update if new route saves more than 10 minutes
    const timeSaving = originalRoute.duration - newRoute.duration;
    return timeSaving > 10;
  }

  /**
   * Update short trip status
   */
  public async updateShortTripStatus(tripId: string, status: ShortTripPlan['status']): Promise<ShortTripPlan> {
    const trip = this.shortTrips.get(tripId);
    if (!trip) {
      throw new Error(`Short trip not found: ${tripId}`);
    }

    trip.status = status;
    trip.updatedAt = new Date();

    this.emit('short-trip:status-updated', { tripId, status });
    return trip;
  }

  /**
   * Get short trip by ID
   */
  public getShortTrip(tripId: string): ShortTripPlan | undefined {
    return this.shortTrips.get(tripId);
  }

  /**
   * Get all short trips for executive
   */
  public getShortTripsForExecutive(executiveId: string): ShortTripPlan[] {
    return Array.from(this.shortTrips.values())
      .filter(trip => trip.executiveId === executiveId);
  }

  /**
   * Helper methods for short trip planning
   */
  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    // Mock implementation - replace with actual geocoding API
    const mockCoordinates: Record<string, { lat: number; lng: number }> = {
      'New York, NY': { lat: 40.7128, lng: -74.0060 },
      'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
      'Boston, MA': { lat: 42.3601, lng: -71.0589 },
      'Washington, DC': { lat: 38.9072, lng: -77.0369 }
    };

    return mockCoordinates[address] || { lat: 40.7128, lng: -74.0060 };
  }

  private calculateDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number }
  ): { km: number; miles: number } {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLng = this.deg2rad(coord2.lng - coord1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const km = R * c;
    
    return {
      km: Math.round(km * 10) / 10,
      miles: Math.round(km * 0.621371 * 10) / 10
    };
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private getTrafficMultiplier(departureTime: Date): number {
    const hour = departureTime.getHours();
    const day = departureTime.getDay();
    
    // Weekend traffic is lighter
    if (day === 0 || day === 6) return 1.1;
    
    // Rush hour traffic
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) return 1.6;
    
    // Regular traffic
    if (hour >= 6 && hour <= 22) return 1.3;
    
    // Night traffic
    return 1.0;
  }

  private getTrafficCondition(multiplier: number): 'light' | 'moderate' | 'heavy' | 'severe' {
    if (multiplier <= 1.1) return 'light';
    if (multiplier <= 1.3) return 'moderate';
    if (multiplier <= 1.5) return 'heavy';
    return 'severe';
  }

  private async getTrafficIncidents(
    _origin: { lat: number; lng: number },
    _destination: { lat: number; lng: number }
  ): Promise<TrafficIncident[]> {
    // Mock implementation - replace with actual traffic API
    return [
      {
        type: 'construction',
        severity: 'minor',
        description: 'Lane closure for road work',
        location: 'I-95 North near Exit 23',
        estimatedDelay: 5,
        coordinates: { lat: 40.7580, lng: -73.9855 }
      }
    ];
  }

  private estimateTollCosts(distanceKm: number): number {
    // Rough estimate: $0.50 per 10km
    return Math.round((distanceKm * 0.05) * 100) / 100;
  }

  private estimateFuelCost(distanceKm: number): number {
    // Assume 8L/100km consumption and $1.50/L
    const fuelUsed = (distanceKm * 8) / 100;
    return Math.round(fuelUsed * 1.50 * 100) / 100;
  }

  private generateWaypoints(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Array<{ lat: number; lng: number; instruction: string }> {
    return [
      { ...origin, instruction: 'Start at origin' },
      { ...destination, instruction: 'Arrive at destination' }
    ];
  }

  private getTimezoneFromCoords(_coords: { lat: number; lng: number }): string {
    // Mock implementation - would use timezone API in production
    return 'America/New_York';
  }

  /**
   * Create comprehensive travel plan
   */
  public async createTravelPlan(request: {
    executiveId: string;
    destination: {
      country: string;
      city: string;
    };
    dates: {
      departure: Date;
      return: Date;
    };
    purpose: string;
  }): Promise<TravelPlan> {
    const startTime = Date.now();

    try {
      const countryCode = this.getCountryCode(request.destination.country);
      const requirements = this.requirementsDatabase.get(countryCode);
      
      if (!requirements) {
        throw new Error(`Travel requirements not available for: ${request.destination.country}`);
      }

      const travelPlan: TravelPlan = {
        id: nanoid(),
        executiveId: request.executiveId,
        type: 'international',
        destination: {
          ...request.destination,
          timezone: this.getTimezone(countryCode)
        },
        dates: {
          ...request.dates,
          duration: Math.ceil((request.dates.return.getTime() - request.dates.departure.getTime()) / (1000 * 60 * 60 * 24))
        },
        purpose: request.purpose as any,
        requirements,
        recommendations: await this.generateRecommendations(countryCode, request.destination.city),
        culturalBriefing: await this.generateCulturalBriefing(countryCode),
        emergencyProtocols: await this.generateEmergencyProtocols(countryCode, request.destination.city),
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.travelPlans.set(travelPlan.id, travelPlan);
      this.performanceMetrics.totalPlans++;

      const responseTime = Date.now() - startTime;
      this.performanceMetrics.responseTimes.push(responseTime);

      this.emit('travel:plan-created', {
        planId: travelPlan.id,
        destination: request.destination,
        responseTime
      });

      return travelPlan;

    } catch (error) {
      this.emit('travel:error', { request, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Generate travel recommendations
   */
  private async generateRecommendations(_countryCode: string, _city: string): Promise<{
    hotels: string[];
    transportation: string[];
    dining: string[];
    networking: string[];
  }> {
    // Executive-level recommendations based on destination
    const recommendations = {
      hotels: [
        'Luxury business hotels with concierge services',
        'Hotels with executive floors and meeting facilities',
        'Hotels near business districts'
      ],
      transportation: [
        'Private car service for airport transfers',
        'Executive taxi services with English-speaking drivers',
        'Local public transport executive passes'
      ],
      dining: [
        'Michelin-starred restaurants for client entertainment',
        'Business lunch venues with private dining',
        'Local specialty restaurants for cultural experience'
      ],
      networking: [
        'Business chambers and executive clubs',
        'Industry-specific networking events',
        'Cultural events suitable for business networking'
      ]
    };

    return recommendations;
  }

  /**
   * Generate cultural briefing
   */
  private async generateCulturalBriefing(countryCode: string): Promise<{
    keyPoints: string[];
    businessEtiquette: string[];
    warnings: string[];
  }> {
    const briefings: Record<string, any> = {
      'JP': {
        keyPoints: [
          'Respect hierarchy and seniority',
          'Business cards are sacred - treat with respect',
          'Silence is valuable - don\'t rush to fill gaps'
        ],
        businessEtiquette: [
          'Bow when greeting, deeper for seniors',
          'Present business cards with both hands',
          'Remove shoes when entering traditional spaces'
        ],
        warnings: [
          'Never point with finger - use open hand',
          'Avoid public displays of emotion',
          'Don\'t refuse offered business cards'
        ]
      },
      'US': {
        keyPoints: [
          'Direct communication is valued',
          'Time is money - be punctual',
          'Personal space is important'
        ],
        businessEtiquette: [
          'Firm handshake with eye contact',
          'First names are common in business',
          'Dress professionally but not overly formal'
        ],
        warnings: [
          'Avoid discussing politics or religion',
          'Tipping is expected in restaurants (18-20%)',
          'Personal space - maintain 3-4 feet distance'
        ]
      }
    };

    return briefings[countryCode] || {
      keyPoints: ['Research local customs before travel'],
      businessEtiquette: ['Follow standard international business practices'],
      warnings: ['Consult local contacts for specific guidance']
    };
  }

  /**
   * Generate emergency protocols
   */
  private async generateEmergencyProtocols(_countryCode: string, city: string): Promise<{
    embassy: string;
    emergencyContacts: string[];
    medicalFacilities: string[];
    evacuation: boolean;
  }> {
    return {
      embassy: `[Country] Embassy in ${city}`,
      emergencyContacts: [
        'Local emergency services: varies by country',
        'Executive assistant: [Contact]',
        'Company security: [Contact]'
      ],
      medicalFacilities: [
        'International hospitals with English services',
        '24/7 medical clinics',
        'Pharmacy locations'
      ],
      evacuation: false // Set based on current security conditions
    };
  }

  /**
   * Update travel plan status
   */
  public async updateTravelPlanStatus(planId: string, status: TravelPlan['status']): Promise<TravelPlan> {
    const plan = this.travelPlans.get(planId);
    if (!plan) {
      throw new Error(`Travel plan not found: ${planId}`);
    }

    plan.status = status;
    plan.updatedAt = new Date();

    if (status === 'completed') {
      this.performanceMetrics.successfulBookings++;
    }

    this.emit('travel:status-updated', { planId, status });
    return plan;
  }

  /**
   * Get travel plan by ID
   */
  public getTravelPlan(planId: string): TravelPlan | undefined {
    return this.travelPlans.get(planId);
  }

  /**
   * Get all travel plans for executive
   */
  public getTravelPlansForExecutive(executiveId: string): TravelPlan[] {
    return Array.from(this.travelPlans.values())
      .filter(plan => plan.executiveId === executiveId);
  }

  /**
   * Helper methods
   */
  private getCountryCode(countryName: string): string {
    const countryCodes: Record<string, string> = {
      'Japan': 'JP',
      'United States': 'US',
      'USA': 'US',
      'United Kingdom': 'UK',
      'UK': 'UK',
      'Germany': 'DE'
    };
    return countryCodes[countryName] || countryName.toUpperCase().slice(0, 2);
  }

  private getTimezone(countryCode: string): string {
    const timezones: Record<string, string> = {
      'JP': 'Asia/Tokyo',
      'US': 'America/New_York',
      'UK': 'Europe/London',
      'DE': 'Europe/Berlin'
    };
    return timezones[countryCode] || 'UTC';
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics() {
    const avgResponseTime = this.performanceMetrics.responseTimes.length > 0
      ? this.performanceMetrics.responseTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.responseTimes.length
      : 0;

    return {
      agentId: this.agentId,
      averageResponseTime: `${avgResponseTime.toFixed(2)}ms`,
      totalPlans: this.performanceMetrics.totalPlans,
      shortTrips: this.performanceMetrics.shortTrips,
      successfulBookings: this.performanceMetrics.successfulBookings,
      successRate: `${((this.performanceMetrics.successfulBookings / (this.performanceMetrics.totalPlans + this.performanceMetrics.shortTrips)) * 100).toFixed(1)}%`,
      countriesCovered: this.requirementsDatabase.size,
      targetResponseTime: '<75ms (Phase 2 goal)',
      features: {
        internationalTravel: true,
        shortTripPlanning: true,
        realTimeTraffic: true,
        multipleRouteProviders: ['Google Maps', 'Waze'],
        trafficMonitoring: true,
        culturalBriefings: true
      }
    };
  }
}

export default TravelLogisticsAgent;