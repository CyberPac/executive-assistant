/**
 * Crisis Management Configuration - Phase 2 LEASA Architecture
 * Comprehensive configuration system for Enhanced Crisis Management Agent
 * 
 * Features:
 * - Performance-optimized configuration for 75% faster response times
 * - Cultural intelligence integration settings
 * - Adaptive learning and optimization parameters
 * - Real-time monitoring and alerting configuration
 * - Integration with Claude Flow MCP system
 */

// Temporary fix for missing exports
export enum CrisisIndicatorType {
  MARKET_VOLATILITY = 'market_volatility',
  MEDIA_NEGATIVE_SENTIMENT = 'media_negative_sentiment',
  OPERATIONAL_FAILURE = 'operational_failure',
  SECURITY_BREACH = 'security_breach',
  STAKEHOLDER_ESCALATION = 'stakeholder_escalation',
  REPUTATION_DAMAGE = 'reputation_damage'
}

// Temporary interface definition
export interface CrisisManagementConfiguration {
  detection: any;
  response: any;
  coordination: any;
  performance: any;
  integration: any;
}

/**
 * Production-ready configuration for Enhanced Crisis Management Agent
 * Optimized for Phase 2 PEA requirements with 75% performance improvement
 */
export const PRODUCTION_CRISIS_MANAGEMENT_CONFIG: CrisisManagementConfiguration = {
  detection: {
    thresholds: {
      crisisDetection: 0.7, // 70% probability threshold for crisis detection
      severityLevels: {
        low: 0.2,
        medium: 0.4,
        high: 0.6,
        critical: 0.8
      },
      confidenceMinimum: 0.6 // Minimum confidence for crisis signals
    },
    monitoring: {
      sources: [
        {
          id: 'market-data-primary',
          type: 'market_data',
          priority: 'high',
          refreshRate: 30, // 30 seconds
          reliability: 0.95,
          geographicScope: ['US', 'EU', 'APAC'],
          dataTypes: ['stock_price', 'volatility', 'volume', 'sector_performance'],
          lastUpdate: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 'social-media-monitor',
          type: 'social_media',
          priority: 'medium',
          refreshRate: 60, // 1 minute
          reliability: 0.8,
          geographicScope: ['US', 'EU', 'APAC'],
          dataTypes: ['sentiment', 'mentions', 'trending_topics', 'executive_mentions'],
          lastUpdate: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 'news-aggregator',
          type: 'news',
          priority: 'high',
          refreshRate: 120, // 2 minutes
          reliability: 0.9,
          geographicScope: ['US', 'EU', 'APAC', 'LATAM'],
          dataTypes: ['breaking_news', 'business_news', 'executive_mentions', 'industry_analysis'],
          lastUpdate: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 'internal-systems-monitor',
          type: 'internal_systems',
          priority: 'critical',
          refreshRate: 15, // 15 seconds
          reliability: 0.98,
          geographicScope: ['global'],
          dataTypes: ['system_alerts', 'performance_metrics', 'security_events', 'operational_status'],
          lastUpdate: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 'regulatory-monitor',
          type: 'regulatory',
          priority: 'high',
          refreshRate: 300, // 5 minutes
          reliability: 0.92,
          geographicScope: ['US', 'EU', 'UK', 'JP', 'SG'],
          dataTypes: ['regulatory_filings', 'compliance_alerts', 'policy_changes', 'enforcement_actions'],
          lastUpdate: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 'stakeholder-feedback',
          type: 'stakeholder_feedback',
          priority: 'medium',
          refreshRate: 180, // 3 minutes
          reliability: 0.85,
          geographicScope: ['global'],
          dataTypes: ['customer_complaints', 'investor_concerns', 'employee_feedback', 'partner_issues'],
          lastUpdate: new Date().toISOString(),
          status: 'active'
        }
      ],
      fusionRules: [
        {
          id: 'critical-consensus-rule',
          sources: ['internal-systems-monitor', 'market-data-primary', 'news-aggregator'],
          algorithm: 'consensus',
          weights: {
            'internal-systems-monitor': 0.4,
            'market-data-primary': 0.35,
            'news-aggregator': 0.25
          },
          threshold: 0.8,
          culturalAdjustment: true
        },
        {
          id: 'social-sentiment-fusion',
          sources: ['social-media-monitor', 'stakeholder-feedback'],
          algorithm: 'weighted_average',
          weights: {
            'social-media-monitor': 0.6,
            'stakeholder-feedback': 0.4
          },
          threshold: 0.6,
          culturalAdjustment: true
        },
        {
          id: 'regulatory-compliance-rule',
          sources: ['regulatory-monitor', 'internal-systems-monitor'],
          algorithm: 'bayesian_fusion',
          weights: {
            'regulatory-monitor': 0.7,
            'internal-systems-monitor': 0.3
          },
          threshold: 0.75,
          culturalAdjustment: false
        }
      ],
      correlationRules: [
        {
          id: 'market-news-correlation',
          signalTypes: [CrisisIndicatorType.MARKET_VOLATILITY, CrisisIndicatorType.MEDIA_NEGATIVE_SENTIMENT],
          timeWindow: 300, // 5 minutes
          correlationThreshold: 0.7,
          geographicScope: ['US', 'EU'],
          impactMultiplier: 1.3
        },
        {
          id: 'operational-security-correlation',
          signalTypes: [CrisisIndicatorType.OPERATIONAL_FAILURE, CrisisIndicatorType.SECURITY_BREACH],
          timeWindow: 180, // 3 minutes
          correlationThreshold: 0.8,
          geographicScope: ['global'],
          impactMultiplier: 1.5
        },
        {
          id: 'stakeholder-reputation-correlation',
          signalTypes: [CrisisIndicatorType.STAKEHOLDER_ESCALATION, CrisisIndicatorType.REPUTATION_DAMAGE],
          timeWindow: 600, // 10 minutes
          correlationThreshold: 0.6,
          geographicScope: ['global'],
          impactMultiplier: 1.2
        }
      ]
    },
    cultural: {
      enableCulturalAnalysis: true,
      culturalWeighting: 0.3, // 30% weight for cultural factors
      defaultCulturalProtocols: ['transparency', 'stakeholder_respect', 'regulatory_compliance']
    },
    performance: {
      maxDetectionTimeMs: 30000, // 30 seconds
      maxAnalysisTimeMs: 5000, // 5 seconds
      parallelSourceProcessing: true,
      cacheEnabled: true
    }
  },

  response: {
    responseTimeTargets: {
      detection: 30000, // 30 seconds
      planGeneration: 120000, // 2 minutes
      stakeholderActivation: 300000, // 5 minutes
      overallResponse: 600000 // 10 minutes total (75% improvement from 40min baseline)
    },
    decisionThresholds: {
      automaticResponse: 0.8, // Auto-respond to crises with >80% probability
      executiveEscalation: 0.7, // Escalate to executive at >70% severity
      boardNotification: 0.8, // Notify board at >80% severity
      mediaResponse: 0.6 // Prepare media response at >60% severity
    },
    adaptiveFramework: {
      enabled: true,
      learningRate: 0.1,
      optimizationInterval: 60, // 1 hour
      performanceTargets: {
        responseTimeImprovement: 0.75, // 75% improvement target
        stakeholderSatisfaction: 0.9, // 90% satisfaction target
        culturalAppropriateness: 0.95, // 95% cultural appropriateness
        decisionAccuracy: 0.92 // 92% decision accuracy
      }
    }
  },

  coordination: {
    stakeholderLimits: {
      maxSimultaneous: 50, // Maximum stakeholders to coordinate simultaneously
      priorityBatching: true,
      culturalGrouping: true
    },
    communicationRules: {
      maxRetries: 3,
      escalationTimeout: 15, // 15 minutes
      approvalTimeout: 10, // 10 minutes
      batchSize: 10 // Process 10 stakeholders per batch
    },
    consensusRules: {
      byzantineTolerance: 2, // Tolerate up to 2 faulty agents
      consensusThreshold: 0.75, // 75% agreement required
      timeoutMinutes: 5,
      fallbackDecision: 'executive'
    }
  },

  performance: {
    monitoring: {
      realTimeMetrics: true,
      performanceTargets: {
        detectionTime: 30000,
        planningTime: 120000,
        coordinationTime: 300000,
        overallResponseTime: 600000,
        stakeholderResponseRate: 0.8,
        culturalAppropriatenessScore: 0.95
      },
      alertThresholds: {
        detectionTimeExceeded: 45000, // Alert if detection takes >45s
        planningTimeExceeded: 180000, // Alert if planning takes >3min
        coordinationFailureRate: 0.2, // Alert if >20% coordination failures
        stakeholderResponseRate: 0.6 // Alert if <60% response rate
      },
      reportingInterval: 15 // Generate reports every 15 minutes
    },
    optimization: {
      enabled: true,
      neuralLearning: true,
      adaptiveThresholds: true,
      performanceTuning: true
    },
    benchmarking: {
      enabled: true,
      baselineMetrics: {
        totalResponseTime: 2400000, // 40 minutes baseline
        detectionTime: 180000, // 3 minutes baseline
        planningTime: 600000, // 10 minutes baseline
        coordinationTime: 1200000, // 20 minutes baseline
        stakeholderResponseRate: 0.6, // 60% baseline
        culturalAppropriatenessScore: 0.7 // 70% baseline
      },
      improvementTargets: {
        totalResponseTime: 600000, // 10 minutes target (75% improvement)
        detectionTime: 30000, // 30 seconds target
        planningTime: 120000, // 2 minutes target
        coordinationTime: 300000, // 5 minutes target
        stakeholderResponseRate: 0.8, // 80% target
        culturalAppropriatenessScore: 0.95 // 95% target
      }
    }
  },

  integration: {
    culturalIntelligence: {
      enabled: true,
      agentId: 'cultural-intelligence-001',
      adaptationLevel: 'expert',
      cacheTimeout: 30 // 30 minutes
    },
    externalSystems: {
      communicationPlatforms: [
        'microsoft-teams',
        'slack',
        'zoom',
        'email-system',
        'secure-messaging'
      ],
      monitoringSystems: [
        'splunk',
        'datadog',
        'newrelic',
        'internal-dashboard'
      ],
      notificationServices: [
        'pagerduty',
        'opsgenie',
        'aws-sns',
        'internal-alerts'
      ],
      approvalSystems: [
        'docusign',
        'internal-approval-workflow',
        'board-portal'
      ]
    },
    claudeFlow: {
      memoryNamespace: 'pea_crisis_management',
      neuralTraining: true,
      coordinationHooks: true,
      performanceTracking: true
    }
  }
};

