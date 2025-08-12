/**
 * API Security Testing Framework
 * Executive Assistant Security Testing Suite
 */

import { SecurityTest, SecurityTestResult, SecurityThreatType } from './security-test-framework';
import * as crypto from 'crypto';

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requiresAuth: boolean;
  rateLimit?: number;
  inputValidation?: string[];
  expectedStatus: number[];
}

export interface APISecurityTestConfig {
  baseUrl: string;
  endpoints: APIEndpoint[];
  authToken?: string;
  userAgent: string;
  timeout: number;
}

/**
 * API Security Test Suite
 */
export class APISecurityTest extends SecurityTest {
  private apiConfig: APISecurityTestConfig;

  constructor(config: APISecurityTestConfig) {
    super();
    this.apiConfig = config;
  }

  async runTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    // API authentication tests
    results.push(await this.testAPIAuthentication());
    
    // API authorization tests
    results.push(await this.testAPIAuthorization());
    
    // Input validation tests
    results.push(await this.testAPIInputValidation());
    
    // Rate limiting tests
    results.push(await this.testAPIRateLimiting());
    
    // CORS security tests
    results.push(await this.testCORSSecurity());
    
    // HTTP security headers tests
    results.push(await this.testSecurityHeaders());
    
    // API versioning security tests
    results.push(await this.testAPIVersioningSecurity());
    
    // Data exposure tests
    results.push(await this.testDataExposure());

    this.results = results;
    results.forEach(result => this.updateMetrics(result));
    
