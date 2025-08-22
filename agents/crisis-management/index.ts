/**
 * Crisis Management Agent - Phase 2
 * Handles crisis detection, response coordination, and recovery planning
 */

import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

export interface CrisisEvent {
  id: string;
  type: 'natural-disaster' | 'cyber-attack' | 'market-crash' | 'health-emergency' | 'political-unrest' | 'supply-chain' | 'reputation' | 'operational';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    country: string;
    region?: string;
    coordinates?: { lat: number; lng: number };
  };
  impact: {
    scope: 'local' | 'regional' | 'national' | 'global';
    categories: ('financial' | 'operational' | 'reputation' | 'safety' | 'legal')[];
    estimatedLoss?: number;
    currency?: string;
  };
  status: 'detected' | 'confirmed' | 'responding' | 'contained' | 'resolved';
  priority: 1 | 2 | 3 | 4 | 5; // 1 = highest priority
  detectedAt: Date;
  confirmedAt?: Date;
  resolvedAt?: Date;
  source: string;
  monitoring: boolean;
}

export interface ResponsePlan {
  id: string;
  crisisId: string;
  executiveId: string;
  phase: 'immediate' | 'short-term' | 'long-term' | 'recovery';
  actions: ResponseAction[];
  stakeholders: Stakeholder[];
  communications: CommunicationPlan[];
  resources: Resource[];
  timeline: {
    startTime: Date;
    estimatedDuration: number; // minutes
    milestones: Milestone[];
  };
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponseAction {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee: string;
  department?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  estimatedTime: number; // minutes
  dependencies: string[]; // Other action IDs
  deadline: Date;
  completedAt?: Date;
  notes?: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  contactInfo: {
    email: string;
    phone: string;
    backup?: string;
  };
  location: string;
  authority: 'decision-maker' | 'coordinator' | 'executor' | 'advisor';
  availability: 'available' | 'limited' | 'unavailable';
  lastContacted?: Date;
}

export interface CommunicationPlan {
  id: string;
  audience: 'internal' | 'external' | 'media' | 'regulators' | 'customers';
  channel: 'email' | 'phone' | 'sms' | 'social-media' | 'press-release' | 'website';
  message: string;
  frequency: 'immediate' | 'hourly' | 'daily' | 'as-needed';
  responsible: string;
  approver?: string;
  status: 'draft' | 'approved' | 'sent' | 'scheduled';
  scheduledAt?: Date;
  sentAt?: Date;
}

export interface Resource {
  id: string;
  type: 'personnel' | 'equipment' | 'facility' | 'financial' | 'external-service';
  name: string;
  description: string;
  quantity: number;
  unit: string;
  availability: 'available' | 'reserved' | 'deployed' | 'unavailable';
  cost?: number;
  currency?: string;
  location?: string;
  contactInfo?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetTime: Date;
  actualTime?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'missed';
  dependencies: string[];
}

export interface ThreatAssessment {
  id: string;
  executiveId: string;
  location: string;
  threats: {
    type: string;
    probability: number; // 0-1
    impact: number; // 1-5
    riskScore: number;
    mitigation: string[];
  }[];
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  validUntil: Date;
  lastUpdated: Date;
}

export class CrisisManagementAgent extends EventEmitter {
  private agentId: string;
  private crises: Map<string, CrisisEvent>;
  private responsePlans: Map<string, ResponsePlan>;
  private threatAssessments: Map<string, ThreatAssessment>;
  private stakeholders: Map<string, Stakeholder>;
  private monitoringSources: Set<string>;
  private performanceMetrics: {
    responseTimes: number[];
    crisesHandled: number;
    averageResolutionTime: number;
    preventedCrises: number;
  };

