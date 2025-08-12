/**
 * Test Factory Utilities for PEA Agents
 * Provides mock data and factory methods for comprehensive testing
 */

import {
  ExecutiveContext,
  ExecutivePreferences,
  CulturalContext,
  StakeholderContext,
  CommunicationEvent,
  PEATask,
  DocumentItem as _DocumentItem,
  SecurityThreat,
  PerformanceMetrics,
  CoordinationProtocol as _CoordinationProtocol,
  ClaudeFlowMCPIntegration
} from '../../src/types/pea-agent-types';
import {
  SecurityLevel,
  TaskType,
  TaskStatus,
  PEAAgentType,
  AgentStatus
} from '../../src/types/enums';
import {
  DocumentAnalysisRequest,
  DocumentInput,
  MultiModalFinding
} from '../../src/agents/document-intelligence/DocumentIntelligenceAgent';
import {
  FinancialContext,
  PortfolioProfile,
  TaxProfile,
  Holding,
  PerformanceTargets,
  MarketData
} from '../../src/agents/financial-intelligence/FinancialIntelligenceAgent';
import {
  TravelRequest,
  TravelDestination,
  TravelLocation,
  TravelTimeline,
  CriticalMeeting
} from '../../src/agents/travel-logistics/TravelLogisticsAgent';
import {
  CrisisEvent,
  CrisisType,
  CrisisSeverity,
  CrisisResponse
} from '../../src/agents/phase2/crisis-management/CrisisManagementAgent';

/**
 * Mock MCP Integration for testing
 */
export const createMockMCPIntegration = (overrides: Partial<ClaudeFlowMCPIntegration> = {}): jest.Mocked<ClaudeFlowMCPIntegration> => {
  return {
    swarmInit: jest.fn().mockResolvedValue({
      swarmId: 'test-swarm-123',
      topology: 'hierarchical',
      agentCount: 5,
      success: true
    }),
    agentSpawn: jest.fn().mockResolvedValue({
      agentId: 'test-agent-456',
      type: 'researcher',
      capabilities: ['research', 'analysis'],
      status: 'active'
    }),
    taskOrchestrate: jest.fn().mockResolvedValue({
      taskId: 'test-task-789',
      status: 'orchestrated',
      assignedAgents: ['agent-1', 'agent-2']
    }),
    memoryUsage: jest.fn().mockResolvedValue({
      stored: true,
      key: 'test-key',
      namespace: 'test-namespace'
    }),
    neuralTrain: jest.fn().mockResolvedValue({
      trainingId: 'training-123',
      epochs: 50,
      accuracy: 0.92
    }),
    neuralPatterns: jest.fn().mockResolvedValue({
      patterns: ['pattern1', 'pattern2'],
      confidence: 0.85,
      recommendations: ['improve coordination', 'optimize response time']
    }),
    ...overrides
  };
};

/**
 * Executive Context Factory
 */
export const createMockExecutiveContext = (overrides: Partial<ExecutiveContext> = {}): ExecutiveContext => {
  return {
    executiveId: 'exec-001',
    sessionId: 'session-123',
    preferences: createMockExecutivePreferences(),
    currentPriority: 'high',
    culturalContext: createMockCulturalContext(),
    stakeholders: [createMockStakeholder()],
    deadline: new Date(Date.now() + 86400000), // 1 day from now
    timeZone: 'UTC',
    confidentialityLevel: SecurityLevel.STRATEGIC_CONFIDENTIAL,
    ...overrides
  };
};

export const createMockExecutivePreferences = (overrides: Partial<ExecutivePreferences> = {}): ExecutivePreferences => {
  return {
    communicationStyle: 'diplomatic',
    decisionThreshold: 0.8,
    privacyLevel: SecurityLevel.EXECUTIVE_PERSONAL,
    timeZone: 'UTC',
    languages: ['en', 'es'],
    culturalAdaptation: true,
    ...overrides
  };
};

export const createMockCulturalContext = (overrides: Partial<CulturalContext> = {}): CulturalContext => {
  return {
    country: 'US',
    region: 'North America',
    businessProtocols: ['formal_meetings', 'direct_communication'],
    communicationPreferences: ['email', 'video_call'],
    appropriatenessScore: 0.9,
    ...overrides
  };
};

export const createMockStakeholder = (overrides: Partial<StakeholderContext> = {}): StakeholderContext => {
  return {
    id: 'stakeholder-001',
    name: 'John Smith',
    relationship: 'board',
    priority: 'high',
    communicationHistory: [createMockCommunicationEvent()],
    culturalProfile: createMockCulturalContext(),
    ...overrides
  };
};

