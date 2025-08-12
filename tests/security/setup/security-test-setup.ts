/**
 * Security Test Setup and Configuration
 * Executive Assistant Security Testing Framework
 */

import * as path from 'path';
import * as fs from 'fs';

// Global test configuration
declare global {
  const SECURITY_TEST_CONFIG: {
    timeout: number;
    vulnerabilityThreshold: number;
    complianceThreshold: number;
    reportDirectory: string;
    zapProxyUrl?: string;
    zapApiKey?: string;
    enableZapIntegration: boolean;
  };
}

// Initialize security test configuration
global.SECURITY_TEST_CONFIG = {
  timeout: parseInt(process.env.SECURITY_TEST_TIMEOUT || '300000'), // 5 minutes
  vulnerabilityThreshold: parseInt(process.env.VULNERABILITY_THRESHOLD || '0'),
  complianceThreshold: parseInt(process.env.COMPLIANCE_THRESHOLD || '95'),
  reportDirectory: path.join(__dirname, '../../../reports/security'),
  zapProxyUrl: process.env.ZAP_PROXY_URL || 'http://localhost:8080',
  zapApiKey: process.env.ZAP_API_KEY || 'changeme',
  enableZapIntegration: process.env.ENABLE_ZAP_INTEGRATION === 'true'
};

// Create reports directory if it doesn't exist
beforeAll(async () => {
  const reportsDir = global.SECURITY_TEST_CONFIG.reportDirectory;
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Create subdirectories for different report types
  const subdirs = ['coverage', 'scans', 'compliance', 'monitoring'];
  for (const subdir of subdirs) {
    const subdirPath = path.join(reportsDir, subdir);
    if (!fs.existsSync(subdirPath)) {
      fs.mkdirSync(subdirPath, { recursive: true });
    }
  }
  
  console.log('🔒 Security test environment initialized');
  console.log(`📁 Reports directory: ${reportsDir}`);
  console.log(`⏱️ Test timeout: ${global.SECURITY_TEST_CONFIG.timeout}ms`);
  console.log(`🚨 Vulnerability threshold: ${global.SECURITY_TEST_CONFIG.vulnerabilityThreshold}`);
  console.log(`✅ Compliance threshold: ${global.SECURITY_TEST_CONFIG.complianceThreshold}%`);
});

// Global test cleanup
afterAll(async () => {
  console.log('🧹 Security test cleanup completed');
});

// Configure Jest timeouts for security tests
jest.setTimeout(global.SECURITY_TEST_CONFIG.timeout);

// Global error handler for unhandled promise rejections in security tests
process.on('unhandledRejection', (reason, _promise) => {
  console.error('🚨 Unhandled Rejection in security test:', reason);
  // Don't exit process in tests, but log the error
});

// Security test utilities
export const SecurityTestUtils = {
  /**
   * Generate test report path
   */
  getReportPath(filename: string): string {
    return path.join(global.SECURITY_TEST_CONFIG.reportDirectory, filename);
  },

  /**
   * Check if ZAP integration is enabled
   */
  isZapEnabled(): boolean {
    return global.SECURITY_TEST_CONFIG.enableZapIntegration;
  },

  /**
   * Get test configuration
   */
  getConfig(): typeof global.SECURITY_TEST_CONFIG {
    return global.SECURITY_TEST_CONFIG;
  },

  /**
   * Create timestamped filename
   */
  createTimestampedFilename(base: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${base}-${timestamp}.${extension}`;
  },

  /**
   * Validate test environment
   */
  validateEnvironment(): boolean {
    const required = ['NODE_ENV'];
    const missing = required.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    }
    
    return missing.length === 0;
  }
};

// Export configuration for use in tests
export { global as SecurityTestConfig };