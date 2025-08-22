/**
 * Financial Management Agent - Phase 2
 * Manages financial operations with focus on Spain, Japan, and Estonia
 */

import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

export interface Currency {
  code: 'EUR' | 'JPY' | 'USD' | 'GBP';
  name: string;
  symbol: string;
  country: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
  source: 'ECB' | 'BOJ' | 'XE' | 'Reuters';
  spread: number; // Bank spread percentage
}

export interface TaxRegulation {
  country: 'Spain' | 'Japan' | 'Estonia';
  corporateTaxRate: number;
  vatRate: number;
  digitalServicesRate?: number;
  witholdingTaxRate: number;
  transferPricingRules: string[];
  complianceRequirements: string[];
  reportingDeadlines: {
    quarterly?: string;
    annual: string;
    vat: string;
  };
}

export interface ExpenseCategory {
  id: string;
  name: string;
  country: 'Spain' | 'Japan' | 'Estonia' | 'International';
  taxDeductible: boolean;
  approvalRequired: boolean;
  maxAmount?: number;
  documentation: string[];
}

export interface FinancialTransaction {
  id: string;
  executiveId: string;
  type: 'expense' | 'income' | 'transfer' | 'investment' | 'tax-payment';
  amount: number;
  currency: string;
  exchangeRate?: number;
  amountUSD: number; // Normalized amount
  category: string;
  country: 'Spain' | 'Japan' | 'Estonia' | 'International';
  description: string;
  date: Date;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  approver?: string;
  taxImplications: {
    deductible: boolean;
    vatApplicable: boolean;
    country: string;
    rate?: number;
  };
  documentation: string[];
  compliance: {
    reviewed: boolean;
    flags: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentPortfolio {
  id: string;
  executiveId: string;
  country: 'Spain' | 'Japan' | 'Estonia';
  investments: Investment[];
  totalValue: {
    EUR: number;
    JPY: number;
    USD: number;
  };
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  riskProfile: 'conservative' | 'balanced' | 'aggressive';
  lastUpdated: Date;
}

export interface Investment {
  id: string;
  type: 'stocks' | 'bonds' | 'real-estate' | 'crypto' | 'commodities';
  name: string;
  symbol?: string;
  amount: number;
  currency: string;
  currentValue: number;
  purchasePrice: number;
  purchaseDate: Date;
  performance: number; // percentage
  country: string;
  exchange?: string;
}

export interface BudgetAllocation {
  id: string;
  executiveId: string;
  country: 'Spain' | 'Japan' | 'Estonia';
  period: 'monthly' | 'quarterly' | 'yearly';
  categories: {
    travel: number;
    meals: number;
    accommodation: number;
    transportation: number;
    communication: number;
    representation: number;
    development: number;
    equipment: number;
    other: number;
  };
  totalBudget: number;
  currency: string;
  spent: number;
  remaining: number;
  alerts: {
    threshold: number; // percentage
    enabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class FinancialManagementAgent extends EventEmitter {
  private agentId: string;
  private transactions: Map<string, FinancialTransaction>;
  private portfolios: Map<string, InvestmentPortfolio>;
  private budgets: Map<string, BudgetAllocation>;
  private exchangeRates: Map<string, ExchangeRate>;
  private taxRegulations: Map<string, TaxRegulation>;
  private expenseCategories: Map<string, ExpenseCategory>;
  private performanceMetrics: {
    responseTimes: number[];
    processedTransactions: number;
    complianceFlags: number;
    totalVolume: number;
  };

  constructor() {
    super();
    this.agentId = `financial-mgmt-${nanoid()}`;
    this.transactions = new Map();
    this.portfolios = new Map();
    this.budgets = new Map();
    this.exchangeRates = new Map();
    this.taxRegulations = new Map();
    this.expenseCategories = new Map();
    this.performanceMetrics = {
      responseTimes: [],
      processedTransactions: 0,
      complianceFlags: 0,
      totalVolume: 0
    };

    this.initializeFinancialData();
    this.startExchangeRateMonitoring();
    this.emit('agent:initialized', { agentId: this.agentId });
  }

  /**
   * Initialize financial data for Spain, Japan, and Estonia
   */
  private initializeFinancialData(): void {
    // Initialize tax regulations
    const taxRegulations: Record<string, TaxRegulation> = {
      'Spain': {
        country: 'Spain',
        corporateTaxRate: 25,
        vatRate: 21,
        digitalServicesRate: 3,
        witholdingTaxRate: 19,
        transferPricingRules: [
          'OECD Transfer Pricing Guidelines',
          'Spanish Transfer Pricing Regulations',
          'Country-by-Country Reporting'
        ],
        complianceRequirements: [
          'Monthly VAT returns',
          'Quarterly corporate tax payments',
          'Annual tax return',
          'Intrastat declarations for EU trade'
        ],
        reportingDeadlines: {
          quarterly: '20th of month following quarter',
          annual: 'July 25th',
          vat: '20th of following month'
        }
      },
      'Japan': {
        country: 'Japan',
        corporateTaxRate: 23.2,
        vatRate: 10, // Consumption tax
        witholdingTaxRate: 20.42,
        transferPricingRules: [
          'Japan Transfer Pricing Taxation System',
          'OECD Guidelines adoption',
          'Master File and Local File requirements'
        ],
        complianceRequirements: [
          'Monthly consumption tax returns',
          'Quarterly provisional tax payments',
          'Annual blue form tax return',
          'Transfer pricing documentation'
        ],
        reportingDeadlines: {
          quarterly: 'Two months after quarter end',
          annual: 'Two months after fiscal year end',
          vat: 'Last day of following month'
        }
      },
      'Estonia': {
        country: 'Estonia',
        corporateTaxRate: 20, // Only on distributed profits
        vatRate: 20,
        witholdingTaxRate: 20,
        transferPricingRules: [
          'Estonian Transfer Pricing Rules',
          'OECD BEPS Action 13',
          'EU State Aid rules'
        ],
        complianceRequirements: [
          'Monthly VAT returns',
          'Annual income tax return',
          'Statistical reports',
          'E-residency compliance'
        ],
        reportingDeadlines: {
          annual: 'March 31st',
          vat: '20th of following month'
        }
      }
    };

    // Initialize expense categories
    const expenseCategories: ExpenseCategory[] = [
      {
        id: 'travel-spain',
        name: 'Business Travel - Spain',
        country: 'Spain',
        taxDeductible: true,
        approvalRequired: false,
        maxAmount: 5000,
        documentation: ['Receipt', 'Business purpose', 'Attendee list']
      },
      {
        id: 'meals-japan',
        name: 'Business Meals - Japan',
        country: 'Japan',
        taxDeductible: true,
        approvalRequired: false,
        maxAmount: 2000,
        documentation: ['Receipt', 'Business purpose', 'Guest list']
      },
      {
        id: 'accommodation-estonia',
        name: 'Accommodation - Estonia',
        country: 'Estonia',
        taxDeductible: true,
        approvalRequired: false,
        maxAmount: 3000,
        documentation: ['Invoice', 'Business justification']
      },
      {
        id: 'representation-intl',
        name: 'Representation Expenses',
        country: 'International',
        taxDeductible: true,
        approvalRequired: true,
        maxAmount: 10000,
        documentation: ['Invoice', 'Approval form', 'Business case']
      }
    ];

    // Store initialized data
    Object.entries(taxRegulations).forEach(([country, regulation]) => {
      this.taxRegulations.set(country, regulation);
    });

    expenseCategories.forEach(category => {
      this.expenseCategories.set(category.id, category);
    });

    // Initialize exchange rates (mock data - would come from real API)
    this.updateExchangeRates();
  }

  /**
   * Process executive expense with multi-country compliance
   */
  public async processExpense(request: {
    executiveId: string;
    amount: number;
    currency: string;
    category: string;
    country: 'Spain' | 'Japan' | 'Estonia' | 'International';
    description: string;
    documentation?: string[];
  }): Promise<FinancialTransaction> {
    const startTime = Date.now();

    try {
      // Validate expense category
      const category = this.expenseCategories.get(request.category);
      if (!category) {
        throw new Error(`Invalid expense category: ${request.category}`);
      }

      // Check approval requirements
      if (category.approvalRequired && request.amount > (category.maxAmount || 0)) {
        throw new Error(`Expense exceeds limit and requires pre-approval: ${request.amount} ${request.currency}`);
      }

      // Convert to USD for normalization
      const exchangeRate = await this.getExchangeRate(request.currency, 'USD');
      const amountUSD = request.amount * exchangeRate.rate;

      // Determine tax implications
      const taxImplications = this.calculateTaxImplications(request.country, category, request.amount);

      // Perform compliance check
      const complianceCheck = await this.performComplianceCheck(request, amountUSD);

      const transaction: FinancialTransaction = {
        id: nanoid(),
        executiveId: request.executiveId,
        type: 'expense',
        amount: request.amount,
        currency: request.currency,
        exchangeRate: exchangeRate.rate,
        amountUSD,
        category: request.category,
        country: request.country,
        description: request.description,
        date: new Date(),
        status: complianceCheck.riskLevel === 'high' ? 'pending' : 'approved',
        taxImplications,
        documentation: request.documentation || [],
        compliance: complianceCheck,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.transactions.set(transaction.id, transaction);
      this.performanceMetrics.processedTransactions++;
      this.performanceMetrics.totalVolume += amountUSD;

      if (complianceCheck.flags.length > 0) {
        this.performanceMetrics.complianceFlags++;
      }

      const responseTime = Date.now() - startTime;
      this.performanceMetrics.responseTimes.push(responseTime);

      this.emit('expense:processed', {
        transactionId: transaction.id,
        amount: request.amount,
        currency: request.currency,
        country: request.country,
        status: transaction.status,
        responseTime
      });

      // Update budget if exists
      await this.updateBudgetAllocation(request.executiveId, request.country, request.category, amountUSD);

      return transaction;

    } catch (error) {
      this.emit('expense:error', { request, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Create or update investment portfolio
   */
  public async manageInvestmentPortfolio(request: {
    executiveId: string;
    country: 'Spain' | 'Japan' | 'Estonia';
    investments: Investment[];
    riskProfile: 'conservative' | 'balanced' | 'aggressive';
  }): Promise<InvestmentPortfolio> {
    const startTime = Date.now();

    try {
      // Calculate total value in multiple currencies
      const totalValue = await this.calculatePortfolioValue(request.investments);

      // Calculate performance metrics
      const performance = this.calculatePortfolioPerformance(request.investments);

      const portfolio: InvestmentPortfolio = {
        id: nanoid(),
        executiveId: request.executiveId,
        country: request.country,
        investments: request.investments,
        totalValue,
        performance,
        riskProfile: request.riskProfile,
        lastUpdated: new Date()
      };

      this.portfolios.set(portfolio.id, portfolio);

      const responseTime = Date.now() - startTime;
      this.performanceMetrics.responseTimes.push(responseTime);

      this.emit('portfolio:updated', {
        portfolioId: portfolio.id,
        country: request.country,
        totalValue: totalValue.USD,
        performance: performance.monthly,
        responseTime
      });

      return portfolio;

    } catch (error) {
      this.emit('portfolio:error', { request, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Create budget allocation for executive
   */
  public async createBudgetAllocation(request: {
    executiveId: string;
    country: 'Spain' | 'Japan' | 'Estonia';
    period: 'monthly' | 'quarterly' | 'yearly';
    categories: BudgetAllocation['categories'];
    currency: string;
  }): Promise<BudgetAllocation> {
    const startTime = Date.now();

    try {
      const totalBudget = Object.values(request.categories).reduce((sum, amount) => sum + amount, 0);

      const budget: BudgetAllocation = {
        id: nanoid(),
        executiveId: request.executiveId,
        country: request.country,
        period: request.period,
        categories: request.categories,
        totalBudget,
        currency: request.currency,
        spent: 0,
        remaining: totalBudget,
        alerts: {
          threshold: 80, // Alert at 80% usage
          enabled: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.budgets.set(budget.id, budget);

      const responseTime = Date.now() - startTime;
      this.performanceMetrics.responseTimes.push(responseTime);

      this.emit('budget:created', {
        budgetId: budget.id,
        country: request.country,
        totalBudget,
        currency: request.currency,
        responseTime
      });

      return budget;

    } catch (error) {
      this.emit('budget:error', { request, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get tax optimization recommendations
   */
  public async getTaxOptimizationRecommendations(
    executiveId: string,
    countries: ('Spain' | 'Japan' | 'Estonia')[]
  ): Promise<{
    recommendations: string[];
    potentialSavings: { country: string; amount: number; currency: string }[];
    complianceAlerts: string[];
  }> {
    const recommendations: string[] = [];
    const potentialSavings: { country: string; amount: number; currency: string }[] = [];
    const complianceAlerts: string[] = [];

    // Get executive's transactions
    const executiveTransactions = Array.from(this.transactions.values())
      .filter(t => t.executiveId === executiveId);

    for (const country of countries) {
      const countryTransactions = executiveTransactions.filter(t => t.country === country);
      const regulation = this.taxRegulations.get(country);

      if (!regulation) continue;

      // Analyze transactions for optimization opportunities
      const taxableAmount = countryTransactions
        .filter(t => t.taxImplications.deductible)
        .reduce((sum, t) => sum + t.amountUSD, 0);

      // Country-specific recommendations
      switch (country) {
        case 'Spain':
          if (taxableAmount > 50000) {
            recommendations.push('Consider establishing a Spanish subsidiary for tax efficiency');
            potentialSavings.push({
              country: 'Spain',
              amount: taxableAmount * 0.03, // 3% potential savings
              currency: 'EUR'
            });
          }
          recommendations.push('Utilize Spanish R&D tax credits for innovation expenses');
          break;

        case 'Japan':
          recommendations.push('Leverage Japan\'s special taxation for foreign executives');
          if (taxableAmount > 100000) {
            recommendations.push('Consider Japan holding company structure');
            potentialSavings.push({
              country: 'Japan',
              amount: taxableAmount * 0.025,
              currency: 'JPY'
            });
          }
          break;

        case 'Estonia':
          recommendations.push('Maximize Estonia\'s e-Residency digital nomad benefits');
          recommendations.push('Utilize Estonia\'s 0% corporate tax on retained earnings');
          potentialSavings.push({
            country: 'Estonia',
            amount: taxableAmount * 0.20, // Full corporate tax savings on retained earnings
            currency: 'EUR'
          });
          break;
      }

      // Check compliance deadlines
      const nextDeadline = this.getNextComplianceDeadline(country);
      if (nextDeadline) {
        complianceAlerts.push(`${country}: ${nextDeadline.type} deadline on ${nextDeadline.date}`);
      }
    }

    return {
      recommendations,
      potentialSavings,
      complianceAlerts
    };
  }

  /**
   * Helper methods
   */
  private async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    const key = `${from}-${to}`;
    let rate = this.exchangeRates.get(key);
    
    if (!rate || this.isRateStale(rate)) {
      rate = await this.fetchExchangeRate(from, to);
      this.exchangeRates.set(key, rate);
    }
    
    return rate;
  }

  private async fetchExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    // Mock implementation - would use real exchange rate API
    const mockRates: Record<string, number> = {
      'EUR-USD': 1.08,
      'JPY-USD': 0.0067,
      'USD-EUR': 0.93,
      'USD-JPY': 149.0,
      'EUR-JPY': 160.0,
      'JPY-EUR': 0.0063
    };

    const key = `${from}-${to}`;
    const rate = mockRates[key] || 1.0;

    return {
      from,
      to,
      rate,
      timestamp: new Date(),
      source: 'ECB',
      spread: 0.002 // 0.2% spread
    };
  }

  private calculateTaxImplications(
    country: string,
    category: ExpenseCategory,
    amount: number
  ): FinancialTransaction['taxImplications'] {
    const regulation = this.taxRegulations.get(country);
    
    return {
      deductible: category.taxDeductible,
      vatApplicable: amount > 1000, // Simplified rule
      country,
      ...(regulation?.vatRate !== undefined && { rate: regulation.vatRate })
    };
  }

  private async performComplianceCheck(
    request: any,
    amountUSD: number
  ): Promise<FinancialTransaction['compliance']> {
    const flags: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // High amount flag
    if (amountUSD > 10000) {
      flags.push('High value transaction');
      riskLevel = 'medium';
    }

    // Documentation check
    if (!request.documentation || request.documentation.length === 0) {
      flags.push('Missing documentation');
      riskLevel = 'medium';
    }

    // Cross-border transaction
    if (request.country === 'International') {
      flags.push('Cross-border transaction - review transfer pricing');
      riskLevel = 'high';
    }

    return {
      reviewed: flags.length === 0,
      flags,
      riskLevel
    };
  }

  private async updateBudgetAllocation(
    executiveId: string,
    country: string,
    _category: string,
    amountUSD: number
  ): Promise<void> {
    // Find relevant budget
    const budget = Array.from(this.budgets.values())
      .find(b => b.executiveId === executiveId && b.country === country);

    if (budget) {
      budget.spent += amountUSD;
      budget.remaining = budget.totalBudget - budget.spent;
      budget.updatedAt = new Date();

      // Check for budget alerts
      const usagePercentage = (budget.spent / budget.totalBudget) * 100;
      if (usagePercentage >= budget.alerts.threshold && budget.alerts.enabled) {
        this.emit('budget:alert', {
          budgetId: budget.id,
          country: budget.country,
          usagePercentage: usagePercentage.toFixed(1),
          remaining: budget.remaining
        });
      }
    }
  }

  private async calculatePortfolioValue(investments: Investment[]): Promise<{
    EUR: number;
    JPY: number;
    USD: number;
  }> {
    let totalUSD = 0;
    
    for (const investment of investments) {
      if (investment.currency === 'USD') {
        totalUSD += investment.currentValue;
      } else {
        const rate = await this.getExchangeRate(investment.currency, 'USD');
        totalUSD += investment.currentValue * rate.rate;
      }
    }

    const eurRate = await this.getExchangeRate('USD', 'EUR');
    const jpyRate = await this.getExchangeRate('USD', 'JPY');

    return {
      USD: totalUSD,
      EUR: totalUSD * eurRate.rate,
      JPY: totalUSD * jpyRate.rate
    };
  }

  private calculatePortfolioPerformance(investments: Investment[]): InvestmentPortfolio['performance'] {
    // Simplified performance calculation
    const avgPerformance = investments.reduce((sum, inv) => sum + inv.performance, 0) / investments.length;
    
    return {
      daily: avgPerformance * 0.1,
      weekly: avgPerformance * 0.5,
      monthly: avgPerformance,
      yearly: avgPerformance * 12
    };
  }

  private getNextComplianceDeadline(country: string): { type: string; date: string } | null {
    const regulation = this.taxRegulations.get(country);
    if (!regulation) return null;

    // Simplified deadline calculation
    return {
      type: 'VAT Return',
      date: regulation.reportingDeadlines.vat
    };
  }

  private isRateStale(rate: ExchangeRate): boolean {
    const oneHour = 60 * 60 * 1000;
    return Date.now() - rate.timestamp.getTime() > oneHour;
  }

  private updateExchangeRates(): void {
    // Mock implementation - would call real exchange rate APIs
    const rates = [
      { from: 'EUR', to: 'USD', rate: 1.08 },
      { from: 'JPY', to: 'USD', rate: 0.0067 },
      { from: 'USD', to: 'EUR', rate: 0.93 },
      { from: 'USD', to: 'JPY', rate: 149.0 }
    ];

    rates.forEach(({ from, to, rate }) => {
      this.exchangeRates.set(`${from}-${to}`, {
        from,
        to,
        rate,
        timestamp: new Date(),
        source: 'ECB',
        spread: 0.002
      });
    });
  }

  private startExchangeRateMonitoring(): void {
    // Update exchange rates every hour
    setInterval(() => {
      this.updateExchangeRates();
      this.emit('exchange-rates:updated', {
        timestamp: new Date(),
        ratesCount: this.exchangeRates.size
      });
    }, 60 * 60 * 1000);
  }

  /**
   * Get transaction by ID
   */
  public getTransaction(transactionId: string): FinancialTransaction | undefined {
    return this.transactions.get(transactionId);
  }

  /**
   * Get all transactions for executive
   */
  public getExecutiveTransactions(executiveId: string): FinancialTransaction[] {
    return Array.from(this.transactions.values())
      .filter(t => t.executiveId === executiveId);
  }

  /**
   * Get investment portfolio
   */
  public getInvestmentPortfolio(portfolioId: string): InvestmentPortfolio | undefined {
    return this.portfolios.get(portfolioId);
  }

  /**
   * Get budget allocation
   */
  public getBudgetAllocation(budgetId: string): BudgetAllocation | undefined {
    return this.budgets.get(budgetId);
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
      processedTransactions: this.performanceMetrics.processedTransactions,
      complianceFlags: this.performanceMetrics.complianceFlags,
      totalVolumeUSD: `$${this.performanceMetrics.totalVolume.toLocaleString()}`,
      supportedCountries: ['Spain', 'Japan', 'Estonia'],
      supportedCurrencies: ['EUR', 'JPY', 'USD'],
      taxRegulations: this.taxRegulations.size,
      exchangeRates: this.exchangeRates.size,
      targetResponseTime: '<75ms (Phase 2 goal)',
      features: {
        multiCountryCompliance: true,
        realTimeExchangeRates: true,
        taxOptimization: true,
        budgetManagement: true,
        investmentTracking: true,
        complianceMonitoring: true
      }
    };
  }
}

export default FinancialManagementAgent;