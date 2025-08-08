"use strict";
/**
 * Crisis Management Agent - Phase 2
 * Handles crisis detection, response coordination, and recovery planning
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.CrisisManagementAgent = void 0;
var events_1 = require("events");
var nanoid_1 = require("nanoid");
var CrisisManagementAgent = /** @class */ (function (_super) {
    __extends(CrisisManagementAgent, _super);
    function CrisisManagementAgent() {
        var _this = _super.call(this) || this;
        _this.agentId = "crisis-mgmt-".concat((0, nanoid_1.nanoid)());
        _this.crises = new Map();
        _this.responsePlans = new Map();
        _this.threatAssessments = new Map();
        _this.stakeholders = new Map();
        _this.monitoringSources = new Set();
        _this.performanceMetrics = {
            responseTimes: [],
            crisesHandled: 0,
            averageResolutionTime: 0,
            preventedCrises: 0
        };
        _this.initializeCrisisManagement();
        _this.startThreatMonitoring();
        _this.emit('agent:initialized', { agentId: _this.agentId });
        return _this;
    }
    /**
     * Initialize crisis management system
     */
    CrisisManagementAgent.prototype.initializeCrisisManagement = function () {
        var _this = this;
        // Initialize monitoring sources
        this.monitoringSources.add('news-feeds');
        this.monitoringSources.add('weather-alerts');
        this.monitoringSources.add('market-indicators');
        this.monitoringSources.add('security-feeds');
        this.monitoringSources.add('social-media');
        this.monitoringSources.add('government-alerts');
        // Initialize key stakeholders
        var keyStakeholders = [
            {
                id: 'ceo-001',
                name: 'Chief Executive Officer',
                role: 'CEO',
                department: 'Executive',
                contactInfo: {
                    email: 'ceo@company.com',
                    phone: '+1-555-0001',
                    backup: '+1-555-0002'
                },
                location: 'HQ',
                authority: 'decision-maker',
                availability: 'available'
            },
            {
                id: 'ciso-001',
                name: 'Chief Information Security Officer',
                role: 'CISO',
                department: 'IT Security',
                contactInfo: {
                    email: 'ciso@company.com',
                    phone: '+1-555-0003'
                },
                location: 'HQ',
                authority: 'coordinator',
                availability: 'available'
            },
            {
                id: 'cfo-001',
                name: 'Chief Financial Officer',
                role: 'CFO',
                department: 'Finance',
                contactInfo: {
                    email: 'cfo@company.com',
                    phone: '+1-555-0004'
                },
                location: 'HQ',
                authority: 'advisor',
                availability: 'available'
            }
        ];
        keyStakeholders.forEach(function (stakeholder) {
            _this.stakeholders.set(stakeholder.id, stakeholder);
        });
    };
    /**
     * Detect and report crisis event
     */
    CrisisManagementAgent.prototype.reportCrisis = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, analysis, crisis, responseTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.analyzeCrisisImpact(event)];
                    case 2:
                        analysis = _a.sent();
                        crisis = {
                            id: (0, nanoid_1.nanoid)(),
                            type: event.type,
                            severity: event.severity || analysis.severity,
                            title: event.title,
                            description: event.description,
                            location: event.location,
                            impact: analysis.impact,
                            status: 'detected',
                            priority: this.calculatePriority(analysis.severity, analysis.impact),
                            detectedAt: new Date(),
                            source: event.source,
                            monitoring: true
                        };
                        this.crises.set(crisis.id, crisis);
                        this.performanceMetrics.crisesHandled++;
                        responseTime = Date.now() - startTime;
                        this.performanceMetrics.responseTimes.push(responseTime);
                        this.emit('crisis:detected', {
                            crisisId: crisis.id,
                            type: crisis.type,
                            severity: crisis.severity,
                            location: crisis.location,
                            responseTime: responseTime
                        });
                        if (!(crisis.severity === 'high' || crisis.severity === 'critical')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.createResponsePlan(crisis.id, 'executive-001')];
                    case 3:
                        _a.sent(); // Default executive
                        _a.label = 4;
                    case 4: 
                    // Send immediate notifications
                    return [4 /*yield*/, this.sendCrisisNotifications(crisis)];
                    case 5:
                        // Send immediate notifications
                        _a.sent();
                        return [2 /*return*/, crisis];
                    case 6:
                        error_1 = _a.sent();
                        this.emit('crisis:error', { event: event, error: error_1 instanceof Error ? error_1.message : String(error_1) });
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create comprehensive response plan
     */
    CrisisManagementAgent.prototype.createResponsePlan = function (crisisId, executiveId, customActions) {
        return __awaiter(this, void 0, void 0, function () {
            var crisis, actions, stakeholders, communications, resources, responsePlan;
            return __generator(this, function (_a) {
                crisis = this.crises.get(crisisId);
                if (!crisis) {
                    throw new Error("Crisis not found: ".concat(crisisId));
                }
                actions = customActions || this.generateDefaultActions(crisis);
                stakeholders = this.selectRelevantStakeholders(crisis);
                communications = this.generateCommunicationPlan(crisis);
                resources = this.identifyRequiredResources(crisis);
                responsePlan = {
                    id: (0, nanoid_1.nanoid)(),
                    crisisId: crisisId,
                    executiveId: executiveId,
                    phase: 'immediate',
                    actions: actions,
                    stakeholders: stakeholders,
                    communications: communications,
                    resources: resources,
                    timeline: {
                        startTime: new Date(),
                        estimatedDuration: this.estimateResponseDuration(crisis),
                        milestones: this.generateMilestones(crisis, actions)
                    },
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                this.responsePlans.set(responsePlan.id, responsePlan);
                this.emit('response-plan:created', {
                    planId: responsePlan.id,
                    crisisId: crisisId,
                    actionsCount: actions.length,
                    estimatedDuration: responsePlan.timeline.estimatedDuration
                });
                return [2 /*return*/, responsePlan];
            });
        });
    };
    /**
     * Perform threat assessment for location
     */
    CrisisManagementAgent.prototype.performThreatAssessment = function (executiveId, location) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, threats, overallRiskLevel, recommendations, assessment, responseTime, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.analyzeThreatLandscape(location)];
                    case 2:
                        threats = _a.sent();
                        overallRiskLevel = this.calculateOverallRisk(threats);
                        recommendations = this.generateThreatRecommendations(threats, location);
                        assessment = {
                            id: (0, nanoid_1.nanoid)(),
                            executiveId: executiveId,
                            location: location,
                            threats: threats,
                            overallRiskLevel: overallRiskLevel,
                            recommendations: recommendations,
                            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                            lastUpdated: new Date()
                        };
                        this.threatAssessments.set(assessment.id, assessment);
                        responseTime = Date.now() - startTime;
                        this.performanceMetrics.responseTimes.push(responseTime);
                        this.emit('threat-assessment:completed', {
                            assessmentId: assessment.id,
                            location: location,
                            riskLevel: overallRiskLevel,
                            threatsCount: threats.length,
                            responseTime: responseTime
                        });
                        return [2 /*return*/, assessment];
                    case 3:
                        error_2 = _a.sent();
                        this.emit('threat-assessment:error', { executiveId: executiveId, location: location, error: error_2 instanceof Error ? error_2.message : String(error_2) });
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update crisis status
     */
    CrisisManagementAgent.prototype.updateCrisisStatus = function (crisisId, status, notes) {
        return __awaiter(this, void 0, void 0, function () {
            var crisis, previousStatus, resolutionTime;
            return __generator(this, function (_a) {
                crisis = this.crises.get(crisisId);
                if (!crisis) {
                    throw new Error("Crisis not found: ".concat(crisisId));
                }
                previousStatus = crisis.status;
                crisis.status = status;
                if (status === 'confirmed' && !crisis.confirmedAt) {
                    crisis.confirmedAt = new Date();
                }
                if (status === 'resolved' && !crisis.resolvedAt) {
                    crisis.resolvedAt = new Date();
                    crisis.monitoring = false;
                    resolutionTime = crisis.resolvedAt.getTime() - crisis.detectedAt.getTime();
                    this.updateResolutionMetrics(resolutionTime);
                }
                this.emit('crisis:status-updated', {
                    crisisId: crisisId,
                    previousStatus: previousStatus,
                    newStatus: status,
                    notes: notes
                });
                return [2 /*return*/, crisis];
            });
        });
    };
    /**
     * Execute response action
     */
    CrisisManagementAgent.prototype.executeAction = function (planId, actionId, assignee) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, action, blockedByDependencies;
            return __generator(this, function (_a) {
                plan = this.responsePlans.get(planId);
                if (!plan) {
                    throw new Error("Response plan not found: ".concat(planId));
                }
                action = plan.actions.find(function (a) { return a.id === actionId; });
                if (!action) {
                    throw new Error("Action not found: ".concat(actionId));
                }
                blockedByDependencies = action.dependencies.some(function (depId) {
                    var dependency = plan.actions.find(function (a) { return a.id === depId; });
                    return dependency && dependency.status !== 'completed';
                });
                if (blockedByDependencies) {
                    throw new Error('Action blocked by incomplete dependencies');
                }
                action.status = 'in-progress';
                action.assignee = assignee;
                plan.updatedAt = new Date();
                this.emit('action:started', {
                    planId: planId,
                    actionId: actionId,
                    assignee: assignee,
                    title: action.title
                });
                return [2 /*return*/, action];
            });
        });
    };
    /**
     * Complete response action
     */
    CrisisManagementAgent.prototype.completeAction = function (planId, actionId, notes) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, action, allCompleted;
            return __generator(this, function (_a) {
                plan = this.responsePlans.get(planId);
                if (!plan) {
                    throw new Error("Response plan not found: ".concat(planId));
                }
                action = plan.actions.find(function (a) { return a.id === actionId; });
                if (!action) {
                    throw new Error("Action not found: ".concat(actionId));
                }
                action.status = 'completed';
                action.completedAt = new Date();
                action.notes = notes;
                plan.updatedAt = new Date();
                allCompleted = plan.actions.every(function (a) { return a.status === 'completed'; });
                if (allCompleted && plan.status === 'active') {
                    plan.status = 'completed';
                    this.emit('response-plan:completed', { planId: planId });
                }
                this.emit('action:completed', {
                    planId: planId,
                    actionId: actionId,
                    title: action.title,
                    notes: notes
                });
                return [2 /*return*/, action];
            });
        });
    };
    /**
     * Helper methods
     */
    CrisisManagementAgent.prototype.analyzeCrisisImpact = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var severity, scope, categories;
            return __generator(this, function (_a) {
                severity = 'medium';
                scope = 'local';
                categories = [];
                switch (event.type) {
                    case 'cyber-attack':
                        severity = 'high';
                        scope = 'global';
                        categories.push('operational', 'reputation', 'financial');
                        break;
                    case 'natural-disaster':
                        severity = 'high';
                        scope = 'regional';
                        categories.push('safety', 'operational');
                        break;
                    case 'market-crash':
                        severity = 'critical';
                        scope = 'global';
                        categories.push('financial');
                        break;
                    case 'health-emergency':
                        severity = 'high';
                        scope = 'national';
                        categories.push('safety', 'operational');
                        break;
                }
                return [2 /*return*/, {
                        severity: severity,
                        impact: {
                            scope: scope,
                            categories: categories,
                            estimatedLoss: this.estimateFinancialImpact(event.type, severity),
                            currency: 'USD'
                        }
                    }];
            });
        });
    };
    CrisisManagementAgent.prototype.calculatePriority = function (severity, impact) {
        if (severity === 'critical')
            return 1;
        if (severity === 'high' && impact.scope === 'global')
            return 1;
        if (severity === 'high')
            return 2;
        if (severity === 'medium' && impact.categories.includes('financial'))
            return 2;
        if (severity === 'medium')
            return 3;
        return 4;
    };
    CrisisManagementAgent.prototype.generateDefaultActions = function (crisis) {
        var actions = [];
        var baseTime = new Date();
        // Common immediate actions
        actions.push({
            id: (0, nanoid_1.nanoid)(),
            title: 'Activate Crisis Management Team',
            description: 'Assemble and brief the crisis management team',
            priority: 'urgent',
            assignee: 'crisis-coordinator',
            status: 'pending',
            estimatedTime: 30,
            dependencies: [],
            deadline: new Date(baseTime.getTime() + 30 * 60 * 1000)
        });
        actions.push({
            id: (0, nanoid_1.nanoid)(),
            title: 'Assess Immediate Safety',
            description: 'Ensure all personnel are safe and accounted for',
            priority: 'urgent',
            assignee: 'safety-officer',
            status: 'pending',
            estimatedTime: 60,
            dependencies: [],
            deadline: new Date(baseTime.getTime() + 60 * 60 * 1000)
        });
        // Crisis-specific actions
        switch (crisis.type) {
            case 'cyber-attack':
                actions.push({
                    id: (0, nanoid_1.nanoid)(),
                    title: 'Isolate Affected Systems',
                    description: 'Disconnect compromised systems from network',
                    priority: 'urgent',
                    assignee: 'it-security',
                    status: 'pending',
                    estimatedTime: 15,
                    dependencies: [],
                    deadline: new Date(baseTime.getTime() + 15 * 60 * 1000)
                });
                break;
            case 'natural-disaster':
                actions.push({
                    id: (0, nanoid_1.nanoid)(),
                    title: 'Activate Emergency Procedures',
                    description: 'Implement evacuation or shelter procedures as needed',
                    priority: 'urgent',
                    assignee: 'facility-manager',
                    status: 'pending',
                    estimatedTime: 45,
                    dependencies: [],
                    deadline: new Date(baseTime.getTime() + 45 * 60 * 1000)
                });
                break;
        }
        return actions;
    };
    CrisisManagementAgent.prototype.selectRelevantStakeholders = function (crisis) {
        var relevant = Array.from(this.stakeholders.values());
        // Always include decision makers for high/critical crises
        if (crisis.severity === 'high' || crisis.severity === 'critical') {
            return relevant.filter(function (s) { return s.authority === 'decision-maker' || s.authority === 'coordinator'; });
        }
        return relevant.filter(function (s) { return s.authority === 'coordinator'; });
    };
    CrisisManagementAgent.prototype.generateCommunicationPlan = function (crisis) {
        var communications = [];
        // Internal communication
        communications.push({
            id: (0, nanoid_1.nanoid)(),
            audience: 'internal',
            channel: 'email',
            message: "Crisis Alert: ".concat(crisis.title, " - ").concat(crisis.description),
            frequency: 'immediate',
            responsible: 'crisis-coordinator',
            status: 'draft'
        });
        // External communication for high-impact crises
        if (crisis.severity === 'high' || crisis.severity === 'critical') {
            communications.push({
                id: (0, nanoid_1.nanoid)(),
                audience: 'external',
                channel: 'press-release',
                message: 'External statement regarding current situation',
                frequency: 'as-needed',
                responsible: 'communications-director',
                approver: 'ceo',
                status: 'draft'
            });
        }
        return communications;
    };
    CrisisManagementAgent.prototype.identifyRequiredResources = function (crisis) {
        var resources = [];
        // Common resources
        resources.push({
            id: (0, nanoid_1.nanoid)(),
            type: 'personnel',
            name: 'Crisis Management Team',
            description: 'Specialized crisis response personnel',
            quantity: 5,
            unit: 'people',
            availability: 'available'
        });
        // Crisis-specific resources
        switch (crisis.type) {
            case 'cyber-attack':
                resources.push({
                    id: (0, nanoid_1.nanoid)(),
                    type: 'external-service',
                    name: 'Cybersecurity Firm',
                    description: 'External cybersecurity experts',
                    quantity: 1,
                    unit: 'contract',
                    availability: 'available',
                    cost: 50000,
                    currency: 'USD'
                });
                break;
        }
        return resources;
    };
    CrisisManagementAgent.prototype.generateMilestones = function (crisis, actions) {
        var milestones = [];
        milestones.push({
            id: (0, nanoid_1.nanoid)(),
            title: 'Initial Response Complete',
            description: 'All immediate actions completed',
            targetTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
            status: 'pending',
            dependencies: actions.filter(function (a) { return a.priority === 'urgent'; }).map(function (a) { return a.id; })
        });
        milestones.push({
            id: (0, nanoid_1.nanoid)(),
            title: 'Crisis Contained',
            description: 'Crisis impact contained and under control',
            targetTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            status: 'pending',
            dependencies: actions.map(function (a) { return a.id; })
        });
        return milestones;
    };
    CrisisManagementAgent.prototype.estimateResponseDuration = function (crisis) {
        // Duration in minutes based on crisis type and severity
        var baseDuration = {
            'natural-disaster': 48 * 60, // 48 hours
            'cyber-attack': 72 * 60, // 72 hours
            'market-crash': 24 * 60, // 24 hours
            'health-emergency': 168 * 60, // 1 week
            'political-unrest': 120 * 60, // 5 days
            'supply-chain': 96 * 60, // 4 days
            'reputation': 48 * 60, // 48 hours
            'operational': 24 * 60 // 24 hours
        };
        var base = baseDuration[crisis.type] || 24 * 60;
        var multiplier = crisis.severity === 'critical' ? 1.5 : crisis.severity === 'high' ? 1.2 : 1.0;
        return Math.round(base * multiplier);
    };
    CrisisManagementAgent.prototype.analyzeThreatLandscape = function (location) {
        return __awaiter(this, void 0, void 0, function () {
            var threatTypes;
            var _this = this;
            return __generator(this, function (_a) {
                threatTypes = [
                    'Natural disasters',
                    'Cyber threats',
                    'Political instability',
                    'Economic volatility',
                    'Health emergencies',
                    'Crime and security',
                    'Transportation disruptions'
                ];
                return [2 /*return*/, threatTypes.map(function (type) { return ({
                        type: type,
                        probability: Math.random() * 0.8 + 0.1, // 0.1 to 0.9
                        impact: Math.floor(Math.random() * 5) + 1, // 1 to 5
                        riskScore: 0, // Will be calculated
                        mitigation: _this.generateMitigationStrategies(type)
                    }); }).map(function (threat) { return (__assign(__assign({}, threat), { riskScore: threat.probability * threat.impact })); })];
            });
        });
    };
    CrisisManagementAgent.prototype.calculateOverallRisk = function (threats) {
        var maxRisk = Math.max.apply(Math, threats.map(function (t) { return t.riskScore; }));
        if (maxRisk >= 4.0)
            return 'critical';
        if (maxRisk >= 3.0)
            return 'high';
        if (maxRisk >= 2.0)
            return 'medium';
        return 'low';
    };
    CrisisManagementAgent.prototype.generateThreatRecommendations = function (threats, location) {
        var recommendations = [];
        var highRiskThreats = threats.filter(function (t) { return t.riskScore >= 3.0; });
        if (highRiskThreats.length > 0) {
            recommendations.push('Consider postponing or relocating activities due to high-risk threats');
            recommendations.push('Implement enhanced security protocols');
            recommendations.push('Establish emergency communication channels');
        }
        recommendations.push('Monitor threat landscape daily');
        recommendations.push('Maintain emergency contact list');
        recommendations.push('Review and update crisis response plans');
        return recommendations;
    };
    CrisisManagementAgent.prototype.generateMitigationStrategies = function (threatType) {
        var strategies = {
            'Natural disasters': [
                'Monitor weather and seismic alerts',
                'Identify evacuation routes',
                'Maintain emergency supplies'
            ],
            'Cyber threats': [
                'Use VPN and secure networks',
                'Regular security updates',
                'Multi-factor authentication'
            ],
            'Political instability': [
                'Monitor political developments',
                'Avoid large gatherings',
                'Register with embassy'
            ]
        };
        return strategies[threatType] || ['Monitor situation closely', 'Maintain situational awareness'];
    };
    CrisisManagementAgent.prototype.estimateFinancialImpact = function (crisisType, severity) {
        var baseImpacts = {
            'cyber-attack': 1000000,
            'natural-disaster': 500000,
            'market-crash': 5000000,
            'health-emergency': 200000,
            'political-unrest': 300000,
            'supply-chain': 800000,
            'reputation': 2000000,
            'operational': 100000
        };
        var multipliers = {
            'low': 0.5,
            'medium': 1.0,
            'high': 2.0,
            'critical': 5.0
        };
        var base = baseImpacts[crisisType] || 100000;
        var multiplier = multipliers[severity];
        return base * multiplier;
    };
    CrisisManagementAgent.prototype.sendCrisisNotifications = function (crisis) {
        return __awaiter(this, void 0, void 0, function () {
            var stakeholders;
            var _this = this;
            return __generator(this, function (_a) {
                stakeholders = this.selectRelevantStakeholders(crisis);
                stakeholders.forEach(function (stakeholder) {
                    _this.emit('notification:sent', {
                        recipient: stakeholder.name,
                        channel: 'email',
                        message: "Crisis Alert: ".concat(crisis.title),
                        urgency: crisis.priority
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    CrisisManagementAgent.prototype.updateResolutionMetrics = function (resolutionTime) {
        var resolutionHours = resolutionTime / (1000 * 60 * 60);
        this.performanceMetrics.averageResolutionTime =
            (this.performanceMetrics.averageResolutionTime + resolutionHours) / 2;
    };
    CrisisManagementAgent.prototype.startThreatMonitoring = function () {
        var _this = this;
        // Monitor threats every 30 minutes
        setInterval(function () {
            _this.emit('threat-monitoring:scan', {
                timestamp: new Date(),
                sources: Array.from(_this.monitoringSources)
            });
        }, 30 * 60 * 1000);
    };
    /**
     * Get crisis by ID
     */
    CrisisManagementAgent.prototype.getCrisis = function (crisisId) {
        return this.crises.get(crisisId);
    };
    /**
     * Get active crises
     */
    CrisisManagementAgent.prototype.getActiveCrises = function () {
        return Array.from(this.crises.values())
            .filter(function (c) { return c.status !== 'resolved'; });
    };
    /**
     * Get response plan
     */
    CrisisManagementAgent.prototype.getResponsePlan = function (planId) {
        return this.responsePlans.get(planId);
    };
    /**
     * Get threat assessment
     */
    CrisisManagementAgent.prototype.getThreatAssessment = function (assessmentId) {
        return this.threatAssessments.get(assessmentId);
    };
    /**
     * Get performance metrics
     */
    CrisisManagementAgent.prototype.getPerformanceMetrics = function () {
        var avgResponseTime = this.performanceMetrics.responseTimes.length > 0
            ? this.performanceMetrics.responseTimes.reduce(function (a, b) { return a + b; }, 0) / this.performanceMetrics.responseTimes.length
            : 0;
        return {
            agentId: this.agentId,
            averageResponseTime: "".concat(avgResponseTime.toFixed(2), "ms"),
            crisesHandled: this.performanceMetrics.crisesHandled,
            averageResolutionTime: "".concat(this.performanceMetrics.averageResolutionTime.toFixed(1), " hours"),
            preventedCrises: this.performanceMetrics.preventedCrises,
            activeCrises: this.getActiveCrises().length,
            monitoringSources: this.monitoringSources.size,
            stakeholders: this.stakeholders.size,
            targetResponseTime: '<75ms (Phase 2 goal)',
            features: {
                realTimeThreatMonitoring: true,
                automaticResponsePlans: true,
                stakeholderNotifications: true,
                multiChannelCommunications: true,
                riskAssessment: true,
                recoverPlanning: true
            }
        };
    };
    return CrisisManagementAgent;
}(events_1.EventEmitter));
exports.CrisisManagementAgent = CrisisManagementAgent;
exports.default = CrisisManagementAgent;
