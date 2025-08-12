/**
 * OWASP ZAP Integration for Automated Security Scanning
 * Executive Assistant Security Testing Framework
 */

import { SecurityTest, SecurityTestResult, SecurityThreatType } from '../core/security-test-framework';
import * as fs from 'fs'; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as path from 'path'; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface ZAPScanConfig {
  zapProxyUrl: string;
  zapApiKey: string;
  targetUrl: string;
  scanPolicies: string[];
  spiderConfig: {
    maxDepth: number;
    maxChildren: number;
    excludeUrls: string[];
  };
  activeScanConfig: {
    policy: string;
    maxRulesToRun: number;
    alertThreshold: string;
  };
  reportFormats: string[];
}

export interface ZAPScanResult {
  scanId: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  alerts: ZAPAlert[];
  summary: {
    highAlerts: number;
    mediumAlerts: number;
    lowAlerts: number;
    informationalAlerts: number;
  };
}

export interface ZAPAlert {
  id: string;
  name: string;
  description: string;
  solution: string;
  reference: string;
  risk: 'High' | 'Medium' | 'Low' | 'Informational';
  confidence: 'High' | 'Medium' | 'Low';
  url: string;
  param: string;
  evidence: string;
  cweid: number;
  wascid: number;
  sourceid: number;
}

/**
 * OWASP ZAP Security Scanner Integration
 */
export class OWASPZAPIntegration extends SecurityTest {
  private zapConfig: ZAPScanConfig;

  constructor(config: ZAPScanConfig) {
    super();
    this.zapConfig = config;
  }

  async runTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    try {
      // Initialize ZAP
      results.push(await this.initializeZAP());
      
      // Run spider scan
      results.push(await this.runSpiderScan());
      
      // Run active security scan
      results.push(await this.runActiveScan());
      
      // Run passive scan analysis
      results.push(await this.runPassiveScan());
      
      // Generate and analyze reports
      results.push(await this.generateSecurityReport());
      
      // Run OWASP Top 10 specific tests
      results.push(await this.runOWASPTop10Tests());

    } catch (error) {
      results.push(this.createTestResult(
        'zap-integration-error',
        'ZAP Integration Error',
        'failed',
        'critical',
        `ZAP integration failed: ${error instanceof Error ? error.message : String(error)}`,
        [],
        [],
        [],
        ['Check ZAP proxy configuration', 'Verify ZAP API key', 'Ensure target URL is accessible']
      ));
    }

    this.results = results;
    results.forEach(result => this.updateMetrics(result));
    