export const createMockCommunicationEvent = (overrides: Partial<CommunicationEvent> = {}): CommunicationEvent => {
  return {
    timestamp: new Date().toISOString(),
    type: 'email',
    sentiment: 'positive',
    effectiveness: 0.8,
    outcomes: ['agreement_reached', 'next_meeting_scheduled'],
    ...overrides
  };
};

/**
 * Performance Metrics Factory
 */
export const createMockPerformanceMetrics = (overrides: Partial<PerformanceMetrics> = {}): PerformanceMetrics => {
  return {
    responseTimeMs: 150,
    accuracyScore: 0.92,
    throughputPerHour: 25,
    consensusSuccessRate: 0.95,
    errorRate: 0.02,
    lastUpdated: new Date().toISOString(),
    ...overrides
  };
};

/**
 * Task Factory
 */
export const createMockPEATask = (overrides: Partial<PEATask> = {}): PEATask => {
  return {
    id: 'task-001',
    description: 'Analyze quarterly financial reports',
    type: TaskType.ANALYSIS,
    priority: 'high',
    assignedAgents: ['doc-intel-001'],
    dependencies: [],
    status: TaskStatus.IN_PROGRESS,
    context: createMockExecutiveContext(),
    performanceTargets: {
      maxResponseTimeMs: 5000,
      minAccuracy: 0.9,
      minConsensusScore: 0.8,
      maxErrorRate: 0.05
    },
    createdAt: new Date().toISOString(),
    ...overrides
  };
};

/**
 * Document Intelligence Factories
 */
export const createMockDocumentAnalysisRequest = (overrides: Partial<DocumentAnalysisRequest> = {}): DocumentAnalysisRequest => {
  return {
    id: 'analysis-001',
    documents: [createMockDocumentInput()],
    analysisType: 'detailed',
    priority: 'high',
    executiveContext: {
      focus: ['financial_performance', 'risk_assessment'],
      decisionPoints: ['budget_approval', 'investment_strategy'],
      stakeholders: ['CFO', 'Board_Members']
    },
    outputFormat: 'executive_brief',
    ...overrides
  };
};

export const createMockDocumentInput = (overrides: Partial<DocumentInput> = {}): DocumentInput => {
  return {
    id: 'doc-001',
    name: 'Q4_Financial_Report.pdf',
    type: 'pdf',
    size: 2048576, // 2MB
    source: 'finance_department',
    confidentialityLevel: 'confidential',
    metadata: {
      author: 'Finance Team',
      createdDate: '2025-01-01',
      lastModified: '2025-01-10'
    },
    ...overrides
  };
};

export const createMockMultiModalFinding = (overrides: Partial<MultiModalFinding> = {}): MultiModalFinding => {
  return {
    type: 'text',
    content: 'Revenue increased by 15% compared to previous quarter',
    significance: 'high',
    context: 'financial_analysis',
    extractedData: {
      revenue_growth: 0.15,
      period: 'Q4_2024',
      confidence: 0.9
    },
    ...overrides
  };
};

/**
 * Financial Intelligence Factories
 */
export const createMockFinancialContext = (overrides: Partial<FinancialContext> = {}): FinancialContext => {
  return {
    executiveId: 'exec-001',
    portfolioProfile: createMockPortfolioProfile(),
    taxProfile: createMockTaxProfile(),
    riskTolerance: 'moderate',
    investmentHorizon: 10,
    liquidityNeeds: 500000,
    regulatoryJurisdictions: ['US', 'EU'],
    currencies: ['USD', 'EUR'],
    complianceRequirements: ['SOX', 'GDPR'],
    ...overrides
  };
};

export const createMockPortfolioProfile = (overrides: Partial<PortfolioProfile> = {}): PortfolioProfile => {
  return {
    totalValue: 5000000,
    assetAllocation: {
      'stocks': 60,
      'bonds': 30,
      'real_estate': 10
    },
    holdings: [createMockHolding()],
    performanceTargets: createMockPerformanceTargets(),
    rebalancingRules: [],
    ...overrides
  };
};

export const createMockHolding = (overrides: Partial<Holding> = {}): Holding => {
  return {
    symbol: 'AAPL',
    quantity: 1000,
    currentPrice: 150.50,
    costBasis: 120.00,
    sector: 'Technology',
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
    ...overrides
  };
};

export const createMockPerformanceTargets = (overrides: Partial<PerformanceTargets> = {}): PerformanceTargets => {
  return {
    annualReturn: 0.08,
    maxDrawdown: 0.15,
    sharpeRatio: 1.2,
    volatility: 0.12,
    ...overrides
  };
};

export const createMockTaxProfile = (overrides: Partial<TaxProfile> = {}): TaxProfile => {
  return {
    jurisdiction: 'US',
    taxBracket: 0.37,
    taxOptimizationGoals: ['minimize_capital_gains', 'maximize_deductions'],
    harvestingRules: [],
    retirementAccounts: [],
    ...overrides
  };
};

