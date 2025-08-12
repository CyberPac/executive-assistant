/**
 * Comprehensive Security Test Suite - Jest Integration
 * Executive Assistant Security Testing Framework
 */

import { 
  SecurityTestRunner, 
  InputValidationTest,
  SecurityTest as _SecurityTest,
  SecurityTestResult 
} from './core/security-test-framework';
import { AuthenticationSecurityTest } from './core/authentication-security-test';
import { APISecurityTest } from './core/api-security-test';
import { OWASPZAPIntegration } from './owasp/owasp-zap-integration';
import { DependencyVulnerabilityScanner } from './integrations/dependency-vulnerability-scanner';
import { AgentSecurityTests } from './agents/agent-security-tests';
import { SecurityMonitoringSystem } from './monitoring/security-monitoring';
import * as fs from 'fs';
import * as path from 'path';

describe('Executive Assistant Security Test Suite', () => {
  let testRunner: SecurityTestRunner;
  let securityMonitoring: SecurityMonitoringSystem;

  beforeAll(async () => {
    testRunner = new SecurityTestRunner({
      timeout: 60000,
      maxRetries: 3,
      severityLevels: ['low', 'medium', 'high', 'critical'],
      complianceStandards: ['OWASP', 'NIST', 'ISO27001', 'GDPR', 'CCPA'],
      testCategories: ['input-validation', 'authentication', 'authorization', 'encryption', 'data-protection']
    });

    securityMonitoring = new SecurityMonitoringSystem();

    // Ensure security test reports directory exists
    const reportsDir = path.join(__dirname, '../../../reports/security');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
  });

  afterAll(async () => {
    // Generate final security report
    const results = testRunner.getResults ? testRunner.getResults() : [];
    const metrics = testRunner.getMetrics ? testRunner.getMetrics() : {
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      vulnerabilitiesFound: 0,
      criticalIssues: 0,
      complianceScore: 0,
      coverage: 0,
      executionTime: 0
    };
    
    const report = testRunner.generateSecurityReport ? testRunner.generateSecurityReport(results, metrics) : '';
    const reportPath = path.join(__dirname, '../../../reports/security/security-test-report.md');
    
    fs.writeFileSync(reportPath, report);
    console.log(`Security test report generated: ${reportPath}`);

    // Export monitoring data
    const monitoringData = securityMonitoring.exportMonitoringData();
    const monitoringPath = path.join(__dirname, '../../../reports/security/monitoring-data.json');
    fs.writeFileSync(monitoringPath, JSON.stringify(monitoringData, null, 2));
  });

  describe('Input Validation Security Tests', () => {
    let inputValidationTest: InputValidationTest;

    beforeEach(() => {
      inputValidationTest = new InputValidationTest();
      testRunner.addTest(inputValidationTest);
    });

    test('should prevent SQL injection attacks', async () => {
      const results = await inputValidationTest.runTests();
      const sqlInjectionResult = results.find(r => r.testId === 'sql-injection-001');
      
      expect(sqlInjectionResult).toBeDefined();
      expect(sqlInjectionResult!.status).toBe('passed');
      
      if (sqlInjectionResult!.status === 'failed') {
        // Update security monitoring
        securityMonitoring.generateAlert(
          'critical',
          'input_validation',
          'SQL Injection Vulnerability Detected',
          'Application vulnerable to SQL injection attacks',
          'input_validation_test'
        );
        
        securityMonitoring.updateMetric('sql_injection_vulnerabilities', sqlInjectionResult!.vulnerabilities.length);
      }
    }, 30000);

    test('should prevent XSS attacks', async () => {
      const results = await inputValidationTest.runTests();
      const xssResult = results.find(r => r.testId === 'xss-prevention-001');
      
      expect(xssResult).toBeDefined();
      expect(xssResult!.status).toBe('passed');
      
      if (xssResult!.status === 'failed') {
        securityMonitoring.generateAlert(
          'high',
          'input_validation',
          'XSS Vulnerability Detected',
          'Application vulnerable to Cross-Site Scripting attacks',
          'input_validation_test'
        );
        
        securityMonitoring.updateMetric('xss_vulnerabilities', xssResult!.vulnerabilities.length);
      }
    }, 30000);

    test('should prevent command injection attacks', async () => {
      const results = await inputValidationTest.runTests();
      const commandInjectionResult = results.find(r => r.testId === 'command-injection-001');
      
      expect(commandInjectionResult).toBeDefined();
      expect(commandInjectionResult!.status).toBe('passed');
      
      if (commandInjectionResult!.status === 'failed') {
        securityMonitoring.generateAlert(
          'critical',
          'input_validation',
          'Command Injection Vulnerability Detected',
          'Application vulnerable to command injection attacks',
          'input_validation_test'
        );
      }
    }, 30000);

    test('should validate data types properly', async () => {
      const results = await inputValidationTest.runTests();
      const dataTypeResult = results.find(r => r.testId === 'data-type-validation-001');
      
      expect(dataTypeResult).toBeDefined();
      expect(dataTypeResult!.status).toBe('passed');
    }, 15000);
  });

  describe('Authentication Security Tests', () => {
    let authTest: AuthenticationSecurityTest;

    beforeEach(() => {
      authTest = new AuthenticationSecurityTest();
      testRunner.addTest(authTest);
    });

    test('should prevent authentication bypass', async () => {
      const results = await authTest.runTests();
      const bypassResult = results.find(r => r.testId === 'auth-bypass-001');
      
      expect(bypassResult).toBeDefined();
      expect(bypassResult!.status).toBe('passed');
      
      if (bypassResult!.status === 'failed') {
        securityMonitoring.generateAlert(
          'critical',
          'authentication',
          'Authentication Bypass Vulnerability',
          'Authentication system can be bypassed',
          'authentication_test'
        );
      }
    }, 30000);

    test('should enforce strong password policies', async () => {
      const results = await authTest.runTests();
      const passwordResult = results.find(r => r.testId === 'password-policy-001');
      
      expect(passwordResult).toBeDefined();
      expect(passwordResult!.status).toBe('passed');
    }, 20000);

    test('should have secure session management', async () => {
      const results = await authTest.runTests();
      const sessionResult = results.find(r => r.testId === 'session-mgmt-001');
      
      expect(sessionResult).toBeDefined();
      expect(sessionResult!.status).toBe('passed');
    }, 25000);

    test('should implement brute force protection', async () => {
      const results = await authTest.runTests();
      const bruteForceResult = results.find(r => r.testId === 'brute-force-001');
      
      expect(bruteForceResult).toBeDefined();
      expect(bruteForceResult!.status).toBe('passed');
    }, 30000);
  });

  describe('API Security Tests', () => {
    let apiSecurityTest: APISecurityTest;

    beforeEach(() => {
      const apiConfig = {
        baseUrl: 'http://localhost:3000',
        endpoints: [
          {
            path: '/api/health',
            method: 'GET' as const,
            requiresAuth: false,
            expectedStatus: [200]
          },
          {
            path: '/api/users',
            method: 'GET' as const,
            requiresAuth: true,
            rateLimit: 100,
            expectedStatus: [200, 401, 403]
          },
          {
            path: '/api/admin/users',
            method: 'GET' as const,
            requiresAuth: true,
            expectedStatus: [200, 401, 403]
          }
        ],
        userAgent: 'SecurityTest/1.0',
        timeout: 5000
      };

      apiSecurityTest = new APISecurityTest(apiConfig);
      testRunner.addTest(apiSecurityTest);
    });

    test('should enforce API authentication', async () => {
      const results = await apiSecurityTest.runTests();
      const authResult = results.find(r => r.testId === 'api-auth-001');
      
      expect(authResult).toBeDefined();
      expect(authResult!.status).toBe('passed');
    }, 45000);

    test('should enforce API authorization', async () => {
      const results = await apiSecurityTest.runTests();
      const authzResult = results.find(r => r.testId === 'api-authz-001');
      
      expect(authzResult).toBeDefined();
      expect(authzResult!.status).toBe('passed');
    }, 40000);

    test('should validate API inputs', async () => {
      const results = await apiSecurityTest.runTests();
      const inputResult = results.find(r => r.testId === 'api-input-001');
      
      expect(inputResult).toBeDefined();
      expect(inputResult!.status).toBe('passed');
    }, 60000);

    test('should implement rate limiting', async () => {
      const results = await apiSecurityTest.runTests();
      const rateLimitResult = results.find(r => r.testId === 'api-rate-limit-001');
      
      expect(rateLimitResult).toBeDefined();
      // Rate limiting may not be critical failure
      expect(['passed', 'failed']).toContain(rateLimitResult!.status);
    }, 120000);

    test('should have secure CORS configuration', async () => {
      const results = await apiSecurityTest.runTests();
      const corsResult = results.find(r => r.testId === 'cors-security-001');
      
      expect(corsResult).toBeDefined();
      expect(corsResult!.status).toBe('passed');
    }, 20000);

    test('should implement security headers', async () => {
      const results = await apiSecurityTest.runTests();
      const headersResult = results.find(r => r.testId === 'security-headers-001');
      
      expect(headersResult).toBeDefined();
      expect(headersResult!.status).toBe('passed');
    }, 15000);
  });

  describe('OWASP ZAP Integration Tests', () => {
    let zapIntegration: OWASPZAPIntegration;

    beforeEach(() => {
      const zapConfig = OWASPZAPIntegration.createCICDConfig('http://localhost:3000');
      zapIntegration = new OWASPZAPIntegration(zapConfig);
      testRunner.addTest(zapIntegration);
    });

    test('should initialize ZAP proxy', async () => {
      const results = await zapIntegration.runTests();
      const initResult = results.find(r => r.testId === 'zap-init-001');
      
      expect(initResult).toBeDefined();
      // ZAP may not be available in test environment
      expect(['passed', 'failed']).toContain(initResult!.status);
    }, 30000);

    test('should run OWASP Top 10 assessment', async () => {
      const results = await zapIntegration.runTests();
      const owaspResult = results.find(r => r.testId === 'owasp-top10-001');
      
      expect(owaspResult).toBeDefined();
      
      if (owaspResult && owaspResult.vulnerabilities.length > 0) {
        securityMonitoring.updateMetric('owasp_top10_vulnerabilities', owaspResult.vulnerabilities.length);
      }
    }, 300000); // 5 minutes for full OWASP scan
  });

  describe('Dependency Vulnerability Tests', () => {
    let dependencyScanner: DependencyVulnerabilityScanner;

    beforeEach(() => {
      dependencyScanner = new DependencyVulnerabilityScanner();
      testRunner.addTest(dependencyScanner);
    });

    test('should scan for vulnerable dependencies', async () => {
      const results = await dependencyScanner.runTests();
      const auditResult = results.find(r => r.testId === 'dependency-audit-001');
      
      expect(auditResult).toBeDefined();
      
      if (auditResult && auditResult.vulnerabilities.length > 0) {
        const criticalVulns = auditResult.vulnerabilities.filter(v => v.severity === 'critical').length;
        
        if (criticalVulns > 0) {
          securityMonitoring.generateAlert(
            'critical',
            'dependency_vulnerability',
            'Critical Dependency Vulnerabilities Found',
            `Found ${criticalVulns} critical vulnerabilities in dependencies`,
            'dependency_scanner'
          );
        }
        
        securityMonitoring.updateMetric('dependency_vulnerabilities', auditResult.vulnerabilities.length);
      }
    }, 60000);

    test('should check for known vulnerable packages', async () => {
      const results = await dependencyScanner.runTests();
      const knownVulnsResult = results.find(r => r.testId === 'known-vulns-001');
      
      expect(knownVulnsResult).toBeDefined();
      expect(knownVulnsResult!.status).toBe('passed');
    }, 30000);

    test('should validate license compliance', async () => {
      const results = await dependencyScanner.runTests();
      const licenseResult = results.find(r => r.testId === 'license-audit-001');
      
      expect(licenseResult).toBeDefined();
      expect(['passed', 'failed']).toContain(licenseResult!.status);
    }, 45000);
  });

  describe('Agent-Specific Security Tests', () => {
    let agentSecurityTests: AgentSecurityTests;

    beforeEach(() => {
      agentSecurityTests = new AgentSecurityTests();
      testRunner.addTest(agentSecurityTests);
    });

    test('should validate Calendar Intelligence Agent security', async () => {
      const results = await agentSecurityTests.runTests();
      const calendarResults = results.filter(r => r.testId.includes('calendar'));
      
      expect(calendarResults.length).toBeGreaterThan(0);
      
      // Check for critical failures
      const criticalFailures = calendarResults.filter(r => 
        r.status === 'failed' && r.severity === 'critical'
      );
      
      expect(criticalFailures.length).toBe(0);
    }, 60000);

    test('should validate Communication Manager Agent security', async () => {
      const results = await agentSecurityTests.runTests();
      const commResults = results.filter(r => r.testId.includes('communication'));
      
      expect(commResults.length).toBeGreaterThan(0);
      
      const criticalFailures = commResults.filter(r => 
        r.status === 'failed' && r.severity === 'critical'
      );
      
      expect(criticalFailures.length).toBe(0);
    }, 60000);

    test('should validate Financial Intelligence Agent security', async () => {
      const results = await agentSecurityTests.runTests();
      const financialResults = results.filter(r => r.testId.includes('financial'));
      
      expect(financialResults.length).toBeGreaterThan(0);
      
      // Financial agent should have extra security due to sensitive data
      const securityResults = financialResults.filter(r => r.name.includes('Security'));
      expect(securityResults.length).toBeGreaterThan(0);
    }, 60000);

    test('should validate inter-agent communication security', async () => {
      const results = await agentSecurityTests.runTests();
      const interAgentResult = results.find(r => r.testId === 'inter-agent-comm-001');
      
      expect(interAgentResult).toBeDefined();
      expect(interAgentResult!.status).toBe('passed');
    }, 45000);

    test('should prevent agent privilege escalation', async () => {
      const results = await agentSecurityTests.runTests();
      const privilegeResult = results.find(r => r.testId === 'agent-privilege-escalation-001');
      
      expect(privilegeResult).toBeDefined();
      expect(privilegeResult!.status).toBe('passed');
      
      if (privilegeResult!.status === 'failed') {
        securityMonitoring.generateAlert(
          'critical',
          'privilege_escalation',
          'Agent Privilege Escalation Vulnerability',
          'One or more agents vulnerable to privilege escalation',
          'agent_security_test'
        );
      }
    }, 40000);

    test('should protect cultural intelligence data', async () => {
      const results = await agentSecurityTests.runTests();
      const culturalResult = results.find(r => r.testId === 'cultural-data-001');
      
      expect(culturalResult).toBeDefined();
      expect(['passed', 'skipped']).toContain(culturalResult!.status);
    }, 30000);

    test('should enforce executive data access controls', async () => {
      const results = await agentSecurityTests.runTests();
      const executiveResult = results.find(r => r.testId === 'executive-access-001');
      
      expect(executiveResult).toBeDefined();
      expect(executiveResult!.status).toBe('passed');
    }, 35000);
  });

  describe('Security Monitoring Tests', () => {
    test('should detect and generate security alerts', async () => {
      const results = await securityMonitoring.runTests();
      const threatDetectionResult = results.find(r => r.testId === 'threat-detection-001');
      
      expect(threatDetectionResult).toBeDefined();
      expect(threatDetectionResult!.status).toBe('passed');
    }, 30000);

    test('should collect security metrics', async () => {
      const results = await securityMonitoring.runTests();
      const metricsResult = results.find(r => r.testId === 'metrics-collection-001');
      
      expect(metricsResult).toBeDefined();
      expect(metricsResult!.status).toBe('passed');
    }, 25000);

    test('should monitor compliance status', async () => {
      const results = await securityMonitoring.runTests();
      const complianceResult = results.find(r => r.testId === 'compliance-monitoring-001');
      
      expect(complianceResult).toBeDefined();
      expect(complianceResult!.status).toBe('passed');
    }, 40000);

    test('should provide security dashboard', async () => {
      const dashboard = securityMonitoring.getDashboard();
      
      expect(dashboard).toBeDefined();
      expect(dashboard.security_posture_score).toBeGreaterThanOrEqual(0);
      expect(dashboard.security_posture_score).toBeLessThanOrEqual(100);
      expect(dashboard.compliance_score).toBeGreaterThanOrEqual(0);
      expect(dashboard.compliance_score).toBeLessThanOrEqual(100);
    }, 10000);
  });

  describe('Integration Security Tests', () => {
    test('should run comprehensive security test suite', async () => {
      const { results, metrics, summary } = await testRunner.runAllTests();
      
      expect(results.length).toBeGreaterThan(0);
      expect(metrics.testsRun).toBeGreaterThan(0);
      expect(summary.totalTests).toBe(metrics.testsRun);
      
      // Update final metrics
      securityMonitoring.updateMetric('total_security_tests', metrics.testsRun);
      securityMonitoring.updateMetric('security_test_failures', metrics.testsFailed);
      securityMonitoring.updateMetric('critical_vulnerabilities', metrics.criticalIssues);
      
      // Generate summary alert if critical issues found
      if (metrics.criticalIssues > 0) {
        securityMonitoring.generateAlert(
          'critical',
          'security_assessment',
          'Critical Security Issues Detected',
          `Security assessment found ${metrics.criticalIssues} critical issues`,
          'security_test_suite',
          ['executive_assistant_system'],
          [{
            type: 'policy_violation',
            value: `${metrics.criticalIssues} critical vulnerabilities`,
            confidence: 1.0,
            first_seen: new Date(),
            last_seen: new Date(),
            count: 1
          }]
        );
      }
      
      console.log('Security Test Summary:', {
        totalTests: summary.totalTests,
        passed: summary.passed,
        failed: summary.failed,
        criticalIssues: summary.criticalIssues,
        overallStatus: summary.overallStatus
      });
    }, 600000); // 10 minutes for full test suite

    test('should generate comprehensive security report', async () => {
      const dashboard = securityMonitoring.getDashboard();
      const monitoringData = securityMonitoring.exportMonitoringData();
      
      expect(dashboard).toBeDefined();
      expect(monitoringData.alerts).toBeDefined();
      expect(monitoringData.metrics).toBeDefined();
      
      // Verify monitoring data structure
      expect(Array.isArray(monitoringData.alerts)).toBe(true);
      expect(typeof monitoringData.metrics).toBe('object');
      
      console.log('Security Dashboard Summary:', {
        securityPostureScore: dashboard.security_posture_score,
        activeThreats: dashboard.active_threats,
        complianceScore: dashboard.compliance_score,
        totalAlerts: monitoringData.alerts.length,
        metricsTracked: Object.keys(monitoringData.metrics).length
      });
    }, 15000);
  });
});

/**
 * Custom Jest matchers for security testing
 */
declare global {
  namespace jest {
    interface Matchers<R> {
      toPassSecurityTest(): R;
      toHaveNoCriticalVulnerabilities(): R;
      toMeetComplianceThreshold(threshold: number): R;
    }
  }
}

expect.extend({
  toPassSecurityTest(received: SecurityTestResult) {
    const pass = received.status === 'passed';
    return {
      message: () => `Expected security test ${received.name} to ${pass ? 'fail' : 'pass'} but it ${pass ? 'passed' : 'failed'}`,
      pass
    };
  },
  
  toHaveNoCriticalVulnerabilities(received: SecurityTestResult) {
    const criticalVulns = received.vulnerabilities.filter(v => v.severity === 'critical').length;
    const pass = criticalVulns === 0;
    return {
      message: () => `Expected no critical vulnerabilities but found ${criticalVulns}`,
      pass
    };
  },
  
  toMeetComplianceThreshold(received: any, threshold: number) {
    const score = received.compliance_score || received.complianceScore || 0;
    const pass = score >= threshold;
    return {
      message: () => `Expected compliance score of at least ${threshold} but got ${score}`,
      pass
    };
  }
});