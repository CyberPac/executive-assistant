/**
 * Zero-Trust Policy Engine - WP-2.1 Security Enhancement
 * Dynamic policy enforcement and compliance management
 * 
 * SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL
 * Implements comprehensive policy management with real-time enforcement,
 * dynamic rule evaluation, and compliance framework integration.
 * 
 * @version 2.1.0
 * @author Executive Assistant Security Team
 * @since 2025-01-22
 */

import { PolicyViolation } from './ZeroTrustArchitecture';
import { HSMInterface } from '../hsm/HSMInterface';
import { SIEMIntegrationFramework } from '../audit/SIEMIntegrationFramework';

export interface PolicyEngineConfig {
  readonly enabled: boolean;
  readonly enforcement: EnforcementConfig;
  readonly compliance: ComplianceFrameworkConfig;
  readonly ruleEngine: RuleEngineConfig;
  readonly monitoring: PolicyMonitoringConfig;
  readonly automation: PolicyAutomationConfig;
}

export interface EnforcementConfig {
  readonly mode: 'monitor' | 'enforce' | 'block';
  readonly realTimeEnforcement: boolean;
  readonly gracePeriod: number;
  readonly escalationEnabled: boolean;
  readonly bypassMechanisms: BypassConfig[];
  readonly auditRequired: boolean;
}

export interface BypassConfig {
  readonly type: 'emergency' | 'maintenance' | 'executive';
  readonly approvers: string[];
  readonly duration: number;
  readonly auditTrail: boolean;
  readonly justification: boolean;
}

export interface ComplianceFrameworkConfig {
  readonly frameworks: ComplianceFramework[];
  readonly mappings: PolicyMapping[];
  readonly reporting: ComplianceReportingConfig;
  readonly validation: ComplianceValidationConfig;
}

export interface ComplianceFramework {
  readonly name: 'sox' | 'hipaa' | 'pci-dss' | 'gdpr' | 'iso27001' | 'nist';
  readonly version: string;
  readonly requirements: ComplianceRequirement[];
  readonly enabled: boolean;
  readonly priority: number;
}

export interface ComplianceRequirement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly mandatory: boolean;
  readonly policies: string[];
  readonly controls: string[];
}

export interface PolicyMapping {
  readonly policyId: string;
  readonly framework: string;
  readonly requirementId: string;
  readonly mappingType: 'direct' | 'partial' | 'supportive';
  readonly coverage: number;
}

export interface ComplianceReportingConfig {
  readonly enabled: boolean;
  readonly frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  readonly recipients: string[];
  readonly format: 'json' | 'pdf' | 'html' | 'csv';
  readonly automated: boolean;
}

export interface ComplianceValidationConfig {
  readonly enabled: boolean;
  readonly validationRules: ValidationRule[];
  readonly scheduleEnabled: boolean;
  readonly validationFrequency: number;
}

export interface ValidationRule {
  readonly id: string;
  readonly framework: string;
  readonly requirement: string;
  readonly validationLogic: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly enabled: boolean;
}

export interface RuleEngineConfig {
  readonly engine: 'rego' | 'json-rules' | 'drools' | 'custom';
  readonly rulesets: RulesetConfig[];
  readonly evaluation: EvaluationConfig;
  readonly optimization: OptimizationConfig;
}

export interface RulesetConfig {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly rules: PolicyRule[];
  readonly priority: number;
  readonly enabled: boolean;
}

export interface EvaluationConfig {
  readonly parallelEvaluation: boolean;
  readonly caching: boolean;
  readonly timeout: number;
  readonly fallbackAction: 'allow' | 'deny' | 'defer';
}

export interface OptimizationConfig {
  readonly enabled: boolean;
  readonly ruleOptimization: boolean;
  readonly indexingEnabled: boolean;
  readonly performanceTargets: PerformanceTargets;
}

export interface PerformanceTargets {
  readonly maxEvaluationTime: number;
  readonly maxMemoryUsage: number;
  readonly cacheHitRate: number;
  readonly throughputTarget: number;
}

export interface PolicyMonitoringConfig {
  readonly enabled: boolean;
  readonly realTimeMonitoring: boolean;
  readonly alerting: AlertingConfig;
  readonly metrics: MetricsConfig;
  readonly dashboards: DashboardConfig;
}

export interface AlertingConfig {
  readonly enabled: boolean;
  readonly channels: AlertChannel[];
  readonly escalation: EscalationConfig;
  readonly suppression: SuppressionConfig;
}