export const createMockMarketData = (overrides: Partial<MarketData> = {}): MarketData => {
  return {
    symbol: 'AAPL',
    price: 150.50,
    change: 2.50,
    changePercent: 1.69,
    volume: 75000000,
    marketCap: 2500000000000,
    timestamp: new Date().toISOString(),
    ...overrides
  };
};

/**
 * Travel Logistics Factories
 */
export const createMockTravelRequest = (overrides: Partial<TravelRequest> = {}): TravelRequest => {
  return {
    id: 'travel-001',
    executiveId: 'exec-001',
    priority: 'high',
    type: 'business',
    destination: createMockTravelDestination(),
    departure: createMockTravelLocation(),
    timeline: createMockTravelTimeline(),
    requirements: {
      documentation: {
        passport: true,
        visa: [],
        healthCertificates: []
      },
      health: {
        vaccinations: [],
        medications: [],
        medicalClearance: false,
        healthInsurance: true
      },
      connectivity: {
        internetSpeed: 'enterprise',
        secureConnection: true,
        conferenceCapability: true,
        timezoneSynchronization: true
      },
      accommodation: {
        type: 'executive_suite',
        securityLevel: 'enhanced',
        culturalConsiderations: [],
        businessFacilities: ['conference_room', 'high_speed_internet']
      },
      dietary: [],
      accessibility: []
    },
    preferences: {
      aviation: {
        type: 'private',
        class: 'first',
        aircraft: ['G650'],
        operators: ['NetJets'],
        airports: ['JFK'],
        scheduleFlexibility: 'medium'
      },
      transport: {
        ground: {
          type: 'executive',
          vehicle: ['luxury_sedan'],
          securityFeatures: ['armored'],
          culturalAppropriate: true
        },
        security: {
          securityDetail: true,
          armoredVehicle: true,
          routePlanning: 'secure',
          communicationSecurity: true
        }
      },
      accommodation: {
        brands: ['Four Seasons', 'Ritz Carlton'],
        roomType: ['Presidential Suite'],
        amenities: ['spa', 'fitness'],
        culturalSensitivity: true
      },
      cultural: {
        languageSupport: ['en', 'local'],
        culturalBriefing: true,
        diplomaticProtocol: true,
        localCustomsGuidance: true,
        businessEtiquetteTraining: true
      }
    },
    securityLevel: 'enhanced',
    confidentialityLevel: 'confidential',
    ...overrides
  };
};

export const createMockTravelDestination = (overrides: Partial<TravelDestination> = {}): TravelDestination => {
  return {
    country: 'Japan',
    city: 'Tokyo',
    airport: 'NRT',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    timezone: 'Asia/Tokyo',
    culturalRegion: 'East Asia',
    diplomaticConsiderations: ['business_etiquette', 'gift_giving'],
    securityRisk: 'low',
    ...overrides
  };
};

export const createMockTravelLocation = (overrides: Partial<TravelLocation> = {}): TravelLocation => {
  return {
    country: 'US',
    city: 'New York',
    airport: 'JFK',
    address: '123 Business Ave, New York, NY',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    ...overrides
  };
};

export const createMockTravelTimeline = (overrides: Partial<TravelTimeline> = {}): TravelTimeline => {
  return {
    departureDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    returnDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    flexibility: 'low',
    criticalMeetings: [createMockCriticalMeeting()],
    bufferTime: 60,
    ...overrides
  };
};

export const createMockCriticalMeeting = (overrides: Partial<CriticalMeeting> = {}): CriticalMeeting => {
  return {
    id: 'meeting-001',
    datetime: new Date(Date.now() + 86400000).toISOString(),
    duration: 120,
    importance: 'critical',
    culturalSignificance: 'high_context_culture',
    attendees: [{
      name: 'Tanaka-san',
      role: 'CEO',
      culture: 'Japanese',
      seniority: 'executive',
      relationship: 'new'
    }],
    ...overrides
  };
};

/**
 * Crisis Management Factories
 */
export const createMockCrisisEvent = (overrides: Partial<CrisisEvent> = {}): CrisisEvent => {
  return {
    id: 'crisis-001',
    type: CrisisType.OPERATIONAL_CRISIS,
    severity: CrisisSeverity.HIGH,
    description: 'Major system outage affecting customer operations',
    detectedAt: new Date().toISOString(),
    affectedStakeholders: ['customers', 'employees', 'partners'],
    riskLevel: 'high',
    estimatedImpact: {
      financial: 0.7,
      reputational: 0.8,
      operational: 0.9,
      strategic: 0.4
    },
    geographicScope: ['US', 'EU'],
    culturalConsiderations: ['transparency_expectations', 'regulatory_reporting'],
    ...overrides
  };
};

