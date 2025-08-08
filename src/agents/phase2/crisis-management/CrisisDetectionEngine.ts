/**
 * Crisis Detection Engine - Phase 2 LEASA Architecture
 * Real-time crisis detection and analysis engine with <30s detection target
 * 
 * Features:
 * - Real-time monitoring and pattern recognition
 * - Multi-source data fusion and analysis
 * - Predictive crisis probability scoring
 * - Cultural context-aware threat assessment
 * - Integration with Cultural Intelligence Agent
 * 
 * Performance Targets:
 * - Crisis detection: <30s from event occurrence
 * - Threat assessment: <5s analysis time
 * - Cultural adaptation: <2s cultural context loading
 * - Multi-source fusion: <10s data aggregation
 */

import {
  PEAAgentBase,
  ExecutiveContext,
  ClaudeFlowMCPIntegration,
  SecurityLevel
} from '../../../types/pea-agent-types';

export interface MonitoringSource {
  id: string;
  type: 'news' | 'social_media' | 'market_data' | 'internal_systems' | 'stakeholder_feedback' | 'regulatory';
  priority: 'low' | 'medium' | 'high' | 'critical';
  refreshRate: number; // seconds
  reliability: number; // 0-1 scale
  geographicScope: string[];
  dataTypes: string[];
  lastUpdate: string;
  status: 'active' | 'inactive' | 'error';
}

export interface CrisisSignal {
  id: string;
  sourceId: string;
  timestamp: string;
  confidence: number; // 0-1 scale
  severity: number; // 0-1 scale
  type: CrisisIndicatorType;
  description: string;
  rawData: any;
  geographicScope: string[];
  stakeholdersAffected: string[];
  culturalImplications: string[];
  correlationId?: string; // For grouping related signals
}

export enum CrisisIndicatorType {
  MARKET_VOLATILITY = 'market_volatility',
  MEDIA_NEGATIVE_SENTIMENT = 'media_negative_sentiment',
  STAKEHOLDER_ESCALATION = 'stakeholder_escalation',
  OPERATIONAL_FAILURE = 'operational_failure',
  REGULATORY_ACTION = 'regulatory_action',
  SECURITY_BREACH = 'security_breach',
  NATURAL_DISASTER = 'natural_disaster',
  GEOPOLITICAL_TENSION = 'geopolitical_tension',
  SUPPLY_CHAIN_DISRUPTION = 'supply_chain_disruption',
  REPUTATION_DAMAGE = 'reputation_damage'
}

export interface CrisisDetectionResult {
  crisisDetected: boolean;
  probability: number; // 0-1 scale
  severity: number; // 0-1 scale
  confidence: number; // 0-1 scale
  estimatedImpact: {
    financial: number;
    reputational: number;
    operational: number;
    strategic: number;
  };
  timeToImpact: number; // minutes until crisis affects executive/business
  criticalSignals: CrisisSignal[];
  recommendedActions: string[];
  culturalConsiderations: CulturalCrisisContext[];
  correlatedEvents: string[];
}

export interface CulturalCrisisContext {
  country: string;
  region: string;
  culturalFactors: string[];
  communicationProtocols: string[];
  stakeholderExpectations: string[];
  regulatoryImplications: string[];
  timeZoneConsiderations: string;
  appropriateResponseStyle: 'formal' | 'diplomatic' | 'direct' | 'collaborative';
}

export interface DetectionConfiguration {
  thresholds: {
    crisisDetection: number; // minimum probability to trigger crisis
    severityLevels: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    confidenceMinimum: number;
  };
  monitoring: {
    sources: MonitoringSource[];
    fusionRules: FusionRule[];
    correlationRules: CorrelationRule[];
  };
  cultural: {
    enableCulturalAnalysis: boolean;
    culturalWeighting: number; // 0-1 scale for cultural factor importance
    defaultCulturalProtocols: string[];
  };
  performance: {
    maxDetectionTimeMs: number; // 30 seconds = 30000ms
    maxAnalysisTimeMs: number; // 5 seconds = 5000ms
    parallelSourceProcessing: boolean;
    cacheEnabled: boolean;
  };
}

