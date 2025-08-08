/**
 * Cultural Intelligence - Cultural Database Module
 * Centralized repository for cultural intelligence data
 */

export interface CultureData {
  countryCode: string;
  countryName: string;
  region: string;
  subRegions?: string[];
  businessCulture: BusinessCultureProfile;
  communicationPatterns: CommunicationPattern[];
  businessEtiquette: BusinessEtiquette;
  legalCompliance: ComplianceRequirements;
  economicProfile: EconomicProfile;
  lastUpdated: string;
}

export interface BusinessCultureProfile {
  hierarchyStyle: 'flat' | 'hierarchical' | 'matrix';
  decisionMaking: 'individual' | 'consensus' | 'hierarchical' | 'committee';
  timeOrientation: 'monochronic' | 'polychronic';
  relationshipFocus: 'task-oriented' | 'relationship-oriented' | 'balanced';
  communicationStyle: 'direct' | 'indirect' | 'context-dependent';
  negotiationStyle: 'competitive' | 'cooperative' | 'ceremonial';
  riskTolerance: 'high' | 'medium' | 'low';
}

export interface CommunicationPattern {
  channel: 'email' | 'phone' | 'video' | 'in-person' | 'messaging' | 'formal-letter';
  formality: 'high' | 'medium' | 'low';
  responseTimeExpectation: string; // e.g., "within 24 hours"
  preferredLanguages: string[];
  avoidancePatterns: string[];
}

export interface BusinessEtiquette {
  greetingProtocols: string[];
  meetingConventions: string[];
  giftGiving: {
    appropriate: boolean;
    restrictions: string[];
    recommendations: string[];
  };
  diningEtiquette: string[];
  dressCodes: {
    business: string;
    casual: string;
    formal: string;
  };
}

export interface ComplianceRequirements {
  dataPrivacyLaws: string[];
  businessRegulations: string[];
  contractualRequirements: string[];
  employmentLaws: string[];
  taxImplications: string[];
}

export interface EconomicProfile {
  currency: string;
  businessHours: {
    standard: { start: string; end: string };
    friday?: { start: string; end: string };
    weekend: boolean;
  };
  holidays: PublicHoliday[];
  fiscalYearStart: string;
  paymentTerms: string[];
}

export interface PublicHoliday {
  name: string;
  date: string;
  businessImpact: 'full-closure' | 'reduced-hours' | 'normal-operations';
}

