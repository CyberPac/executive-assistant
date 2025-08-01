/**
 * PEA Agent System - Complete Integration Export
 * Personal Executive Assistant Foundation Implementation
 * 
 * This module provides the complete PEA agent system with Claude Flow MCP integration
 * Includes: 5 specialized agents, coordination system, validation framework
 */

// Core PEA System Components
const { PEACoordinationSystem } = require('./PEACoordinationSystem');
const { PEACoordinator } = require('./pea-coordinator');
const { PEAValidationFramework } = require('./pea-validation');

// Individual Agent Implementations (TypeScript modules would be imported differently in production)
// Note: These are TypeScript files that would need compilation in a production environment
const agentPaths = {
  ExecutiveOrchestratorAgent: './executive-orchestrator/ExecutiveOrchestratorAgent.ts',
  CalendarIntelligenceAgent: './calendar-intelligence/CalendarIntelligenceAgent.ts', 
  CommunicationManagerAgent: './communication-manager/CommunicationManagerAgent.ts',
  DocumentIntelligenceAgent: './document-intelligence/DocumentIntelligenceAgent.ts',
  SecurityPrivacyAgent: './security-privacy/SecurityPrivacyAgent.ts'
};

/**
 * Initialize complete PEA system with Claude Flow MCP integration
 */
async function initializePEASystem(mcpIntegration, options = {}) {
  console.log('🚀 Initializing Complete PEA Agent System...');
  
  try {
    // Initialize PEA Coordinator
    const coordinator = new PEACoordinator(mcpIntegration);
    const initResult = await coordinator.initialize();
    
    // Store system initialization metrics
    await mcpIntegration.memoryUsage({
      action: 'store',
      key: 'pea_system/complete_initialization',
      value: JSON.stringify({
        systemType: 'Complete PEA Foundation',
        version: '1.0.0-foundation',
        coordinator: initResult,
        agents: {
          executive_orchestrator: 'initialized',
          calendar_intelligence: 'initialized', 
          communication_manager: 'initialized',
          document_intelligence: 'initialized',
          security_privacy: 'initialized'
        },
        capabilities: [
          'executive_task_coordination',
          'predictive_scheduling', 
          'voice_modeling_communication',
          'multi_modal_document_analysis',
          'zero_trust_security_monitoring',
          'byzantine_fault_tolerance',
          'claude_flow_mcp_integration'
        ],
        performance_targets: {
          coordination_response_time: '<100ms',
          task_success_rate: '>98%',
          system_reliability: '>99.9%',
          consensus_accuracy: '>95%',
          security_threat_detection: '>99%'
        },
        timestamp: new Date().toISOString()
      }),
      namespace: 'pea_foundation'
    });
    
    console.log('✅ Complete PEA System initialized successfully');
    console.log('🎯 5 specialized agents coordinated with Claude Flow MCP integration');
    
    return {
      coordinator,
      systemMetrics: initResult,
      capabilities: [
        'executive_orchestration',
        'calendar_intelligence',
        'communication_management', 
        'document_intelligence',
        'security_privacy_monitoring'
      ]
    };
    
  } catch (error) {
    console.error('❌ PEA System initialization failed:', error);
    throw error;
  }
}

/**
 * Run complete PEA system validation
 */
async function validatePEASystem(mcpIntegration) {
  console.log('🧪 Running Complete PEA System Validation...');
  
  try {
    const validator = new PEAValidationFramework(mcpIntegration);
    const validationReport = await validator.runValidationSuite();
    
    // Cleanup validation resources
    await validator.cleanup();
    
    return validationReport;
    
  } catch (error) {
    console.error('❌ PEA System validation failed:', error);
    throw error;
  }
}

/**
 * Execute executive task through complete PEA system
 */
async function executeExecutiveTask(coordinator, taskDescription, executiveContext, options = {}) {
  return await coordinator.executeExecutiveTask(taskDescription, executiveContext, options);
}

/**
 * Get comprehensive system status
 */
async function getSystemStatus(coordinator) {
  return await coordinator.getSystemStatus();
}

/**
 * Gracefully shutdown PEA system
 */
async function shutdownPEASystem(coordinator) {
  console.log('🛑 Shutting down Complete PEA System...');
  await coordinator.shutdown();
  console.log('✅ PEA System shutdown complete');
}

// Export all PEA system components
module.exports = {
  // Core System Classes
  PEACoordinationSystem,
  PEACoordinator,
  PEAValidationFramework,
  
  // System Management Functions
  initializePEASystem,
  validatePEASystem,
  executeExecutiveTask,
  getSystemStatus,
  shutdownPEASystem,
  
  // Agent Paths (for TypeScript compilation reference)
  agentPaths,
  
  // System Information
  systemInfo: {
    name: 'PEA Foundation System',
    version: '1.0.0-foundation',
    agents: 5,
    capabilities: [
      'executive_orchestration',
      'calendar_intelligence', 
      'communication_management',
      'document_intelligence',
      'security_privacy_monitoring'
    ],
    integration: 'claude-flow-mcp-v2.0+',
    performance: {
      coordination_response: '<100ms',
      task_success_rate: '>98%',
      system_reliability: '>99.9%'
    }
  }
};

/**
 * Usage Example:
 * 
 * const peaSystem = require('./src/agents');
 * 
 * // Initialize system
 * const { coordinator } = await peaSystem.initializePEASystem(mcpIntegration);
 * 
 * // Execute executive task
 * const result = await peaSystem.executeExecutiveTask(
 *   coordinator,
 *   'Schedule board meeting with international stakeholders',
 *   executiveContext
 * );
 * 
 * // Validate system
 * const validationReport = await peaSystem.validatePEASystem(mcpIntegration);
 * 
 * // Shutdown system
 * await peaSystem.shutdownPEASystem(coordinator);
 */