export interface FusionRule {
  id: string;
  sources: string[];
  algorithm: 'weighted_average' | 'bayesian_fusion' | 'dempster_shafer' | 'consensus';
  weights: Record<string, number>;
  threshold: number;
  culturalAdjustment: boolean;
}

export interface CorrelationRule {
  id: string;
  signalTypes: CrisisIndicatorType[];
  timeWindow: number; // seconds
  correlationThreshold: number;
  geographicScope: string[];
  impactMultiplier: number;
}

export class CrisisDetectionEngine {
  private mcpIntegration: ClaudeFlowMCPIntegration;
  private configuration: DetectionConfiguration;
  private activeSources: Map<string, MonitoringSource> = new Map();
  private signalCache: Map<string, CrisisSignal[]> = new Map();
  private correlationEngine: CorrelationEngine;
  private culturalAnalyzer: CulturalCrisisAnalyzer;
  private performanceMetrics: DetectionPerformanceMetrics;

  constructor(
    mcpIntegration: ClaudeFlowMCPIntegration,
    configuration: DetectionConfiguration
  ) {
    this.mcpIntegration = mcpIntegration;
    this.configuration = configuration;
    this.correlationEngine = new CorrelationEngine(configuration.monitoring.correlationRules);
    this.culturalAnalyzer = new CulturalCrisisAnalyzer(mcpIntegration);
    this.performanceMetrics = new DetectionPerformanceMetrics();
  }

  /**
   * Initialize crisis detection engine with monitoring sources
   */
  async initialize(): Promise<void> {
    const startTime = Date.now();
    console.log('🔍 Initializing Crisis Detection Engine...');

    try {
      // Initialize monitoring sources
      for (const source of this.configuration.monitoring.sources) {
        await this.initializeMonitoringSource(source);
      }

      // Initialize cultural analyzer
      await this.culturalAnalyzer.initialize();

      // Store initialization in memory
      await this.mcpIntegration.memoryUsage(
        'store',
        'crisis_detection/initialization',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          initializationTime: Date.now() - startTime,
          sourcesInitialized: this.activeSources.size,
          configuration: {
            maxDetectionTime: this.configuration.performance.maxDetectionTimeMs,
            sourcesCount: this.configuration.monitoring.sources.length,
            culturalAnalysisEnabled: this.configuration.cultural.enableCulturalAnalysis
          }
        }),
        'pea_crisis_management'
      );