  constructor() {
    super();
    this.agentId = `crisis-mgmt-${nanoid()}`;
    this.crises = new Map();
    this.responsePlans = new Map();
    this.threatAssessments = new Map();
    this.stakeholders = new Map();
    this.monitoringSources = new Set();
    this.performanceMetrics = {
      responseTimes: [],
      crisesHandled: 0,
      averageResolutionTime: 0,
      preventedCrises: 0
    };

    this.initializeCrisisManagement();
    this.startThreatMonitoring();
    this.emit('agent:initialized', { agentId: this.agentId });
  }

  /**
   * Initialize crisis management system
   */
  private initializeCrisisManagement(): void {
    // Initialize monitoring sources
    this.monitoringSources.add('news-feeds');
    this.monitoringSources.add('weather-alerts');
    this.monitoringSources.add('market-indicators');
    this.monitoringSources.add('security-feeds');
    this.monitoringSources.add('social-media');
    this.monitoringSources.add('government-alerts');

    // Initialize key stakeholders
    const keyStakeholders: Stakeholder[] = [
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

    keyStakeholders.forEach(stakeholder => {
      this.stakeholders.set(stakeholder.id, stakeholder);
    });
  }

  /**
   * Detect and report crisis event
   */
  public async reportCrisis(event: {
    type: CrisisEvent['type'];
    title: string;
    description: string;
    location: CrisisEvent['location'];
    source: string;
    severity?: CrisisEvent['severity'];
  }): Promise<CrisisEvent> {
    const startTime = Date.now();

    try {
      // Analyze crisis severity and impact
      const analysis = await this.analyzeCrisisImpact(event);

      const crisis: CrisisEvent = {
        id: nanoid(),
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

      const responseTime = Date.now() - startTime;
      this.performanceMetrics.responseTimes.push(responseTime);

      this.emit('crisis:detected', {
        crisisId: crisis.id,
        type: crisis.type,
        severity: crisis.severity,
        location: crisis.location,
        responseTime
      });

      // Auto-create response plan for high/critical severity
      if (crisis.severity === 'high' || crisis.severity === 'critical') {
        await this.createResponsePlan(crisis.id, 'executive-001'); // Default executive
      }

      // Send immediate notifications
      await this.sendCrisisNotifications(crisis);

      return crisis;

    } catch (error) {
      this.emit('crisis:error', { event, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Create comprehensive response plan
   */
  public async createResponsePlan(
    crisisId: string,
    executiveId: string,
    customActions?: ResponseAction[]
  ): Promise<ResponsePlan> {
    const crisis = this.crises.get(crisisId);
    if (!crisis) {
      throw new Error(`Crisis not found: ${crisisId}`);
    }

    const actions = customActions || this.generateDefaultActions(crisis);
    const stakeholders = this.selectRelevantStakeholders(crisis);
    const communications = this.generateCommunicationPlan(crisis);
    const resources = this.identifyRequiredResources(crisis);

    const responsePlan: ResponsePlan = {
      id: nanoid(),
      crisisId,
      executiveId,
      phase: 'immediate',
      actions,
      stakeholders,
      communications,
      resources,
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
      crisisId,
      actionsCount: actions.length,
      estimatedDuration: responsePlan.timeline.estimatedDuration
    });

    return responsePlan;
  }

  /**
   * Perform threat assessment for location
   */
  public async performThreatAssessment(
    executiveId: string,
    location: string
  ): Promise<ThreatAssessment> {
    const startTime = Date.now();

    try {
      const threats = await this.analyzeThreatLandscape(location);
      const overallRiskLevel = this.calculateOverallRisk(threats);
      const recommendations = this.generateThreatRecommendations(threats, location);

      const assessment: ThreatAssessment = {
        id: nanoid(),
        executiveId,
        location,
        threats,
        overallRiskLevel,
        recommendations,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        lastUpdated: new Date()
      };

      this.threatAssessments.set(assessment.id, assessment);

      const responseTime = Date.now() - startTime;
      this.performanceMetrics.responseTimes.push(responseTime);

      this.emit('threat-assessment:completed', {
        assessmentId: assessment.id,
        location,
        riskLevel: overallRiskLevel,
        threatsCount: threats.length,
        responseTime
      });

      return assessment;

    } catch (error) {
      this.emit('threat-assessment:error', { executiveId, location, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Update crisis status
   */
  public async updateCrisisStatus(
    crisisId: string,
    status: CrisisEvent['status'],
    notes?: string
  ): Promise<CrisisEvent> {
    const crisis = this.crises.get(crisisId);
    if (!crisis) {
      throw new Error(`Crisis not found: ${crisisId}`);
    }

    const previousStatus = crisis.status;
    crisis.status = status;

    if (status === 'confirmed' && !crisis.confirmedAt) {
      crisis.confirmedAt = new Date();
    }

    if (status === 'resolved' && !crisis.resolvedAt) {
      crisis.resolvedAt = new Date();
      crisis.monitoring = false;

      // Calculate resolution time
      const resolutionTime = crisis.resolvedAt.getTime() - crisis.detectedAt.getTime();
      this.updateResolutionMetrics(resolutionTime);
    }

    this.emit('crisis:status-updated', {
      crisisId,
      previousStatus,
      newStatus: status,
      notes
    });

    return crisis;
  }

  /**
   * Execute response action
   */
  public async executeAction(
    planId: string,
    actionId: string,
    assignee: string
  ): Promise<ResponseAction> {
    const plan = this.responsePlans.get(planId);
    if (!plan) {
      throw new Error(`Response plan not found: ${planId}`);
    }

    const action = plan.actions.find(a => a.id === actionId);
    if (!action) {
      throw new Error(`Action not found: ${actionId}`);
    }

    // Check dependencies
    const blockedByDependencies = action.dependencies.some(depId => {
      const dependency = plan.actions.find(a => a.id === depId);
      return dependency && dependency.status !== 'completed';
    });

    if (blockedByDependencies) {
      throw new Error('Action blocked by incomplete dependencies');
    }

    action.status = 'in-progress';
    action.assignee = assignee;
    plan.updatedAt = new Date();

    this.emit('action:started', {
      planId,
      actionId,
      assignee,
      title: action.title
    });

    return action;
  }

  /**
   * Complete response action
   */
  public async completeAction(
    planId: string,
    actionId: string,
    notes?: string
  ): Promise<ResponseAction> {
    const plan = this.responsePlans.get(planId);
    if (!plan) {
      throw new Error(`Response plan not found: ${planId}`);
    }

    const action = plan.actions.find(a => a.id === actionId);
    if (!action) {
      throw new Error(`Action not found: ${actionId}`);
    }

    action.status = 'completed';
    action.completedAt = new Date();
    action.notes = notes ?? '';
    plan.updatedAt = new Date();

    // Check if all actions are completed
    const allCompleted = plan.actions.every(a => a.status === 'completed');
    if (allCompleted && plan.status === 'active') {
      plan.status = 'completed';
      this.emit('response-plan:completed', { planId });
    }

    this.emit('action:completed', {
      planId,
      actionId,
      title: action.title,
      notes
    });

    return action;
  }

  /**
   * Helper methods
   */
  private async analyzeCrisisImpact(event: any): Promise<{
    severity: CrisisEvent['severity'];
    impact: CrisisEvent['impact'];
  }> {
    // Simplified crisis analysis - would use AI/ML models in production
    let severity: CrisisEvent['severity'] = 'medium';
    let scope: CrisisEvent['impact']['scope'] = 'local';
    const categories: CrisisEvent['impact']['categories'] = [];

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

    return {
      severity,
      impact: {
        scope,
        categories,
        estimatedLoss: this.estimateFinancialImpact(event.type, severity),
        currency: 'USD'
      }
    };
  }

  private calculatePriority(severity: CrisisEvent['severity'], impact: CrisisEvent['impact']): CrisisEvent['priority'] {
    if (severity === 'critical') return 1;
    if (severity === 'high' && impact.scope === 'global') return 1;
    if (severity === 'high') return 2;
    if (severity === 'medium' && impact.categories.includes('financial')) return 2;
    if (severity === 'medium') return 3;
    return 4;
  }

  private generateDefaultActions(crisis: CrisisEvent): ResponseAction[] {
    const actions: ResponseAction[] = [];
    const baseTime = new Date();

    // Common immediate actions
    actions.push({
      id: nanoid(),
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
      id: nanoid(),
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
          id: nanoid(),
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
          id: nanoid(),
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
  }

  private selectRelevantStakeholders(crisis: CrisisEvent): Stakeholder[] {
    const relevant = Array.from(this.stakeholders.values());
    
    // Always include decision makers for high/critical crises
    if (crisis.severity === 'high' || crisis.severity === 'critical') {
      return relevant.filter(s => s.authority === 'decision-maker' || s.authority === 'coordinator');
    }

    return relevant.filter(s => s.authority === 'coordinator');
  }

  private generateCommunicationPlan(crisis: CrisisEvent): CommunicationPlan[] {
    const communications: CommunicationPlan[] = [];

    // Internal communication
    communications.push({
      id: nanoid(),
      audience: 'internal',
      channel: 'email',
      message: `Crisis Alert: ${crisis.title} - ${crisis.description}`,
      frequency: 'immediate',
      responsible: 'crisis-coordinator',
      status: 'draft'
    });

    // External communication for high-impact crises
    if (crisis.severity === 'high' || crisis.severity === 'critical') {
      communications.push({
        id: nanoid(),
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
  }

  private identifyRequiredResources(crisis: CrisisEvent): Resource[] {
    const resources: Resource[] = [];

    // Common resources
    resources.push({
      id: nanoid(),
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
          id: nanoid(),
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
  }

  private generateMilestones(_crisis: CrisisEvent, actions: ResponseAction[]): Milestone[] {
    const milestones: Milestone[] = [];

    milestones.push({
      id: nanoid(),
      title: 'Initial Response Complete',
      description: 'All immediate actions completed',
      targetTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      status: 'pending',
      dependencies: actions.filter(a => a.priority === 'urgent').map(a => a.id)
    });

    milestones.push({
      id: nanoid(),
      title: 'Crisis Contained',
      description: 'Crisis impact contained and under control',
      targetTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: 'pending',
      dependencies: actions.map(a => a.id)
    });

    return milestones;
  }

  private estimateResponseDuration(crisis: CrisisEvent): number {
    // Duration in minutes based on crisis type and severity
    const baseDuration = {
      'natural-disaster': 48 * 60, // 48 hours
      'cyber-attack': 72 * 60, // 72 hours
      'market-crash': 24 * 60, // 24 hours
      'health-emergency': 168 * 60, // 1 week
      'political-unrest': 120 * 60, // 5 days
      'supply-chain': 96 * 60, // 4 days
      'reputation': 48 * 60, // 48 hours
      'operational': 24 * 60 // 24 hours
    };

    const base = baseDuration[crisis.type] || 24 * 60;
    const multiplier = crisis.severity === 'critical' ? 1.5 : crisis.severity === 'high' ? 1.2 : 1.0;

    return Math.round(base * multiplier);
  }

  private async analyzeThreatLandscape(_location: string): Promise<ThreatAssessment['threats']> {
    // Mock threat analysis - would integrate with threat intelligence feeds
    const threatTypes = [
      'Natural disasters',
      'Cyber threats',
      'Political instability',
      'Economic volatility',
      'Health emergencies',
      'Crime and security',
      'Transportation disruptions'
    ];

    return threatTypes.map(type => ({
      type,
      probability: Math.random() * 0.8 + 0.1, // 0.1 to 0.9
      impact: Math.floor(Math.random() * 5) + 1, // 1 to 5
      riskScore: 0, // Will be calculated
      mitigation: this.generateMitigationStrategies(type)
    })).map(threat => ({
      ...threat,
      riskScore: threat.probability * threat.impact
    }));
  }

  private calculateOverallRisk(threats: ThreatAssessment['threats']): ThreatAssessment['overallRiskLevel'] {
    const maxRisk = Math.max(...threats.map(t => t.riskScore));
    
    if (maxRisk >= 4.0) return 'critical';
    if (maxRisk >= 3.0) return 'high';
    if (maxRisk >= 2.0) return 'medium';
    return 'low';
  }

  private generateThreatRecommendations(threats: ThreatAssessment['threats'], _location: string): string[] {
    const recommendations: string[] = [];

    const highRiskThreats = threats.filter(t => t.riskScore >= 3.0);
    
    if (highRiskThreats.length > 0) {
      recommendations.push('Consider postponing or relocating activities due to high-risk threats');
      recommendations.push('Implement enhanced security protocols');
      recommendations.push('Establish emergency communication channels');
    }

    recommendations.push('Monitor threat landscape daily');
    recommendations.push('Maintain emergency contact list');
    recommendations.push('Review and update crisis response plans');

    return recommendations;
  }

  private generateMitigationStrategies(threatType: string): string[] {
    const strategies: Record<string, string[]> = {
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
  }

  private estimateFinancialImpact(crisisType: CrisisEvent['type'], severity: CrisisEvent['severity']): number {
    const baseImpacts = {
      'cyber-attack': 1000000,
      'natural-disaster': 500000,
      'market-crash': 5000000,
      'health-emergency': 200000,
      'political-unrest': 300000,
      'supply-chain': 800000,
      'reputation': 2000000,
      'operational': 100000
    };

    const multipliers = {
      'low': 0.5,
      'medium': 1.0,
      'high': 2.0,
      'critical': 5.0
    };

    const base = baseImpacts[crisisType] || 100000;
    const multiplier = multipliers[severity];

    return base * multiplier;
  }

  private async sendCrisisNotifications(crisis: CrisisEvent): Promise<void> {
    // Mock notification system
    const stakeholders = this.selectRelevantStakeholders(crisis);
    
    stakeholders.forEach(stakeholder => {
      this.emit('notification:sent', {
        recipient: stakeholder.name,
        channel: 'email',
        message: `Crisis Alert: ${crisis.title}`,
        urgency: crisis.priority
      });
    });
  }

  private updateResolutionMetrics(resolutionTime: number): void {
    const resolutionHours = resolutionTime / (1000 * 60 * 60);
    this.performanceMetrics.averageResolutionTime = 
      (this.performanceMetrics.averageResolutionTime + resolutionHours) / 2;
  }

  private startThreatMonitoring(): void {
    // Monitor threats every 30 minutes
    setInterval(() => {
      this.emit('threat-monitoring:scan', {
        timestamp: new Date(),
        sources: Array.from(this.monitoringSources)
      });
    }, 30 * 60 * 1000);
  }

  /**
   * Get crisis by ID
   */
  public getCrisis(crisisId: string): CrisisEvent | undefined {
    return this.crises.get(crisisId);
  }

  /**
   * Get active crises
   */
  public getActiveCrises(): CrisisEvent[] {
    return Array.from(this.crises.values())
      .filter(c => c.status !== 'resolved');
  }

  /**
   * Get response plan
   */
  public getResponsePlan(planId: string): ResponsePlan | undefined {
    return this.responsePlans.get(planId);
  }

  /**
   * Get threat assessment
   */
  public getThreatAssessment(assessmentId: string): ThreatAssessment | undefined {
    return this.threatAssessments.get(assessmentId);
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
      crisesHandled: this.performanceMetrics.crisesHandled,
      averageResolutionTime: `${this.performanceMetrics.averageResolutionTime.toFixed(1)} hours`,
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
  }
}

export default CrisisManagementAgent;