export class CulturalDatabase {
  private cultureData: Map<string, CultureData> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // Initialize with comprehensive culture data for major business regions
    const cultureProfiles: CultureData[] = [
      {
        countryCode: 'US',
        countryName: 'United States',
        region: 'North America',
        businessCulture: {
          hierarchyStyle: 'flat',
          decisionMaking: 'individual',
          timeOrientation: 'monochronic',
          relationshipFocus: 'task-oriented',
          communicationStyle: 'direct',
          negotiationStyle: 'competitive',
          riskTolerance: 'high'
        },
        communicationPatterns: [
          {
            channel: 'email',
            formality: 'medium',
            responseTimeExpectation: 'within 24 hours',
            preferredLanguages: ['English'],
            avoidancePatterns: ['overly-formal-titles']
          }
        ],
        businessEtiquette: {
          greetingProtocols: ['firm-handshake', 'direct-eye-contact', 'first-name-basis'],
          meetingConventions: ['punctuality', 'agenda-driven', 'action-items'],
          giftGiving: {
            appropriate: false,
            restrictions: ['no-expensive-gifts', 'company-policy-compliance'],
            recommendations: ['branded-items', 'charitable-donations']
          },
          diningEtiquette: ['business-lunch-common', 'dutch-treat-acceptable'],
          dressCodes: {
            business: 'business-professional',
            casual: 'business-casual',
            formal: 'formal-business'
          }
        },
        legalCompliance: {
          dataPrivacyLaws: ['CCPA', 'various-state-laws'],
          businessRegulations: ['SOX', 'SEC-requirements'],
          contractualRequirements: ['written-agreements', 'liability-clauses'],
          employmentLaws: ['at-will-employment', 'equal-opportunity'],
          taxImplications: ['corporate-tax', 'state-variations']
        },
        economicProfile: {
          currency: 'USD',
          businessHours: {
            standard: { start: '09:00', end: '17:00' },
            weekend: false
          },
          holidays: [
            { name: 'New Year', date: '01-01', businessImpact: 'full-closure' },
            { name: 'Independence Day', date: '07-04', businessImpact: 'full-closure' },
            { name: 'Thanksgiving', date: '11-23', businessImpact: 'full-closure' },
            { name: 'Christmas', date: '12-25', businessImpact: 'full-closure' }
          ],
          fiscalYearStart: '01-01',
          paymentTerms: ['Net-30', 'Net-60', 'immediate-payment']
        },
        lastUpdated: new Date().toISOString()
      },
      {
        countryCode: 'JP',
        countryName: 'Japan',
        region: 'Asia-Pacific',
        businessCulture: {
          hierarchyStyle: 'hierarchical',
          decisionMaking: 'consensus',
          timeOrientation: 'monochronic',
          relationshipFocus: 'relationship-oriented',
          communicationStyle: 'indirect',
          negotiationStyle: 'ceremonial',
          riskTolerance: 'low'
        },
        communicationPatterns: [
          {
            channel: 'formal-letter',
            formality: 'high',
            responseTimeExpectation: 'within 2-3 days',
            preferredLanguages: ['Japanese', 'English'],
            avoidancePatterns: ['direct-confrontation', 'casual-language']
          }
        ],
        businessEtiquette: {
          greetingProtocols: ['bow', 'business-card-ceremony', 'formal-titles'],
          meetingConventions: ['punctuality-critical', 'senior-speaks-first', 'consensus-building'],
          giftGiving: {
            appropriate: true,
            restrictions: ['even-numbers-avoided', 'expensive-wrapping'],
            recommendations: ['quality-items', 'company-branded', 'seasonal-appropriateness']
          },
          diningEtiquette: ['senior-orders-first', 'group-dining', 'ceremony-important'],
          dressCodes: {
            business: 'conservative-formal',
            casual: 'smart-casual',
            formal: 'traditional-formal'
          }
        },
        legalCompliance: {
          dataPrivacyLaws: ['Personal-Information-Protection-Act'],
          businessRegulations: ['Commercial-Code', 'Corporate-Law'],
          contractualRequirements: ['detailed-contracts', 'relationship-clauses'],
          employmentLaws: ['lifetime-employment-tradition', 'group-harmony'],
          taxImplications: ['corporate-tax', 'consumption-tax']
        },
        economicProfile: {
          currency: 'JPY',
          businessHours: {
            standard: { start: '09:00', end: '18:00' },
            weekend: false
          },
          holidays: [
            { name: 'New Year', date: '01-01', businessImpact: 'full-closure' },
            { name: 'Golden Week', date: '04-29', businessImpact: 'full-closure' },
            { name: 'Obon', date: '08-15', businessImpact: 'reduced-hours' }
          ],
          fiscalYearStart: '04-01',
          paymentTerms: ['Net-30', 'end-of-month', 'relationship-based']
        },
        lastUpdated: new Date().toISOString()
      }
    ];

    cultureProfiles.forEach(profile => {
      this.cultureData.set(profile.countryCode, profile);
    });

    this.initialized = true;
  }

  public async getCultureData(countryCode: string): Promise<CultureData | null> {
    if (!this.initialized) {
      this.initializeDatabase();
    }
    
    return this.cultureData.get(countryCode.toUpperCase()) || null;
  }

  public async searchByRegion(region: string): Promise<CultureData[]> {
    if (!this.initialized) {
      this.initializeDatabase();
    }
    
    return Array.from(this.cultureData.values()).filter(
      culture => culture.region.toLowerCase().includes(region.toLowerCase())
    );
  }

  public async getAllCountries(): Promise<string[]> {
    if (!this.initialized) {
      this.initializeDatabase();
    }
    
    return Array.from(this.cultureData.keys());
  }

  public async addCultureData(cultureData: CultureData): Promise<void> {
    cultureData.lastUpdated = new Date().toISOString();
    this.cultureData.set(cultureData.countryCode, cultureData);
  }

  public async updateCultureData(countryCode: string, updates: Partial<CultureData>): Promise<boolean> {
    const existing = this.cultureData.get(countryCode.toUpperCase());
    if (!existing) return false;

    const updated = {
      ...existing,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    this.cultureData.set(countryCode.toUpperCase(), updated);
    return true;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getSupportedCountries(): string[] {
    if (!this.initialized) {
      this.initializeDatabase();
    }
    return Array.from(this.cultureData.keys());
  }

  public getCultureByCountry(countryCode: string): CultureData | null {
    if (!this.initialized) {
      this.initializeDatabase();
    }
    return this.cultureData.get(countryCode.toUpperCase()) || null;
  }
}

// Export singleton instance
export const culturalDatabase = new CulturalDatabase();