      console.log(`✅ Crisis Detection Engine initialized (${Date.now() - startTime}ms)`);
      console.log(`   📡 ${this.activeSources.size} monitoring sources active`);
      console.log(`   🌍 Cultural analysis: ${this.configuration.cultural.enableCulturalAnalysis ? 'enabled' : 'disabled'}`);

    } catch (error) {
      console.error('❌ Crisis Detection Engine initialization failed:', error);
      throw error;
    }
  }

  /**
   * Perform real-time crisis detection with <30s target
   */
  async detectCrisis(executiveContext: ExecutiveContext): Promise<CrisisDetectionResult> {
    const detectionStartTime = Date.now();
    
    try {
      // 1. Collect signals from all active sources (parallel processing)
      const signalCollectionPromises = Array.from(this.activeSources.values()).map(source =>
        this.collectSignalsFromSource(source, executiveContext)
      );

      const allSignals = await Promise.all(signalCollectionPromises);
      const flatSignals = allSignals.flat().filter(signal => signal !== null) as CrisisSignal[];

      // 2. Apply correlation analysis to identify related events
      const correlatedSignals = await this.correlationEngine.analyzeCorrelations(flatSignals);

      // 3. Perform multi-source fusion to calculate crisis probability
      const fusionResults = await this.performDataFusion(correlatedSignals, executiveContext);

      // 4. Apply cultural context analysis if enabled
      let culturalContext: CulturalCrisisContext[] = [];
      if (this.configuration.cultural.enableCulturalAnalysis) {
        culturalContext = await this.culturalAnalyzer.analyzeCulturalImplications(
          correlatedSignals,
          executiveContext
        );
      }

      // 5. Generate final detection result
      const detectionResult: CrisisDetectionResult = {
        crisisDetected: fusionResults.probability >= this.configuration.thresholds.crisisDetection,
        probability: fusionResults.probability,
        severity: fusionResults.severity,
        confidence: fusionResults.confidence,
        estimatedImpact: fusionResults.estimatedImpact,
        timeToImpact: fusionResults.timeToImpact,
        criticalSignals: correlatedSignals.filter(s => s.confidence >= 0.7),
        recommendedActions: this.generateRecommendedActions(fusionResults, culturalContext),
        culturalConsiderations: culturalContext,
        correlatedEvents: correlatedSignals.map(s => s.correlationId).filter(id => id) as string[]
      };

      // 6. Update performance metrics
      const detectionTime = Date.now() - detectionStartTime;
      this.performanceMetrics.recordDetection(detectionTime, detectionResult);

      // 7. Store detection results in memory
      if (detectionResult.crisisDetected) {
        await this.mcpIntegration.memoryUsage(
          'store',
          `crisis_detection/result/${Date.now()}`,
          JSON.stringify({
            ...detectionResult,
            detectionTime,
            executiveContext: {
              executiveId: executiveContext.executiveId,
              sessionId: executiveContext.sessionId,
              timeZone: executiveContext.preferences.timeZone
            }
          }),
          'pea_crisis_management'
        );

        console.log(`🚨 CRISIS DETECTED: ${detectionResult.probability.toFixed(2)} probability (${detectionTime}ms)`);
        console.log(`   📊 Severity: ${detectionResult.severity.toFixed(2)}, Confidence: ${detectionResult.confidence.toFixed(2)}`);
        console.log(`   🌍 Cultural contexts: ${culturalContext.length}`);
      }

      return detectionResult;

    } catch (error) {
      console.error('❌ Crisis detection failed:', error);
      
      // Return safe default result
      return {
        crisisDetected: false,
        probability: 0,
        severity: 0,
        confidence: 0,
        estimatedImpact: { financial: 0, reputational: 0, operational: 0, strategic: 0 },
        timeToImpact: 0,
        criticalSignals: [],
        recommendedActions: ['Review monitoring systems', 'Check data sources'],
        culturalConsiderations: [],
        correlatedEvents: []
      };
    }
  }

  /**
   * Update monitoring source configuration
   */
  async updateMonitoringSource(sourceId: string, updates: Partial<MonitoringSource>): Promise<void> {
    const source = this.activeSources.get(sourceId);
    if (!source) {
      throw new Error(`Monitoring source not found: ${sourceId}`);
    }

    const updatedSource = { ...source, ...updates, lastUpdate: new Date().toISOString() };
    this.activeSources.set(sourceId, updatedSource);

    // Store update in memory
    await this.mcpIntegration.memoryUsage(
      'store',
      `crisis_detection/source_update/${sourceId}`,
      JSON.stringify({
        sourceId,
        updates,
        timestamp: new Date().toISOString()
      }),
      'pea_crisis_management'
    );
  }

  /**
   * Get current detection performance metrics
   */
  getPerformanceMetrics(): any {
    return this.performanceMetrics.getMetrics();
  }

  // Private helper methods

  private async initializeMonitoringSource(source: MonitoringSource): Promise<void> {
    try {
      // Validate source configuration
      if (!source.id || !source.type || source.refreshRate <= 0) {
        throw new Error(`Invalid monitoring source configuration: ${source.id}`);
      }

      // Test source connectivity (mock implementation)
      const testResult = await this.testSourceConnectivity(source);
      if (!testResult.success) {
        console.warn(`⚠️ Monitoring source ${source.id} connectivity issues: ${testResult.error}`);
        source.status = 'error';
      } else {
        source.status = 'active';
      }

      this.activeSources.set(source.id, source);
      console.log(`📡 Monitoring source initialized: ${source.id} [${source.type}]`);

    } catch (error) {
      console.error(`❌ Failed to initialize monitoring source ${source.id}:`, error);
      source.status = 'error';
      this.activeSources.set(source.id, source);
    }
  }

  private async testSourceConnectivity(source: MonitoringSource): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock connectivity test - in production would test actual data source
      if (source.type === 'internal_systems' && !source.dataTypes.length) {
        return { success: false, error: 'No data types configured' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async collectSignalsFromSource(
    source: MonitoringSource,
    executiveContext: ExecutiveContext
  ): Promise<CrisisSignal[]> {
    try {
      if (source.status !== 'active') {
        return [];
      }

      // Check cache first
      const cacheKey = `${source.id}_${Date.now()}`;
      const cachedSignals = this.signalCache.get(cacheKey);
      if (cachedSignals && this.configuration.performance.cacheEnabled) {
        return cachedSignals;
      }

      // Collect signals from source (mock implementation)
      const signals = await this.mockSignalCollection(source, executiveContext);

      // Cache results if enabled
      if (this.configuration.performance.cacheEnabled) {
        this.signalCache.set(cacheKey, signals);
        
        // Clean old cache entries
        setTimeout(() => this.signalCache.delete(cacheKey), 60000); // 1 minute
      }

      return signals;

    } catch (error) {
      console.error(`❌ Failed to collect signals from ${source.id}:`, error);
      return [];
    }
  }

  private async mockSignalCollection(
    source: MonitoringSource,
    executiveContext: ExecutiveContext
  ): Promise<CrisisSignal[]> {
    // Mock signal generation - in production would connect to real data sources
    const mockSignals: CrisisSignal[] = [];

    // Generate sample signals based on source type
    switch (source.type) {
      case 'market_data':
        mockSignals.push({
          id: `signal_${Date.now()}_market`,
          sourceId: source.id,
          timestamp: new Date().toISOString(),
          confidence: 0.8,
          severity: 0.6,
          type: CrisisIndicatorType.MARKET_VOLATILITY,
          description: 'Elevated market volatility detected',
          rawData: { volatilityIndex: 0.65, marketSector: 'technology' },
          geographicScope: ['US', 'EU'],
          stakeholdersAffected: ['investors', 'board'],
          culturalImplications: ['US_quarterly_reporting', 'EU_regulatory_focus']
        });
        break;

      case 'social_media':
        mockSignals.push({
          id: `signal_${Date.now()}_social`,
          sourceId: source.id,
          timestamp: new Date().toISOString(),
          confidence: 0.7,
          severity: 0.4,
          type: CrisisIndicatorType.MEDIA_NEGATIVE_SENTIMENT,
          description: 'Negative sentiment trending on social media',
          rawData: { sentimentScore: -0.3, mentions: 1500, reach: 50000 },
          geographicScope: ['US'],
          stakeholdersAffected: ['customers', 'media'],
          culturalImplications: ['US_social_media_culture']
        });
        break;

      default:
        // Return empty array for other source types in mock
        break;
    }

    return mockSignals;
  }

  private async performDataFusion(
    signals: CrisisSignal[],
    executiveContext: ExecutiveContext
  ): Promise<{
    probability: number;
    severity: number;
    confidence: number;
    estimatedImpact: any;
    timeToImpact: number;
  }> {
    if (signals.length === 0) {
      return {
        probability: 0,
        severity: 0,
        confidence: 0,
        estimatedImpact: { financial: 0, reputational: 0, operational: 0, strategic: 0 },
        timeToImpact: 0
      };
    }

    // Apply fusion rules
    let fusedProbability = 0;
    let fusedSeverity = 0;
    let fusedConfidence = 0;

    for (const rule of this.configuration.monitoring.fusionRules) {
      const applicableSignals = signals.filter(s => 
        rule.sources.includes(s.sourceId) || rule.sources.includes('*')
      );

      if (applicableSignals.length === 0) continue;

      switch (rule.algorithm) {
        case 'weighted_average':
          const weightedSum = applicableSignals.reduce((sum, signal) => {
            const weight = rule.weights[signal.sourceId] || rule.weights['*'] || 1;
            return sum + (signal.confidence * signal.severity * weight);
          }, 0);
          const totalWeight = applicableSignals.reduce((sum, signal) => {
            return sum + (rule.weights[signal.sourceId] || rule.weights['*'] || 1);
          }, 0);
          
          const ruleResult = totalWeight > 0 ? weightedSum / totalWeight : 0;
          if (ruleResult >= rule.threshold) {
            fusedProbability = Math.max(fusedProbability, ruleResult);
            fusedSeverity = Math.max(fusedSeverity, ruleResult);
            fusedConfidence = Math.max(fusedConfidence, 0.8); // Base confidence for triggered rule
          }
          break;

        case 'consensus':
          const consensusSignals = applicableSignals.filter(s => 
            s.confidence >= rule.threshold && s.severity >= rule.threshold
          );
          if (consensusSignals.length >= Math.ceil(applicableSignals.length * 0.6)) {
            const avgProbability = consensusSignals.reduce((sum, s) => sum + s.confidence, 0) / consensusSignals.length;
            const avgSeverity = consensusSignals.reduce((sum, s) => sum + s.severity, 0) / consensusSignals.length;
            
            fusedProbability = Math.max(fusedProbability, avgProbability);
            fusedSeverity = Math.max(fusedSeverity, avgSeverity);
            fusedConfidence = Math.max(fusedConfidence, 0.85); // Higher confidence for consensus
          }
          break;

        default:
          // Fallback to simple averaging
          const avgProbability = applicableSignals.reduce((sum, s) => sum + s.confidence, 0) / applicableSignals.length;
          const avgSeverity = applicableSignals.reduce((sum, s) => sum + s.severity, 0) / applicableSignals.length;
          
          fusedProbability = Math.max(fusedProbability, avgProbability);
          fusedSeverity = Math.max(fusedSeverity, avgSeverity);
          fusedConfidence = Math.max(fusedConfidence, 0.7);
          break;
      }
    }

    // Calculate estimated impact
    const estimatedImpact = {
      financial: Math.min(1.0, fusedSeverity * 0.8),
      reputational: Math.min(1.0, fusedSeverity * 0.9),
      operational: Math.min(1.0, fusedSeverity * 0.7),
      strategic: Math.min(1.0, fusedSeverity * 0.6)
    };

    // Estimate time to impact based on signal types and severity
    const timeToImpact = this.calculateTimeToImpact(signals, fusedSeverity);

    return {
      probability: Math.min(1.0, fusedProbability),
      severity: Math.min(1.0, fusedSeverity),
      confidence: Math.min(1.0, fusedConfidence),
      estimatedImpact,
      timeToImpact
    };
  }

  private calculateTimeToImpact(signals: CrisisSignal[], severity: number): number {
    // Base time calculation - higher severity means faster impact
    let baseTime = 60; // 60 minutes default

    if (severity >= 0.8) baseTime = 15; // 15 minutes for critical
    else if (severity >= 0.6) baseTime = 30; // 30 minutes for high
    else if (severity >= 0.4) baseTime = 45; // 45 minutes for medium

    // Adjust based on signal types
    const hasSecuritySignal = signals.some(s => s.type === CrisisIndicatorType.SECURITY_BREACH);
    const hasMarketSignal = signals.some(s => s.type === CrisisIndicatorType.MARKET_VOLATILITY);
    const hasOperationalSignal = signals.some(s => s.type === CrisisIndicatorType.OPERATIONAL_FAILURE);

    if (hasSecuritySignal) baseTime = Math.min(baseTime, 10); // Security issues are immediate
    if (hasOperationalSignal) baseTime = Math.min(baseTime, 20); // Operations issues are fast
    if (hasMarketSignal) baseTime = Math.min(baseTime, 30); // Market issues develop quickly

    return baseTime;
  }

  private generateRecommendedActions(
    fusionResults: any,
    culturalContext: CulturalCrisisContext[]
  ): string[] {
    const actions: string[] = [];

    // Base actions based on severity
    if (fusionResults.severity >= 0.8) {
      actions.push('Activate crisis response team immediately');
      actions.push('Notify executive leadership within 5 minutes');
      actions.push('Prepare emergency communications');
    } else if (fusionResults.severity >= 0.6) {
      actions.push('Alert crisis management team');
      actions.push('Prepare stakeholder communications');
      actions.push('Monitor situation closely');
    } else if (fusionResults.severity >= 0.4) {
      actions.push('Increase monitoring frequency');
      actions.push('Prepare contingency plans');
      actions.push('Brief key stakeholders');
    }

    // Add cultural considerations
    if (culturalContext.length > 0) {
      actions.push('Apply cultural communication protocols');
      actions.push('Coordinate with cultural intelligence agent');
      
      const diplomaticCultures = culturalContext.filter(c => 
        c.appropriateResponseStyle === 'diplomatic'
      );
      if (diplomaticCultures.length > 0) {
        actions.push('Use diplomatic communication approach for affected regions');
      }
    }

    // Add impact-specific actions
    if (fusionResults.estimatedImpact.financial >= 0.6) {
      actions.push('Engage financial team for impact assessment');
    }
    if (fusionResults.estimatedImpact.reputational >= 0.6) {
      actions.push('Prepare public relations response');
    }
    if (fusionResults.estimatedImpact.operational >= 0.6) {
      actions.push('Activate business continuity protocols');
    }

    return actions;
  }
}

// Supporting classes

class CorrelationEngine {
  private rules: CorrelationRule[];

  constructor(rules: CorrelationRule[]) {
    this.rules = rules;
  }

  async analyzeCorrelations(signals: CrisisSignal[]): Promise<CrisisSignal[]> {
    const correlatedSignals = [...signals];
    const now = Date.now();

    for (const rule of this.rules) {
      const applicableSignals = signals.filter(signal => {
        const signalTime = new Date(signal.timestamp).getTime();
        const withinTimeWindow = (now - signalTime) <= (rule.timeWindow * 1000);
        const matchesType = rule.signalTypes.includes(signal.type);
        const matchesScope = rule.geographicScope.length === 0 || 
          signal.geographicScope.some(scope => rule.geographicScope.includes(scope));
        
        return withinTimeWindow && matchesType && matchesScope;
      });

      if (applicableSignals.length >= 2) {
        const correlationId = `correlation_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        // Apply correlation to signals
        applicableSignals.forEach(signal => {
          signal.correlationId = correlationId;
          // Boost severity for correlated events
          signal.severity = Math.min(1.0, signal.severity * rule.impactMultiplier);
        });
      }
    }

    return correlatedSignals;
  }
}

class CulturalCrisisAnalyzer {
  private mcpIntegration: ClaudeFlowMCPIntegration;
  private culturalProtocols: Map<string, CulturalCrisisContext> = new Map();

  constructor(mcpIntegration: ClaudeFlowMCPIntegration) {
    this.mcpIntegration = mcpIntegration;
  }

  async initialize(): Promise<void> {
    // Load cultural protocols for crisis scenarios
    const protocols: CulturalCrisisContext[] = [
      {
        country: 'US',
        region: 'North America',
        culturalFactors: ['transparency_expectation', 'shareholder_primacy', 'litigation_risk'],
        communicationProtocols: ['direct_communication', 'legal_review_required'],
        stakeholderExpectations: ['immediate_disclosure', 'executive_accountability'],
        regulatoryImplications: ['SEC_disclosure', 'SOX_compliance'],
        timeZoneConsiderations: 'US_Eastern',
        appropriateResponseStyle: 'direct'
      },
      {
        country: 'JP',
        region: 'Asia Pacific',
        culturalFactors: ['face_saving', 'hierarchy_respect', 'consensus_building'],
        communicationProtocols: ['formal_structure', 'bow_equivalent', 'group_harmony'],
        stakeholderExpectations: ['respectful_approach', 'systematic_resolution'],
        regulatoryImplications: ['JFSA_compliance', 'cultural_sensitivity'],
        timeZoneConsiderations: 'Asia_Tokyo',
        appropriateResponseStyle: 'formal'
      },
      {
        country: 'DE',
        region: 'Europe',
        culturalFactors: ['systematic_approach', 'precision', 'stakeholder_model'],
        communicationProtocols: ['structured_communication', 'technical_detail'],
        stakeholderExpectations: ['thorough_analysis', 'systematic_resolution'],
        regulatoryImplications: ['GDPR_considerations', 'EU_disclosure_rules'],
        timeZoneConsiderations: 'Europe_Berlin',
        appropriateResponseStyle: 'collaborative'
      }
    ];

    protocols.forEach(protocol => {
      this.culturalProtocols.set(protocol.country, protocol);
    });
  }

  async analyzeCulturalImplications(
    signals: CrisisSignal[],
    executiveContext: ExecutiveContext
  ): Promise<CulturalCrisisContext[]> {
    const culturalImplications: CulturalCrisisContext[] = [];

    // Extract unique geographic scopes from signals
    const affectedRegions = new Set<string>();
    signals.forEach(signal => {
      signal.geographicScope.forEach(scope => affectedRegions.add(scope));
    });

    // Add executive's cultural context
    if (executiveContext.culturalContext) {
      affectedRegions.add(executiveContext.culturalContext.country);
    }

    // Get cultural protocols for affected regions
    for (const region of affectedRegions) {
      const protocol = this.culturalProtocols.get(region);
      if (protocol) {
        culturalImplications.push(protocol);
      }
    }

    return culturalImplications;
  }
}

class DetectionPerformanceMetrics {
  private detections: Array<{
    timestamp: number;
    detectionTime: number;
    crisisDetected: boolean;
    probability: number;
    severity: number;
  }> = [];

  recordDetection(detectionTime: number, result: CrisisDetectionResult): void {
    this.detections.push({
      timestamp: Date.now(),
      detectionTime,
      crisisDetected: result.crisisDetected,
      probability: result.probability,
      severity: result.severity
    });

    // Keep only last 1000 detections
    if (this.detections.length > 1000) {
      this.detections = this.detections.slice(-1000);
    }
  }

  getMetrics(): any {
    if (this.detections.length === 0) {
      return {
        averageDetectionTime: 0,
        maxDetectionTime: 0,
        minDetectionTime: 0,
        crisesDetected: 0,
        falsePositiveRate: 0,
        averageSeverity: 0,
        detectionsLast24h: 0
      };
    }

    const detectionTimes = this.detections.map(d => d.detectionTime);
    const crisesDetected = this.detections.filter(d => d.crisisDetected).length;
    const last24h = Date.now() - (24 * 60 * 60 * 1000);
    const recent = this.detections.filter(d => d.timestamp >= last24h);

    return {
      averageDetectionTime: detectionTimes.reduce((sum, time) => sum + time, 0) / detectionTimes.length,
      maxDetectionTime: Math.max(...detectionTimes),
      minDetectionTime: Math.min(...detectionTimes),
      crisesDetected,
      falsePositiveRate: crisesDetected > 0 ? (this.detections.length - crisesDetected) / this.detections.length : 0,
      averageSeverity: this.detections.reduce((sum, d) => sum + d.severity, 0) / this.detections.length,
      detectionsLast24h: recent.length
    };
  }
}