/**
 * Executive Context Mock Factory
 * Type-safe mock factory for executive context testing
 */

import { BaseMockFactory } from '../base/MockFactory';
import {
  ExecutiveContext,
  SecurityLevel,
  DeepPartial
} from '../../../../src/types/test-types';

/**
 * Executive Context Mock Factory
 * Provides realistic executive context data for comprehensive testing
 */
export class ExecutiveContextMockFactory extends BaseMockFactory<ExecutiveContext> {
  
  create(overrides?: DeepPartial<ExecutiveContext>): ExecutiveContext {
    const defaults: ExecutiveContext = {
      executiveId: 'exec-001',
      sessionId: `session-${Date.now()}`,
      currentPriority: 'high',
      stakeholders: ['board-member-1', 'team-lead-1', 'investor-1'],
      timeZone: 'America/New_York',
      confidentialityLevel: SecurityLevel.EXECUTIVE_PERSONAL,
      preferences: {
        communicationStyle: 'formal',
        decisionThreshold: 0.8,
        privacyLevel: SecurityLevel.EXECUTIVE_PERSONAL,
        timeZone: 'America/New_York',
        languages: ['en', 'es'],
        culturalAdaptation: true,
        riskTolerance: 'moderate',
        decisionSpeed: 'balanced'
      },
      currentContext: {
        meetingStatus: 'available',
        priority: 'high',
        workload: 'normal'
      }
    };
    
    const mergedDefaults = this.mergeValues(defaults, this.defaults);
    return this.mergeValues(mergedDefaults, overrides);
  }
  
  protected getExpectedInterface(): Record<string, string> {
    return {
      executiveId: 'string',
      sessionId: 'string',
      currentPriority: 'string',
      stakeholders: 'object',
      timeZone: 'string',
      confidentialityLevel: 'string',
      preferences: 'object',
      currentContext: 'object'
    };
  }
  
  /**
   * Create CEO-level executive context
   */
  createCEO(overrides?: DeepPartial<ExecutiveContext>): ExecutiveContext {
    const ceoOverrides: DeepPartial<ExecutiveContext> = {
      executiveId: 'ceo-001',
      currentPriority: 'critical',
      confidentialityLevel: SecurityLevel.EXECUTIVE_PERSONAL,
      stakeholders: [
        'board-chair',
        'cfo',
        'coo',
        'major-investor-1',
        'major-investor-2',
        'regulatory-liaison'
      ],
      preferences: {
        communicationStyle: 'executive',
        decisionThreshold: 0.9,
        privacyLevel: SecurityLevel.EXECUTIVE_PERSONAL,
        riskTolerance: 'moderate',
        decisionSpeed: 'fast'
      },
      currentContext: {
        meetingStatus: 'in_critical_meeting',
        priority: 'critical',
        workload: 'high'
      }
    };
    
    return this.create(this.mergeValues(ceoOverrides, overrides || {}));
  }
  
  /**
   * Create CTO-level executive context
   */
  createCTO(overrides?: DeepPartial<ExecutiveContext>): ExecutiveContext {
    const ctoOverrides: DeepPartial<ExecutiveContext> = {
      executiveId: 'cto-001',
      currentPriority: 'high',
      confidentialityLevel: SecurityLevel.CONFIDENTIAL,
      stakeholders: [
        'engineering-leads',
        'security-team',
        'architecture-committee',
        'product-managers'
      ],
      preferences: {
        communicationStyle: 'technical',
        decisionThreshold: 0.85,
        privacyLevel: SecurityLevel.CONFIDENTIAL,
        riskTolerance: 'calculated',
        decisionSpeed: 'analytical'
      },
      currentContext: {
        meetingStatus: 'available',
        priority: 'high',
        workload: 'high'
      }
    };
    
    return this.create(this.mergeValues(ctoOverrides, overrides || {}));
  }
  
  /**
   * Create CFO-level executive context
   */
  createCFO(overrides?: DeepPartial<ExecutiveContext>): ExecutiveContext {
    const cfoOverrides: DeepPartial<ExecutiveContext> = {
      executiveId: 'cfo-001',
      currentPriority: 'high',
      confidentialityLevel: SecurityLevel.CONFIDENTIAL,
      stakeholders: [
        'accounting-team',
        'board-audit-committee',
        'external-auditors',
        'investors',
        'regulatory-bodies'
      ],
      preferences: {
        communicationStyle: 'formal',
        decisionThreshold: 0.95,
        privacyLevel: SecurityLevel.CONFIDENTIAL,
        riskTolerance: 'conservative',
        decisionSpeed: 'deliberate'
      },
      currentContext: {
        meetingStatus: 'in_financial_review',
        priority: 'high',
        workload: 'high'
      }
    };
    
    return this.create(this.mergeValues(cfoOverrides, overrides || {}));
  }
  