/**
 * Development/Testing configuration with relaxed thresholds
 */
export const DEVELOPMENT_CRISIS_MANAGEMENT_CONFIG: CrisisManagementConfiguration = {
  ...PRODUCTION_CRISIS_MANAGEMENT_CONFIG,
  
  detection: {
    ...PRODUCTION_CRISIS_MANAGEMENT_CONFIG.detection,
    thresholds: {
      crisisDetection: 0.5, // Lower threshold for testing
      severityLevels: {
        low: 0.1,
        medium: 0.3,
        high: 0.5,
        critical: 0.7
      },
      confidenceMinimum: 0.4
    },
    performance: {
      maxDetectionTimeMs: 60000, // 1 minute for development
      maxAnalysisTimeMs: 10000, // 10 seconds
      parallelSourceProcessing: true,
      cacheEnabled: true
    }
  },

  response: {
    ...PRODUCTION_CRISIS_MANAGEMENT_CONFIG.response,
    responseTimeTargets: {
      detection: 60000, // 1 minute
      planGeneration: 180000, // 3 minutes
      stakeholderActivation: 600000, // 10 minutes
      overallResponse: 1200000 // 20 minutes total
    },
    decisionThresholds: {
      automaticResponse: 0.6,
      executiveEscalation: 0.5,
      boardNotification: 0.7,
      mediaResponse: 0.4
    }
  },

  performance: {
    ...PRODUCTION_CRISIS_MANAGEMENT_CONFIG.performance,
    monitoring: {
      ...PRODUCTION_CRISIS_MANAGEMENT_CONFIG.performance.monitoring,
      reportingInterval: 60, // 1 hour for development
      alertThresholds: {
        detectionTimeExceeded: 120000, // 2 minutes
        planningTimeExceeded: 300000, // 5 minutes
        coordinationFailureRate: 0.4,
        stakeholderResponseRate: 0.4
      }
    }
  }
};