export interface AlertChannel {
  readonly type: 'email' | 'sms' | 'webhook' | 'siem' | 'slack';
  readonly endpoint: string;
  readonly severity: string[];
  readonly enabled: boolean;
}

export interface EscalationConfig {
  readonly enabled: boolean;
  readonly levels: EscalationLevel[];
  readonly timeouts: number[];
  readonly autoEscalation: boolean;
}

export interface EscalationLevel {
  readonly level: number;
  readonly recipients: string[];
  readonly actions: string[];
  readonly timeout: number;
}

export interface SuppressionConfig {
  readonly enabled: boolean;
  readonly rules: SuppressionRule[];
  readonly defaultDuration: number;
}

export interface SuppressionRule {
  readonly pattern: string;
  readonly duration: number;
  readonly conditions: string[];
}

export interface MetricsConfig {
  readonly enabled: boolean;
  readonly collection: CollectionConfig;
  readonly retention: RetentionConfig;
  readonly aggregation: AggregationConfig;
}

export interface CollectionConfig {
  readonly interval: number;
  readonly metrics: string[];
  readonly labels: string[];
}

export interface RetentionConfig {
  readonly period: number;
  readonly compression: boolean;
  readonly archival: boolean;
}

export interface AggregationConfig {
  readonly enabled: boolean;
  readonly functions: string[];
  readonly timeWindows: number[];
}

export interface DashboardConfig {
  readonly enabled: boolean;
  readonly dashboards: Dashboard[];
  readonly refreshInterval: number;
  readonly realTime: boolean;
}

export interface Dashboard {
  readonly id: string;
  readonly name: string;
  readonly widgets: Widget[];
  readonly permissions: string[];
}

export interface Widget {
  readonly type: 'chart' | 'table' | 'metric' | 'alert';
  readonly title: string;
  readonly query: string;
  readonly position: { x: number; y: number; width: number; height: number };
}

export interface PolicyAutomationConfig {
  readonly enabled: boolean;
  readonly workflows: WorkflowConfig[];
  readonly triggers: TriggerConfig[];
  readonly actions: ActionConfig[];
}

export interface WorkflowConfig {
  readonly id: string;
  readonly name: string;
  readonly trigger: string;
  readonly steps: WorkflowStep[];
  readonly enabled: boolean;
}

export interface WorkflowStep {
  readonly id: string;
  readonly type: 'condition' | 'action' | 'delay' | 'parallel';
  readonly configuration: any;
  readonly onSuccess?: string;
  readonly onFailure?: string;
}

export interface TriggerConfig {
  readonly id: string;
  readonly type: 'violation' | 'schedule' | 'event' | 'threshold';
  readonly condition: string;
  readonly enabled: boolean;
}

export interface ActionConfig {
  readonly id: string;
  readonly type: 'notify' | 'isolate' | 'escalate' | 'remediate' | 'log';
  readonly configuration: any;
  readonly timeout: number;
}

export interface PolicyRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly priority: number;
  readonly conditions: PolicyCondition[];
  readonly actions: PolicyAction[];
  readonly metadata: PolicyMetadata;
  readonly enabled: boolean;
  readonly version: string;
  readonly created: Date;
  readonly modified: Date;
}

export interface PolicyCondition {
  readonly id: string;
  readonly type: 'attribute' | 'context' | 'time' | 'risk' | 'behavior';
  readonly field: string;
  readonly operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains' | 'regex';
  readonly value: any;
  readonly negate: boolean;
}

export interface PolicyAction {
  readonly id: string;
  readonly type: 'allow' | 'deny' | 'challenge' | 'log' | 'alert' | 'escalate';
  readonly parameters: Record<string, any>;
  readonly delay: number;
  readonly retries: number;
}