    return results;
  }

  private async testAPIAuthentication(): Promise<SecurityTestResult> {
    const vulnerabilities = [];
    const threats = [];
    let issues = 0;

    // Test endpoints without authentication
    for (const endpoint of this.apiConfig.endpoints.filter(e => e.requiresAuth)) {
      const response = await this.simulateAPIRequest(endpoint.path, endpoint.method, null);
      
      if (response.status !== 401 && response.status !== 403) {
        issues++;
        threats.push(this.createThreat(
          SecurityThreatType.UNAUTHORIZED_ACCESS,
          'critical',
          'unauthenticated_user',
          `${endpoint.method} ${endpoint.path}`,
          'Protected endpoint accessible without authentication',
          true,
          false
        ));

        vulnerabilities.push(this.createVulnerability(
          'Missing Authentication',
          'critical',
          'api_endpoint',
          `Endpoint ${endpoint.method} ${endpoint.path} accessible without authentication`,
          'Implement proper authentication checks on protected endpoints',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html']
        ));
      }
    }

    // Test with invalid tokens
    const invalidTokens = [
      'invalid_token',
      'expired_token',
      'Bearer invalid',
      'malformed.jwt.token',
      ''
    ];

    for (const token of invalidTokens) {
      for (const endpoint of this.apiConfig.endpoints.filter(e => e.requiresAuth)) {
        const response = await this.simulateAPIRequest(endpoint.path, endpoint.method, token);
        
        if (response.status === 200) {
          issues++;
          vulnerabilities.push(this.createVulnerability(
            'Invalid Token Accepted',
            'high',
            'api_authentication',
            `Endpoint ${endpoint.method} ${endpoint.path} accepts invalid token: ${token}`,
            'Implement proper token validation',
            undefined,
            undefined,
            ['https://tools.ietf.org/html/rfc6750']
          ));
        }
      }
    }

    const status = issues === 0 ? 'passed' : 'failed';
    const recommendations = issues > 0 ? [
      'Implement authentication on all protected endpoints',
      'Validate tokens properly and reject invalid ones',
      'Use standard authentication mechanisms (OAuth 2.0, JWT)',
      'Implement proper error handling for authentication failures',
      'Log authentication attempts for monitoring'
    ] : [];

    return this.createTestResult(
      'api-auth-001',
      'API Authentication Security Test',
      status,
      'critical',
      `API authentication test completed, ${issues} issues found`,
      threats,
      vulnerabilities,
      [],
      recommendations
    );
  }

  private async testAPIAuthorization(): Promise<SecurityTestResult> {
    const vulnerabilities = [];
    const threats = [];
    let issues = 0;

    // Test privilege escalation
    const userRoles = ['user', 'admin', 'guest'];
    const restrictedEndpoints = this.apiConfig.endpoints.filter(e => 
      e.path.includes('/admin') || e.path.includes('/delete') || e.method === 'DELETE'
    );

    for (const role of userRoles) {
      for (const endpoint of restrictedEndpoints) {
        const token = this.generateTestToken(role);
        const response = await this.simulateAPIRequest(endpoint.path, endpoint.method, token);
        
        // Regular users shouldn't access admin endpoints
        if (role === 'user' && endpoint.path.includes('/admin') && response.status === 200) {
          issues++;
          threats.push(this.createThreat(
            SecurityThreatType.UNAUTHORIZED_ACCESS,
            'high',
            'authenticated_user',
            `${endpoint.method} ${endpoint.path}`,
            'Privilege escalation: regular user accessing admin endpoint',
            true,
            false
          ));

          vulnerabilities.push(this.createVulnerability(
            'Privilege Escalation',
            'high',
            'api_authorization',
            `User role can access admin endpoint: ${endpoint.method} ${endpoint.path}`,
            'Implement proper role-based access control (RBAC)',
            undefined,
            undefined,
            ['https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html']
          ));
        }
      }
    }

    // Test Insecure Direct Object References (IDOR)
    const idorTests = [
      { path: '/api/users/1', description: 'Access other user data' },
      { path: '/api/documents/admin-secret', description: 'Access restricted documents' },
      { path: '/api/settings/global', description: 'Access global settings' }
    ];

    for (const test of idorTests) {
      const userToken = this.generateTestToken('user');
      const response = await this.simulateAPIRequest(test.path, 'GET', userToken);
      
      if (response.status === 200 && response.data && response.data.sensitive) {
        issues++;
        threats.push(this.createThreat(
          SecurityThreatType.DATA_LEAK,
          'high',
          'authenticated_user',
          test.path,
          `IDOR vulnerability: ${test.description}`,
          true,
          false
        ));

        vulnerabilities.push(this.createVulnerability(
          'Insecure Direct Object Reference',
          'high',
          'api_authorization',
          `IDOR vulnerability in ${test.path}: ${test.description}`,
          'Implement proper access control checks for object references',
          undefined,
          undefined,
          ['https://owasp.org/www-community/attacks/Insecure_Direct_Object_Reference']
        ));
      }
    }

    const status = issues === 0 ? 'passed' : 'failed';
    const recommendations = issues > 0 ? [
      'Implement role-based access control (RBAC)',
      'Validate user permissions for each resource access',
      'Use indirect object references or access tokens',
      'Implement proper session management',
      'Log authorization failures for monitoring'
    ] : [];

    return this.createTestResult(
      'api-authz-001',
      'API Authorization Security Test',
      status,
      'high',
      `API authorization test completed, ${issues} issues found`,
      threats,
      vulnerabilities,
      [],
      recommendations
    );
  }

  private async testAPIInputValidation(): Promise<SecurityTestResult> {
    const vulnerabilities = [];
    const threats = [];
    let issues = 0;

    const maliciousInputs = {
      sql_injection: [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --"
      ],
      xss: [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert(document.cookie)'
      ],
      xxe: [
        '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>',
        '<?xml version="1.0" encoding="ISO-8859-1"?><!DOCTYPE foo [<!ELEMENT foo ANY ><!ENTITY xxe SYSTEM "file:///dev/random" >]><foo>&xxe;</foo>'
      ],
      command_injection: [
        '; ls -la',
        '| cat /etc/passwd',
        '&& whoami'
      ],
      ldap_injection: [
        '*)(uid=*))(|(uid=*',
        '*))(|(cn=*'
      ],
      json_injection: [
        '{"test": "value", "admin": true}',
        '{"$ne": null}'
      ]
    };

    for (const endpoint of this.apiConfig.endpoints.filter(e => ['POST', 'PUT', 'PATCH'].includes(e.method))) {
      for (const [attackType, payloads] of Object.entries(maliciousInputs)) {
        for (const payload of payloads) {
          const testData = this.createTestPayload(payload);
          const response = await this.simulateAPIRequest(
            endpoint.path, 
            endpoint.method, 
            this.apiConfig.authToken, 
            testData
          );

          // Check if malicious input caused unexpected behavior
          if (this.detectMaliciousResponse(response, attackType)) {
            issues++;
            
            const severity = this.getSeverityForAttackType(attackType);
            threats.push(this.createThreat(
              this.getThreatTypeForAttack(attackType),
              severity,
              'malicious_input',
              `${endpoint.method} ${endpoint.path}`,
              `${attackType} vulnerability detected with payload: ${payload}`,
              true,
              false
            ));

            vulnerabilities.push(this.createVulnerability(
              this.getVulnerabilityName(attackType),
              severity,
              'input_validation',
              `${attackType} vulnerability in ${endpoint.method} ${endpoint.path}`,
              'Implement proper input validation and sanitization',
              undefined,
              undefined,
              [this.getReferenceForAttackType(attackType)]
            ));
          }
        }
      }
    }

    // Test oversized inputs
    const oversizedInput = 'A'.repeat(10000);
    for (const endpoint of this.apiConfig.endpoints.filter(e => ['POST', 'PUT', 'PATCH'].includes(e.method))) {
      const testData = this.createTestPayload(oversizedInput);
      const response = await this.simulateAPIRequest(endpoint.path, endpoint.method, this.apiConfig.authToken, testData);
      
      if (response.status === 500) {
        issues++;
        vulnerabilities.push(this.createVulnerability(
          'Input Size Validation',
          'medium',
          'input_validation',
          `Endpoint ${endpoint.method} ${endpoint.path} doesn't handle oversized input properly`,
          'Implement input size limits and proper error handling',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html']
        ));
      }
    }

    const status = issues === 0 ? 'passed' : 'failed';
    const recommendations = issues > 0 ? [
      'Implement comprehensive input validation',
      'Use parameterized queries for database operations',
      'Sanitize and encode all user inputs',
      'Implement input size limits',
      'Use allowlists instead of blocklists',
      'Validate data types and formats strictly'
    ] : [];

    return this.createTestResult(
      'api-input-001',
      'API Input Validation Security Test',
      status,
      'critical',
      `API input validation test completed, ${issues} issues found`,
      threats,
      vulnerabilities,
      [],
      recommendations
    );
  }

  private async testAPIRateLimiting(): Promise<SecurityTestResult> {
    const vulnerabilities = [];
    const threats = [];
    let issues = 0;

    // Test rate limiting on endpoints
    for (const endpoint of this.apiConfig.endpoints) {
      const requestCount = 100;
      let blockedRequests = 0;
      let successfulRequests = 0;

      for (let i = 0; i < requestCount; i++) {
        const response = await this.simulateAPIRequest(endpoint.path, endpoint.method, this.apiConfig.authToken);
        
        if (response.status === 429) {
          blockedRequests++;
        } else if (response.status >= 200 && response.status < 300) {
          successfulRequests++;
        }
      }

      // If most requests succeeded, rate limiting may be insufficient
      if (successfulRequests > 50 && blockedRequests < 10) {
        issues++;
        threats.push(this.createThreat(
          SecurityThreatType.UNAUTHORIZED_ACCESS,
          'medium',
          'attacker',
          `${endpoint.method} ${endpoint.path}`,
          'Insufficient rate limiting allows potential abuse',
          true,
          false
        ));

        vulnerabilities.push(this.createVulnerability(
          'Insufficient Rate Limiting',
          'medium',
          'api_gateway',
          `Endpoint ${endpoint.method} ${endpoint.path} lacks proper rate limiting`,
          'Implement appropriate rate limiting based on endpoint sensitivity',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html']
        ));
      }
    }

    const status = issues === 0 ? 'passed' : 'failed';
    const recommendations = issues > 0 ? [
      'Implement rate limiting on all API endpoints',
      'Use different limits for different endpoint types',
      'Implement progressive delays for repeated violations',
      'Consider IP-based and user-based rate limiting',
      'Monitor and alert on rate limit violations'
    ] : [];

    return this.createTestResult(
      'api-rate-limit-001',
      'API Rate Limiting Security Test',
      status,
      'medium',
      `API rate limiting test completed, ${issues} issues found`,
      threats,
      vulnerabilities,
      [],
      recommendations
    );
  }

  private async testCORSSecurity(): Promise<SecurityTestResult> {
    const vulnerabilities = [];
    let issues = 0;

    // Test CORS configuration
    const corsTests = [
      { origin: 'https://evil.com', description: 'Malicious origin' },
      { origin: '*', description: 'Wildcard origin' },
      { origin: 'null', description: 'Null origin' },
      { origin: 'file://', description: 'File protocol origin' }
    ];

    for (const test of corsTests) {
      const corsResponse = await this.simulateCORSRequest(test.origin);
      
      if (corsResponse.allowed) {
        issues++;
        const severity = test.origin === '*' ? 'high' : 'medium';
        
        vulnerabilities.push(this.createVulnerability(
          'Insecure CORS Configuration',
          severity,
          'cors_policy',
          `CORS allows potentially dangerous origin: ${test.description}`,
          'Configure CORS to allow only trusted origins',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS']
        ));
      }
    }

    // Test preflight request handling
    const preflightResponse = await this.simulatePreflightRequest();
    if (!preflightResponse.handled) {
      issues++;
      vulnerabilities.push(this.createVulnerability(
        'Missing Preflight Handling',
        'medium',
        'cors_policy',
        'API doesn\'t properly handle CORS preflight requests',
        'Implement proper preflight request handling',
        undefined,
        undefined,
        ['https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#preflighted_requests']
      ));
    }

    const status = issues === 0 ? 'passed' : 'failed';
    const recommendations = issues > 0 ? [
      'Configure CORS to allow only trusted origins',
      'Avoid using wildcard (*) in Access-Control-Allow-Origin',
      'Implement proper preflight request handling',
      'Use specific methods and headers in CORS policy',
      'Consider credentials in CORS configuration'
    ] : [];

    return this.createTestResult(
      'cors-security-001',
      'CORS Security Configuration Test',
      status,
      'medium',
      `CORS security test completed, ${issues} issues found`,
      [],
      vulnerabilities,
      [],
      recommendations
    );
  }

  private async testSecurityHeaders(): Promise<SecurityTestResult> {
    const vulnerabilities = [];
    let issues = 0;

    const requiredHeaders = {
      'Content-Security-Policy': {
        severity: 'high' as const,
        description: 'Missing Content Security Policy header'
      },
      'X-Frame-Options': {
        severity: 'medium' as const,
        description: 'Missing X-Frame-Options header'
      },
      'X-Content-Type-Options': {
        severity: 'medium' as const,
        description: 'Missing X-Content-Type-Options header'
      },
      'Strict-Transport-Security': {
        severity: 'high' as const,
        description: 'Missing Strict Transport Security header'
      },
      'X-XSS-Protection': {
        severity: 'low' as const,
        description: 'Missing X-XSS-Protection header'
      }
    };

    // Test security headers on main endpoint
    const response = await this.simulateAPIRequest('/api/health', 'GET', null);
    
    for (const [headerName, config] of Object.entries(requiredHeaders)) {
      if (!response.headers[headerName.toLowerCase()]) {
        issues++;
        vulnerabilities.push(this.createVulnerability(
          'Missing Security Header',
          config.severity,
          'http_headers',
          config.description,
          `Add ${headerName} header with appropriate value`,
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html']
        ));
      }
    }

    // Test for information disclosure in headers
    const dangerousHeaders = ['server', 'x-powered-by', 'x-aspnet-version'];
    for (const header of dangerousHeaders) {
      if (response.headers[header]) {
        issues++;
        vulnerabilities.push(this.createVulnerability(
          'Information Disclosure',
          'low',
          'http_headers',
          `Response contains information disclosure header: ${header}`,
          `Remove or obfuscate ${header} header`,
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html']
        ));
      }
    }

    const status = issues === 0 ? 'passed' : 'failed';
    const recommendations = issues > 0 ? [
      'Implement all required security headers',
      'Configure Content Security Policy appropriately',
      'Remove information disclosure headers',
      'Use HTTPS with HSTS enabled',
      'Regularly review and update security headers'
    ] : [];

    return this.createTestResult(
      'security-headers-001',
      'HTTP Security Headers Test',
      status,
      'high',
      `Security headers test completed, ${issues} issues found`,
      [],
      vulnerabilities,
      [],
      recommendations
    );
  }

  private async testAPIVersioningSecurity(): Promise<SecurityTestResult> {
    const vulnerabilities = [];
    let issues = 0;

    // Test if old API versions are still accessible
    const apiVersions = ['v1', 'v2', 'v3', 'beta', 'alpha'];
    
    for (const version of apiVersions) {
      const versionedPath = `/api/${version}/users`;
      const response = await this.simulateAPIRequest(versionedPath, 'GET', this.apiConfig.authToken);
      
      if (response.status === 200 && response.deprecated) {
        issues++;
        vulnerabilities.push(this.createVulnerability(
          'Deprecated API Version',
          'medium',
          'api_versioning',
          `Deprecated API version ${version} is still accessible`,
          'Disable deprecated API versions or implement proper deprecation process',
          undefined,
          undefined,
          ['https://restfulapi.net/versioning/']
        ));
      }
    }

    const status = issues === 0 ? 'passed' : 'failed';
    const recommendations = issues > 0 ? [
      'Implement proper API versioning strategy',
      'Disable or restrict access to deprecated versions',
      'Provide clear migration paths for API consumers',
      'Monitor usage of deprecated API versions',
      'Implement sunset headers for deprecated APIs'
    ] : [];

    return this.createTestResult(
      'api-versioning-001',
      'API Versioning Security Test',
      status,
      'medium',
      `API versioning test completed, ${issues} issues found`,
      [],
      vulnerabilities,
      [],
      recommendations
    );
  }

  private async testDataExposure(): Promise<SecurityTestResult> {
    const vulnerabilities = [];
    const threats = [];
    let issues = 0;

    // Test for sensitive data exposure in responses
    const sensitiveDataPatterns = {
      password: /password\s*[:=]\s*["\']([^"\']+)["\']|"password"\s*:\s*"([^"]+)"/i,
      credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/,
      api_key: /api[_\-]?key\s*[:=]\s*["\']([^"\']+)["\']|"api[_\-]?key"\s*:\s*"([^"]+)"/i,
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    };

    for (const endpoint of this.apiConfig.endpoints.filter(e => e.method === 'GET')) {
      const response = await this.simulateAPIRequest(endpoint.path, endpoint.method, this.apiConfig.authToken);
      
      if (response.data && typeof response.data === 'string') {
        for (const [dataType, pattern] of Object.entries(sensitiveDataPatterns)) {
          if (pattern.test(response.data)) {
            issues++;
            
            const severity = dataType === 'password' || dataType === 'api_key' ? 'critical' : 
                           dataType === 'credit_card' || dataType === 'ssn' ? 'high' : 'medium';
            
            threats.push(this.createThreat(
              SecurityThreatType.DATA_LEAK,
              severity,
              'api_response',
              endpoint.path,
              `Sensitive ${dataType} data exposed in API response`,
              true,
              false
            ));

            vulnerabilities.push(this.createVulnerability(
              'Sensitive Data Exposure',
              severity,
              'data_handling',
              `${dataType} data exposed in ${endpoint.path} response`,
              'Remove sensitive data from API responses or implement proper data masking',
              undefined,
              undefined,
              ['https://owasp.org/www-community/vulnerabilities/Information_exposure_through_query_strings_in_url']
            ));
          }
        }
      }
    }

    const status = issues === 0 ? 'passed' : 'failed';
    const recommendations = issues > 0 ? [
      'Review all API responses for sensitive data',
      'Implement data masking for sensitive fields',
      'Use field filtering to limit exposed data',
      'Implement proper data classification',
      'Regular audit API responses for data leaks'
    ] : [];

    return this.createTestResult(
      'data-exposure-001',
      'API Data Exposure Test',
      status,
      'critical',
      `Data exposure test completed, ${issues} issues found`,
      threats,
      vulnerabilities,
      [],
      recommendations
    );
  }

  // Helper methods for API testing simulation
  private async simulateAPIRequest(
    path: string, 
    method: string, 
    token: string | null, 
    data?: any
  ): Promise<{status: number, data?: any, headers: Record<string, string>, deprecated?: boolean}> {
    // Simulate API request - in real implementation, this would make actual HTTP requests
    const headers: Record<string, string> = {};
    
    // Simulate missing security headers (for testing)
    if (Math.random() > 0.7) {
      headers['content-security-policy'] = "default-src 'self'";
    }
    if (Math.random() > 0.8) {
      headers['x-frame-options'] = 'DENY';
    }
    
    // Simulate authentication check
    if (this.apiConfig.endpoints.find(e => e.path === path)?.requiresAuth && !token) {
      return { status: 401, headers };
    }
    
    // Simulate various response scenarios
    if (path.includes('/admin') && token?.includes('user')) {
      return { status: 403, headers }; // Proper authorization
    }
    
    if (data && this.containsMaliciousInput(data)) {
      return { status: 500, data: 'Internal server error', headers }; // Vulnerable to injection
    }
    
    return { 
      status: 200, 
      data: this.generateMockResponseData(path),
      headers,
      deprecated: path.includes('v1') || path.includes('beta')
    };
  }

  private async simulateCORSRequest(origin: string): Promise<{allowed: boolean}> {
    // Simulate CORS check
    const dangerousOrigins = ['*', 'null', 'file://', 'https://evil.com'];
    return { allowed: dangerousOrigins.includes(origin) };
  }

  private async simulatePreflightRequest(): Promise<{handled: boolean}> {
    // Simulate preflight request handling
    return { handled: Math.random() > 0.3 };
  }

  private generateTestToken(role: string): string {
    // Generate test JWT-like token for the role
    const header = Buffer.from(JSON.stringify({alg: 'HS256', typ: 'JWT'})).toString('base64');
    const payload = Buffer.from(JSON.stringify({role, exp: Date.now() + 3600000})).toString('base64');
    const signature = crypto.createHmac('sha256', 'secret').update(`${header}.${payload}`).digest('base64');
    return `${header}.${payload}.${signature}`;
  }

  private createTestPayload(maliciousInput: string): any {
    return {
      name: maliciousInput,
      email: `test${maliciousInput}@example.com`,
      data: maliciousInput
    };
  }

  private detectMaliciousResponse(response: any, attackType: string): boolean {
    // Simulate detection of successful attacks based on response
    if (response.status === 500) return true; // Server error might indicate successful injection
    if (response.data && typeof response.data === 'string') {
      // Check for signs of successful attacks
      switch (attackType) {
        case 'sql_injection':
          return response.data.includes('SQL') || response.data.includes('ORA-');
        case 'xss':
          return response.data.includes('<script>') || response.data.includes('alert(');
        case 'xxe':
          return response.data.includes('root:') || response.data.includes('/etc/passwd');
        case 'command_injection':
          return response.data.includes('uid=') || response.data.includes('total');
      }
    }
    return false;
  }

  private getSeverityForAttackType(attackType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      sql_injection: 'critical',
      command_injection: 'critical',
      xxe: 'high',
      xss: 'high',
      ldap_injection: 'medium',
      json_injection: 'medium'
    };
    return severityMap[attackType] || 'medium';
  }

  private getThreatTypeForAttack(attackType: string): SecurityThreatType {
    const threatMap: Record<string, SecurityThreatType> = {
      sql_injection: SecurityThreatType.SQL_INJECTION,
      xss: SecurityThreatType.XSS,
      command_injection: SecurityThreatType.COMMAND_INJECTION,
      xxe: SecurityThreatType.DATA_LEAK,
      ldap_injection: SecurityThreatType.UNAUTHORIZED_ACCESS,
      json_injection: SecurityThreatType.INPUT_VALIDATION
    };
    return threatMap[attackType] || SecurityThreatType.INPUT_VALIDATION;
  }

  private getVulnerabilityName(attackType: string): string {
    const nameMap: Record<string, string> = {
      sql_injection: 'SQL Injection',
      xss: 'Cross-Site Scripting',
      command_injection: 'Command Injection',
      xxe: 'XML External Entity',
      ldap_injection: 'LDAP Injection',
      json_injection: 'JSON Injection'
    };
    return nameMap[attackType] || 'Input Validation';
  }

  private getReferenceForAttackType(attackType: string): string {
    const refMap: Record<string, string> = {
      sql_injection: 'https://owasp.org/www-community/attacks/SQL_Injection',
      xss: 'https://owasp.org/www-community/attacks/xss/',
      command_injection: 'https://owasp.org/www-community/attacks/Command_Injection',
      xxe: 'https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing',
      ldap_injection: 'https://owasp.org/www-community/attacks/LDAP_Injection',
      json_injection: 'https://owasp.org/www-community/attacks/Content_Spoofing'
    };
    return refMap[attackType] || 'https://owasp.org/www-community/';
  }

  private containsMaliciousInput(data: any): boolean {
    if (typeof data === 'string') {
      return /('|--|;|<script|javascript:|file:\/\/|\||\&\&)/.test(data);
    }
    if (typeof data === 'object' && data !== null) {
      return Object.values(data).some(value => this.containsMaliciousInput(value));
    }
    return false;
  }

  private generateMockResponseData(path: string): any {
    // Generate mock response data that might contain sensitive information (for testing)
    if (path.includes('/users')) {
      return JSON.stringify({
        users: [
          { id: 1, name: 'John Doe', email: 'john@example.com', password: 'secret123' }, // Sensitive data leak
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ]
      });
    }
    return JSON.stringify({ message: 'success', timestamp: Date.now() });
  }
}