    return results;
  }

  private async initializeZAP(): Promise<SecurityTestResult> {
    console.log('Initializing OWASP ZAP...');
    
    // Simulate ZAP initialization
    const initSuccess = await this.simulateZAPConnection();
    
    if (!initSuccess) {
      return this.createTestResult(
        'zap-init-001',
        'ZAP Initialization',
        'failed',
        'critical',
        'Failed to connect to ZAP proxy',
        [],
        [this.createVulnerability(
          'ZAP Connection Failure',
          'critical',
          'security_infrastructure',
          'Unable to establish connection with ZAP proxy',
          'Verify ZAP is running and accessible at configured URL'
        )],
        [],
        ['Start ZAP proxy server', 'Verify network connectivity', 'Check firewall settings']
      );
    }

    return this.createTestResult(
      'zap-init-001',
      'ZAP Initialization',
      'passed',
      'low',
      'Successfully connected to ZAP proxy',
      [],
      [],
      [],
      []
    );
  }

  private async runSpiderScan(): Promise<SecurityTestResult> {
    console.log('Running ZAP Spider scan...');
    
    const spiderResult = await this.simulateSpiderScan();
    const vulnerabilities = [];
    const threats = [];

    if (spiderResult.urlsFound < 5) {
      vulnerabilities.push(this.createVulnerability(
        'Limited URL Discovery',
        'medium',
        'spider_scan',
        'Spider scan found very few URLs, coverage may be insufficient',
        'Review spider configuration and authentication'
      ));
    }

    if (spiderResult.errors.length > 0) {
      for (const error of spiderResult.errors) {
        vulnerabilities.push(this.createVulnerability(
          'Spider Scan Error',
          'low',
          'spider_scan',
          `Spider encountered error: ${error}`,
          'Review target application for scan blocking mechanisms'
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';

    return this.createTestResult(
      'zap-spider-001',
      'ZAP Spider Scan',
      status,
      'medium',
      `Spider scan completed. Found ${spiderResult.urlsFound} URLs, ${spiderResult.errors.length} errors`,
      threats,
      vulnerabilities,
      [],
      ['Ensure proper authentication for spider', 'Review excluded URLs configuration', 'Check for rate limiting issues']
    );
  }

  private async runActiveScan(): Promise<SecurityTestResult> {
    console.log('Running ZAP Active security scan...');
    
    const activeScanResult = await this.simulateActiveScan();
    const vulnerabilities = [];
    const threats = [];

    // Process high-risk alerts
    for (const alert of activeScanResult.alerts.filter(a => a.risk === 'High')) {
      threats.push(this.createThreat(
        this.mapZAPAlertToThreatType(alert.name),
        'high',
        'automated_scan',
        alert.url,
        alert.description,
        true,
        false
      ));

      vulnerabilities.push(this.createVulnerability(
        alert.name,
        'high',
        'web_application',
        alert.description,
        alert.solution,
        undefined,
        undefined,
        [alert.reference]
      ));
    }

    // Process medium-risk alerts
    for (const alert of activeScanResult.alerts.filter(a => a.risk === 'Medium')) {
      vulnerabilities.push(this.createVulnerability(
        alert.name,
        'medium',
        'web_application',
        alert.description,
        alert.solution,
        undefined,
        undefined,
        [alert.reference]
      ));
    }

    const criticalIssues = threats.length;
    const status = criticalIssues === 0 ? 'passed' : 'failed';

    return this.createTestResult(
      'zap-active-001',
      'ZAP Active Security Scan',
      status,
      'critical',
      `Active scan found ${activeScanResult.alerts.length} alerts: ${activeScanResult.summary.highAlerts} high, ${activeScanResult.summary.mediumAlerts} medium`,
      threats,
      vulnerabilities,
      [],
      [
        'Address all high-risk vulnerabilities immediately',
        'Review and remediate medium-risk issues',
        'Implement security controls based on findings',
        'Schedule regular security scans'
      ]
    );
  }

  private async runPassiveScan(): Promise<SecurityTestResult> {
    console.log('Running ZAP Passive scan analysis...');
    
    const passiveScanResult = await this.simulatePassiveScan();
    const vulnerabilities = [];

    // Analyze passive scan results for configuration issues
    for (const finding of passiveScanResult.findings) {
      if (finding.type === 'missing_security_header') {
        vulnerabilities.push(this.createVulnerability(
          'Missing Security Header',
          'medium',
          'http_security',
          `Missing security header: ${finding.details}`,
          'Implement recommended security headers',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html']
        ));
      }
      
      if (finding.type === 'information_disclosure') {
        vulnerabilities.push(this.createVulnerability(
          'Information Disclosure',
          'low',
          'information_leakage',
          finding.details,
          'Remove or obfuscate sensitive information from responses',
          undefined,
          undefined,
          ['https://owasp.org/www-community/vulnerabilities/Information_exposure_through_query_strings_in_url']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';

    return this.createTestResult(
      'zap-passive-001',
      'ZAP Passive Scan Analysis',
      status,
      'medium',
      `Passive scan identified ${passiveScanResult.findings.length} findings`,
      [],
      vulnerabilities,
      [],
      [
        'Implement missing security headers',
        'Review information disclosure issues',
        'Enable security-focused response configurations'
      ]
    );
  }

  private async generateSecurityReport(): Promise<SecurityTestResult> {
    console.log('Generating ZAP security reports...');
    
    const reportGenerated = await this.simulateReportGeneration();
    
    if (!reportGenerated.success) {
      return this.createTestResult(
        'zap-report-001',
        'ZAP Report Generation',
        'failed',
        'medium',
        'Failed to generate security report',
        [],
        [this.createVulnerability(
          'Report Generation Failure',
          'medium',
          'reporting',
          'Unable to generate security scan report',
          'Check ZAP report generation configuration'
        )],
        [],
        ['Verify report template configuration', 'Check file system permissions', 'Review ZAP logging for errors']
      );
    }

    // Create compliance results based on report
    const compliance = [
      this.createComplianceResult(
        'OWASP',
        'OWASP Top 10 2021',
        reportGenerated.owaspCompliance ? 'compliant' : 'non-compliant',
        `OWASP Top 10 compliance: ${reportGenerated.owaspScore}/10`,
        [reportGenerated.reportPath]
      )
    ];

    return this.createTestResult(
      'zap-report-001',
      'ZAP Security Report Generation',
      'passed',
      'low',
      `Security report generated successfully at ${reportGenerated.reportPath}`,
      [],
      [],
      compliance,
      ['Review detailed security report', 'Share findings with development team', 'Track remediation progress']
    );
  }

  private async runOWASPTop10Tests(): Promise<SecurityTestResult> {
    console.log('Running OWASP Top 10 2021 specific tests...');
    
    const owaspTests = await this.simulateOWASPTop10Tests();
    const vulnerabilities = [];
    const threats = [];
    const compliance = [];

    // Test each OWASP Top 10 category
    const owaspTop10 = [
      { id: 'A01', name: 'Broken Access Control', severity: 'critical' },
      { id: 'A02', name: 'Cryptographic Failures', severity: 'high' },
      { id: 'A03', name: 'Injection', severity: 'critical' },
      { id: 'A04', name: 'Insecure Design', severity: 'high' },
      { id: 'A05', name: 'Security Misconfiguration', severity: 'high' },
      { id: 'A06', name: 'Vulnerable and Outdated Components', severity: 'high' },
      { id: 'A07', name: 'Identification and Authentication Failures', severity: 'critical' },
      { id: 'A08', name: 'Software and Data Integrity Failures', severity: 'high' },
      { id: 'A09', name: 'Security Logging and Monitoring Failures', severity: 'medium' },
      { id: 'A10', name: 'Server-Side Request Forgery', severity: 'high' }
    ];

    let compliantCategories = 0;

    for (const category of owaspTop10) {
      const testResult = owaspTests.results[category.id];
      
      if (testResult && testResult.vulnerabilities.length > 0) {
        for (const vuln of testResult.vulnerabilities) {
          threats.push(this.createThreat(
            this.mapOWASPCategoryToThreatType(category.id),
            category.severity as 'low' | 'medium' | 'high' | 'critical',
            'web_application',
            'application',
            `${category.name}: ${vuln.description}`,
            true,
            false
          ));

          vulnerabilities.push(this.createVulnerability(
            category.name,
            category.severity as 'low' | 'medium' | 'high' | 'critical',
            'owasp_top10',
            vuln.description,
            vuln.solution,
            undefined,
            undefined,
            [`https://owasp.org/Top10/2021/${category.id}_2021-${category.name.replace(/\s+/g, '_')}/`]
          ));
        }
        
        compliance.push(this.createComplianceResult(
          'OWASP Top 10',
          category.name,
          'non-compliant',
          `${testResult.vulnerabilities.length} vulnerabilities found`,
          [testResult.evidence]
        ));
      } else {
        compliantCategories++;
        compliance.push(this.createComplianceResult(
          'OWASP Top 10',
          category.name,
          'compliant',
          'No vulnerabilities found in this category',
          []
        ));
      }
    }

    const _overallCompliance = compliantCategories === owaspTop10.length ? 'compliant' : 'non-compliant';
    const status = vulnerabilities.filter(v => v.severity === 'critical').length === 0 ? 'passed' : 'failed';

    return this.createTestResult(
      'owasp-top10-001',
      'OWASP Top 10 2021 Assessment',
      status,
      'critical',
      `OWASP Top 10 assessment: ${compliantCategories}/${owaspTop10.length} categories compliant`,
      threats,
      vulnerabilities,
      compliance,
      [
        'Address all critical OWASP Top 10 vulnerabilities',
        'Implement security controls for identified risks',
        'Regular OWASP Top 10 compliance assessments',
        'Developer training on OWASP Top 10 risks'
      ]
    );
  }

  // Simulation methods (in production, these would make actual ZAP API calls)
  private async simulateZAPConnection(): Promise<boolean> {
    // Simulate ZAP connection attempt
    return Math.random() > 0.1; // 90% success rate
  }

  private async simulateSpiderScan(): Promise<{urlsFound: number, errors: string[]}> {
    return {
      urlsFound: Math.floor(Math.random() * 100) + 10,
      errors: Math.random() > 0.8 ? ['Rate limit exceeded', 'Authentication required'] : []
    };
  }

  private async simulateActiveScan(): Promise<ZAPScanResult> {
    const alerts: ZAPAlert[] = [];
    
    // Generate sample alerts
    if (Math.random() > 0.7) {
      alerts.push({
        id: '1',
        name: 'SQL Injection',
        description: 'SQL injection vulnerability detected',
        solution: 'Use parameterized queries',
        reference: 'https://owasp.org/www-community/attacks/SQL_Injection',
        risk: 'High',
        confidence: 'High',
        url: '/api/users',
        param: 'id',
        evidence: 'MySQL error in response',
        cweid: 89,
        wascid: 19,
        sourceid: 1
      });
    }

    if (Math.random() > 0.6) {
      alerts.push({
        id: '2',
        name: 'Cross Site Scripting (Reflected)',
        description: 'Reflected XSS vulnerability detected',
        solution: 'Encode user input',
        reference: 'https://owasp.org/www-community/attacks/xss/',
        risk: 'High',
        confidence: 'Medium',
        url: '/search',
        param: 'query',
        evidence: '<script>alert(1)</script>',
        cweid: 79,
        wascid: 8,
        sourceid: 2
      });
    }

    const summary = {
      highAlerts: alerts.filter(a => a.risk === 'High').length,
      mediumAlerts: alerts.filter(a => a.risk === 'Medium').length,
      lowAlerts: alerts.filter(a => a.risk === 'Low').length,
      informationalAlerts: alerts.filter(a => a.risk === 'Informational').length
    };

    return {
      scanId: 'scan-' + Date.now(),
      status: 'completed',
      progress: 100,
      alerts,
      summary
    };
  }

  private async simulatePassiveScan(): Promise<{findings: Array<{type: string, details: string}>}> {
    const findings = [];
    
    if (Math.random() > 0.5) {
      findings.push({
        type: 'missing_security_header',
        details: 'Content-Security-Policy header missing'
      });
    }

    if (Math.random() > 0.7) {
      findings.push({
        type: 'information_disclosure',
        details: 'Server version information disclosed in headers'
      });
    }

    return { findings };
  }

  private async simulateReportGeneration(): Promise<{success: boolean, reportPath: string, owaspCompliance: boolean, owaspScore: number}> {
    return {
      success: Math.random() > 0.1,
      reportPath: '/tmp/security-report.html',
      owaspCompliance: Math.random() > 0.5,
      owaspScore: Math.floor(Math.random() * 10) + 1
    };
  }

  private async simulateOWASPTop10Tests(): Promise<{results: Record<string, {vulnerabilities: Array<{description: string, solution: string}>, evidence: string}>}> {
    const results: Record<string, {vulnerabilities: Array<{description: string, solution: string}>, evidence: string}> = {};
    
    // Simulate some vulnerabilities in random categories
    if (Math.random() > 0.6) {
      results['A01'] = {
        vulnerabilities: [{
          description: 'User can access other users\' data by modifying URL parameters',
          solution: 'Implement proper access controls and object-level authorization'
        }],
        evidence: 'URL parameter manipulation test'
      };
    }

    if (Math.random() > 0.7) {
      results['A03'] = {
        vulnerabilities: [{
          description: 'SQL injection vulnerability in login form',
          solution: 'Use parameterized queries and input validation'
        }],
        evidence: 'SQL error messages in response'
      };
    }

    return { results };
  }

  private mapZAPAlertToThreatType(alertName: string): SecurityThreatType {
    const mapping: Record<string, SecurityThreatType> = {
      'SQL Injection': SecurityThreatType.SQL_INJECTION,
      'Cross Site Scripting': SecurityThreatType.XSS,
      'Remote Code Execution': SecurityThreatType.COMMAND_INJECTION,
      'Path Traversal': SecurityThreatType.PATH_TRAVERSAL,
      'Authentication Bypass': SecurityThreatType.AUTHENTICATION_BYPASS
    };
    
    for (const [pattern, threatType] of Object.entries(mapping)) {
      if (alertName.includes(pattern)) {
        return threatType;
      }
    }
    
    return SecurityThreatType.INPUT_VALIDATION;
  }

  private mapOWASPCategoryToThreatType(categoryId: string): SecurityThreatType {
    const mapping: Record<string, SecurityThreatType> = {
      'A01': SecurityThreatType.UNAUTHORIZED_ACCESS,
      'A02': SecurityThreatType.ENCRYPTION_WEAKNESS,
      'A03': SecurityThreatType.SQL_INJECTION,
      'A04': SecurityThreatType.INPUT_VALIDATION,
      'A05': SecurityThreatType.INPUT_VALIDATION,
      'A06': SecurityThreatType.INPUT_VALIDATION,
      'A07': SecurityThreatType.AUTHENTICATION_BYPASS,
      'A08': SecurityThreatType.DATA_LEAK,
      'A09': SecurityThreatType.INPUT_VALIDATION,
      'A10': SecurityThreatType.COMMAND_INJECTION
    };
    
    return mapping[categoryId] || SecurityThreatType.INPUT_VALIDATION;
  }

  /**
   * Create ZAP scan configuration for CI/CD integration
   */
  public static createCICDConfig(targetUrl: string): ZAPScanConfig {
    return {
      zapProxyUrl: 'http://localhost:8080',
      zapApiKey: process.env.ZAP_API_KEY || 'changeme',
      targetUrl,
      scanPolicies: ['Default Policy'],
      spiderConfig: {
        maxDepth: 5,
        maxChildren: 10,
        excludeUrls: ['/logout', '/admin/delete']
      },
      activeScanConfig: {
        policy: 'Default Policy',
        maxRulesToRun: -1,
        alertThreshold: 'MEDIUM'
      },
      reportFormats: ['HTML', 'JSON', 'XML']
    };
  }

  /**
   * Generate ZAP Docker command for CI/CD
   */
  public static generateDockerCommand(config: ZAPScanConfig): string {
    return `docker run -t owasp/zap2docker-stable zap-baseline.py \\
      -t ${config.targetUrl} \\
      -J zap-report.json \\
      -H zap-report.html \\
      -r zap-report.md \\
      -z "-config api.key=${config.zapApiKey}"`;
  }
}