/**
 * Configuration factory for different environments
 */
export class CrisisManagementConfigFactory {
  /**
   * Get configuration for specified environment
   */
  static getConfiguration(environment: 'production' | 'development' | 'testing'): CrisisManagementConfiguration {
    switch (environment) {
      case 'production':
        return PRODUCTION_CRISIS_MANAGEMENT_CONFIG;
      case 'development':
        return DEVELOPMENT_CRISIS_MANAGEMENT_CONFIG;
      case 'testing':
        return this.getTestingConfiguration();
      default:
        throw new Error(`Unknown environment: ${environment}`);
    }
  }

  /**
   * Get optimized configuration for specific crisis types
   */
  static getOptimizedConfiguration(
    crisisType: 'security' | 'financial' | 'operational' | 'reputation' | 'regulatory',
    baseConfig: CrisisManagementConfiguration = PRODUCTION_CRISIS_MANAGEMENT_CONFIG
  ): CrisisManagementConfiguration {
    const optimizedConfig = JSON.parse(JSON.stringify(baseConfig)) as CrisisManagementConfiguration;

    switch (crisisType) {
      case 'security':
        // Optimize for security crises - faster detection, immediate escalation
        optimizedConfig.detection.thresholds.crisisDetection = 0.6;
        optimizedConfig.response.responseTimeTargets.detection = 15000; // 15 seconds
        optimizedConfig.response.decisionThresholds.automaticResponse = 0.9;
        optimizedConfig.response.decisionThresholds.executiveEscalation = 0.6;
        break;

      case 'financial':
        // Optimize for financial crises - comprehensive analysis, board involvement
        optimizedConfig.detection.thresholds.crisisDetection = 0.8;
        optimizedConfig.response.responseTimeTargets.planGeneration = 60000; // 1 minute
        optimizedConfig.response.decisionThresholds.boardNotification = 0.6;
        optimizedConfig.coordination.consensusRules.consensusThreshold = 0.8;
        break;

      case 'operational':
        // Optimize for operational crises - fast response, high coordination
        optimizedConfig.response.responseTimeTargets.stakeholderActivation = 180000; // 3 minutes
        optimizedConfig.coordination.stakeholderLimits.maxSimultaneous = 100;
        optimizedConfig.coordination.communicationRules.batchSize = 20;
        break;

      case 'reputation':
        // Optimize for reputation crises - cultural sensitivity, media focus
        optimizedConfig.integration.culturalIntelligence.adaptationLevel = 'expert';
        optimizedConfig.response.decisionThresholds.mediaResponse = 0.4;
        optimizedConfig.detection.cultural.culturalWeighting = 0.5;
        break;

      case 'regulatory':
        // Optimize for regulatory crises - compliance focus, documentation
        optimizedConfig.coordination.consensusRules.timeoutMinutes = 10;
        optimizedConfig.coordination.communicationRules.approvalTimeout = 5;
        optimizedConfig.response.decisionThresholds.automaticResponse = 0.95; // Require high confidence
        break;
    }

    return optimizedConfig;
  }