export const createMockCrisisResponse = (overrides: Partial<CrisisResponse> = {}): CrisisResponse => {
  return {
    id: 'response-001',
    crisisId: 'crisis-001',
    responseStrategy: {
      type: 'containment',
      priority: 'immediate',
      approachType: 'collaborative',
      communicationTone: 'transparent'
    },
    actions: [],
    stakeholderCommunications: [],
    timelineEstimate: 120,
    successProbability: 0.85,
    resourceRequirements: ['crisis-response-team', 'technical-team'],
    culturalAdaptations: [],
    ...overrides
  };
};

/**
 * Security Threat Factory
 */
export const createMockSecurityThreat = (overrides: Partial<SecurityThreat> = {}): SecurityThreat => {
  return {
    id: 'threat-001',
    type: 'unauthorized_access',
    severity: 'medium',
    confidence: 0.85,
    description: 'Unusual access pattern detected in executive calendar system',
    affectedSystems: ['calendar_system', 'email_integration'],
    recommendedActions: ['review_access_logs', 'update_authentication'],
    detectedAt: new Date().toISOString(),
    responseImplemented: false,
    ...overrides
  };
};

/**
 * Test Data Arrays for Bulk Operations
 */
export const createMockDocumentInputBatch = (count: number = 5): DocumentInput[] => {
  return Array.from({ length: count }, (_, i) => 
    createMockDocumentInput({
      id: `doc-${String(i + 1).padStart(3, '0')}`,
      name: `Document_${i + 1}.pdf`,
      type: i % 2 === 0 ? 'pdf' : 'docx'
    })
  );
};

export const createMockHoldingsBatch = (count: number = 10): Holding[] => {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'JNJ', 'V'];
  return Array.from({ length: count }, (_, i) => 
    createMockHolding({
      symbol: symbols[i % symbols.length],
      quantity: Math.floor(Math.random() * 1000) + 100,
      currentPrice: Math.random() * 200 + 50,
      sector: i % 2 === 0 ? 'Technology' : 'Finance'
    })
  );
};

/**
 * Test Assertion Helpers
 */
export const assertAgentInitialization = (agent: any, expectedType: PEAAgentType): void => {
  expect(agent.id).toBeDefined();
  expect(agent.type).toBe(expectedType);
  expect(agent.status).toBe(AgentStatus.ACTIVE);
  expect(agent.capabilities).toBeInstanceOf(Array);
  expect(agent.capabilities.length).toBeGreaterThan(0);
  expect(agent.performanceMetrics).toBeDefined();
  expect(agent.performanceMetrics.responseTimeMs).toBeGreaterThanOrEqual(0);
  expect(agent.performanceMetrics.accuracyScore).toBeGreaterThanOrEqual(0);
  expect(agent.performanceMetrics.consensusSuccessRate).toBeGreaterThanOrEqual(0);
};

export const assertPerformanceMetrics = (metrics: PerformanceMetrics, thresholds: Partial<PerformanceMetrics> = {}): void => {
  if (thresholds.responseTimeMs !== undefined) {
    expect(metrics.responseTimeMs).toBeLessThanOrEqual(thresholds.responseTimeMs);
  }
  if (thresholds.accuracyScore !== undefined) {
    expect(metrics.accuracyScore).toBeGreaterThanOrEqual(thresholds.accuracyScore);
  }
  if (thresholds.errorRate !== undefined) {
    expect(metrics.errorRate).toBeLessThanOrEqual(thresholds.errorRate);
  }
  expect(metrics.consensusSuccessRate).toBeGreaterThanOrEqual(0.7);
  expect(metrics.throughputPerHour).toBeGreaterThanOrEqual(0);
};

/**
 * Mock Timer Utilities for Performance Testing
 */
export class MockPerformanceTimer {
  private startTime: number = 0;
  private measurements: number[] = [];

  start(): void {
    this.startTime = performance.now();
  }

  measure(): number {
    const duration = performance.now() - this.startTime;
    this.measurements.push(duration);
    return duration;
  }

  getAverageTime(): number {
    return this.measurements.reduce((sum, time) => sum + time, 0) / this.measurements.length;
  }

  reset(): void {
    this.measurements = [];
  }
}

/**
 * Test Environment Setup Utilities
 */
export const setupTestEnvironment = () => {
  // Mock performance.now for consistent testing
  Object.defineProperty(global, 'performance', {
    value: {
      now: jest.fn(() => Date.now())
    }
  });

  // Setup common environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.PEA_LOG_LEVEL = 'error'; // Reduce logging noise in tests
};

export const cleanupTestEnvironment = () => {
  // Cleanup any test artifacts
  jest.clearAllMocks();
  jest.restoreAllMocks();
};