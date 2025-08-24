/**
 * Mock types for crisis management tests
 */

export enum CrisisType {
  OPERATIONAL = 'operational',
  SECURITY = 'security', 
  FINANCIAL = 'financial',
  REGULATORY = 'regulatory',
  COMMUNICATION = 'communication',
  BUSINESS_CONTINUITY = 'business_continuity'
}

export enum CrisisSeverity {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum CrisisStatus {
  DETECTED = 'detected',
  ACTIVE = 'active',
  RESPONDING = 'responding',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum CrisisEscalationLevel {
  TEAM = 'team',
  MANAGER = 'manager', 
  EXECUTIVE = 'executive',
  BOARD = 'board'
}

export interface CrisisIncident {
  id: string;
  type: CrisisType;
  severity: CrisisSeverity;
  status: CrisisStatus;
  escalationLevel: CrisisEscalationLevel;
  priority: number;
  estimatedCost?: number;
  responseTeam?: string[];
  complianceRequirements?: string[];
  description: string;
  timestamp: Date;
}

// Mock Crisis Management Agent with proper types
export class CrisisManagementAgent {
  public status: string = 'ready';
  private capabilities: any;
  private activeCrises: CrisisIncident[] = [];

  constructor(_config?: any) {
    this.capabilities = {
      adaptive_response: true,
      byzantine_fault_tolerance: true,
      crisis_detection: true,
      cultural_crisis_communication: true,
      escalation_management: true,
      executive_decision_support: true,
      multi_agent_coordination: true,
      real_time_monitoring: true,
      stakeholder_coordination: true,
    };
  }

  async initialize(): Promise<void> {
    this.status = 'active';
  }

  getCapabilities(): any {
    return this.capabilities;
  }

  async detectCrisis(scenario: any): Promise<CrisisIncident> {
    const incident: CrisisIncident = {
      id: 'crisis-' + Date.now(),
      type: this.mapScenarioToType(scenario),
      severity: this.calculateSeverity(scenario),
      status: CrisisStatus.DETECTED,
      escalationLevel: CrisisEscalationLevel.TEAM,
      priority: 1,
      description: scenario.description || 'Mock crisis',
      timestamp: new Date()
    };

    if (scenario.type === 'security') {
      incident.escalationLevel = CrisisEscalationLevel.EXECUTIVE;
    }

    if (scenario.type === 'financial') {
      incident.estimatedCost = scenario.estimatedCost;
      incident.responseTeam = ['financial_team'];
    }

    if (scenario.type === 'regulatory') {
      incident.complianceRequirements = scenario.regulations || [];
      incident.responseTeam = ['legal_team'];
    }

    this.activeCrises.push(incident);
    return incident;
  }

  private mapScenarioToType(scenario: any): CrisisType {
    switch (scenario.type) {
      case 'operational':
        return CrisisType.OPERATIONAL;
      case 'security':
        return CrisisType.SECURITY;
      case 'financial':
        return CrisisType.FINANCIAL;
      case 'regulatory':
        return CrisisType.REGULATORY;
      default:
        return CrisisType.BUSINESS_CONTINUITY;
    }
  }

  private calculateSeverity(scenario: any): CrisisSeverity {
    if (scenario.type === 'security' && scenario.severity === 'critical') {
      return CrisisSeverity.CRITICAL;
    }
    return CrisisSeverity.HIGH;
  }

  getActiveCrises(): CrisisIncident[] {
    return this.activeCrises;
  }

  async initiateCrisisResponse(incident: CrisisIncident): Promise<any> {
    return {
      success: true,
      responseId: 'response-' + Date.now(),
      incident
    };
  }

  async executeResponseSteps(_responseId: string): Promise<boolean> {
    return true;
  }

  async coordinateStakeholders(_incident: CrisisIncident): Promise<boolean> {
    return true;
  }

  async generateStatusUpdate(incident: CrisisIncident): Promise<any> {
    return {
      id: 'update-' + Date.now(),
      incident: incident.id,
      status: 'in_progress',
      timestamp: new Date()
    };
  }

  async escalateCrisis(incident: CrisisIncident, level: CrisisEscalationLevel): Promise<boolean> {
    incident.escalationLevel = level;
    return true;
  }

  async resolveCrisis(incident: CrisisIncident): Promise<boolean> {
    incident.status = CrisisStatus.RESOLVED;
    return true;
  }

  async generatePostIncidentReport(incident: CrisisIncident): Promise<any> {
    return {
      id: 'report-' + Date.now(),
      incident: incident.id,
      resolution: 'successful',
      lessons: ['mock lesson'],
      timestamp: new Date()
    };
  }

  async getCrisisAnalytics(_timeRange: string): Promise<any> {
    return {
      totalCrises: this.activeCrises.length,
      averageResolutionTime: 120,
      successRate: 0.95
    };
  }

  async getDashboardData(): Promise<any> {
    return {
      activeCrises: this.activeCrises.length,
      criticalAlerts: 2,
      teamStatus: 'ready'
    };
  }

  async integrateWithMonitoringSystem(_systemConfig: any): Promise<boolean> {
    return true;
  }

  async coordinateWithAgents(_agentIds: string[]): Promise<boolean> {
    return true;
  }

  async sendNotification(_notification: any): Promise<boolean> {
    return true;
  }

  async handleInvalidCrisis(_data: any): Promise<any> {
    return {
      error: 'invalid_crisis_data',
      message: 'Handled gracefully'
    };
  }

  async handleMCPFailure(): Promise<boolean> {
    return true;
  }

  async handleNotificationFailure(): Promise<boolean> {
    return true;
  }

  async processConcurrentCrises(_crises: any[]): Promise<boolean> {
    return true;
  }
}

export default {
  CrisisType,
  CrisisSeverity,
  CrisisStatus,
  CrisisEscalationLevel,
  CrisisManagementAgent
};