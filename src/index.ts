/**
 * Personal Executive Assistant (PEA) System
 * Main Entry Point - LEASA v2.0 Architecture
 * 
 * This is the primary entry point for the PEA system, initializing the
 * complete 15-agent LEASA (LocalExecutive AI Swarm Architecture) framework
 * with Claude Flow v2.0+ integration.
 */

import { PEASystem } from './PEASystem';
import { logger } from './utils/logger';
import { config } from './config/environment';

/**
 * Initialize and start the Personal Executive Assistant system
 */
async function main(): Promise<void> {
  try {
    logger.info('🚀 Initializing Personal Executive Assistant (PEA) System');
    logger.info(`📋 Configuration: ${config.environment}`);
    logger.info(`🏗️ Architecture: LEASA v2.0 (15-agent system)`);
    
    // Initialize the PEA system
    const peaSystem = new PEASystem(config);
    
    // Start the system with full agent orchestration
    await peaSystem.initialize();
    await peaSystem.start();
    
    logger.info('✅ PEA System successfully initialized and running');
    logger.info(`🌐 System available at: ${config.server.host}:${config.server.port}`);
    
    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      logger.info('📋 Received SIGTERM, shutting down gracefully...');
      await peaSystem.shutdown();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      logger.info('📋 Received SIGINT, shutting down gracefully...');
      await peaSystem.shutdown();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('❌ Failed to initialize PEA System:', error);
    process.exit(1);
  }
}

// Start the system
if (require.main === module) {
  main().catch((error) => {
    logger.error('💥 Unhandled error during startup:', error);
    process.exit(1);
  });
}

export { PEASystem } from './PEASystem';
export * from './types';
export * from './agents';
export * from './coordination';
export * from './security';
export * from './performance';