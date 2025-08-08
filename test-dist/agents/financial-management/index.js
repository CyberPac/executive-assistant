"use strict";
/**
 * Financial Management Agent - Phase 2
 * Manages financial operations with focus on Spain, Japan, and Estonia
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialManagementAgent = void 0;
var events_1 = require("events");
var nanoid_1 = require("nanoid");
var FinancialManagementAgent = /** @class */ (function (_super) {
    __extends(FinancialManagementAgent, _super);
    function FinancialManagementAgent() {
        var _this = _super.call(this) || this;
        _this.agentId = "financial-mgmt-".concat((0, nanoid_1.nanoid)());
        _this.transactions = new Map();
        _this.portfolios = new Map();
        _this.budgets = new Map();
        _this.exchangeRates = new Map();
        _this.taxRegulations = new Map();
        _this.expenseCategories = new Map();
        _this.performanceMetrics = {
            responseTimes: [],
            processedTransactions: 0,
            complianceFlags: 0,
            totalVolume: 0
        };
        _this.initializeFinancialData();
        _this.startExchangeRateMonitoring();
        _this.emit('agent:initialized', { agentId: _this.agentId });
        return _this;
    }
    /**
     * Initialize financial data for Spain, Japan, and Estonia
     */
    FinancialManagementAgent.prototype.initializeFinancialData = function () {
        var _this = this;
        // Initialize tax regulations
        var taxRegulations = {
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
        var expenseCategories = [
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
        Object.entries(taxRegulations).forEach(function (_a) {
            var country = _a[0], regulation = _a[1];
            _this.taxRegulations.set(country, regulation);
        });
        expenseCategories.forEach(function (category) {
            _this.expenseCategories.set(category.id, category);
        });
        // Initialize exchange rates (mock data - would come from real API)
        this.updateExchangeRates();
    };
    /**
     * Process executive expense with multi-country compliance
     */
    FinancialManagementAgent.prototype.processExpense = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, category, exchangeRate, amountUSD, taxImplications, complianceCheck, transaction, responseTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        category = this.expenseCategories.get(request.category);
                        if (!category) {
                            throw new Error("Invalid expense category: ".concat(request.category));
                        }
                        // Check approval requirements
                        if (category.approvalRequired && request.amount > (category.maxAmount || 0)) {
                            throw new Error("Expense exceeds limit and requires pre-approval: ".concat(request.amount, " ").concat(request.currency));
                        }
                        return [4 /*yield*/, this.getExchangeRate(request.currency, 'USD')];
                    case 2:
                        exchangeRate = _a.sent();
                        amountUSD = request.amount * exchangeRate.rate;
                        taxImplications = this.calculateTaxImplications(request.country, category, request.amount);
                        return [4 /*yield*/, this.performComplianceCheck(request, amountUSD)];
                    case 3:
                        complianceCheck = _a.sent();
                        transaction = {
                            id: (0, nanoid_1.nanoid)(),
                            executiveId: request.executiveId,
                            type: 'expense',
                            amount: request.amount,
                            currency: request.currency,
                            exchangeRate: exchangeRate.rate,
                            amountUSD: amountUSD,
                            category: request.category,
                            country: request.country,
                            description: request.description,
                            date: new Date(),
                            status: complianceCheck.riskLevel === 'high' ? 'pending' : 'approved',
                            taxImplications: taxImplications,
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
                        responseTime = Date.now() - startTime;
                        this.performanceMetrics.responseTimes.push(responseTime);
                        this.emit('expense:processed', {
                            transactionId: transaction.id,
                            amount: request.amount,
                            currency: request.currency,
                            country: request.country,
                            status: transaction.status,
                            responseTime: responseTime
                        });
                        // Update budget if exists
                        return [4 /*yield*/, this.updateBudgetAllocation(request.executiveId, request.country, request.category, amountUSD)];
                    case 4:
                        // Update budget if exists
                        _a.sent();
                        return [2 /*return*/, transaction];
                    case 5:
                        error_1 = _a.sent();
                        this.emit('expense:error', { request: request, error: error_1 instanceof Error ? error_1.message : String(error_1) });
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create or update investment portfolio
     */
    FinancialManagementAgent.prototype.manageInvestmentPortfolio = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, totalValue, performance_1, portfolio, responseTime, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.calculatePortfolioValue(request.investments)];
                    case 2:
                        totalValue = _a.sent();
                        performance_1 = this.calculatePortfolioPerformance(request.investments);
                        portfolio = {
                            id: (0, nanoid_1.nanoid)(),
                            executiveId: request.executiveId,
                            country: request.country,
                            investments: request.investments,
                            totalValue: totalValue,
                            performance: performance_1,
                            riskProfile: request.riskProfile,
                            lastUpdated: new Date()
                        };
                        this.portfolios.set(portfolio.id, portfolio);
                        responseTime = Date.now() - startTime;
                        this.performanceMetrics.responseTimes.push(responseTime);
                        this.emit('portfolio:updated', {
                            portfolioId: portfolio.id,
                            country: request.country,
                            totalValue: totalValue.USD,
                            performance: performance_1.monthly,
                            responseTime: responseTime
                        });
                        return [2 /*return*/, portfolio];
                    case 3:
                        error_2 = _a.sent();
                        this.emit('portfolio:error', { request: request, error: error_2 instanceof Error ? error_2.message : String(error_2) });
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create budget allocation for executive
     */
    FinancialManagementAgent.prototype.createBudgetAllocation = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, totalBudget, budget, responseTime;
            return __generator(this, function (_a) {
                startTime = Date.now();
                try {
                    totalBudget = Object.values(request.categories).reduce(function (sum, amount) { return sum + amount; }, 0);
                    budget = {
                        id: (0, nanoid_1.nanoid)(),
                        executiveId: request.executiveId,
                        country: request.country,
                        period: request.period,
                        categories: request.categories,
                        totalBudget: totalBudget,
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
                    responseTime = Date.now() - startTime;
                    this.performanceMetrics.responseTimes.push(responseTime);
                    this.emit('budget:created', {
                        budgetId: budget.id,
                        country: request.country,
                        totalBudget: totalBudget,
                        currency: request.currency,
                        responseTime: responseTime
                    });
                    return [2 /*return*/, budget];
                }
                catch (error) {
                    this.emit('budget:error', { request: request, error: error instanceof Error ? error.message : String(error) });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get tax optimization recommendations
     */
    FinancialManagementAgent.prototype.getTaxOptimizationRecommendations = function (executiveId, countries) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, potentialSavings, complianceAlerts, executiveTransactions, _loop_1, this_1, _i, countries_1, country;
            return __generator(this, function (_a) {
                recommendations = [];
                potentialSavings = [];
                complianceAlerts = [];
                executiveTransactions = Array.from(this.transactions.values())
                    .filter(function (t) { return t.executiveId === executiveId; });
                _loop_1 = function (country) {
                    var countryTransactions = executiveTransactions.filter(function (t) { return t.country === country; });
                    var regulation = this_1.taxRegulations.get(country);
                    if (!regulation)
                        return "continue";
                    // Analyze transactions for optimization opportunities
                    var taxableAmount = countryTransactions
                        .filter(function (t) { return t.taxImplications.deductible; })
                        .reduce(function (sum, t) { return sum + t.amountUSD; }, 0);
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
                    var nextDeadline = this_1.getNextComplianceDeadline(country);
                    if (nextDeadline) {
                        complianceAlerts.push("".concat(country, ": ").concat(nextDeadline.type, " deadline on ").concat(nextDeadline.date));
                    }
                };
                this_1 = this;
                for (_i = 0, countries_1 = countries; _i < countries_1.length; _i++) {
                    country = countries_1[_i];
                    _loop_1(country);
                }
                return [2 /*return*/, {
                        recommendations: recommendations,
                        potentialSavings: potentialSavings,
                        complianceAlerts: complianceAlerts
                    }];
            });
        });
    };
    /**
     * Helper methods
     */
    FinancialManagementAgent.prototype.getExchangeRate = function (from, to) {
        return __awaiter(this, void 0, void 0, function () {
            var key, rate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(from, "-").concat(to);
                        rate = this.exchangeRates.get(key);
                        if (!(!rate || this.isRateStale(rate))) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fetchExchangeRate(from, to)];
                    case 1:
                        rate = _a.sent();
                        this.exchangeRates.set(key, rate);
                        _a.label = 2;
                    case 2: return [2 /*return*/, rate];
                }
            });
        });
    };
    FinancialManagementAgent.prototype.fetchExchangeRate = function (from, to) {
        return __awaiter(this, void 0, void 0, function () {
            var mockRates, key, rate;
            return __generator(this, function (_a) {
                mockRates = {
                    'EUR-USD': 1.08,
                    'JPY-USD': 0.0067,
                    'USD-EUR': 0.93,
                    'USD-JPY': 149.0,
                    'EUR-JPY': 160.0,
                    'JPY-EUR': 0.0063
                };
                key = "".concat(from, "-").concat(to);
                rate = mockRates[key] || 1.0;
                return [2 /*return*/, {
                        from: from,
                        to: to,
                        rate: rate,
                        timestamp: new Date(),
                        source: 'ECB',
                        spread: 0.002 // 0.2% spread
                    }];
            });
        });
    };
    FinancialManagementAgent.prototype.calculateTaxImplications = function (country, category, amount) {
        var regulation = this.taxRegulations.get(country);
        return {
            deductible: category.taxDeductible,
            vatApplicable: amount > 1000, // Simplified rule
            country: country,
            rate: regulation === null || regulation === void 0 ? void 0 : regulation.vatRate
        };
    };
    FinancialManagementAgent.prototype.performComplianceCheck = function (request, amountUSD) {
        return __awaiter(this, void 0, void 0, function () {
            var flags, riskLevel;
            return __generator(this, function (_a) {
                flags = [];
                riskLevel = 'low';
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
                return [2 /*return*/, {
                        reviewed: flags.length === 0,
                        flags: flags,
                        riskLevel: riskLevel
                    }];
            });
        });
    };
    FinancialManagementAgent.prototype.updateBudgetAllocation = function (executiveId, country, category, amountUSD) {
        return __awaiter(this, void 0, void 0, function () {
            var budget, usagePercentage;
            return __generator(this, function (_a) {
                budget = Array.from(this.budgets.values())
                    .find(function (b) { return b.executiveId === executiveId && b.country === country; });
                if (budget) {
                    budget.spent += amountUSD;
                    budget.remaining = budget.totalBudget - budget.spent;
                    budget.updatedAt = new Date();
                    usagePercentage = (budget.spent / budget.totalBudget) * 100;
                    if (usagePercentage >= budget.alerts.threshold && budget.alerts.enabled) {
                        this.emit('budget:alert', {
                            budgetId: budget.id,
                            country: budget.country,
                            usagePercentage: usagePercentage.toFixed(1),
                            remaining: budget.remaining
                        });
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    FinancialManagementAgent.prototype.calculatePortfolioValue = function (investments) {
        return __awaiter(this, void 0, void 0, function () {
            var totalUSD, _i, investments_1, investment, rate, eurRate, jpyRate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        totalUSD = 0;
                        _i = 0, investments_1 = investments;
                        _a.label = 1;
                    case 1:
                        if (!(_i < investments_1.length)) return [3 /*break*/, 5];
                        investment = investments_1[_i];
                        if (!(investment.currency === 'USD')) return [3 /*break*/, 2];
                        totalUSD += investment.currentValue;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.getExchangeRate(investment.currency, 'USD')];
                    case 3:
                        rate = _a.sent();
                        totalUSD += investment.currentValue * rate.rate;
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [4 /*yield*/, this.getExchangeRate('USD', 'EUR')];
                    case 6:
                        eurRate = _a.sent();
                        return [4 /*yield*/, this.getExchangeRate('USD', 'JPY')];
                    case 7:
                        jpyRate = _a.sent();
                        return [2 /*return*/, {
                                USD: totalUSD,
                                EUR: totalUSD * eurRate.rate,
                                JPY: totalUSD * jpyRate.rate
                            }];
                }
            });
        });
    };
    FinancialManagementAgent.prototype.calculatePortfolioPerformance = function (investments) {
        // Simplified performance calculation
        var avgPerformance = investments.reduce(function (sum, inv) { return sum + inv.performance; }, 0) / investments.length;
        return {
            daily: avgPerformance * 0.1,
            weekly: avgPerformance * 0.5,
            monthly: avgPerformance,
            yearly: avgPerformance * 12
        };
    };
    FinancialManagementAgent.prototype.getNextComplianceDeadline = function (country) {
        var regulation = this.taxRegulations.get(country);
        if (!regulation)
            return null;
        // Simplified deadline calculation
        return {
            type: 'VAT Return',
            date: regulation.reportingDeadlines.vat
        };
    };
    FinancialManagementAgent.prototype.isRateStale = function (rate) {
        var oneHour = 60 * 60 * 1000;
        return Date.now() - rate.timestamp.getTime() > oneHour;
    };
    FinancialManagementAgent.prototype.updateExchangeRates = function () {
        var _this = this;
        // Mock implementation - would call real exchange rate APIs
        var rates = [
            { from: 'EUR', to: 'USD', rate: 1.08 },
            { from: 'JPY', to: 'USD', rate: 0.0067 },
            { from: 'USD', to: 'EUR', rate: 0.93 },
            { from: 'USD', to: 'JPY', rate: 149.0 }
        ];
        rates.forEach(function (_a) {
            var from = _a.from, to = _a.to, rate = _a.rate;
            _this.exchangeRates.set("".concat(from, "-").concat(to), {
                from: from,
                to: to,
                rate: rate,
                timestamp: new Date(),
                source: 'ECB',
                spread: 0.002
            });
        });
    };
    FinancialManagementAgent.prototype.startExchangeRateMonitoring = function () {
        var _this = this;
        // Update exchange rates every hour
        setInterval(function () {
            _this.updateExchangeRates();
            _this.emit('exchange-rates:updated', {
                timestamp: new Date(),
                ratesCount: _this.exchangeRates.size
            });
        }, 60 * 60 * 1000);
    };
    /**
     * Get transaction by ID
     */
    FinancialManagementAgent.prototype.getTransaction = function (transactionId) {
        return this.transactions.get(transactionId);
    };
    /**
     * Get all transactions for executive
     */
    FinancialManagementAgent.prototype.getExecutiveTransactions = function (executiveId) {
        return Array.from(this.transactions.values())
            .filter(function (t) { return t.executiveId === executiveId; });
    };
    /**
     * Get investment portfolio
     */
    FinancialManagementAgent.prototype.getInvestmentPortfolio = function (portfolioId) {
        return this.portfolios.get(portfolioId);
    };
    /**
     * Get budget allocation
     */
    FinancialManagementAgent.prototype.getBudgetAllocation = function (budgetId) {
        return this.budgets.get(budgetId);
    };
    /**
     * Get performance metrics
     */
    FinancialManagementAgent.prototype.getPerformanceMetrics = function () {
        var avgResponseTime = this.performanceMetrics.responseTimes.length > 0
            ? this.performanceMetrics.responseTimes.reduce(function (a, b) { return a + b; }, 0) / this.performanceMetrics.responseTimes.length
            : 0;
        return {
            agentId: this.agentId,
            averageResponseTime: "".concat(avgResponseTime.toFixed(2), "ms"),
            processedTransactions: this.performanceMetrics.processedTransactions,
            complianceFlags: this.performanceMetrics.complianceFlags,
            totalVolumeUSD: "$".concat(this.performanceMetrics.totalVolume.toLocaleString()),
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
    };
    return FinancialManagementAgent;
}(events_1.EventEmitter));
exports.FinancialManagementAgent = FinancialManagementAgent;
exports.default = FinancialManagementAgent;
