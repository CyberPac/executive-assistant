/**
 * Enhanced Unit Tests for Travel Logistics Agent
 * Comprehensive testing to improve coverage from 4.04% to 80%+
 */

import {
  TravelLogisticsAgent,
  TravelRequest,
  TravelPreferences,
  TravelItinerary,
  TravelBooking,
  TravelAlert,
  TravelPolicy,
  TravelExpenseReport,
  TravelRisk,
  EmergencyContact,
  TravelInsurance,
  TravelDocument,
  TravelCompliance
} from '../../../src/agents/travel-logistics/TravelLogisticsAgent';
import { PEAAgentType, AgentStatus, SecurityLevel } from '../../../src/types/enums';

// Mock MCP integration
const createMockMCPIntegration = () => ({
  invokeFunction: jest.fn(),
  storeMemory: jest.fn(),
  retrieveMemory: jest.fn(),
  sendNotification: jest.fn(),
  scheduleTask: jest.fn(),
  getAgentStatus: jest.fn(),
  coordinateWith: jest.fn(),
  searchFlights: jest.fn(),
  searchHotels: jest.fn(),
  searchCarRentals: jest.fn(),
  bookTravel: jest.fn(),
  cancelBooking: jest.fn(),
  getTravelAlerts: jest.fn(),
  checkVisa: jest.fn(),
  getWeather: jest.fn(),
  calculateExpenses: jest.fn(),
  generateReport: jest.fn()
});