  /**
   * Create international executive context
   */
  createInternational(overrides?: DeepPartial<ExecutiveContext>): ExecutiveContext {
    const internationalOverrides: DeepPartial<ExecutiveContext> = {
      timeZone: 'Europe/London',
      preferences: {
        timeZone: 'Europe/London',
        languages: ['en', 'fr', 'de', 'es'],
        culturalAdaptation: true,
        communicationStyle: 'diplomatic'
      },
      stakeholders: [
        'eu-board-members',
        'asia-pac-leads',
        'americas-directors',
        'global-compliance-team'
      ]
    };
    
    return this.create(this.mergeValues(internationalOverrides, overrides || {}));
  }
  
  /**
   * Create crisis management context
   */
  createCrisisMode(overrides?: DeepPartial<ExecutiveContext>): ExecutiveContext {
    const crisisOverrides: DeepPartial<ExecutiveContext> = {
      currentPriority: 'critical',
      confidentialityLevel: SecurityLevel.TOP_SECRET,
      preferences: {
        decisionThreshold: 0.7,
        decisionSpeed: 'immediate',
        riskTolerance: 'aggressive'
      },
      currentContext: {
        meetingStatus: 'crisis_management',
        priority: 'critical',
        workload: 'maximum'
      },
      stakeholders: [
        'crisis-response-team',
        'legal-counsel',
        'public-relations',
        'board-chair',
        'regulatory-contacts'
      ]
    };
    
    return this.create(this.mergeValues(crisisOverrides, overrides || {}));
  }
  
  /**
   * Create board meeting context
   */
  createBoardMeeting(overrides?: DeepPartial<ExecutiveContext>): ExecutiveContext {
    const boardMeetingOverrides: DeepPartial<ExecutiveContext> = {
      currentPriority: 'critical',
      confidentialityLevel: SecurityLevel.EXECUTIVE_PERSONAL,
      currentContext: {
        meetingStatus: 'board_meeting',
        priority: 'critical',
        workload: 'focused'
      },
      stakeholders: [
        'board-chair',
        'independent-directors',
        'audit-committee',
        'compensation-committee',
        'nominating-committee'
      ],
      preferences: {
        communicationStyle: 'board_formal',
        decisionThreshold: 0.9,
        decisionSpeed: 'considered'
      }
    };
    
    return this.create(this.mergeValues(boardMeetingOverrides, overrides || {}));
  }
  
  /**
   * Create investor relations context
   */
  createInvestorRelations(overrides?: DeepPartial<ExecutiveContext>): ExecutiveContext {
    const investorRelationsOverrides: DeepPartial<ExecutiveContext> = {
      currentPriority: 'high',
      confidentialityLevel: SecurityLevel.CONFIDENTIAL,
      stakeholders: [
        'institutional-investors',
        'retail-investors',
        'analyst-community',
        'investment-banks',
        'rating-agencies'
      ],
      preferences: {
        communicationStyle: 'investor_focused',
        decisionThreshold: 0.85,
        riskTolerance: 'balanced'
      },
      currentContext: {
        meetingStatus: 'investor_call',
        priority: 'high',
        workload: 'normal'
      }
    };
    
    return this.create(this.mergeValues(investorRelationsOverrides, overrides || {}));
  }
  
  /**
   * Create regulatory compliance context
   */
  createRegulatoryCompliance(overrides?: DeepPartial<ExecutiveContext>): ExecutiveContext {
    const regulatoryOverrides: DeepPartial<ExecutiveContext> = {
      currentPriority: 'high',
      confidentialityLevel: SecurityLevel.CONFIDENTIAL,
      stakeholders: [
        'compliance-officers',
        'legal-team',
        'regulatory-bodies',
        'external-counsel',
        'audit-firms'
      ],
      preferences: {
        communicationStyle: 'formal',
        decisionThreshold: 0.95,
        riskTolerance: 'conservative',
        decisionSpeed: 'deliberate'
      },
      currentContext: {
        meetingStatus: 'compliance_review',
        priority: 'high',
        workload: 'normal'
      }
    };
    
    return this.create(this.mergeValues(regulatoryOverrides, overrides || {}));
  }
}

// Singleton instance for global use
export const executiveContextMockFactory = new ExecutiveContextMockFactory();