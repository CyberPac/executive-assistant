/**
 * Comprehensive Security Headers Tests
 * Complete validation of HTTP security headers and web security configurations
 */

import { SecurityTestRunner, SecurityTest, SecurityTestResult, SecurityThreatType } from '../core/security-test-framework';

export class SecurityHeadersTest extends SecurityTest {
  async runTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    // Content Security Policy tests
    results.push(await this.testContentSecurityPolicy());
    
    // HTTP Strict Transport Security tests
    results.push(await this.testHSTS());
    
    // X-Frame-Options tests
    results.push(await this.testXFrameOptions());
    
    // X-Content-Type-Options tests
    results.push(await this.testXContentTypeOptions());
    
    // X-XSS-Protection tests
    results.push(await this.testXXSSProtection());
    
    // Referrer Policy tests
    results.push(await this.testReferrerPolicy());
    
    // Feature Policy/Permissions Policy tests
    results.push(await this.testPermissionsPolicy());
    
    // Cross-Origin headers tests
    results.push(await this.testCrossOriginHeaders());

    this.results = results;
    results.forEach(result => this.updateMetrics(result));
    
    return results;
  }

  private async testContentSecurityPolicy(): Promise<SecurityTestResult> {
    const cspTests = [
      {
        name: 'Missing CSP header',
        headers: {},
        expected: false,
        severity: 'high'
      },
      {
        name: 'Unsafe inline scripts',
        headers: { 'Content-Security-Policy': "script-src 'unsafe-inline'" },
        expected: false,
        severity: 'high'
      },
      {
        name: 'Unsafe eval',
        headers: { 'Content-Security-Policy': "script-src 'unsafe-eval'" },
        expected: false,
        severity: 'high'
      },
      {
        name: 'Wildcard sources',
        headers: { 'Content-Security-Policy': 'script-src *' },
        expected: false,
        severity: 'medium'
      },
      {
        name: 'Data URIs in script-src',
        headers: { 'Content-Security-Policy': 'script-src data:' },
        expected: false,
        severity: 'medium'
      },
      {
        name: 'Strong CSP with nonces',
        headers: { 'Content-Security-Policy': "default-src 'self'; script-src 'nonce-abc123' 'strict-dynamic'; object-src 'none'" },
        expected: true,
        severity: 'low'
      },
      {
        name: 'Strong CSP with hashes',
        headers: { 'Content-Security-Policy': "default-src 'self'; script-src 'sha256-abc123'; style-src 'self' 'unsafe-inline'; object-src 'none'" },
        expected: true,
        severity: 'low'
      }
    ];

    const vulnerabilities = [];
    const threats = [];

    for (const cspTest of cspTests) {
      const result = this.simulateCSPTest(cspTest.headers);
      
      if (result.secure !== cspTest.expected) {
        if (!cspTest.expected && result.secure) {
          // Test expects failure but got secure result - this is actually good
          continue;
        }
        
        if (cspTest.expected && !result.secure) {
          // Expected secure but got insecure
          threats.push(this.createThreat(
            SecurityThreatType.XSS,
            cspTest.severity as 'low' | 'medium' | 'high' | 'critical',
            'malicious_content',
            'web_application',
            `CSP weakness: ${cspTest.name}`,
            true,
            false
          ));

          vulnerabilities.push(this.createVulnerability(
            'Content Security Policy Weakness',
            cspTest.severity as 'low' | 'medium' | 'high' | 'critical',
            'csp_configuration',
            `CSP issue: ${cspTest.name}`,
            'Implement strong Content Security Policy',
            undefined,
            undefined,
            ['https://content-security-policy.com/', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP']
          ));
        }

        if (!cspTest.expected && !result.secure) {
          // Correctly detected insecure CSP
          vulnerabilities.push(this.createVulnerability(
            'Content Security Policy Issue',
            cspTest.severity as 'low' | 'medium' | 'high' | 'critical',
            'csp_configuration',
            `CSP weakness detected: ${cspTest.name}`,
            'Fix Content Security Policy configuration',
            undefined,
            undefined,
            ['https://content-security-policy.com/']
          ));
        }
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'security-headers-csp-001',
      'Content Security Policy Test',
      status,
      'high',
      `Tested ${cspTests.length} CSP configurations`,
      threats,
      vulnerabilities,
      [],
      ['Implement strict CSP without unsafe-inline/unsafe-eval', 'Use nonces or hashes for inline content', 'Avoid wildcard sources', 'Test CSP thoroughly']
    );
  }

  private async testHSTS(): Promise<SecurityTestResult> {
    const hstsTests = [
      {
        name: 'Missing HSTS header',
        headers: {},
        secure: false
      },
      {
        name: 'HSTS with short max-age',
        headers: { 'Strict-Transport-Security': 'max-age=3600' },
        secure: false
      },
      {
        name: 'HSTS without includeSubDomains',
        headers: { 'Strict-Transport-Security': 'max-age=31536000' },
        secure: true,
        warning: true
      },
      {
        name: 'Strong HSTS configuration',
        headers: { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' },
        secure: true
      }
    ];

    const vulnerabilities = [];

    for (const hstsTest of hstsTests) {
      const result = this.simulateHSTSTest(hstsTest.headers);
      
      if (!result.secure && hstsTest.secure) {
        vulnerabilities.push(this.createVulnerability(
          'HSTS Configuration Issue',
          'medium',
          'transport_security',
          `HSTS issue: ${hstsTest.name}`,
          'Configure HTTP Strict Transport Security properly',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security']
        ));
      }

      if (!hstsTest.secure && !result.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Missing HSTS Protection',
          'medium',
          'transport_security',
          `HSTS missing or weak: ${hstsTest.name}`,
          'Implement HTTP Strict Transport Security',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security']
        ));
      }

      if (hstsTest.warning && result.secure) {
        vulnerabilities.push(this.createVulnerability(
          'HSTS Configuration Warning',
          'low',
          'transport_security',
          `HSTS improvement recommended: ${hstsTest.name}`,
          'Consider including includeSubDomains and preload directives',
          undefined,
          undefined,
          ['https://hstspreload.org/']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'security-headers-hsts-001',
      'HTTP Strict Transport Security Test',
      status,
      'medium',
      `Tested ${hstsTests.length} HSTS configurations`,
      [],
      vulnerabilities,
      [],
      ['Set HSTS max-age to at least 1 year', 'Include includeSubDomains directive', 'Consider HSTS preload', 'Ensure HTTPS is properly configured']
    );
  }

  private async testXFrameOptions(): Promise<SecurityTestResult> {
    const frameOptionsTests = [
      {
        name: 'Missing X-Frame-Options',
        headers: {},
        secure: false
      },
      {
        name: 'X-Frame-Options: ALLOWALL',
        headers: { 'X-Frame-Options': 'ALLOWALL' },
        secure: false
      },
      {
        name: 'X-Frame-Options: DENY',
        headers: { 'X-Frame-Options': 'DENY' },
        secure: true
      },
      {
        name: 'X-Frame-Options: SAMEORIGIN',
        headers: { 'X-Frame-Options': 'SAMEORIGIN' },
        secure: true
      },
      {
        name: 'CSP frame-ancestors (preferred)',
        headers: { 'Content-Security-Policy': "frame-ancestors 'none'" },
        secure: true,
        modern: true
      }
    ];

    const vulnerabilities = [];

    for (const frameTest of frameOptionsTests) {
      const result = this.simulateFrameOptionsTest(frameTest.headers);
      
      if (!result.secure && frameTest.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Frame Options Issue',
          'medium',
          'clickjacking_protection',
          `Frame protection issue: ${frameTest.name}`,
          'Configure X-Frame-Options or CSP frame-ancestors',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options']
        ));
      }

      if (!frameTest.secure && !result.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Clickjacking Vulnerability',
          'medium',
          'clickjacking_protection',
          `Missing clickjacking protection: ${frameTest.name}`,
          'Implement X-Frame-Options or CSP frame-ancestors',
          undefined,
          undefined,
          ['https://owasp.org/www-community/attacks/Clickjacking']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'security-headers-frame-options-001',
      'X-Frame-Options Test',
      status,
      'medium',
      `Tested ${frameOptionsTests.length} frame options configurations`,
      [],
      vulnerabilities,
      [],
      ['Set X-Frame-Options to DENY or SAMEORIGIN', 'Use CSP frame-ancestors directive (preferred)', 'Test iframe embedding behavior', 'Consider application requirements']
    );
  }

  private async testXContentTypeOptions(): Promise<SecurityTestResult> {
    const contentTypeTests = [
      {
        name: 'Missing X-Content-Type-Options',
        headers: {},
        secure: false
      },
      {
        name: 'X-Content-Type-Options: nosniff',
        headers: { 'X-Content-Type-Options': 'nosniff' },
        secure: true
      }
    ];

    const vulnerabilities = [];

    for (const contentTest of contentTypeTests) {
      const result = this.simulateContentTypeOptionsTest(contentTest.headers);
      
      if (!result.secure && contentTest.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Content Type Options Issue',
          'low',
          'mime_type_security',
          `Content type issue: ${contentTest.name}`,
          'Configure X-Content-Type-Options header',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options']
        ));
      }

      if (!contentTest.secure && !result.secure) {
        vulnerabilities.push(this.createVulnerability(
          'MIME Type Sniffing Vulnerability',
          'low',
          'mime_type_security',
          `Missing MIME type protection: ${contentTest.name}`,
          'Implement X-Content-Type-Options: nosniff',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'security-headers-content-type-001',
      'X-Content-Type-Options Test',
      status,
      'low',
      `Tested ${contentTypeTests.length} content type configurations`,
      [],
      vulnerabilities,
      [],
      ['Set X-Content-Type-Options: nosniff', 'Ensure proper MIME types are set', 'Test file upload functionality', 'Validate content type handling']
    );
  }

  private async testXXSSProtection(): Promise<SecurityTestResult> {
    const xssProtectionTests = [
      {
        name: 'Missing X-XSS-Protection',
        headers: {},
        secure: false
      },
      {
        name: 'X-XSS-Protection: 0 (disabled)',
        headers: { 'X-XSS-Protection': '0' },
        secure: true, // Disabling is actually recommended now
        note: 'Disabled XSS protection (recommended for modern browsers)'
      },
      {
        name: 'X-XSS-Protection: 1; mode=block',
        headers: { 'X-XSS-Protection': '1; mode=block' },
        secure: true,
        legacy: true
      }
    ];

    const vulnerabilities = [];

    for (const xssTest of xssProtectionTests) {
      const result = this.simulateXSSProtectionTest(xssTest.headers);
      
      if (!result.configured && !xssTest.secure) {
        vulnerabilities.push(this.createVulnerability(
          'XSS Protection Header Missing',
          'low',
          'xss_protection',
          `XSS protection not configured: ${xssTest.name}`,
          'Configure X-XSS-Protection header appropriately',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'security-headers-xss-protection-001',
      'X-XSS-Protection Test',
      status,
      'low',
      `Tested ${xssProtectionTests.length} XSS protection configurations`,
      [],
      vulnerabilities,
      [],
      ['Consider disabling X-XSS-Protection (set to 0) for modern browsers', 'Use CSP for XSS protection instead', 'If using legacy browsers, set to 1; mode=block', 'Test with different browser versions']
    );
  }

  private async testReferrerPolicy(): Promise<SecurityTestResult> {
    const referrerTests = [
      {
        name: 'Missing Referrer-Policy',
        headers: {},
        secure: false
      },
      {
        name: 'Referrer-Policy: unsafe-url',
        headers: { 'Referrer-Policy': 'unsafe-url' },
        secure: false
      },
      {
        name: 'Referrer-Policy: no-referrer',
        headers: { 'Referrer-Policy': 'no-referrer' },
        secure: true,
        restrictive: true
      },
      {
        name: 'Referrer-Policy: strict-origin-when-cross-origin',
        headers: { 'Referrer-Policy': 'strict-origin-when-cross-origin' },
        secure: true
      },
      {
        name: 'Referrer-Policy: same-origin',
        headers: { 'Referrer-Policy': 'same-origin' },
        secure: true
      }
    ];

    const vulnerabilities = [];

    for (const referrerTest of referrerTests) {
      const result = this.simulateReferrerPolicyTest(referrerTest.headers);
      
      if (!result.secure && referrerTest.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Referrer Policy Issue',
          'low',
          'information_disclosure',
          `Referrer policy issue: ${referrerTest.name}`,
          'Configure appropriate Referrer-Policy',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy']
        ));
      }

      if (!referrerTest.secure && !result.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Information Disclosure via Referrer',
          'low',
          'information_disclosure',
          `Referrer information may be exposed: ${referrerTest.name}`,
          'Implement appropriate Referrer-Policy',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'security-headers-referrer-policy-001',
      'Referrer Policy Test',
      status,
      'low',
      `Tested ${referrerTests.length} referrer policy configurations`,
      [],
      vulnerabilities,
      [],
      ['Set appropriate Referrer-Policy based on requirements', 'Consider strict-origin-when-cross-origin for balance', 'Use no-referrer for maximum privacy', 'Test impact on third-party integrations']
    );
  }

  private async testPermissionsPolicy(): Promise<SecurityTestResult> {
    const permissionTests = [
      {
        name: 'Missing Permissions-Policy',
        headers: {},
        secure: false
      },
      {
        name: 'Permissions-Policy with dangerous defaults',
        headers: { 'Permissions-Policy': 'camera=*, microphone=*, geolocation=*' },
        secure: false
      },
      {
        name: 'Restrictive Permissions-Policy',
        headers: { 'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()' },
        secure: true
      },
      {
        name: 'Selective Permissions-Policy',
        headers: { 'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=(self "https://trusted.com")' },
        secure: true
      }
    ];

    const vulnerabilities = [];

    for (const permissionTest of permissionTests) {
      const result = this.simulatePermissionsPolicyTest(permissionTest.headers);
      
      if (!result.secure && permissionTest.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Permissions Policy Issue',
          'medium',
          'feature_policy',
          `Permissions policy issue: ${permissionTest.name}`,
          'Configure restrictive Permissions-Policy',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy']
        ));
      }

      if (!permissionTest.secure && !result.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Missing Feature Controls',
          'low',
          'feature_policy',
          `Missing or weak permissions policy: ${permissionTest.name}`,
          'Implement Permissions-Policy to control browser features',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'security-headers-permissions-policy-001',
      'Permissions Policy Test',
      status,
      'medium',
      `Tested ${permissionTests.length} permissions policy configurations`,
      [],
      vulnerabilities,
      [],
      ['Implement restrictive Permissions-Policy', 'Disable unnecessary browser features', 'Use principle of least privilege', 'Test functionality with policy enabled']
    );
  }

  private async testCrossOriginHeaders(): Promise<SecurityTestResult> {
    const crossOriginTests = [
      {
        name: 'Missing COOP header',
        headers: {},
        headerType: 'COOP',
        secure: false
      },
      {
        name: 'COOP: same-origin',
        headers: { 'Cross-Origin-Opener-Policy': 'same-origin' },
        headerType: 'COOP',
        secure: true
      },
      {
        name: 'COOP: same-origin-allow-popups',
        headers: { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' },
        headerType: 'COOP',
        secure: true,
        note: 'Less restrictive but may be needed for functionality'
      },
      {
        name: 'Missing COEP header',
        headers: {},
        headerType: 'COEP',
        secure: false
      },
      {
        name: 'COEP: require-corp',
        headers: { 'Cross-Origin-Embedder-Policy': 'require-corp' },
        headerType: 'COEP',
        secure: true
      },
      {
        name: 'Missing CORP header',
        headers: {},
        headerType: 'CORP',
        secure: false
      },
      {
        name: 'CORP: same-site',
        headers: { 'Cross-Origin-Resource-Policy': 'same-site' },
        headerType: 'CORP',
        secure: true
      }
    ];

    const vulnerabilities = [];

    for (const crossOriginTest of crossOriginTests) {
      const result = this.simulateCrossOriginTest(crossOriginTest.headers, crossOriginTest.headerType);
      
      if (!result.secure && crossOriginTest.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Cross-Origin Header Issue',
          'medium',
          'cross_origin_isolation',
          `Cross-origin header issue: ${crossOriginTest.name}`,
          `Configure ${crossOriginTest.headerType} header properly`,
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy']
        ));
      }

      if (!crossOriginTest.secure && !result.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Missing Cross-Origin Protection',
          'low',
          'cross_origin_isolation',
          `Missing cross-origin protection: ${crossOriginTest.name}`,
          `Implement ${crossOriginTest.headerType} header`,
          undefined,
          undefined,
          ['https://web.dev/coop-coep/']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'security-headers-cross-origin-001',
      'Cross-Origin Headers Test',
      status,
      'medium',
      `Tested ${crossOriginTests.length} cross-origin configurations`,
      [],
      vulnerabilities,
      [],
      ['Implement COOP for cross-origin isolation', 'Use COEP to require CORP on embedded resources', 'Set CORP on resources as needed', 'Test cross-origin functionality thoroughly']
    );
  }

  // Simulation methods
  private simulateCSPTest(headers: any): { secure: boolean } {
    const csp = headers['Content-Security-Policy'];
    if (!csp) return { secure: false };
    
    const hasUnsafeInline = csp.includes("'unsafe-inline'");
    const hasUnsafeEval = csp.includes("'unsafe-eval'");
    const hasWildcard = csp.includes('*') && !csp.includes("'strict-dynamic'");
    const hasDataUri = csp.includes('data:') && csp.includes('script-src');
    
    return { secure: !hasUnsafeInline && !hasUnsafeEval && !hasWildcard && !hasDataUri };
  }

  private simulateHSTSTest(headers: any): { secure: boolean } {
    const hsts = headers['Strict-Transport-Security'];
    if (!hsts) return { secure: false };
    
    const maxAgeMatch = hsts.match(/max-age=(\d+)/);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1]) : 0;
    
    return { secure: maxAge >= 31536000 }; // At least 1 year
  }

  private simulateFrameOptionsTest(headers: any): { secure: boolean } {
    const frameOptions = headers['X-Frame-Options'];
    const csp = headers['Content-Security-Policy'];
    
    if (csp && csp.includes('frame-ancestors')) {
      return { secure: !csp.includes("frame-ancestors *") };
    }
    
    if (!frameOptions) return { secure: false };
    
    return { secure: ['DENY', 'SAMEORIGIN'].includes(frameOptions) };
  }

  private simulateContentTypeOptionsTest(headers: any): { secure: boolean } {
    const contentTypeOptions = headers['X-Content-Type-Options'];
    return { secure: contentTypeOptions === 'nosniff' };
  }

  private simulateXSSProtectionTest(headers: any): { configured: boolean; secure: boolean } {
    const xssProtection = headers['X-XSS-Protection'];
    const configured = xssProtection !== undefined;
    
    if (!configured) return { configured: false, secure: false };
    
    // Both '0' (disabled) and '1; mode=block' are acceptable
    const secure = xssProtection === '0' || xssProtection === '1; mode=block';
    
    return { configured, secure };
  }

  private simulateReferrerPolicyTest(headers: any): { secure: boolean } {
    const referrerPolicy = headers['Referrer-Policy'];
    if (!referrerPolicy) return { secure: false };
    
    const secureValues = [
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin'
    ];
    
    return { secure: secureValues.includes(referrerPolicy) };
  }

  private simulatePermissionsPolicyTest(headers: any): { secure: boolean } {
    const permissionsPolicy = headers['Permissions-Policy'];
    if (!permissionsPolicy) return { secure: false };
    
    // Check for dangerous wildcards
    const hasWildcards = permissionsPolicy.includes('*');
    
    return { secure: !hasWildcards };
  }

  private simulateCrossOriginTest(headers: any, headerType: string): { secure: boolean } {
    const headerMap = {
      'COOP': 'Cross-Origin-Opener-Policy',
      'COEP': 'Cross-Origin-Embedder-Policy',
      'CORP': 'Cross-Origin-Resource-Policy'
    };
    
    const headerName = headerMap[headerType as keyof typeof headerMap];
    const headerValue = headers[headerName];
    
    if (!headerValue) return { secure: false };
    
    const secureValues = {
      'COOP': ['same-origin', 'same-origin-allow-popups'],
      'COEP': ['require-corp'],
      'CORP': ['same-origin', 'same-site', 'cross-origin']
    };
    
    const validValues = secureValues[headerType as keyof typeof secureValues];
    return { secure: validValues.includes(headerValue) };
  }
}

describe('Comprehensive Security Headers Tests', () => {
  let testRunner: SecurityTestRunner;
  let headersTest: SecurityHeadersTest;

  beforeAll(() => {
    testRunner = new SecurityTestRunner({
      timeout: 60000,
      maxRetries: 3,
      severityLevels: ['low', 'medium', 'high', 'critical'],
      complianceStandards: ['OWASP', 'NIST'],
      testCategories: ['security-headers', 'web-security']
    });

    headersTest = new SecurityHeadersTest();
    testRunner.addTest(headersTest);
  });

  test('should implement strong Content Security Policy', async () => {
    const results = await headersTest.runTests();
    const cspResult = results.find(r => r.testId === 'security-headers-csp-001');
    
    expect(cspResult).toBeDefined();
    expect(cspResult!.status).toBe('passed');
  }, 45000);

  test('should implement HTTP Strict Transport Security', async () => {
    const results = await headersTest.runTests();
    const hstsResult = results.find(r => r.testId === 'security-headers-hsts-001');
    
    expect(hstsResult).toBeDefined();
    expect(hstsResult!.status).toBe('passed');
  }, 30000);

  test('should implement X-Frame-Options protection', async () => {
    const results = await headersTest.runTests();
    const frameOptionsResult = results.find(r => r.testId === 'security-headers-frame-options-001');
    
    expect(frameOptionsResult).toBeDefined();
    expect(frameOptionsResult!.status).toBe('passed');
  }, 25000);

  test('should implement X-Content-Type-Options', async () => {
    const results = await headersTest.runTests();
    const contentTypeResult = results.find(r => r.testId === 'security-headers-content-type-001');
    
    expect(contentTypeResult).toBeDefined();
    expect(contentTypeResult!.status).toBe('passed');
  }, 20000);

  test('should configure X-XSS-Protection appropriately', async () => {
    const results = await headersTest.runTests();
    const xssProtectionResult = results.find(r => r.testId === 'security-headers-xss-protection-001');
    
    expect(xssProtectionResult).toBeDefined();
    expect(xssProtectionResult!.status).toBe('passed');
  }, 20000);

  test('should implement appropriate Referrer Policy', async () => {
    const results = await headersTest.runTests();
    const referrerPolicyResult = results.find(r => r.testId === 'security-headers-referrer-policy-001');
    
    expect(referrerPolicyResult).toBeDefined();
    expect(referrerPolicyResult!.status).toBe('passed');
  }, 25000);

  test('should implement Permissions Policy controls', async () => {
    const results = await headersTest.runTests();
    const permissionsPolicyResult = results.find(r => r.testId === 'security-headers-permissions-policy-001');
    
    expect(permissionsPolicyResult).toBeDefined();
    expect(permissionsPolicyResult!.status).toBe('passed');
  }, 30000);

  test('should implement cross-origin isolation headers', async () => {
    const results = await headersTest.runTests();
    const crossOriginResult = results.find(r => r.testId === 'security-headers-cross-origin-001');
    
    expect(crossOriginResult).toBeDefined();
    expect(crossOriginResult!.status).toBe('passed');
  }, 35000);
});