  /**
   * Validate configuration for completeness and consistency
   */
  static validateConfiguration(config: CrisisManagementConfiguration): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate detection configuration
    if (config.detection.thresholds.crisisDetection < 0 || config.detection.thresholds.crisisDetection > 1) {
      errors.push('Crisis detection threshold must be between 0 and 1');
    }

    if (config.detection.monitoring.sources.length === 0) {
      errors.push('At least one monitoring source must be configured');
    }

    // Validate response time targets
    if (config.response.responseTimeTargets.detection > config.response.responseTimeTargets.planGeneration) {
      warnings.push('Detection time target is greater than planning time target');
    }

    if (config.response.responseTimeTargets.overallResponse < 
        config.response.responseTimeTargets.detection + 
        config.response.responseTimeTargets.planGeneration + 
        config.response.responseTimeTargets.stakeholderActivation) {
      warnings.push('Overall response time may be unrealistic given individual phase targets');
    }

    // Validate consensus rules
    if (config.coordination.consensusRules.byzantineTolerance < 1) {
      warnings.push('Byzantine tolerance should be at least 1 for fault tolerance');
    }

    if (config.coordination.consensusRules.consensusThreshold < 0.5) {
      warnings.push('Consensus threshold below 50% may lead to poor decisions');
    }

    // Validate performance targets
    const perfTargets = config.performance.benchmarking.improvementTargets;
    const baseline = config.performance.benchmarking.baselineMetrics;
    
