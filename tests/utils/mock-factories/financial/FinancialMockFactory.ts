/**
 * Financial Context Mock Factory
 * Type-safe mock factory for financial testing with realistic data
 */

import { BaseMockFactory } from '../base/MockFactory';
import {
  FinancialContext,
  PortfolioProfile,
  Holding,
  DeepPartial
} from '../../../../src/types/test-types';

/**
 * Financial Context Mock Factory
 * Provides realistic financial data for comprehensive testing
 */
export class FinancialContextMockFactory extends BaseMockFactory<FinancialContext> {
  
  create(overrides?: DeepPartial<FinancialContext>): FinancialContext {
    const defaults: FinancialContext = {
      executiveId: 'exec-001',
      portfolioProfile: this.createDefaultPortfolio(),
      taxProfile: {
        jurisdiction: 'US',
        taxBracket: 0.37,
        taxOptimizationGoals: ['minimize_current_tax', 'defer_gains', 'harvest_losses'],
        harvestingRules: [
          {
            enabled: true,
            lossThreshold: 1000,
            gainOffset: true,
            washSaleAvoidance: true
          }
        ],
        retirementAccounts: [
          {
            type: '401k',
            balance: 500000,
            contributionLimit: 22500,
            currentContributions: 22500
          }
        ]
      },
      riskTolerance: 'moderate',
      investmentHorizon: 10,
      liquidityNeeds: 100000,
      regulatoryJurisdictions: ['US', 'EU'],
      currencies: ['USD', 'EUR'],
      complianceRequirements: ['SOX', 'FINRA', 'SEC']
    };
    
    const mergedDefaults = this.mergeValues(defaults, this.defaults);
    return this.mergeValues(mergedDefaults, overrides);
  }
  
  protected getExpectedInterface(): Record<string, string> {
    return {
      executiveId: 'string',
      portfolioProfile: 'object',
      taxProfile: 'object',
      riskTolerance: 'string',
      investmentHorizon: 'number',
      liquidityNeeds: 'number',
      regulatoryJurisdictions: 'object',
      currencies: 'object',
      complianceRequirements: 'object'
    };
  }
  
  /**
   * Create default portfolio with realistic holdings
   */
  private createDefaultPortfolio(): PortfolioProfile {
    return {
      totalValue: 1500000,
      assetAllocation: {
        stocks: 60,
        bonds: 30,
        cash: 5,
        alternatives: 5
      },
      holdings: this.createDefaultHoldings(),
      performanceTargets: {
        annualReturn: 0.08,
        maxDrawdown: 0.15,
        sharpeRatio: 1.2,
        volatility: 0.12
      },
      rebalancingRules: [
        {
          frequency: 'quarterly',
          threshold: 5,
          assetClass: 'stocks',
          targetAllocation: 60
        }
      ]
    };
  }
  
  /**
   * Create realistic holdings data
   */
  private createDefaultHoldings(): Holding[] {
    return [
      {
        symbol: 'AAPL',
        quantity: 500,
        currentPrice: 150.00,
        costBasis: 120.00,
        sector: 'Technology',
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      },
      {
        symbol: 'MSFT',
        quantity: 300,
        currentPrice: 400.00,
        costBasis: 350.00,
        sector: 'Technology',
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      },
      {
        symbol: 'BND',
        quantity: 1000,
        currentPrice: 80.00,
        costBasis: 82.00,
        sector: 'Bonds',
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      },
      {
        symbol: 'VTI',
        quantity: 200,
        currentPrice: 220.00,
        costBasis: 200.00,
        sector: 'Diversified',
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      }
    ];
  }
  
  /**
   * Create high net worth executive context
   */
  createHighNetWorth(overrides?: DeepPartial<FinancialContext>): FinancialContext {
    const highNetWorthOverrides: DeepPartial<FinancialContext> = {
      portfolioProfile: {
        totalValue: 50000000,
        assetAllocation: {
          stocks: 50,
          bonds: 20,
          alternatives: 20,
          cash: 10
        },
        holdings: [
          {
            symbol: 'BRK.A',
            quantity: 10,
            currentPrice: 500000,
            costBasis: 400000,
            sector: 'Financial',
            currency: 'USD',
            lastUpdated: new Date().toISOString()
          }
        ]
      },
      liquidityNeeds: 5000000,
      regulatoryJurisdictions: ['US', 'EU', 'UK', 'SG'],
      complianceRequirements: ['SOX', 'FINRA', 'SEC', 'MiFID', 'MAS']
    };
    
    return this.create(this.mergeValues(highNetWorthOverrides, overrides || {}));
  }
  
