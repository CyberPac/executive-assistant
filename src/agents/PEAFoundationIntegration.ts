/**
 * PEA Foundation Integration - Complete 5-Agent System Integration
 * Personal Executive Assistant Core Architecture Integration Layer
 * 
 * Provides simplified integration interface for the complete PEA 5-agent foundation system
 * with Claude Flow v2.0+ MCP coordination, Byzantine fault tolerance, and executive-grade security.
 */

import { PEACoordinationSystem } from './PEACoordinationSystem';
import { 
  ClaudeFlowMCPIntegration,
  ExecutiveContext, 
  PEATask,
  TaskStatus,
  ExecutivePreferences,
  PEAAgentType
} from '../../src/types/pea-agent-types';

export interface PEAFoundationConfig {
  executiveId: string;
  preferences: ExecutivePreferences;
  securityLevel: 'standard' | 'enhanced' | 'executive';
  enableByzantineFaultTolerance: boolean;
  enableNeuralLearning: boolean;
  culturalIntelligence: boolean;
}

export interface PEAFoundationResult {
  success: boolean;
  systemId: string;
  agentsInitialized: number;
  coordinationActive: boolean;
  executionTime: number;
  healthStatus: 'operational' | 'degraded' | 'critical';
  capabilities: string[];
}

export interface PEAExecutiveRequest {
  id?: string;
  type: 'scheduling' | 'communication' | 'document-analysis' | 'decision-support' | 'crisis-management';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: {
    stakeholders: string[];
    timeline?: string;
    culturalContext?: {
      country: string;
      protocol: string;
    };
    confidentialityLevel?: 'public' | 'internal' | 'confidential' | 'restricted';
  };
  requiredCapabilities?: string[];
}

/**
 * Simplified integration class for PEA Foundation System
 */
export class PEAFoundationIntegration {
  private coordinationSystem: PEACoordinationSystem;
  private mcpIntegration: ClaudeFlowMCPIntegration;
  private initialized: boolean = false;
  private systemId: string;

  constructor(mcpIntegration: ClaudeFlowMCPIntegration) {
    this.mcpIntegration = mcpIntegration;
    this.coordinationSystem = new PEACoordinationSystem(mcpIntegration);
    this.systemId = `pea-foundation-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Initialize complete PEA Foundation System
   */
  async initializeFoundation(config: PEAFoundationConfig): Promise<PEAFoundationResult> {
    const startTime = Date.now();
    console.log('🚀 Initializing PEA Foundation System...');

    try {
      // Store foundation configuration
      await this.mcpIntegration.memoryUsage(
        'store',
        `pea-foundation/config/${this.systemId}`,
        JSON.stringify({
          ...config,
          systemId: this.systemId,
          initializationStarted: new Date().toISOString()
        }),
        'pea_foundation'
      );

      // Initialize core coordination system
      await this.coordinationSystem.initialize();

      // Validate all 5 agents are operational
      const systemStatus = await this.coordinationSystem.getSystemStatus();
      
      if (systemStatus.agentCount < 5) {
        throw new Error(`Expected 5 agents, found ${systemStatus.agentCount}`);
      }

      // Verify coordination health
      if (!systemStatus.coordinationHealth.byzantineFaultTolerance) {
        console.warn('⚠️ Byzantine fault tolerance not fully operational');
      }

      // Store successful initialization
      await this.mcpIntegration.memoryUsage(
        'store',
        `pea-foundation/initialization/${this.systemId}`,
        JSON.stringify({
          systemId: this.systemId,
          success: true,
          agentsInitialized: systemStatus.agentCount,
          initializationTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          capabilities: this.getAllCapabilities()
        }),
        'pea_foundation'
      );

      this.initialized = true;

      const result: PEAFoundationResult = {
        success: true,
        systemId: this.systemId,
        agentsInitialized: systemStatus.agentCount,
        coordinationActive: systemStatus.coordinationHealth.byzantineFaultTolerance,
        executionTime: Date.now() - startTime,
        healthStatus: systemStatus.status === 'operational' ? 'operational' : 'degraded',
        capabilities: this.getAllCapabilities()
      };

      console.log(`✅ PEA Foundation System initialized successfully`);
      console.log(`📊 System ID: ${this.systemId}`);
      console.log(`👥 Agents: ${result.agentsInitialized}/5 operational`);
      console.log(`⚡ Capabilities: ${result.capabilities.length} total`);
      console.log(`🕐 Initialization time: ${result.executionTime}ms`);

      return result;

    } catch (error) {
      console.error('❌ PEA Foundation System initialization failed:', error);
      
      // Store failure information
      await this.mcpIntegration.memoryUsage(
        'store',
        `pea-foundation/failures/${this.systemId}`,
        JSON.stringify({
          systemId: this.systemId,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          initializationTime: Date.now() - startTime
        }),
        'pea_foundation'
      );

      throw error;
    }
  }

  /**
   * Execute executive request with full agent coordination
   */
  async executeExecutiveRequest(
    request: PEAExecutiveRequest,
    executiveContext: ExecutiveContext
  ): Promise<any> {
    if (!this.initialized) {
      throw new Error('PEA Foundation System not initialized. Call initializeFoundation() first.');
    }

    const startTime = Date.now();
    console.log(`📋 Executing executive request: ${request.description}`);

    try {
      // Convert request to PEA task format
      const peaTask: PEATask = {
        id: request.id || `exec-req-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        description: request.description,
        type: request.type as any,
        priority: request.priority,
        assignedAgents: this.determineRequiredAgents(request),
        dependencies: [],
        status: TaskStatus.PENDING,
        context: executiveContext,
        performanceTargets: {
          maxResponseTimeMs: request.priority === 'critical' ? 30000 : 120000,
          minAccuracy: 0.9,
          minConsensusScore: 0.8,
          maxErrorRate: 0.05
        },
        createdAt: new Date().toISOString()
      };