export interface PolicyMetadata {
  readonly compliance: string[];
  readonly tags: string[];
  readonly owner: string;
  readonly reviewer: string;
  readonly lastReview: Date;
  readonly nextReview: Date;
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PolicyEvaluationRequest {
  readonly id: string;
  readonly timestamp: Date;
  readonly context: EvaluationContext;
  readonly rules: string[];
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EvaluationContext {
  readonly subject: Subject;
  readonly resource: Resource;
  readonly action: Action;
  readonly environment: Environment;
  readonly session?: SessionContext;
}

export interface Subject {
  readonly id: string;
  readonly type: 'user' | 'service' | 'device' | 'application';
  readonly attributes: Record<string, any>;
  readonly roles: string[];
  readonly groups: string[];
}

export interface Resource {
  readonly id: string;
  readonly type: string;
  readonly attributes: Record<string, any>;
  readonly classification: string;
  readonly owner: string;
}

export interface Action {
  readonly type: string;
  readonly method: string;
  readonly parameters: Record<string, any>;
}

export interface Environment {
  readonly time: Date;
  readonly location: string;
  readonly network: string;
  readonly riskLevel: number;
  readonly threatLevel: string;
}

export interface SessionContext {
  readonly sessionId: string;
  readonly created: Date;
  readonly lastActivity: Date;
  readonly mfaVerified: boolean;
  readonly riskScore: number;
}

export interface PolicyEvaluationResult {
  readonly requestId: string;
  readonly decision: 'allow' | 'deny' | 'challenge';
  readonly confidence: number;
  readonly evaluatedRules: RuleEvaluationResult[];
  readonly violations: PolicyViolation[];
  readonly obligations: PolicyObligation[];
  readonly metadata: ResultMetadata;
  readonly timestamp: Date;
  readonly duration: number;
}

export interface RuleEvaluationResult {
  readonly ruleId: string;
  readonly matched: boolean;
  readonly decision: string;
  readonly confidence: number;
  readonly conditions: ConditionResult[];
  readonly actions: ActionResult[];
}

export interface ConditionResult {
  readonly conditionId: string;
  readonly matched: boolean;
  readonly value: any;
  readonly evaluation: string;
}

export interface ActionResult {
  readonly actionId: string;
  readonly executed: boolean;
  readonly result: any;
  readonly error?: string;
}

export interface PolicyObligation {
  readonly type: 'log' | 'notify' | 'monitor' | 'escalate';
  readonly description: string;
  readonly parameters: Record<string, any>;
  readonly deadline?: Date;
}

export interface ResultMetadata {
  readonly evaluationMode: string;
  readonly cacheHit: boolean;
  readonly optimized: boolean;
  readonly debugInfo?: any;
}

export interface PolicyEngineMetrics {
  readonly timestamp: Date;
  readonly totalRules: number;
  readonly activeRules: number;
  readonly evaluationsCount: number;
  readonly averageEvaluationTime: number;
  readonly cacheHitRate: number;
  readonly violationsCount: number;
  readonly complianceScore: number;
  readonly performanceScore: number;
}

/**
 * Zero-Trust Policy Engine Implementation
 */
export class ZeroTrustPolicyEngine {
  private config: PolicyEngineConfig;
  private hsmInterface: HSMInterface;
  private siemIntegration: SIEMIntegrationFramework;
  private policies: Map<string, PolicyRule> = new Map();
  private rulesets: Map<string, RulesetConfig> = new Map();
  private evaluationCache: Map<string, PolicyEvaluationResult> = new Map();
  private complianceFrameworks: Map<string, ComplianceFramework> = new Map();
  private metrics: PolicyEngineMetrics;
  private isInitialized = false;

  constructor(
    config: PolicyEngineConfig,
    hsmInterface: HSMInterface,
    siemIntegration: SIEMIntegrationFramework
  ) {
    this.config = config;
    this.hsmInterface = hsmInterface;
    this.siemIntegration = siemIntegration;
    
    this.metrics = {
      timestamp: new Date(),
      totalRules: 0,
      activeRules: 0,
      evaluationsCount: 0,
      averageEvaluationTime: 0,
      cacheHitRate: 0,
      violationsCount: 0,
      complianceScore: 0,
      performanceScore: 0
    };
  }

  /**
   * Initialize policy engine
   */
  async initialize(): Promise<void> {
    console.log('📋 Initializing Zero-Trust Policy Engine...');
    
    try {
      // Initialize compliance frameworks
      await this.initializeComplianceFrameworks();
      
      // Load default policies
      await this.loadDefaultPolicies();
      
      // Initialize rule engine
      await this.initializeRuleEngine();
      
      // Start monitoring
      this.startPolicyMonitoring();
      
      // Start automation workflows
      if (this.config.automation.enabled) {
        this.startAutomation();
      }
      
      this.isInitialized = true;
      console.log('✅ Zero-Trust Policy Engine initialized');
      
    } catch (error) {
      console.error('❌ Policy engine initialization failed:', error);
      throw error;
    }
  }

  /**
   * Evaluate policy for access request
   */
  async evaluatePolicy(request: PolicyEvaluationRequest): Promise<PolicyEvaluationResult> {
    this.ensureInitialized();
    
    const startTime = Date.now();
    
    try {
      console.log(`📋 Evaluating policy request: ${request.id}`);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cachedResult = this.evaluationCache.get(cacheKey);
      
      if (cachedResult && this.isCacheValid(cachedResult)) {
        console.log(`⚡ Using cached policy result: ${request.id}`);
        this.updateMetrics(cachedResult, true);
        return cachedResult;
      }
      
      // Evaluate applicable rules
      const applicableRules = this.findApplicableRules(request);
      const ruleResults = await this.evaluateRules(applicableRules, request.context);
      
      // Determine final decision
      const decision = this.calculateDecision(ruleResults);
      const confidence = this.calculateConfidence(ruleResults);
      
      // Collect violations
      const violations = this.collectViolations(ruleResults);
      
      // Generate obligations
      const obligations = this.generateObligations(ruleResults, decision);
      
      const result: PolicyEvaluationResult = {
        requestId: request.id,
        decision,
        confidence,
        evaluatedRules: ruleResults,
        violations,
        obligations,
        metadata: {
          evaluationMode: this.config.enforcement.mode,
          cacheHit: false,
          optimized: this.config.ruleEngine.optimization.enabled
        },
        timestamp: new Date(),
        duration: Date.now() - startTime
      };
      
      // Cache result
      this.cacheResult(cacheKey, result);
      
      // Log policy evaluation
      await this.logPolicyEvaluation(request, result);
      
      // Update metrics
      this.updateMetrics(result, false);
      
      console.log(`${decision === 'allow' ? '✅' : '❌'} Policy evaluation: ${request.id} (${decision})`);
      return result;
      
    } catch (error) {
      console.error(`❌ Policy evaluation failed: ${request.id}`, error);
      
      // Log evaluation error
      await this.siemIntegration.logSecurityEvent({
        eventType: 'policy-evaluation-error',
        severity: 'critical',
        source: 'zero-trust-policy',
        details: { requestId: request.id, error: error instanceof Error ? error.message : String(error) },
        timestamp: new Date()
      });
      
      throw error;
    }
  }

  /**
   * Add new policy rule
   */
  async addPolicy(policy: PolicyRule): Promise<void> {
    this.ensureInitialized();
    
    // Validate policy
    const validation = await this.validatePolicy(policy);
    if (!validation.valid) {
      throw new Error(`Policy validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Store policy
    this.policies.set(policy.id, policy);
    
    // Update metrics
    this.updatePolicyMetrics();
    
    // Log policy addition
    await this.siemIntegration.logSecurityEvent({
      eventType: 'policy-added',
      severity: 'info',
      source: 'zero-trust-policy',
      details: { policyId: policy.id, category: policy.category, priority: policy.priority },
      timestamp: new Date()
    });
    
    console.log(`✅ Policy added: ${policy.name} (${policy.id})`);
  }

  /**
   * Get policy engine metrics
   */
  getMetrics(): PolicyEngineMetrics {
    this.ensureInitialized();
    return { ...this.metrics };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(framework?: string): Promise<ComplianceReport> {
    this.ensureInitialized();
    
    const frameworksToReport = framework ? 
      [this.complianceFrameworks.get(framework)].filter(Boolean) :
      Array.from(this.complianceFrameworks.values());
    
    const report: ComplianceReport = {
      timestamp: new Date(),
      frameworks: [],
      overallScore: 0,
      summary: {
        totalRequirements: 0,
        metRequirements: 0,
        partiallyMet: 0,
        notMet: 0
      },
      details: []
    };
    
    for (const fw of frameworksToReport) {
      if (!fw) continue;
      
      const frameworkReport = await this.generateFrameworkReport(fw);
      report.frameworks.push(frameworkReport);
      
      report.summary.totalRequirements += frameworkReport.totalRequirements;
      report.summary.metRequirements += frameworkReport.metRequirements;
      report.summary.partiallyMet += frameworkReport.partiallyMet;
      report.summary.notMet += frameworkReport.notMet;
    }
    
    report.overallScore = report.summary.totalRequirements > 0 ?
      (report.summary.metRequirements / report.summary.totalRequirements) * 100 : 0;
    
    return report;
  }

  // Private implementation methods

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Policy engine not initialized');
    }
  }

  private async initializeComplianceFrameworks(): Promise<void> {
    console.log('📋 Initializing compliance frameworks...');
    
    for (const framework of this.config.compliance.frameworks) {
      this.complianceFrameworks.set(framework.name, framework);
      console.log(`✅ Compliance framework loaded: ${framework.name.toUpperCase()}`);
    }
  }

  private async loadDefaultPolicies(): Promise<void> {
    console.log('📋 Loading default policies...');
    
    const defaultPolicies: PolicyRule[] = [
      {
        id: 'zero-trust-identity-verification',
        name: 'Zero Trust Identity Verification',
        description: 'Require identity verification for all access requests',
        category: 'identity',
        priority: 100,
        conditions: [
          {
            id: 'identity-verified',
            type: 'attribute',
            field: 'identity.verified',
            operator: 'equals',
            value: true,
            negate: false
          }
        ],
        actions: [
          {
            id: 'allow-access',
            type: 'allow',
            parameters: {},
            delay: 0,
            retries: 0
          }
        ],
        metadata: {
          compliance: ['sox', 'nist'],
          tags: ['zero-trust', 'identity'],
          owner: 'security-team',
          reviewer: 'security-team',
          lastReview: new Date(),
          nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          riskLevel: 'high'
        },
        enabled: true,
        version: '1.0',
        created: new Date(),
        modified: new Date()
      },
      {
        id: 'high-risk-block',
        name: 'High Risk Access Block',
        description: 'Block access for high-risk identities',
        category: 'risk',
        priority: 200,
        conditions: [
          {
            id: 'high-risk',
            type: 'risk',
            field: 'risk.score',
            operator: 'greater-than',
            value: 0.8,
            negate: false
          }
        ],
        actions: [
          {
            id: 'deny-access',
            type: 'deny',
            parameters: { reason: 'High risk score detected' },
            delay: 0,
            retries: 0
          },
          {
            id: 'alert-security',
            type: 'alert',
            parameters: { severity: 'critical', team: 'security' },
            delay: 0,
            retries: 1
          }
        ],
        metadata: {
          compliance: ['sox', 'nist', 'iso27001'],
          tags: ['zero-trust', 'risk', 'security'],
          owner: 'security-team',
          reviewer: 'security-team',
          lastReview: new Date(),
          nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          riskLevel: 'critical'
        },
        enabled: true,
        version: '1.0',
        created: new Date(),
        modified: new Date()
      }
    ];
    
    for (const policy of defaultPolicies) {
      this.policies.set(policy.id, policy);
    }
    
    console.log(`✅ Loaded ${defaultPolicies.length} default policies`);
  }

  private async initializeRuleEngine(): Promise<void> {
    console.log('🔧 Initializing rule engine...');
    
    for (const ruleset of this.config.ruleEngine.rulesets) {
      this.rulesets.set(ruleset.id, ruleset);
    }
  }

  private startPolicyMonitoring(): void {
    if (!this.config.monitoring.enabled) return;
    
    console.log('📊 Starting policy monitoring...');
    
    setInterval(() => {
      this.updatePolicyMetrics();
      this.monitorPolicyPerformance();
    }, 60000); // Every minute
  }

  private startAutomation(): void {
    console.log('🤖 Starting policy automation...');
    
    // Initialize automation workflows
    for (const workflow of this.config.automation.workflows) {
      if (workflow.enabled) {
        console.log(`✅ Automation workflow enabled: ${workflow.name}`);
      }
    }
  }

  private generateCacheKey(request: PolicyEvaluationRequest): string {
    const keyData = {
      subject: request.context.subject.id,
      resource: request.context.resource.id,
      action: request.context.action.type,
      rules: request.rules.sort()
    };
    
    return `policy-${JSON.stringify(keyData).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)}`;
  }

  private isCacheValid(result: PolicyEvaluationResult): boolean {
    const cacheTimeout = 300000; // 5 minutes
    return Date.now() - result.timestamp.getTime() < cacheTimeout;
  }

  private findApplicableRules(request: PolicyEvaluationRequest): PolicyRule[] {
    const rules: PolicyRule[] = [];
    
    for (const [ruleId, rule] of this.policies.entries()) {
      if (!rule.enabled) continue;
      
      // Check if rule is requested or applies by default
      if (request.rules.length === 0 || request.rules.includes(ruleId)) {
        rules.push(rule);
      }
    }
    
    // Sort by priority (higher priority first)
    return rules.sort((a, b) => b.priority - a.priority);
  }

  private async evaluateRules(
    rules: PolicyRule[],
    context: EvaluationContext
  ): Promise<RuleEvaluationResult[]> {
    const results: RuleEvaluationResult[] = [];
    
    for (const rule of rules) {
      try {
        const result = await this.evaluateRule(rule, context);
        results.push(result);
        
        // Early termination for critical decisions
        if (result.decision === 'deny' && rule.priority >= 200) {
          break;
        }
      } catch (error) {
        console.error(`Rule evaluation failed: ${rule.id}`, error);
        
        results.push({
          ruleId: rule.id,
          matched: false,
          decision: 'error',
          confidence: 0,
          conditions: [],
          actions: []
        });
      }
    }
    
    return results;
  }

  private async evaluateRule(
    rule: PolicyRule,
    context: EvaluationContext
  ): Promise<RuleEvaluationResult> {
    // Evaluate conditions
    const conditionResults = await this.evaluateConditions(rule.conditions, context);
    const allConditionsMet = conditionResults.every(c => c.matched);
    
    // Execute actions if conditions are met
    const actionResults: ActionResult[] = [];
    let decision = 'no-match';
    
    if (allConditionsMet) {
      for (const action of rule.actions) {
        const actionResult = await this.executeAction(action, context);
        actionResults.push(actionResult);
        
        if (action.type === 'allow' || action.type === 'deny') {
          decision = action.type;
        }
      }
    }
    
    return {
      ruleId: rule.id,
      matched: allConditionsMet,
      decision,
      confidence: this.calculateRuleConfidence(conditionResults),
      conditions: conditionResults,
      actions: actionResults
    };
  }

  private async evaluateConditions(
    conditions: PolicyCondition[],
    context: EvaluationContext
  ): Promise<ConditionResult[]> {
    const results: ConditionResult[] = [];
    
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, context);
      results.push(result);
    }
    
    return results;
  }

  private async evaluateCondition(
    condition: PolicyCondition,
    context: EvaluationContext
  ): Promise<ConditionResult> {
    let contextValue: any;
    
    // Extract value from context based on field path
    const fieldParts = condition.field.split('.');
    let current: any = context;
    
    for (const part of fieldParts) {
      current = current?.[part];
    }
    
    contextValue = current;
    
    // Evaluate condition
    let matched = false;
    
    switch (condition.operator) {
      case 'equals':
        matched = contextValue === condition.value;
        break;
      case 'not-equals':
        matched = contextValue !== condition.value;
        break;
      case 'greater-than':
        matched = contextValue > condition.value;
        break;
      case 'less-than':
        matched = contextValue < condition.value;
        break;
      case 'contains':
        matched = Array.isArray(contextValue) ? 
          contextValue.includes(condition.value) : 
          String(contextValue).includes(String(condition.value));
        break;
      case 'regex':
        matched = new RegExp(condition.value).test(String(contextValue));
        break;
    }
    
    // Apply negation if specified
    if (condition.negate) {
      matched = !matched;
    }
    
    return {
      conditionId: condition.id,
      matched,
      value: contextValue,
      evaluation: `${condition.field} ${condition.operator} ${condition.value} = ${matched}`
    };
  }

  private async executeAction(
    action: PolicyAction,
    context: EvaluationContext
  ): Promise<ActionResult> {
    try {
      let result: any = null;
      
      switch (action.type) {
        case 'allow':
        case 'deny':
          result = { decision: action.type, parameters: action.parameters };
          break;
        case 'challenge':
          result = { challenge: 'mfa', parameters: action.parameters };
          break;
        case 'log':
          await this.siemIntegration.logSecurityEvent({
            eventType: 'policy-action-log',
            severity: 'info',
            source: 'zero-trust-policy',
            details: {
              actionId: action.id,
              subjectId: context.subject.id,
              resourceId: context.resource.id,
              parameters: action.parameters
            },
            timestamp: new Date()
          });
          result = { logged: true };
          break;
        case 'alert':
          await this.siemIntegration.logSecurityEvent({
            eventType: 'policy-alert',
            severity: action.parameters.severity || 'medium',
            source: 'zero-trust-policy',
            details: {
              actionId: action.id,
              subjectId: context.subject.id,
              resourceId: context.resource.id,
              parameters: action.parameters
            },
            timestamp: new Date()
          });
          result = { alerted: true };
          break;
        case 'escalate':
          result = { escalated: true, target: action.parameters.target };
          break;
      }
      
      return {
        actionId: action.id,
        executed: true,
        result
      };
      
    } catch (error) {
      return {
        actionId: action.id,
        executed: false,
        result: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private calculateRuleConfidence(conditionResults: ConditionResult[]): number {
    if (conditionResults.length === 0) return 0;
    
    const matchedConditions = conditionResults.filter(c => c.matched).length;
    return matchedConditions / conditionResults.length;
  }

  private calculateDecision(ruleResults: RuleEvaluationResult[]): 'allow' | 'deny' | 'challenge' {
    // Check for explicit deny first (highest priority)
    for (const result of ruleResults) {
      if (result.matched && result.decision === 'deny') {
        return 'deny';
      }
    }
    
    // Check for challenge requirements
    for (const result of ruleResults) {
      if (result.matched && result.decision === 'challenge') {
        return 'challenge';
      }
    }
    
    // Check for explicit allow
    for (const result of ruleResults) {
      if (result.matched && result.decision === 'allow') {
        return 'allow';
      }
    }
    
    // Default to deny if no explicit allow
    return 'deny';
  }

  private calculateConfidence(ruleResults: RuleEvaluationResult[]): number {
    if (ruleResults.length === 0) return 0;
    
    const totalConfidence = ruleResults.reduce((sum, result) => sum + result.confidence, 0);
    return totalConfidence / ruleResults.length;
  }

  private collectViolations(ruleResults: RuleEvaluationResult[]): PolicyViolation[] {
    const violations: PolicyViolation[] = [];
    
    for (const result of ruleResults) {
      if (result.matched && result.decision === 'deny') {
        const policy = this.policies.get(result.ruleId);
        if (policy) {
          violations.push({
            policyId: result.ruleId,
            severity: policy.metadata.riskLevel,
            description: `Policy violation: ${policy.name}`,
            remediation: 'Review access request and resolve policy violations',
            autoRemediated: false
          });
        }
      }
    }
    
    return violations;
  }

  private generateObligations(
    ruleResults: RuleEvaluationResult[],
    decision: string
  ): PolicyObligation[] {
    const obligations: PolicyObligation[] = [];
    
    // Always log policy decisions
    obligations.push({
      type: 'log',
      description: 'Log policy evaluation result',
      parameters: { decision, timestamp: new Date() }
    });
    
    // Add monitoring for allowed high-risk access
    if (decision === 'allow') {
      const hasHighRiskRules = ruleResults.some(r => {
        const policy = this.policies.get(r.ruleId);
        return policy?.metadata.riskLevel === 'high' || policy?.metadata.riskLevel === 'critical';
      });
      
      if (hasHighRiskRules) {
        obligations.push({
          type: 'monitor',
          description: 'Enhanced monitoring for high-risk access',
          parameters: { duration: 3600000 } // 1 hour
        });
      }
    }
    
    return obligations;
  }

  private async logPolicyEvaluation(
    request: PolicyEvaluationRequest,
    result: PolicyEvaluationResult
  ): Promise<void> {
    await this.siemIntegration.logSecurityEvent({
      eventType: 'policy-evaluation',
      severity: result.decision === 'deny' ? 'high' : 'info',
      source: 'zero-trust-policy',
      details: {
        requestId: request.id,
        subjectId: request.context.subject.id,
        resourceId: request.context.resource.id,
        action: request.context.action.type,
        decision: result.decision,
        confidence: result.confidence,
        violations: result.violations.length,
        evaluatedRules: result.evaluatedRules.length,
        duration: result.duration
      },
      timestamp: new Date()
    });
  }

  private cacheResult(key: string, result: PolicyEvaluationResult): void {
    // Simple LRU cache implementation
    if (this.evaluationCache.size >= 1000) {
      const firstKey = this.evaluationCache.keys().next().value;
      this.evaluationCache.delete(firstKey);
    }
    
    this.evaluationCache.set(key, result);
  }

  private updateMetrics(result: PolicyEvaluationResult, _cached: boolean): void {
    // Update average evaluation time
    const alpha = 0.1;
    const newAverageEvaluationTime = 
      (this.metrics.averageEvaluationTime * (1 - alpha)) + (result.duration * alpha);
    
    // Update cache hit rate
    const cacheHits = Array.from(this.evaluationCache.values())
      .filter(r => r.metadata.cacheHit).length;
    const newEvaluationsCount = this.metrics.evaluationsCount + 1;
    const newCacheHitRate = cacheHits / newEvaluationsCount;
    
    // Update violations count
    const newViolationsCount = this.metrics.violationsCount + result.violations.length;
    
    this.metrics = {
      ...this.metrics,
      evaluationsCount: newEvaluationsCount,
      averageEvaluationTime: newAverageEvaluationTime,
      cacheHitRate: newCacheHitRate,
      violationsCount: newViolationsCount,
      timestamp: new Date()
    };
  }

  private updatePolicyMetrics(): void {
    this.metrics = {
      ...this.metrics,
      totalRules: this.policies.size,
      activeRules: Array.from(this.policies.values()).filter(p => p.enabled).length
    };
  }

  private monitorPolicyPerformance(): void {
    // Calculate performance score based on evaluation time and throughput
    const targetEvaluationTime = this.config.ruleEngine.optimization.performanceTargets.maxEvaluationTime;
    const evaluationPerformance = Math.max(0, 1 - (this.metrics.averageEvaluationTime / targetEvaluationTime));
    
    this.metrics = {
      ...this.metrics,
      performanceScore: evaluationPerformance * 100
    };
    
    if (this.metrics.averageEvaluationTime > targetEvaluationTime) {
      console.warn(`⚠️ Policy evaluation time exceeded target: ${this.metrics.averageEvaluationTime}ms`);
    }
  }

  private async validatePolicy(policy: PolicyRule): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Basic validation
    if (!policy.id) errors.push('Policy ID is required');
    if (!policy.name) errors.push('Policy name is required');
    if (!policy.conditions || policy.conditions.length === 0) errors.push('At least one condition is required');
    if (!policy.actions || policy.actions.length === 0) errors.push('At least one action is required');
    
    // Validate conditions
    for (const condition of policy.conditions || []) {
      if (!condition.field) errors.push(`Condition ${condition.id}: field is required`);
      if (!condition.operator) errors.push(`Condition ${condition.id}: operator is required`);
    }
    
    // Validate actions
    for (const action of policy.actions || []) {
      if (!action.type) errors.push(`Action ${action.id}: type is required`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async generateFrameworkReport(framework: ComplianceFramework): Promise<FrameworkReport> {
    const report: FrameworkReport = {
      framework: framework.name,
      version: framework.version,
      totalRequirements: framework.requirements.length,
      metRequirements: 0,
      partiallyMet: 0,
      notMet: 0,
      score: 0,
      requirements: []
    };
    
    for (const requirement of framework.requirements) {
      const mappings = this.config.compliance.mappings
        .filter(m => m.framework === framework.name && m.requirementId === requirement.id);
      
      let requirementMet = false;
      let partiallyMet = false;
      
      if (mappings.length > 0) {
        const coverageSum = mappings.reduce((sum, m) => sum + m.coverage, 0);
        const averageCoverage = coverageSum / mappings.length;
        
        if (averageCoverage >= 0.8) {
          requirementMet = true;
          report.metRequirements++;
        } else if (averageCoverage >= 0.4) {
          partiallyMet = true;
          report.partiallyMet++;
        } else {
          report.notMet++;
        }
      } else {
        report.notMet++;
      }
      
      report.requirements.push({
        id: requirement.id,
        title: requirement.title,
        status: requirementMet ? 'met' : partiallyMet ? 'partial' : 'not-met',
        coverage: mappings.length > 0 ? mappings.reduce((sum, m) => sum + m.coverage, 0) / mappings.length : 0,
        policies: mappings.map(m => m.policyId)
      });
    }
    
    report.score = (report.metRequirements / report.totalRequirements) * 100;
    
    return report;
  }
}

// Additional interfaces for compliance reporting
export interface ComplianceReport {
  timestamp: Date;
  frameworks: FrameworkReport[];
  overallScore: number;
  summary: {
    totalRequirements: number;
    metRequirements: number;
    partiallyMet: number;
    notMet: number;
  };
  details: any[];
}

export interface FrameworkReport {
  framework: string;
  version: string;
  totalRequirements: number;
  metRequirements: number;
  partiallyMet: number;
  notMet: number;
  score: number;
  requirements: RequirementReport[];
}

export interface RequirementReport {
  id: string;
  title: string;
  status: 'met' | 'partial' | 'not-met';
  coverage: number;
  policies: string[];
}