  /**
   * Create conservative risk profile context
   */
  createConservative(overrides?: DeepPartial<FinancialContext>): FinancialContext {
    const conservativeOverrides: DeepPartial<FinancialContext> = {
      riskTolerance: 'conservative',
      portfolioProfile: {
        assetAllocation: {
          stocks: 30,
          bonds: 60,
          cash: 10
        },
        performanceTargets: {
          annualReturn: 0.05,
          maxDrawdown: 0.08,
          sharpeRatio: 0.8,
          volatility: 0.08
        }
      },
      investmentHorizon: 5
    };
    
    return this.create(this.mergeValues(conservativeOverrides, overrides || {}));
  }
  
  /**
   * Create aggressive growth profile context
   */
  createAggressive(overrides?: DeepPartial<FinancialContext>): FinancialContext {
    const aggressiveOverrides: DeepPartial<FinancialContext> = {
      riskTolerance: 'aggressive',
      portfolioProfile: {
        assetAllocation: {
          stocks: 85,
          bonds: 5,
          alternatives: 10
        },
        performanceTargets: {
          annualReturn: 0.12,
          maxDrawdown: 0.25,
          sharpeRatio: 1.5,
          volatility: 0.18
        }
      },
      investmentHorizon: 20
    };
    
    return this.create(this.mergeValues(aggressiveOverrides, overrides || {}));
  }
  
  /**
   * Create international diversified context
   */
  createInternational(overrides?: DeepPartial<FinancialContext>): FinancialContext {
    const internationalOverrides: DeepPartial<FinancialContext> = {
      regulatoryJurisdictions: ['US', 'EU', 'UK', 'JP', 'AU', 'CA'],
      currencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'],
      portfolioProfile: {
        holdings: [
          {
            symbol: 'VEA',
            quantity: 1000,
            currentPrice: 50.00,
            costBasis: 45.00,
            sector: 'International',
            currency: 'USD',
            lastUpdated: new Date().toISOString()
          },
          {
            symbol: 'VWO',
            quantity: 500,
            currentPrice: 45.00,
            costBasis: 40.00,
            sector: 'Emerging Markets',
            currency: 'USD',
            lastUpdated: new Date().toISOString()
          }
        ]
      },
      complianceRequirements: ['SOX', 'FINRA', 'SEC', 'MiFID', 'FCA', 'JFSA', 'ASIC', 'CSA']
    };
    
    return this.create(this.mergeValues(internationalOverrides, overrides || {}));
  }
  
  /**
   * Create context with tax optimization focus
   */
  createTaxOptimized(overrides?: DeepPartial<FinancialContext>): FinancialContext {
    const taxOptimizedOverrides: DeepPartial<FinancialContext> = {
      taxProfile: {
        jurisdiction: 'US',
        taxBracket: 0.37,
        taxOptimizationGoals: [
          'minimize_current_tax',
          'defer_gains',
          'harvest_losses',
          'maximize_retirement_contributions',
          'utilize_tax_advantaged_accounts'
        ],
        harvestingRules: [
          {
            enabled: true,
            lossThreshold: 500,
            gainOffset: true,
            washSaleAvoidance: true
          }
        ],
        retirementAccounts: [
          {
            type: '401k',
            balance: 500000,
            contributionLimit: 22500,
            currentContributions: 22500
          },
          {
            type: 'IRA',
            balance: 100000,
            contributionLimit: 6000,
            currentContributions: 6000
          },
          {
            type: 'Roth',
            balance: 75000,
            contributionLimit: 6000,
            currentContributions: 6000
          }
        ]
      }
    };
    
    return this.create(this.mergeValues(taxOptimizedOverrides, overrides || {}));
  }
}

/**
 * Portfolio Profile Mock Factory
 * Standalone factory for portfolio-specific testing
 */
export class PortfolioProfileMockFactory extends BaseMockFactory<PortfolioProfile> {
  
  create(overrides?: DeepPartial<PortfolioProfile>): PortfolioProfile {
    const defaults: PortfolioProfile = {
      totalValue: 1000000,
      assetAllocation: { stocks: 60, bonds: 30, cash: 10 },
      holdings: [],
      performanceTargets: {
        annualReturn: 0.08,
        maxDrawdown: 0.15,
        sharpeRatio: 1.2,
        volatility: 0.12
      },
      rebalancingRules: []
    };
    
    const mergedDefaults = this.mergeValues(defaults, this.defaults);
    return this.mergeValues(mergedDefaults, overrides);
  }
  
  protected getExpectedInterface(): Record<string, string> {
    return {
      totalValue: 'number',
      assetAllocation: 'object',
      holdings: 'object',
      performanceTargets: 'object',
      rebalancingRules: 'object'
    };
  }
}

// Singleton instances for global use
export const financialContextMockFactory = new FinancialContextMockFactory();
export const portfolioProfileMockFactory = new PortfolioProfileMockFactory();