describe('TravelLogisticsAgent - Enhanced Coverage', () => {
  let agent: TravelLogisticsAgent;
  let mockMcpIntegration: jest.Mocked<any>;

  beforeEach(() => {
    mockMcpIntegration = createMockMCPIntegration();
    agent = new TravelLogisticsAgent(mockMcpIntegration);
    jest.clearAllMocks();
  });

  describe('Agent Initialization and Configuration', () => {
    it('should initialize with correct agent properties', () => {
      expect(agent.id).toBe('travel-logistics-001');
      expect(agent.type).toBe(PEAAgentType.TRAVEL_LOGISTICS);
      expect(agent.name).toBe('Travel Logistics Coordinator');
      expect(agent.status).toBe(AgentStatus.INITIALIZING);
      expect(agent.securityLevel).toBe(SecurityLevel.STANDARD);
    });

    it('should initialize with comprehensive travel capabilities', () => {
      const capabilities = agent.getCapabilities();
      
      expect(capabilities).toMatchObject({
        flightBooking: true,
        hotelReservation: true,
        carRental: true,
        visaAssistance: true,
        travelInsurance: true,
        expenseTracking: true,
        riskAssessment: true,
        emergencySupport: true,
        culturalGuidance: true,
        documentManagement: true,
        multiCurrencySupport: true,
        realTimeUpdates: true
      });
    });

    it('should set up travel preferences and policies', async () => {
      await agent.initialize();
      
      expect(agent.status).toBe(AgentStatus.READY);
      expect(mockMcpIntegration.storeMemory).toHaveBeenCalledWith(
        'travel_initialization',
        expect.objectContaining({
          status: 'initialized',
          capabilities: expect.any(Object)
        })
      );
    });

    it('should configure executive travel preferences', async () => {
      const executivePreferences: TravelPreferences = {
        classPreference: 'business',
        airlinePreferences: ['American Airlines', 'Delta', 'United'],
        hotelChains: ['Marriott', 'Hilton', 'Hyatt'],
        seatPreference: 'aisle',
        mealPreferences: ['vegetarian'],
        roomPreferences: ['suite', 'club_level'],
        carCategory: 'luxury',
        budgetLimits: {
          flight: 5000,
          hotel: 500,
          meals: 200,
          ground: 100
        },
        loyaltyPrograms: {
          airlines: ['AA Executive Platinum', 'Delta Diamond'],
          hotels: ['Marriott Titanium', 'Hilton Diamond'],
          carRental: ['Hertz President Circle']
        }
      };

      await agent.setTravelPreferences('exec-001', executivePreferences);
      
      expect(mockMcpIntegration.storeMemory).toHaveBeenCalledWith(
        'travel_preferences_exec-001',
        executivePreferences
      );
    });
  });

  describe('Travel Request Processing', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should process complete travel request', async () => {
      const travelRequest: TravelRequest = {
        id: 'tr-001',
        executiveId: 'exec-001',
        requestType: 'business',
        priority: 'high',
        departure: {
          location: 'New York, NY',
          date: new Date('2024-03-15'),
          time: '08:00',
          airport: 'JFK'
        },
        destination: {
          location: 'London, UK',
          date: new Date('2024-03-15'),
          time: '20:00',
          airport: 'LHR'
        },
        return: {
          location: 'London, UK',
          date: new Date('2024-03-18'),
          time: '15:00',
          airport: 'LHR'
        },
        accommodations: {
          checkIn: new Date('2024-03-15'),
          checkOut: new Date('2024-03-18'),
          nights: 3,
          roomType: 'suite',
          location: 'Central London'
        },
        groundTransportation: {
          required: true,
          type: 'car_service',
          pickupLocation: 'Hotel',
          destinations: ['Meeting venue', 'Airport']
        },
        specialRequirements: [
          'Visa assistance required',
          'Travel insurance',
          'Emergency contact setup'
        ],
        budgetConstraints: {
          total: 8000,
          flightMax: 4000,
          hotelMax: 600,
          groundMax: 200
        },
        requestedBy: 'assistant-001',
        requestedAt: new Date(),
        urgency: 'normal'
      };

      mockMcpIntegration.searchFlights.mockResolvedValue([
        {
          flightNumber: 'AA101',
          airline: 'American Airlines',
          price: 3500,
          departure: { time: '08:15', airport: 'JFK' },
          arrival: { time: '19:45', airport: 'LHR' },
          duration: 425,
          class: 'business'
        }
      ]);

      mockMcpIntegration.searchHotels.mockResolvedValue([
        {
          name: 'The Langham London',
          price: 550,
          rating: 5,
          location: 'Central London',
          amenities: ['Spa', 'Business Center', 'Concierge']
        }
      ]);

      const result = await agent.processTravelRequest(travelRequest);

      expect(result.success).toBe(true);
      expect(result.requestId).toBe('tr-001');
      expect(result.estimatedTotal).toBeLessThanOrEqual(8000);
      expect(result.itinerary).toBeDefined();
      expect(mockMcpIntegration.searchFlights).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'JFK',
          to: 'LHR',
          date: expect.any(Date),
          class: 'business'
        })
      );
    });

    it('should handle multi-city travel requests', async () => {
      const multiCityRequest: TravelRequest = {
        id: 'tr-002',
        executiveId: 'exec-001',
        requestType: 'business',
        priority: 'high',
        multiCity: true,
        cities: [
          {
            location: 'New York, NY',
            arrival: new Date('2024-03-15'),
            departure: new Date('2024-03-17'),
            purpose: 'Board meeting'
          },
          {
            location: 'London, UK',
            arrival: new Date('2024-03-17'),
            departure: new Date('2024-03-20'),
            purpose: 'Client meetings'
          },
          {
            location: 'Tokyo, Japan',
            arrival: new Date('2024-03-20'),
            departure: new Date('2024-03-23'),
            purpose: 'Partnership negotiations'
          }
        ],
        requestedBy: 'assistant-001',
        requestedAt: new Date()
      };

      const result = await agent.processTravelRequest(multiCityRequest);

      expect(result.success).toBe(true);
      expect(result.itinerary.segments).toHaveLength(3);
      expect(mockMcpIntegration.searchFlights).toHaveBeenCalledTimes(3); // For each segment
    });

    it('should validate travel request requirements', async () => {
      const invalidRequest: TravelRequest = {
        id: 'tr-invalid',
        executiveId: '',
        requestType: 'business',
        priority: 'high',
        departure: {
          location: '',
          date: new Date('2023-01-01'), // Past date
          time: '25:00', // Invalid time
          airport: ''
        },
        requestedBy: 'assistant-001',
        requestedAt: new Date()
      };

      await expect(agent.processTravelRequest(invalidRequest))
        .rejects.toThrow('Invalid travel request');
    });

    it('should handle urgent travel requests with priority processing', async () => {
      const urgentRequest: TravelRequest = {
        id: 'tr-urgent',
        executiveId: 'exec-001',
        requestType: 'emergency',
        priority: 'critical',
        urgency: 'immediate',
        departure: {
          location: 'San Francisco, CA',
          date: new Date(Date.now() + 86400000), // Tomorrow
          time: '06:00',
          airport: 'SFO'
        },
        destination: {
          location: 'Seattle, WA',
          date: new Date(Date.now() + 86400000),
          time: '08:00',
          airport: 'SEA'
        },
        requestedBy: 'assistant-001',
        requestedAt: new Date()
      };

      mockMcpIntegration.searchFlights.mockResolvedValue([
        {
          flightNumber: 'AS150',
          airline: 'Alaska Airlines',
          price: 800,
          departure: { time: '06:15', airport: 'SFO' },
          arrival: { time: '08:30', airport: 'SEA' },
          availability: 'available'
        }
      ]);

      const result = await agent.processTravelRequest(urgentRequest);

      expect(result.success).toBe(true);
      expect(result.processingTime).toBeLessThan(30000); // Fast processing
      expect(mockMcpIntegration.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urgent_travel_processed',
          priority: 'high'
        })
      );
    });
  });

  describe('Travel Booking Management', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should create comprehensive travel bookings', async () => {
      const bookingDetails = {
        requestId: 'tr-001',
        executiveId: 'exec-001',
        flights: [{
          outbound: {
            flightNumber: 'AA101',
            airline: 'American Airlines',
            departure: { airport: 'JFK', time: '08:15', date: '2024-03-15' },
            arrival: { airport: 'LHR', time: '19:45', date: '2024-03-15' },
            class: 'business',
            price: 3500
          },
          return: {
            flightNumber: 'AA102',
            airline: 'American Airlines',
            departure: { airport: 'LHR', time: '15:30', date: '2024-03-18' },
            arrival: { airport: 'JFK', time: '18:45', date: '2024-03-18' },
            class: 'business',
            price: 3500
          }
        }],
        hotels: [{
          name: 'The Langham London',
          checkIn: '2024-03-15',
          checkOut: '2024-03-18',
          nights: 3,
          roomType: 'suite',
          rate: 550,
          totalCost: 1650
        }],
        groundTransport: [{
          type: 'car_service',
          provider: 'Executive Cars London',
          pickups: ['LHR Airport', 'Hotel'],
          destinations: ['Hotel', 'Meeting venues', 'LHR Airport'],
          totalCost: 180
        }]
      };

      mockMcpIntegration.bookTravel.mockResolvedValue({
        bookingId: 'booking-001',
        confirmationNumbers: {
          flights: 'AA-CONF-123',
          hotel: 'LANG-CONF-456',
          carService: 'EC-CONF-789'
        },
        totalCost: 7830,
        status: 'confirmed'
      });

      const booking = await agent.createBooking(bookingDetails);

      expect(booking.success).toBe(true);
      expect(booking.bookingId).toBe('booking-001');
      expect(booking.totalCost).toBe(7830);
      expect(booking.confirmations).toBeDefined();
      expect(mockMcpIntegration.storeMemory).toHaveBeenCalledWith(
        'travel_booking_booking-001',
        expect.objectContaining({
          bookingId: 'booking-001',
          status: 'confirmed'
        })
      );
    });

    it('should handle booking modifications', async () => {
      const originalBooking = {
        bookingId: 'booking-001',
        flightConfirmation: 'AA-CONF-123',
        hotelConfirmation: 'LANG-CONF-456'
      };

      const modifications = {
        flights: {
          changeType: 'reschedule',
          newDeparture: { date: '2024-03-16', time: '10:00' },
          reason: 'Meeting rescheduled'
        },
        hotel: {
          changeType: 'extend',
          newCheckOut: '2024-03-19',
          additionalNights: 1
        }
      };

      mockMcpIntegration.invokeFunction.mockResolvedValue({
        modificationId: 'mod-001',
        newConfirmations: {
          flights: 'AA-CONF-124',
          hotel: 'LANG-CONF-457'
        },
        additionalCost: 750,
        status: 'modified'
      });

      const result = await agent.modifyBooking(originalBooking.bookingId, modifications);

      expect(result.success).toBe(true);
      expect(result.modificationId).toBe('mod-001');
      expect(result.additionalCost).toBe(750);
    });

    it('should cancel bookings with appropriate policies', async () => {
      const cancellationRequest = {
        bookingId: 'booking-001',
        reason: 'Meeting cancelled',
        cancelAll: true,
        requestedBy: 'exec-001'
      };

      mockMcpIntegration.cancelBooking.mockResolvedValue({
        cancellationId: 'cancel-001',
        refundAmount: 6500,
        cancellationFees: 1330,
        netRefund: 5170,
        status: 'cancelled'
      });

      const result = await agent.cancelBooking(cancellationRequest);

      expect(result.success).toBe(true);
      expect(result.netRefund).toBe(5170);
      expect(result.cancellationFees).toBe(1330);
      expect(mockMcpIntegration.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'booking_cancelled',
          details: expect.objectContaining({
            netRefund: 5170
          })
        })
      );
    });
  });

  describe('Travel Risk Assessment and Safety', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should assess travel risks for destinations', async () => {
      const destination = 'Cairo, Egypt';
      const travelDate = new Date('2024-04-01');

      mockMcpIntegration.invokeFunction.mockResolvedValue({
        riskLevel: 'medium',
        riskFactors: [
          'Political demonstrations possible',
          'Heightened security measures',
          'Health advisory for certain areas'
        ],
        recommendations: [
          'Register with embassy',
          'Avoid large gatherings',
          'Carry identification at all times'
        ],
        emergencyContacts: [
          { type: 'embassy', phone: '+20-2-xxxx-xxxx' },
          { type: 'local_police', phone: '122' }
        ]
      });

      const riskAssessment = await agent.assessTravelRisk(destination, travelDate);

      expect(riskAssessment.riskLevel).toBe('medium');
      expect(riskAssessment.riskFactors).toHaveLength(3);
      expect(riskAssessment.recommendations).toContain('Register with embassy');
      expect(riskAssessment.emergencyContacts).toHaveLength(2);
    });

    it('should provide real-time travel alerts', async () => {
      const executiveLocation = 'London, UK';

      mockMcpIntegration.getTravelAlerts.mockResolvedValue([
        {
          id: 'alert-001',
          type: 'weather',
          severity: 'moderate',
          title: 'Heavy snow expected',
          description: 'Significant snowfall may affect transportation',
          affectedAreas: ['London', 'Southeast England'],
          startTime: new Date(),
          estimatedDuration: 12,
          recommendations: ['Allow extra travel time', 'Check flight status']
        },
        {
          id: 'alert-002',
          type: 'transportation',
          severity: 'high',
          title: 'Underground strike',
          description: 'London Underground workers on strike',
          affectedLines: ['Central', 'Piccadilly'],
          startTime: new Date(),
          estimatedDuration: 24,
          alternatives: ['Bus services', 'Taxi', 'Walking']
        }
      ]);

      const alerts = await agent.getTravelAlerts(executiveLocation);

      expect(alerts).toHaveLength(2);
      expect(alerts[0].type).toBe('weather');
      expect(alerts[1].type).toBe('transportation');
      expect(alerts[1].severity).toBe('high');
    });

    it('should set up emergency protocols', async () => {
      const emergencySetup = {
        executiveId: 'exec-001',
        travelId: 'tr-001',
        emergencyContacts: [
          {
            name: 'Executive Assistant',
            phone: '+1-555-xxx-xxxx',
            email: 'assistant@company.com',
            relationship: 'professional'
          },
          {
            name: 'Family Contact',
            phone: '+1-555-yyy-yyyy',
            relationship: 'family'
          }
        ],
        medicalInfo: {
          allergies: ['Penicillin'],
          medications: ['Daily vitamin'],
          bloodType: 'O+',
          insurance: {
            provider: 'Global Health Insurance',
            policyNumber: 'GHI-123456'
          }
        },
        preferences: {
          language: 'English',
          dietary: ['No shellfish'],
          accessibility: []
        }
      };

      const result = await agent.setupEmergencyProtocols(emergencySetup);

      expect(result.success).toBe(true);
      expect(result.emergencyId).toBeDefined();
      expect(mockMcpIntegration.storeMemory).toHaveBeenCalledWith(
        'emergency_protocols_exec-001',
        expect.objectContaining({
          executiveId: 'exec-001',
          emergencyContacts: expect.any(Array)
        })
      );
    });
  });

  describe('Travel Documentation and Compliance', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should manage visa requirements and applications', async () => {
      const visaRequest = {
        executiveId: 'exec-001',
        destination: 'India',
        nationality: 'US',
        travelPurpose: 'business',
        travelDate: new Date('2024-05-01'),
        stayDuration: 7
      };

      mockMcpIntegration.checkVisa.mockResolvedValue({
        required: true,
        type: 'e-visa',
        processingTime: '3-5 business days',
        cost: 25,
        requirements: [
          'Valid passport (6+ months)',
          'Passport photo',
          'Business invitation letter',
          'Flight itinerary'
        ],
        applicationUrl: 'https://indianvisaonline.gov.in'
      });

      const visaInfo = await agent.checkVisaRequirements(visaRequest);

      expect(visaInfo.required).toBe(true);
      expect(visaInfo.type).toBe('e-visa');
      expect(visaInfo.requirements).toContain('Valid passport (6+ months)');
      expect(visaInfo.cost).toBe(25);
    });

    it('should track passport and document validity', async () => {
      const documents: TravelDocument[] = [
        {
          type: 'passport',
          number: 'US123456789',
          issuedBy: 'United States',
          issueDate: new Date('2019-01-01'),
          expiryDate: new Date('2029-01-01'),
          executiveId: 'exec-001'
        },
        {
          type: 'global_entry',
          number: 'GE987654321',
          issuedBy: 'US CBP',
          issueDate: new Date('2020-06-01'),
          expiryDate: new Date('2025-06-01'),
          executiveId: 'exec-001'
        }
      ];

      const validityCheck = await agent.checkDocumentValidity(documents, new Date('2024-05-01'));

      expect(validityCheck.valid).toBe(true);
      expect(validityCheck.warnings).toContain(
        expect.stringContaining('Global Entry expires')
      );
      expect(validityCheck.recommendations).toContain(
        'Renew Global Entry before expiry'
      );
    });

    it('should ensure corporate travel compliance', async () => {
      const travelPolicy: TravelPolicy = {
        companyId: 'company-001',
        flightRestrictions: {
          maxDomesticFare: 800,
          maxInternationalFare: 4000,
          requiredClass: {
            domestic: 'economy',
            international: 'business'
          },
          preferredAirlines: ['American', 'Delta', 'United']
        },
        hotelRestrictions: {
          maxNightlyRate: 400,
          preferredChains: ['Marriott', 'Hilton', 'Hyatt'],
          requiredAmenities: ['WiFi', 'Business Center']
        },
        expenseRestrictions: {
          maxMealAllowance: 150,
          maxGroundTransport: 100,
          requireReceiptsOver: 25
        },
        approvalRequirements: {
          internationalTravel: true,
          travelOverAmount: 5000,
          advanceBookingDays: 14
        }
      };

      const booking = {
        flights: { totalCost: 3800, class: 'business', airline: 'American' },
        hotels: { nightly: 380, chain: 'Marriott', nights: 3 },
        expenses: { meals: 140, ground: 85 }
      };

      const compliance = await agent.checkTravelCompliance(booking, travelPolicy);

      expect(compliance.compliant).toBe(true);
      expect(compliance.violations).toHaveLength(0);
      expect(compliance.approvalRequired).toBe(false);
    });
  });

  describe('Expense Tracking and Reporting', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should track real-time travel expenses', async () => {
      const expenses = [
        {
          category: 'flight',
          amount: 3500,
          currency: 'USD',
          vendor: 'American Airlines',
          date: new Date('2024-03-15'),
          description: 'NYC to London business class'
        },
        {
          category: 'hotel',
          amount: 550,
          currency: 'GBP',
          vendor: 'The Langham London',
          date: new Date('2024-03-15'),
          description: 'Suite accommodation per night'
        },
        {
          category: 'meals',
          amount: 75,
          currency: 'GBP',
          vendor: 'Restaurant Gordon Ramsay',
          date: new Date('2024-03-16'),
          description: 'Business dinner with client'
        }
      ];

      mockMcpIntegration.calculateExpenses.mockResolvedValue({
        totalUSD: 4925.50,
        byCategory: {
          flight: 3500,
          hotel: 731.50, // Converted from GBP
          meals: 99.50, // Converted from GBP
          ground: 0
        },
        conversions: {
          'GBP-USD': 1.33
        }
      });

      const expenseReport = await agent.trackExpenses('tr-001', expenses);

      expect(expenseReport.totalUSD).toBe(4925.50);
      expect(expenseReport.byCategory.flight).toBe(3500);
      expect(expenseReport.conversions['GBP-USD']).toBe(1.33);
    });

    it('should generate comprehensive expense reports', async () => {
      const reportRequest = {
        executiveId: 'exec-001',
        travelId: 'tr-001',
        periodStart: new Date('2024-03-15'),
        periodEnd: new Date('2024-03-18'),
        includeReceipts: true,
        format: 'detailed'
      };

      mockMcpIntegration.generateReport.mockResolvedValue({
        reportId: 'exp-report-001',
        summary: {
          totalExpenses: 5280.75,
          totalReimbursable: 4950.25,
          totalPersonal: 330.50,
          currenciesUsed: ['USD', 'GBP'],
          expenseCount: 12
        },
        breakdown: {
          flights: 3500,
          hotels: 1650,
          meals: 450.75,
          ground: 180,
          incidentals: 80
        },
        receipts: ['receipt-001', 'receipt-002', 'receipt-003'],
        complianceCheck: {
          policyViolations: 0,
          flaggedExpenses: [],
          requiresApproval: false
        }
      });

      const report = await agent.generateExpenseReport(reportRequest);

      expect(report.success).toBe(true);
      expect(report.reportId).toBe('exp-report-001');
      expect(report.summary.totalExpenses).toBe(5280.75);
      expect(report.complianceCheck.policyViolations).toBe(0);
    });

    it('should handle multi-currency expense calculations', async () => {
      const multiCurrencyExpenses = [
        { amount: 1000, currency: 'USD', category: 'flight' },
        { amount: 500, currency: 'EUR', category: 'hotel' },
        { amount: 8000, currency: 'JPY', category: 'meals' },
        { amount: 75, currency: 'GBP', category: 'ground' }
      ];

      mockMcpIntegration.calculateExpenses.mockResolvedValue({
        totalUSD: 1677.50,
        conversions: {
          'EUR-USD': 1.08,
          'JPY-USD': 0.0067,
          'GBP-USD': 1.33
        },
        byCategory: {
          flight: 1000,
          hotel: 540, // 500 EUR * 1.08
          meals: 53.60, // 8000 JPY * 0.0067
          ground: 99.75 // 75 GBP * 1.33
        }
      });

      const result = await agent.calculateMultiCurrencyExpenses(multiCurrencyExpenses);

      expect(result.totalUSD).toBe(1677.50);
      expect(result.conversions).toHaveProperty('EUR-USD');
      expect(result.conversions).toHaveProperty('JPY-USD');
      expect(result.conversions).toHaveProperty('GBP-USD');
    });
  });

  describe('Cultural Intelligence and Local Guidance', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should provide cultural guidance for destinations', async () => {
      const destination = 'Tokyo, Japan';
      const businessContext = 'Client meetings and negotiations';

      mockMcpIntegration.invokeFunction.mockResolvedValue({
        culturalNorms: [
          'Bowing is customary when meeting business partners',
          'Business cards should be exchanged with both hands',
          'Punctuality is extremely important',
          'Remove shoes when entering traditional venues'
        ],
        businessEtiquette: [
          'Meetings often start with small talk',
          'Decision-making may take longer than in Western cultures',
          'Hierarchy is important - address senior members first',
          'Avoid direct confrontation or saying no directly'
        ],
        diningCustoms: [
          'Wait for the host to start eating',
          'Slurping noodles is acceptable',
          'Tipping is not customary and may be offensive',
          'Use chopsticks properly - never stick them upright in rice'
        ],
        giftGiving: [
          'Gifts should be wrapped beautifully',
          'Present and receive gifts with both hands',
          'Avoid giving sets of four (unlucky number)',
          'Quality over quantity is preferred'
        ],
        languageBasics: [
          'Learn basic greetings: Ohayo gozaimasu (Good morning)',
          'Arigatou gozaimasu (Thank you very much)',
          'Sumimasen (Excuse me/I\'m sorry)',
          'Hai (Yes) and Iie (No)'
        ]
      });

      const guidance = await agent.getCulturalGuidance(destination, businessContext);

      expect(guidance.culturalNorms).toContain('Bowing is customary when meeting business partners');
      expect(guidance.businessEtiquette).toContain('Hierarchy is important - address senior members first');
      expect(guidance.diningCustoms).toContain('Tipping is not customary and may be offensive');
      expect(guidance.languageBasics).toHaveLength(4);
    });

    it('should recommend local services and contacts', async () => {
      const location = 'Dubai, UAE';
      const serviceTypes = ['transportation', 'interpreter', 'business_center', 'concierge'];

      mockMcpIntegration.invokeFunction.mockResolvedValue({
        transportation: {
          recommended: 'Emirates Chauffeur Service',
          alternatives: ['Careem Business', 'Uber for Business'],
          notes: 'Pre-booking recommended for airport transfers'
        },
        interpreter: {
          recommended: 'Dubai Professional Translation Services',
          languages: ['Arabic', 'English', 'Hindi', 'Urdu'],
          rates: '$150-200/hour',
          availability: '24/7 for business needs'
        },
        businessCenter: {
          recommended: 'Emirates Towers Business Centre',
          services: ['Meeting rooms', 'Video conferencing', 'Secretary services'],
          location: 'Downtown Dubai'
        },
        concierge: {
          recommended: 'Quintessentially Dubai',
          services: ['Dining reservations', 'Entertainment booking', 'Shopping assistance'],
          contactHours: '24/7'
        }
      });

      const services = await agent.getLocalServices(location, serviceTypes);

      expect(services.transportation.recommended).toBe('Emirates Chauffeur Service');
      expect(services.interpreter.languages).toContain('Arabic');
      expect(services.businessCenter.services).toContain('Meeting rooms');
      expect(services.concierge.contactHours).toBe('24/7');
    });
  });

  describe('Travel Optimization and Analytics', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should optimize travel routes and schedules', async () => {
      const multiCityTrip = {
        startLocation: 'New York',
        destinations: ['London', 'Paris', 'Frankfurt', 'Milan'],
        endLocation: 'New York',
        constraints: {
          maxTravelTime: 15, // hours
          minStayDuration: 24, // hours
          budgetLimit: 12000
        },
        preferences: {
          minimizeFlightChanges: true,
          preferDirectFlights: true,
          optimizeFor: 'time' // or 'cost'
        }
      };

      mockMcpIntegration.invokeFunction.mockResolvedValue({
        optimizedRoute: ['New York', 'London', 'Frankfurt', 'Milan', 'Paris', 'New York'],
        totalCost: 11750,
        totalTravelTime: 14.5,
        savings: {
          cost: 1250,
          time: 3.5,
          flightChanges: 2
        },
        routeDetails: [
          {
            from: 'New York',
            to: 'London',
            flight: 'BA117',
            duration: 7,
            cost: 3200
          },
          {
            from: 'London',
            to: 'Frankfurt',
            flight: 'LH903',
            duration: 1.5,
            cost: 450
          }
          // ... more segments
        ]
      });

      const optimization = await agent.optimizeTravelRoute(multiCityTrip);

      expect(optimization.totalCost).toBeLessThanOrEqual(12000);
      expect(optimization.totalTravelTime).toBeLessThanOrEqual(15);
      expect(optimization.savings.cost).toBe(1250);
      expect(optimization.optimizedRoute).toHaveLength(6);
    });

    it('should provide travel analytics and insights', async () => {
      const analyticsRequest = {
        executiveId: 'exec-001',
        period: 'quarterly',
        year: 2024,
        quarter: 1
      };

      mockMcpIntegration.invokeFunction.mockResolvedValue({
        travelSummary: {
          totalTrips: 12,
          totalDays: 45,
          totalExpenses: 87500,
          destinationCount: 8,
          averageTripCost: 7291.67
        },
        patterns: {
          mostVisitedDestinations: ['London', 'Singapore', 'Tokyo'],
          preferredAirlines: ['American Airlines', 'British Airways'],
          averageAdvanceBooking: 18, // days
          peakTravelMonths: ['March', 'October']
        },
        efficiency: {
          onTimePerformance: 0.92,
          bookingAccuracy: 0.96,
          expenseCompliance: 0.98,
          travelerSatisfaction: 4.6
        },
        recommendations: [
          'Consider travel consolidation in March to reduce costs',
          'Book Singapore trips earlier for better rates',
          'Utilize loyalty program benefits more effectively'
        ]
      });

      const analytics = await agent.getTravelAnalytics(analyticsRequest);

      expect(analytics.travelSummary.totalTrips).toBe(12);
      expect(analytics.patterns.mostVisitedDestinations).toContain('London');
      expect(analytics.efficiency.onTimePerformance).toBe(0.92);
      expect(analytics.recommendations).toHaveLength(3);
    });
  });

  describe('Integration and Communication', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should coordinate with other PEA agents', async () => {
      const travelRequest = {
        executiveId: 'exec-001',
        meetingPurpose: 'Board presentation',
        confidentialityLevel: 'high'
      };

      await agent.coordinateWithPEAAgents(travelRequest, [
        'calendar-intelligence',
        'security-privacy',
        'executive-orchestrator'
      ]);

      expect(mockMcpIntegration.coordinateWith).toHaveBeenCalledWith(
        expect.arrayContaining([
          'calendar-intelligence',
          'security-privacy',
          'executive-orchestrator'
        ])
      );
    });

    it('should send travel notifications and updates', async () => {
      const travelUpdate = {
        type: 'flight_delay',
        severity: 'medium',
        travelId: 'tr-001',
        executiveId: 'exec-001',
        details: {
          originalDeparture: '08:15',
          newDeparture: '10:30',
          delay: 135, // minutes
          reason: 'Air traffic control',
          gate: 'B12'
        },
        recommendations: [
          'Inform meeting attendees of potential delay',
          'Consider rescheduling first meeting',
          'Monitor gate changes'
        ]
      };

      await agent.sendTravelNotification(travelUpdate);

      expect(mockMcpIntegration.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'flight_delay',
          priority: 'medium',
          recipients: expect.arrayContaining(['exec-001'])
        })
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should handle booking service failures gracefully', async () => {
      mockMcpIntegration.bookTravel.mockRejectedValue(new Error('Booking service unavailable'));

      const bookingRequest = {
        requestId: 'tr-001',
        executiveId: 'exec-001',
        flights: [{ flightNumber: 'AA101', price: 3500 }]
      };

      const result = await agent.createBooking(bookingRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Booking service unavailable');
      expect(result.fallbackOptions).toBeDefined();
      expect(mockMcpIntegration.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'booking_failure',
          priority: 'high'
        })
      );
    });

    it('should handle invalid travel dates', async () => {
      const invalidRequest = {
        id: 'tr-invalid',
        executiveId: 'exec-001',
        departure: {
          location: 'New York',
          date: new Date('2023-01-01'), // Past date
          time: '08:00'
        },
        requestedBy: 'assistant-001',
        requestedAt: new Date()
      };

      await expect(agent.processTravelRequest(invalidRequest))
        .rejects.toThrow('Travel date cannot be in the past');
    });

    it('should handle concurrent travel processing', async () => {
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push({
          id: `tr-concurrent-${i}`,
          executiveId: 'exec-001',
          departure: {
            location: 'New York',
            date: new Date(Date.now() + (i + 1) * 86400000),
            time: '09:00'
          },
          destination: {
            location: 'Los Angeles',
            date: new Date(Date.now() + (i + 1) * 86400000),
            time: '12:00'
          },
          requestedBy: 'assistant-001',
          requestedAt: new Date()
        });
      }

      mockMcpIntegration.searchFlights.mockResolvedValue([{
        flightNumber: 'AA100',
        price: 500,
        availability: 'available'
      }]);

      const results = await Promise.all(
        requests.map(req => agent.processTravelRequest(req))
      );

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle missing travel preferences gracefully', async () => {
      const requestWithoutPreferences = {
        id: 'tr-no-prefs',
        executiveId: 'exec-new',
        departure: {
          location: 'Boston',
          date: new Date(Date.now() + 86400000),
          time: '08:00'
        },
        destination: {
          location: 'Chicago',
          date: new Date(Date.now() + 86400000),
          time: '11:00'
        },
        requestedBy: 'assistant-001',
        requestedAt: new Date()
      };

      mockMcpIntegration.retrieveMemory.mockResolvedValue(null); // No preferences stored

      const result = await agent.processTravelRequest(requestWithoutPreferences);

      expect(result.success).toBe(true);
      expect(result.usedDefaults).toBe(true);
      expect(result.recommendationsToSetup).toContain('Configure travel preferences');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high-volume travel processing efficiently', async () => {
      await agent.initialize();

      const startTime = Date.now();
      const requests = [];

      // Create 50 travel requests
      for (let i = 0; i < 50; i++) {
        requests.push({
          id: `tr-perf-${i}`,
          executiveId: `exec-${i % 10}`,
          departure: {
            location: 'New York',
            date: new Date(Date.now() + i * 86400000),
            time: '09:00'
          },
          destination: {
            location: 'San Francisco',
            date: new Date(Date.now() + i * 86400000),
            time: '12:00'
          },
          requestedBy: 'assistant-001',
          requestedAt: new Date()
        });
      }

      mockMcpIntegration.searchFlights.mockResolvedValue([{
        flightNumber: 'UA100',
        price: 600,
        availability: 'available'
      }]);

      await Promise.all(requests.map(req => agent.processTravelRequest(req)));

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});