    if (perfTargets.totalResponseTime >= baseline.totalResponseTime) {
      warnings.push('Improvement target should be better than baseline');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate testing configuration with mock data
   */
  private static getTestingConfiguration(): CrisisManagementConfiguration {
    const testConfig = JSON.parse(JSON.stringify(DEVELOPMENT_CRISIS_MANAGEMENT_CONFIG)) as CrisisManagementConfiguration;
    
    // Configure for testing with mock sources
    testConfig.detection.monitoring.sources = testConfig.detection.monitoring.sources.map((source: any) => ({
      ...source,
      refreshRate: 5, // 5 seconds for testing
      status: 'active'
    }));

    // Faster response times for testing
    testConfig.response.responseTimeTargets = {
      detection: 5000, // 5 seconds
      planGeneration: 15000, // 15 seconds
      stakeholderActivation: 30000, // 30 seconds
      overallResponse: 60000 // 1 minute total
    };

    // Lower thresholds for testing
    testConfig.detection.thresholds.crisisDetection = 0.3;
    testConfig.response.decisionThresholds.automaticResponse = 0.4;

    return testConfig;
  }
}

/**
 * Configuration templates for different executive contexts
 */
export const EXECUTIVE_CONTEXT_CONFIGS = {
  /**
   * Fortune 500 CEO configuration
   */
  FORTUNE_500_CEO: {
    stakeholderLimits: {
      maxSimultaneous: 100,
      priorityBatching: true,
      culturalGrouping: true
    },
    responseTimeTargets: {
      detection: 15000, // 15 seconds
      planGeneration: 60000, // 1 minute
      stakeholderActivation: 180000, // 3 minutes
      overallResponse: 300000 // 5 minutes
    },
    culturalIntelligence: {
      enabled: true,
      adaptationLevel: 'expert' as const,
      cacheTimeout: 15
    }
  },

  /**
   * Startup founder configuration
   */
  STARTUP_FOUNDER: {
    stakeholderLimits: {
      maxSimultaneous: 25,
      priorityBatching: true,
      culturalGrouping: false
    },
    responseTimeTargets: {
      detection: 30000, // 30 seconds
      planGeneration: 120000, // 2 minutes
      stakeholderActivation: 300000, // 5 minutes
      overallResponse: 600000 // 10 minutes
    },
    culturalIntelligence: {
      enabled: true,
      adaptationLevel: 'basic' as const,
      cacheTimeout: 60
    }
  },

  /**
   * Government official configuration
   */
  GOVERNMENT_OFFICIAL: {
    stakeholderLimits: {
      maxSimultaneous: 75,
      priorityBatching: true,
      culturalGrouping: true
    },
    responseTimeTargets: {
      detection: 45000, // 45 seconds
      planGeneration: 300000, // 5 minutes
      stakeholderActivation: 600000, // 10 minutes
      overallResponse: 1200000 // 20 minutes
    },
    culturalIntelligence: {
      enabled: true,
      adaptationLevel: 'expert' as const,
      cacheTimeout: 30
    }
  }
};

/**
 * Performance optimization presets
 */
export const PERFORMANCE_PRESETS = {
  /**
   * Maximum performance - lowest latency, highest resource usage
   */
  MAXIMUM_PERFORMANCE: {
    detection: {
      maxDetectionTimeMs: 15000,
      maxAnalysisTimeMs: 2000,
      parallelSourceProcessing: true,
      cacheEnabled: true
    },
    responseTimeTargets: {
      detection: 15000,
      planGeneration: 60000,
      stakeholderActivation: 180000,
      overallResponse: 300000
    },
    monitoring: {
      realTimeMetrics: true,
      reportingInterval: 5
    }
  },

  /**
   * Balanced performance - good performance with reasonable resource usage
   */
  BALANCED_PERFORMANCE: {
    detection: {
      maxDetectionTimeMs: 30000,
      maxAnalysisTimeMs: 5000,
      parallelSourceProcessing: true,
      cacheEnabled: true
    },
    responseTimeTargets: {
      detection: 30000,
      planGeneration: 120000,
      stakeholderActivation: 300000,
      overallResponse: 600000
    },
    monitoring: {
      realTimeMetrics: true,
      reportingInterval: 15
    }
  },

  /**
   * Resource efficient - good performance with minimal resource usage
   */
  RESOURCE_EFFICIENT: {
    detection: {
      maxDetectionTimeMs: 60000,
      maxAnalysisTimeMs: 10000,
      parallelSourceProcessing: false,
      cacheEnabled: true
    },
    responseTimeTargets: {
      detection: 60000,
      planGeneration: 180000,
      stakeholderActivation: 600000,
      overallResponse: 1200000
    },
    monitoring: {
      realTimeMetrics: false,
      reportingInterval: 60
    }
  }
};

export default {
  PRODUCTION_CRISIS_MANAGEMENT_CONFIG,
  DEVELOPMENT_CRISIS_MANAGEMENT_CONFIG,
  CrisisManagementConfigFactory,
  EXECUTIVE_CONTEXT_CONFIGS,
  PERFORMANCE_PRESETS
};