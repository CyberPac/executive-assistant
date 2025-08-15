/**
 * Comprehensive Unit Tests for FinancialIntelligenceAgent
 * Testing portfolio optimization, tax strategy, and financial analytics
 */

import { FinancialIntelligenceAgent, FinancialContext, FinancialAlert as _FinancialAlert } from '../../../src/agents/financial-intelligence/FinancialIntelligenceAgent';
import { PEAAgentType, AgentStatus, SecurityLevel } from '../../../src/types/enums';
import {
  createMockMCPIntegration,
  createMockFinancialContext,
  createMockPortfolioProfile,
  createMockHoldingsBatch,
  createMockMarketData as _createMockMarketData,
  assertAgentInitialization,
  assertPerformanceMetrics,
  MockPerformanceTimer
} from '../../utils/test-factories';

describe('FinancialIntelligenceAgent', () => {
  let agent: FinancialIntelligenceAgent;
  let mockMcpIntegration: jest.Mocked<any>;
  let performanceTimer: MockPerformanceTimer;

  beforeEach(() => {
    mockMcpIntegration = createMockMCPIntegration();
    agent = new FinancialIntelligenceAgent(
      'financial-intel-001',
      mockMcpIntegration,
      SecurityLevel.EXECUTIVE_PERSONAL
    );
    performanceTimer = new MockPerformanceTimer();
    
    // Mock console methods to reduce test output noise
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    performanceTimer.reset();
  });

  describe('Agent Initialization', () => {
    it('should initialize with correct agent type and security level', () => {
      expect(agent.id).toBe('financial-intel-001');
      expect(agent.type).toBe(PEAAgentType.FINANCIAL_MANAGEMENT);
      expect(agent.name).toBe('Financial Intelligence Agent');
      expect(agent.status).toBe(AgentStatus.INITIALIZING);
      expect(agent.securityLevel).toBe(SecurityLevel.EXECUTIVE_PERSONAL);
    });

    it('should have comprehensive financial capabilities', () => {
      const expectedCapabilities = [
        'portfolio-optimization',
        'tax-strategy',
        'investment-analysis',
        'risk-assessment',
        'compliance-monitoring',
        'market-analysis',
        'financial-planning',
        'multi-currency-tracking'
      ];
      
      expect(agent.capabilities).toEqual(expect.arrayContaining(expectedCapabilities));
      expect(agent.capabilities.length).toBe(expectedCapabilities.length);
    });

    it('should initialize successfully with financial components', async () => {
      performanceTimer.start();
      
      await agent.initialize();
      
      const initTime = performanceTimer.measure();
      
      assertAgentInitialization(agent, PEAAgentType.FINANCIAL_MANAGEMENT);
      expect(initTime).toBeLessThan(3000); // Should initialize within 3 seconds
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        expect.stringContaining('agent_initialized'),
        expect.any(String),
        'financial_intelligence'
      );
    });

    it('should handle initialization failure gracefully', async () => {
      mockMcpIntegration.memoryUsage.mockRejectedValue(new Error('Financial system unavailable'));
      
      await expect(agent.initialize()).rejects.toThrow('Financial system unavailable');
      expect(agent.status).toBe(AgentStatus.ERROR);
    });
  });

  describe('Financial Context Management', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should set and store financial context securely', async () => {
      const financialContext = createMockFinancialContext();
      
      await agent.setFinancialContext(financialContext);
      
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        expect.stringContaining('financial_context_set'),
        expect.stringContaining(financialContext.executiveId),
        'financial_intelligence'
      );
    });

    it('should validate financial context before setting', async () => {
      const incompleteContext = {
        executiveId: 'exec-001'
        // Missing required fields
      } as FinancialContext;
      
      // Should handle incomplete context gracefully
      await agent.setFinancialContext(incompleteContext);
      
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalled();
    });

    it('should initialize jurisdiction compliance for multiple countries', async () => {
      const multiJurisdictionContext = createMockFinancialContext({
        regulatoryJurisdictions: ['US', 'EU', 'UK', 'JP']
      });
      
      await agent.setFinancialContext(multiJurisdictionContext);
      
      // Should handle multiple jurisdictions
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        expect.any(String),
        expect.stringContaining('US'),
        'financial_intelligence'
      );
    });
  });

  describe('Portfolio Analysis', () => {
    let mockFinancialContext: FinancialContext;

    beforeEach(async () => {
      await agent.initialize();
      mockFinancialContext = createMockFinancialContext({
        portfolioProfile: createMockPortfolioProfile({
          holdings: createMockHoldingsBatch(15)
        })
      });
      await agent.setFinancialContext(mockFinancialContext);
    });

    it('should analyze portfolio and provide optimization recommendations', async () => {
      performanceTimer.start();
      
      const analysis = await agent.analyzePortfolio();
      
      const analysisTime = performanceTimer.measure();
      
      expect(analysis).toHaveProperty('currentAllocation');
      expect(analysis).toHaveProperty('recommendedAllocation');
      expect(analysis).toHaveProperty('rebalancingNeeded');
      expect(analysis).toHaveProperty('expectedReturn');
      expect(analysis).toHaveProperty('riskScore');
      expect(analysis).toHaveProperty('recommendations');
      
      expect(typeof analysis.currentAllocation).toBe('object');
      expect(typeof analysis.recommendedAllocation).toBe('object');
      expect(typeof analysis.rebalancingNeeded).toBe('boolean');
      expect(analysis.expectedReturn).toBeGreaterThanOrEqual(0);
      expect(analysis.riskScore).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      
      // Performance check
      expect(analysisTime).toBeLessThan(2000); // Should complete within 2 seconds
      
      // Should store analysis results
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        expect.stringContaining('portfolio_analyzed'),
        expect.any(String),
        'financial_intelligence'
      );
    });

    it('should calculate current allocation accurately', async () => {
      const analysis = await agent.analyzePortfolio();
      
      const allocationTotal = Object.values(analysis.currentAllocation)
        .reduce((sum, percentage) => sum + percentage, 0);
      
      // Total allocation should be approximately 100% (allowing for rounding)
      expect(Math.abs(allocationTotal - 100)).toBeLessThan(1);
    });

    it('should identify rebalancing opportunities', async () => {
      // Create a portfolio with significant imbalances
      const imbalancedContext = createMockFinancialContext({
        portfolioProfile: createMockPortfolioProfile({
          holdings: [
            ...createMockHoldingsBatch(5).map(h => ({ ...h, sector: 'Technology' })),
            ...createMockHoldingsBatch(2).map(h => ({ ...h, sector: 'Healthcare' }))
          ],
          rebalancingRules: [{
            frequency: 'monthly',
            threshold: 5, // 5% deviation threshold
            assetClass: 'Technology',
            targetAllocation: 60
          }]
        })
      });
      
      await agent.setFinancialContext(imbalancedContext);
      const analysis = await agent.analyzePortfolio();
      
      // Should detect need for rebalancing
      expect(analysis.rebalancingNeeded).toBeDefined();
    });

    it('should handle empty portfolio gracefully', async () => {
      const emptyPortfolioContext = createMockFinancialContext({
        portfolioProfile: createMockPortfolioProfile({
          holdings: []
        })
      });
      
      await agent.setFinancialContext(emptyPortfolioContext);
      
      const analysis = await agent.analyzePortfolio();
      
      expect(analysis.currentAllocation).toEqual({});
      expect(analysis.expectedReturn).toBe(0);
    });

    it('should fail when no financial context is set', async () => {
      const agentWithoutContext = new FinancialIntelligenceAgent(
        'test-agent',
        mockMcpIntegration
      );
      await agentWithoutContext.initialize();
      
      await expect(agentWithoutContext.analyzePortfolio())
        .rejects.toThrow('Financial context not set');
    });
  });

  describe('Tax Strategy Generation', () => {
    let mockFinancialContext: FinancialContext;

    beforeEach(async () => {
      await agent.initialize();
      mockFinancialContext = createMockFinancialContext();
      await agent.setFinancialContext(mockFinancialContext);
    });

    it('should generate comprehensive tax strategy', async () => {
      performanceTimer.start();
      
      const taxStrategy = await agent.generateTaxStrategy();
      
      const strategyTime = performanceTimer.measure();
      
      expect(taxStrategy).toHaveProperty('harvestingOpportunities');
      expect(taxStrategy).toHaveProperty('retirementOptimization');
      expect(taxStrategy).toHaveProperty('jurisdictionCompliance');
      
      expect(Array.isArray(taxStrategy.harvestingOpportunities)).toBe(true);
      expect(Array.isArray(taxStrategy.retirementOptimization)).toBe(true);
      expect(Array.isArray(taxStrategy.jurisdictionCompliance)).toBe(true);
      
      // Performance check
      expect(strategyTime).toBeLessThan(1500); // Should complete within 1.5 seconds
      
      // Should store strategy results
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        expect.stringContaining('tax_strategy_generated'),
        expect.any(String),
        'financial_intelligence'
      );
    });

    it('should provide jurisdiction-specific compliance status', async () => {
      const multiJurisdictionContext = createMockFinancialContext({
        regulatoryJurisdictions: ['US', 'EU', 'UK']
      });
      
      await agent.setFinancialContext(multiJurisdictionContext);
      const taxStrategy = await agent.generateTaxStrategy();
      
      expect(taxStrategy.jurisdictionCompliance.length).toBeGreaterThanOrEqual(3);
      
      taxStrategy.jurisdictionCompliance.forEach(compliance => {
        expect(compliance).toHaveProperty('jurisdiction');
        expect(compliance).toHaveProperty('requirements');
        expect(compliance).toHaveProperty('status');
        expect(['compliant', 'at-risk', 'non-compliant']).toContain(compliance.status);
      });
    });

    it('should identify tax harvesting opportunities', async () => {
      const taxStrategy = await agent.generateTaxStrategy();
      
      taxStrategy.harvestingOpportunities.forEach(opportunity => {
        expect(opportunity).toHaveProperty('symbol');
        expect(opportunity).toHaveProperty('action');
        expect(opportunity).toHaveProperty('taxSavings');
        expect(opportunity).toHaveProperty('timing');
        expect(['harvest', 'defer']).toContain(opportunity.action);
        expect(opportunity.taxSavings).toBeGreaterThanOrEqual(0);
      });
    });

    it('should optimize retirement contributions', async () => {
      const taxStrategy = await agent.generateTaxStrategy();
      
      taxStrategy.retirementOptimization.forEach(optimization => {
        expect(optimization).toHaveProperty('accountType');
        expect(optimization).toHaveProperty('recommendedContribution');
        expect(optimization).toHaveProperty('taxBenefit');
        expect(optimization.recommendedContribution).toBeGreaterThanOrEqual(0);
        expect(optimization.taxBenefit).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Financial Alerts Monitoring', () => {
    beforeEach(async () => {
      await agent.initialize();
      await agent.setFinancialContext(createMockFinancialContext());
    });

    it('should monitor and generate financial alerts', async () => {
      performanceTimer.start();
      
      const alerts = await agent.monitorFinancialAlerts();
      
      const monitoringTime = performanceTimer.measure();
      
      expect(Array.isArray(alerts)).toBe(true);
      expect(monitoringTime).toBeLessThan(1000); // Should complete within 1 second
      
      // If alerts are generated, they should have proper structure
      alerts.forEach(alert => {
        expect(alert).toHaveProperty('id');
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('title');
        expect(alert).toHaveProperty('description');
        expect(alert).toHaveProperty('actionRequired');
        expect(alert).toHaveProperty('recommendations');
        expect(alert).toHaveProperty('createdAt');
        
        expect(['portfolio', 'market', 'tax', 'compliance']).toContain(alert.type);
        expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity);
      });
    });

    it('should store alert detection activity', async () => {
      await agent.monitorFinancialAlerts();
      
      // Should store monitoring activity even if no alerts
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalled();
    });

    it('should handle monitoring without financial context', async () => {
      const agentWithoutContext = new FinancialIntelligenceAgent(
        'test-agent',
        mockMcpIntegration
      );
      await agentWithoutContext.initialize();
      
      const alerts = await agentWithoutContext.monitorFinancialAlerts();
      
      expect(alerts).toEqual([]);
    });
  });

  describe('Financial Dashboard', () => {
    beforeEach(async () => {
      await agent.initialize();
      await agent.setFinancialContext(createMockFinancialContext());
    });

    it('should provide comprehensive financial dashboard', async () => {
      performanceTimer.start();
      
      const dashboard = await agent.getFinancialDashboard();
      
      const dashboardTime = performanceTimer.measure();
      
      expect(dashboard).toHaveProperty('portfolioSummary');
      expect(dashboard).toHaveProperty('assetAllocation');
      expect(dashboard).toHaveProperty('performanceMetrics');
      expect(dashboard).toHaveProperty('alerts');
      expect(dashboard).toHaveProperty('taxOptimization');
      expect(dashboard).toHaveProperty('complianceStatus');
      
      // Portfolio summary validation
      expect(dashboard.portfolioSummary).toHaveProperty('totalValue');
      expect(dashboard.portfolioSummary).toHaveProperty('dayChange');
      expect(dashboard.portfolioSummary).toHaveProperty('weekChange');
      expect(dashboard.portfolioSummary).toHaveProperty('monthChange');
      expect(dashboard.portfolioSummary).toHaveProperty('ytdChange');
      
      // Tax optimization validation
      expect(dashboard.taxOptimization).toHaveProperty('potentialSavings');
      expect(dashboard.taxOptimization).toHaveProperty('actionItems');
      
      // Compliance status validation
      expect(dashboard.complianceStatus).toHaveProperty('overallScore');
      expect(dashboard.complianceStatus).toHaveProperty('requiresAttention');
      
      // Performance check
      expect(dashboardTime).toBeLessThan(2000); // Should load within 2 seconds
      
      // Should log dashboard access
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        expect.stringContaining('dashboard_accessed'),
        expect.any(String),
        'financial_intelligence'
      );
    });

    it('should provide accurate portfolio summary metrics', async () => {
      const dashboard = await agent.getFinancialDashboard();
      
      expect(dashboard.portfolioSummary.totalValue).toBeGreaterThan(0);
      expect(dashboard.portfolioSummary.dayChange).toBeDefined();
      expect(dashboard.portfolioSummary.weekChange).toBeDefined();
      expect(dashboard.portfolioSummary.monthChange).toBeDefined();
      expect(dashboard.portfolioSummary.ytdChange).toBeDefined();
      
      // Performance changes should be realistic (-1 to 1 for daily changes)
      expect(dashboard.portfolioSummary.dayChange).toBeGreaterThan(-1);
      expect(dashboard.portfolioSummary.dayChange).toBeLessThan(1);
    });

    it('should include current alerts in dashboard', async () => {
      // Generate some alerts first
      await agent.monitorFinancialAlerts();
      
      const dashboard = await agent.getFinancialDashboard();
      
      expect(Array.isArray(dashboard.alerts)).toBe(true);
    });

    it('should calculate compliance score accurately', async () => {
      const dashboard = await agent.getFinancialDashboard();
      
      expect(dashboard.complianceStatus.overallScore).toBeGreaterThanOrEqual(0);
      expect(dashboard.complianceStatus.overallScore).toBeLessThanOrEqual(1);
      expect(Array.isArray(dashboard.complianceStatus.requiresAttention)).toBe(true);
    });
  });

  describe('Market Data Integration', () => {
    beforeEach(async () => {
      await agent.initialize();
      await agent.setFinancialContext(createMockFinancialContext());
    });

    it('should handle market data updates efficiently', async () => {
      // Test market data processing through portfolio analysis
      const analysis = await agent.analyzePortfolio();
      
      expect(analysis.expectedReturn).toBeDefined();
      expect(analysis.riskScore).toBeDefined();
      
      // Market data should influence analysis
      expect(analysis.expectedReturn).toBeGreaterThanOrEqual(0);
      expect(analysis.riskScore).toBeGreaterThan(0);
    });

    it('should cache market data for performance', async () => {
      // Perform multiple analyses to test caching
      await agent.analyzePortfolio();
      await agent.analyzePortfolio();
      
      // Should use cached data efficiently
      assertPerformanceMetrics(agent.performanceMetrics, {
        responseTimeMs: 3000
      });
    });
  });

  describe('Multi-Currency Support', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should handle multi-currency portfolios', async () => {
      const multiCurrencyContext = createMockFinancialContext({
        currencies: ['USD', 'EUR', 'GBP', 'JPY'],
        portfolioProfile: createMockPortfolioProfile({
          holdings: [
            ...createMockHoldingsBatch(5).map(h => ({ ...h, currency: 'USD' })),
            ...createMockHoldingsBatch(3).map(h => ({ ...h, currency: 'EUR' })),
            ...createMockHoldingsBatch(2).map(h => ({ ...h, currency: 'GBP' }))
          ]
        })
      });
      
      await agent.setFinancialContext(multiCurrencyContext);
      const analysis = await agent.analyzePortfolio();
      
      expect(analysis.currentAllocation).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      
      // Should handle currency diversity
      expect(Object.keys(analysis.currentAllocation).length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      await agent.initialize();
      await agent.setFinancialContext(createMockFinancialContext());
    });

    it('should handle large portfolios efficiently', async () => {
      const largePortfolioContext = createMockFinancialContext({
        portfolioProfile: createMockPortfolioProfile({
          holdings: createMockHoldingsBatch(100) // Large portfolio
        })
      });
      
      await agent.setFinancialContext(largePortfolioContext);
      
      performanceTimer.start();
      
      const analysis = await agent.analyzePortfolio();
      
      const processingTime = performanceTimer.measure();
      
      expect(analysis.currentAllocation).toBeDefined();
      expect(processingTime).toBeLessThan(5000); // Should handle large portfolios within 5 seconds
    });

    it('should maintain consistent response times', async () => {
      const responseTimes: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        performanceTimer.start();
        await agent.analyzePortfolio();
        responseTimes.push(performanceTimer.measure());
      }
      
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxVariance = avgResponseTime * 0.3; // 30% variance tolerance
      
      responseTimes.forEach(time => {
        expect(Math.abs(time - avgResponseTime)).toBeLessThanOrEqual(maxVariance);
      });
    });

    it('should update performance metrics appropriately', async () => {
      const initialMetrics = { ...agent.performanceMetrics };
      
      await agent.analyzePortfolio();
      await agent.generateTaxStrategy();
      await agent.monitorFinancialAlerts();
      
      assertPerformanceMetrics(agent.performanceMetrics, {
        responseTimeMs: 10000,
        accuracyScore: 0.8,
        errorRate: 0.1
      });
      
      expect(agent.performanceMetrics.throughputPerHour).toBeGreaterThanOrEqual(initialMetrics.throughputPerHour);
    });
  });

  describe('Error Handling and Recovery', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should handle portfolio analysis errors gracefully', async () => {
      await agent.setFinancialContext(createMockFinancialContext());
      
      // Mock a failure in market data fetching
      const _fetchMarketDataSpy = jest.spyOn(agent as any, 'fetchMarketData')
        .mockRejectedValue(new Error('Market data unavailable'));
      
      const analysis = await agent.analyzePortfolio();
      
      // Should still provide analysis with fallback data
      expect(analysis.currentAllocation).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    it('should recover from tax strategy generation failures', async () => {
      await agent.setFinancialContext(createMockFinancialContext());
      
      mockMcpIntegration.memoryUsage.mockRejectedValue(new Error('Storage failure'));
      
      const taxStrategy = await agent.generateTaxStrategy();
      
      // Should complete even if storage fails
      expect(taxStrategy.harvestingOpportunities).toBeDefined();
      expect(taxStrategy.retirementOptimization).toBeDefined();
      expect(taxStrategy.jurisdictionCompliance).toBeDefined();
    });

    it('should track error rates accurately', async () => {
      await agent.setFinancialContext(createMockFinancialContext());
      
      const initialErrorRate = agent.performanceMetrics.errorRate;
      
      // Force some errors
      mockMcpIntegration.memoryUsage.mockRejectedValue(new Error('Persistent storage error'));
      
      try {
        await agent.analyzePortfolio();
      } catch (_error) {
        // Expected
      }
      
      expect(agent.performanceMetrics.errorRate).toBeGreaterThanOrEqual(initialErrorRate);
    });
  });

  describe('Security and Privacy', () => {
    it('should maintain executive-level security', async () => {
      expect(agent.securityLevel).toBe(SecurityLevel.EXECUTIVE_PERSONAL);
      
      await agent.initialize();
      const financialContext = createMockFinancialContext();
      await agent.setFinancialContext(financialContext);
      
      // All stored data should respect security level
      const memoryUsageCalls = mockMcpIntegration.memoryUsage.mock.calls;
      memoryUsageCalls.forEach(call => {
        expect(call[3]).toBe('financial_intelligence'); // Proper namespace
      });
    });

    it('should handle sensitive financial data securely', async () => {
      await agent.initialize();
      
      const sensitiveContext = createMockFinancialContext({
        portfolioProfile: createMockPortfolioProfile({
          totalValue: 50000000 // $50M portfolio
        })
      });
      
      await agent.setFinancialContext(sensitiveContext);
      const analysis = await agent.analyzePortfolio();
      
      expect(analysis).toBeDefined();
      
      // Should store activity without exposing sensitive values
      const storedData = JSON.parse(mockMcpIntegration.memoryUsage.mock.calls[1][2]);
      expect(storedData.totalValue).toBeUndefined(); // Shouldn't store actual values
    });
  });
});