      // Execute through coordination system
      const result = await this.coordinationSystem.executeExecutiveTask(peaTask, executiveContext);

      // Store execution results
      await this.mcpIntegration.memoryUsage(
        'store',
        `executive_requests/${peaTask.id}`,
        JSON.stringify({
          request,
          peaTask,
          result,
          systemId: this.systemId,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }),
        'pea_foundation'
      );

      console.log(`✅ Executive request completed: ${peaTask.id} (${Date.now() - startTime}ms)`);
      console.log(`🎯 Performance: ${result.performanceMetrics.coordinationEfficiency * 100}% efficiency`);
      console.log(`👥 Agents involved: ${result.agentsInvolved.length}`);
      console.log(`🧠 Consensus applied: ${result.consensusApplied ? 'Yes' : 'No'}`);

      return {
        ...result,
        systemId: this.systemId,
        originalRequest: request
      };

    } catch (error) {
      console.error(`❌ Executive request failed [${request.id}]:`, error);
      throw error;
    }
  }

  /**
   * Get comprehensive system status and health metrics
   */
  async getFoundationStatus(): Promise<any> {
    if (!this.initialized) {
      return {
        systemId: this.systemId,
        initialized: false,
        error: 'System not initialized'
      };
    }

    try {
      const systemStatus = await this.coordinationSystem.getSystemStatus();
      
      return {
        initialized: true,
        ...systemStatus,
        capabilities: this.getAllCapabilities(),
        agentHealthDetails: systemStatus.activeAgents.map(agent => ({
          id: agent.id,
          type: agent.type,
          status: agent.status,
          capabilities: agent.capabilities,
          performanceMetrics: agent.performanceMetrics
        }))
      };

    } catch (error) {
      console.error('❌ Failed to get foundation status:', error);
      throw error;
    }
  }

  /**
   * Handle system degradation or recovery
   */
  async handleSystemDegradation(issue: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    console.log(`⚠️ Handling system degradation: ${issue} [${severity}]`);

    await this.coordinationSystem.handleSystemDegradation(issue, severity);

    // Store degradation handling
    await this.mcpIntegration.memoryUsage(
      'store',
      `system_degradation/${this.systemId}/${Date.now()}`,
      JSON.stringify({
        systemId: this.systemId,
        issue,
        severity,
        handledAt: new Date().toISOString()
      }),
      'pea_foundation'
    );
  }

  /**
   * Shutdown foundation system gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down PEA Foundation System...');

    try {
      // Store shutdown event
      await this.mcpIntegration.memoryUsage(
        'store',
        `pea-foundation/shutdown/${this.systemId}`,
        JSON.stringify({
          systemId: this.systemId,
          shutdownAt: new Date().toISOString(),
          graceful: true
        }),
        'pea_foundation'
      );

      this.initialized = false;
      console.log('✅ PEA Foundation System shutdown completed');

    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  private getAllCapabilities(): string[] {
    return [
      // Executive Orchestrator
      'master_coordination', 'decision_making', 'resource_allocation', 'strategic_planning',
      'consensus_validation', 'crisis_escalation', 'cultural_intelligence_coordination',
      
      // Calendar Intelligence
      'predictive_scheduling', 'temporal_analysis', 'conflict_resolution', 'optimization',
      'multi_timezone_coordination', 'travel_integration', 'cultural_scheduling',
      
      // Communication Manager
      'voice_modeling', 'executive_communication', 'natural_language', 'context_awareness',
      'stakeholder_management', 'cultural_adaptation', 'multi_channel_coordination',
      
      // Document Intelligence
      'multi_modal_analysis', 'document_processing', 'knowledge_extraction', 'semantic_understanding',
      'executive_synthesis', 'comparative_analysis', 'risk_assessment',
      
      // Security Privacy
      'zero_trust_monitoring', 'privacy_enforcement', 'threat_detection', 'compliance_validation',
      'quantum_ready_encryption', 'data_classification', 'access_control', 'incident_response'
    ];
  }

  private determineRequiredAgents(request: PEAExecutiveRequest): string[] {
    const requiredAgents = ['executive-orchestrator-001']; // Always include orchestrator

    switch (request.type) {
      case 'scheduling':
        requiredAgents.push('calendar-intelligence-001');
        break;
      case 'communication':
        requiredAgents.push('communication-manager-001');
        break;
      case 'document-analysis':
        requiredAgents.push('document-intelligence-001');
        break;
      case 'crisis-management':
        // Include all agents for crisis management
        requiredAgents.push(
          'calendar-intelligence-001',
          'communication-manager-001',
          'document-intelligence-001',
          'security-privacy-001'
        );
        break;
      default:
        // For complex requests, include relevant agents based on capabilities
        if (request.requiredCapabilities) {
          if (request.requiredCapabilities.some(cap => cap.includes('scheduling'))) {
            requiredAgents.push('calendar-intelligence-001');
          }
          if (request.requiredCapabilities.some(cap => cap.includes('communication'))) {
            requiredAgents.push('communication-manager-001');
          }
          if (request.requiredCapabilities.some(cap => cap.includes('document'))) {
            requiredAgents.push('document-intelligence-001');
          }
        }
    }

    // Always include security for high-priority requests
    if (request.priority === 'high' || request.priority === 'critical') {
      requiredAgents.push('security-privacy-001');
    }

    return [...new Set(requiredAgents)]; // Remove duplicates
  }
}

/**
 * Factory function for easy PEA Foundation initialization
 */
export function createPEAFoundation(mcpIntegration: ClaudeFlowMCPIntegration): PEAFoundationIntegration {
  return new PEAFoundationIntegration(mcpIntegration);
}

/**
 * Quick start function for common executive scenarios
 */
export async function quickStartPEAFoundation(
  mcpIntegration: ClaudeFlowMCPIntegration,
  executiveId: string,
  preferences: Partial<ExecutivePreferences> = {}
): Promise<PEAFoundationIntegration> {
  const foundation = createPEAFoundation(mcpIntegration);

  const config: PEAFoundationConfig = {
    executiveId,
    preferences: {
      communicationStyle: 'diplomatic',
      decisionThreshold: 0.8,
      privacyLevel: 'executive-personal' as any,
      timeZone: 'UTC',
      languages: ['en'],
      culturalAdaptation: true,
      ...preferences
    },
    securityLevel: 'executive',
    enableByzantineFaultTolerance: true,
    enableNeuralLearning: true,
    culturalIntelligence: true
  };

  await foundation.initializeFoundation(config);
  return foundation;
}