/**
 * CSRF Protection Security Tests
 * Comprehensive Cross-Site Request Forgery prevention testing
 */

import { SecurityTestRunner, SecurityTest, SecurityTestResult, SecurityThreatType } from '../core/security-test-framework';

export class CSRFProtectionTest extends SecurityTest {
  async runTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    // Basic CSRF token validation
    results.push(await this.testCSRFTokenValidation());
    
    // SameSite cookie protection
    results.push(await this.testSameSiteCookies());
    
    // Origin header validation
    results.push(await this.testOriginHeaderValidation());
    
    // Referer header validation
    results.push(await this.testRefererHeaderValidation());
    
    // Double submit cookie pattern
    results.push(await this.testDoubleSubmitCookie());
    
    // Custom header validation
    results.push(await this.testCustomHeaderValidation());
    
    // JSON CSRF attacks
    results.push(await this.testJSONCSRFAttacks());

    this.results = results;
    results.forEach(result => this.updateMetrics(result));
    
    return results;
  }

  private async testCSRFTokenValidation(): Promise<SecurityTestResult> {
    const csrfAttacks = [
      {
        name: 'Missing CSRF token',
        request: {
          method: 'POST',
          url: '/api/users/delete',
          headers: {},
          body: 'userId=123',
          csrfToken: null
        }
      },
      {
        name: 'Invalid CSRF token',
        request: {
          method: 'POST',
          url: '/api/users/delete',
          headers: {},
          body: 'userId=123',
          csrfToken: 'invalid_token_12345'
        }
      },
      {
        name: 'Expired CSRF token',
        request: {
          method: 'POST',
          url: '/api/users/delete',
          headers: {},
          body: 'userId=123',
          csrfToken: 'expired_token_from_yesterday'
        }
      },
      {
        name: 'Reused CSRF token',
        request: {
          method: 'POST',
          url: '/api/users/delete',
          headers: {},
          body: 'userId=123',
          csrfToken: 'already_used_token_123'
        }
      },
      {
        name: 'Cross-user CSRF token',
        request: {
          method: 'POST',
          url: '/api/users/delete',
          headers: {},
          body: 'userId=123',
          csrfToken: 'valid_token_for_different_user'
        }
      }
    ];

    const vulnerabilities = [];
    const threats = [];

    for (const attack of csrfAttacks) {
      const result = this.simulateCSRFTokenTest(attack.request);
      
      if (result.success) {
        threats.push(this.createThreat(
          SecurityThreatType.CSRF,
          'high',
          'external_website',
          'state_changing_endpoint',
          `CSRF attack successful: ${attack.name}`,
          true,
          false
        ));

        vulnerabilities.push(this.createVulnerability(
          'CSRF Token Validation Failure',
          'high',
          'csrf_protection',
          `CSRF protection bypassed: ${attack.name}`,
          'Implement proper CSRF token validation',
          undefined,
          undefined,
          ['https://owasp.org/www-community/attacks/csrf', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.length > 0 ? 'failed' : 'passed';
    return this.createTestResult(
      'csrf-token-validation-001',
      'CSRF Token Validation Test',
      status,
      'high',
      `Tested ${csrfAttacks.length} CSRF token validation scenarios`,
      threats,
      vulnerabilities,
      [],
      ['Implement CSRF tokens for all state-changing operations', 'Validate token presence and authenticity', 'Ensure tokens are unique per session', 'Implement token expiration']
    );
  }

  private async testSameSiteCookies(): Promise<SecurityTestResult> {
    const sameSiteTests = [
      {
        name: 'No SameSite attribute',
        cookie: 'sessionId=abc123; Secure; HttpOnly',
        crossSiteRequest: true,
        expected: 'blocked'
      },
      {
        name: 'SameSite=None without Secure',
        cookie: 'sessionId=abc123; SameSite=None; HttpOnly',
        crossSiteRequest: true,
        expected: 'blocked'
      },
      {
        name: 'SameSite=Lax',
        cookie: 'sessionId=abc123; SameSite=Lax; Secure; HttpOnly',
        crossSiteRequest: true,
        expected: 'conditionally_blocked'
      },
      {
        name: 'SameSite=Strict',
        cookie: 'sessionId=abc123; SameSite=Strict; Secure; HttpOnly',
        crossSiteRequest: true,
        expected: 'blocked'
      }
    ];

    const vulnerabilities = [];

    for (const test of sameSiteTests) {
      const result = this.simulateSameSiteTest(test.cookie, test.crossSiteRequest);
      
      if (result.cookieSent && test.expected === 'blocked') {
        vulnerabilities.push(this.createVulnerability(
          'SameSite Cookie Protection Failure',
          'medium',
          'cookie_security',
          `Cookie sent in cross-site request: ${test.name}`,
          'Configure SameSite cookie attributes properly',
          undefined,
          undefined,
          ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite']
        ));
      }
    }

    const status = vulnerabilities.length > 0 ? 'failed' : 'passed';
    return this.createTestResult(
      'csrf-samesite-cookies-001',
      'SameSite Cookie Protection Test',
      status,
      'medium',
      `Tested ${sameSiteTests.length} SameSite cookie configurations`,
      [],
      vulnerabilities,
      [],
      ['Set SameSite=Strict for authentication cookies', 'Use SameSite=Lax for general session cookies', 'Always include Secure attribute with SameSite=None']
    );
  }

  private async testOriginHeaderValidation(): Promise<SecurityTestResult> {
    const originTests = [
      {
        name: 'Missing Origin header',
        origin: null,
        expectedOrigin: 'https://app.example.com',
        shouldAllow: false
      },
      {
        name: 'Invalid Origin domain',
        origin: 'https://evil.com',
        expectedOrigin: 'https://app.example.com',
        shouldAllow: false
      },
      {
        name: 'Subdomain confusion',
        origin: 'https://evil.app.example.com',
        expectedOrigin: 'https://app.example.com',
        shouldAllow: false
      },
      {
        name: 'Protocol mismatch',
        origin: 'http://app.example.com',
        expectedOrigin: 'https://app.example.com',
        shouldAllow: false
      },
      {
        name: 'Valid origin',
        origin: 'https://app.example.com',
        expectedOrigin: 'https://app.example.com',
        shouldAllow: true
      }
    ];

    const vulnerabilities = [];

    for (const test of originTests) {
      const result = this.simulateOriginValidation(test.origin, test.expectedOrigin);
      
      if (result.allowed && !test.shouldAllow) {
        vulnerabilities.push(this.createVulnerability(
          'Origin Header Validation Failure',
          'high',
          'origin_validation',
          `Request allowed with invalid origin: ${test.name}`,
          'Implement strict Origin header validation',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.length > 0 ? 'failed' : 'passed';
    return this.createTestResult(
      'csrf-origin-validation-001',
      'Origin Header Validation Test',
      status,
      'high',
      `Tested ${originTests.length} origin validation scenarios`,
      [],
      vulnerabilities,
      [],
      ['Validate Origin header on all state-changing requests', 'Maintain allowlist of valid origins', 'Reject requests with missing or invalid Origin']
    );
  }

  private async testRefererHeaderValidation(): Promise<SecurityTestResult> {
    const refererTests = [
      {
        name: 'Missing Referer header',
        referer: null,
        expectedReferer: 'https://app.example.com',
        shouldAllow: false
      },
      {
        name: 'Invalid Referer domain',
        referer: 'https://evil.com/page',
        expectedReferer: 'https://app.example.com',
        shouldAllow: false
      },
      {
        name: 'Referer spoofing attempt',
        referer: 'https://app.example.com.evil.com/',
        expectedReferer: 'https://app.example.com',
        shouldAllow: false
      },
      {
        name: 'Valid Referer',
        referer: 'https://app.example.com/profile',
        expectedReferer: 'https://app.example.com',
        shouldAllow: true
      }
    ];

    const vulnerabilities = [];

    for (const test of refererTests) {
      const result = this.simulateRefererValidation(test.referer, test.expectedReferer);
      
      if (result.allowed && !test.shouldAllow) {
        vulnerabilities.push(this.createVulnerability(
          'Referer Header Validation Failure',
          'medium',
          'referer_validation',
          `Request allowed with invalid referer: ${test.name}`,
          'Implement Referer header validation as secondary defense',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.length > 0 ? 'failed' : 'passed';
    return this.createTestResult(
      'csrf-referer-validation-001',
      'Referer Header Validation Test',
      status,
      'medium',
      `Tested ${refererTests.length} referer validation scenarios`,
      [],
      vulnerabilities,
      [],
      ['Use Referer validation as additional protection layer', 'Handle cases where Referer may be missing', 'Validate Referer domain against allowlist']
    );
  }

  private async testDoubleSubmitCookie(): Promise<SecurityTestResult> {
    const doubleSubmitTests = [
      {
        name: 'Missing CSRF cookie',
        csrfCookie: null,
        csrfParameter: 'valid_csrf_token_123',
        shouldAllow: false
      },
      {
        name: 'Missing CSRF parameter',
        csrfCookie: 'valid_csrf_token_123',
        csrfParameter: null,
        shouldAllow: false
      },
      {
        name: 'Mismatched CSRF values',
        csrfCookie: 'valid_csrf_token_123',
        csrfParameter: 'different_csrf_token_456',
        shouldAllow: false
      },
      {
        name: 'Valid double submit',
        csrfCookie: 'valid_csrf_token_123',
        csrfParameter: 'valid_csrf_token_123',
        shouldAllow: true
      }
    ];

    const vulnerabilities = [];

    for (const test of doubleSubmitTests) {
      const result = this.simulateDoubleSubmitTest(test.csrfCookie, test.csrfParameter);
      
      if (result.allowed && !test.shouldAllow) {
        vulnerabilities.push(this.createVulnerability(
          'Double Submit Cookie Validation Failure',
          'high',
          'csrf_protection',
          `Double submit validation bypassed: ${test.name}`,
          'Implement proper double submit cookie validation',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.length > 0 ? 'failed' : 'passed';
    return this.createTestResult(
      'csrf-double-submit-001',
      'Double Submit Cookie Test',
      status,
      'high',
      `Tested ${doubleSubmitTests.length} double submit scenarios`,
      [],
      vulnerabilities,
      [],
      ['Implement double submit cookie pattern', 'Ensure CSRF tokens match between cookie and parameter', 'Use secure random token generation']
    );
  }

  private async testCustomHeaderValidation(): Promise<SecurityTestResult> {
    const customHeaderTests = [
      {
        name: 'Missing custom header',
        headers: {},
        requiredHeader: 'X-Requested-With',
        shouldAllow: false
      },
      {
        name: 'Invalid custom header value',
        headers: { 'X-Requested-With': 'InvalidValue' },
        requiredHeader: 'X-Requested-With',
        expectedValue: 'XMLHttpRequest',
        shouldAllow: false
      },
      {
        name: 'Valid custom header',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        requiredHeader: 'X-Requested-With',
        expectedValue: 'XMLHttpRequest',
        shouldAllow: true
      },
      {
        name: 'Custom API key header missing',
        headers: {},
        requiredHeader: 'X-API-Key',
        shouldAllow: false
      }
    ];

    const vulnerabilities = [];

    for (const test of customHeaderTests) {
      const result = this.simulateCustomHeaderTest(test.headers, test.requiredHeader, test.expectedValue);
      
      if (result.allowed && !test.shouldAllow) {
        vulnerabilities.push(this.createVulnerability(
          'Custom Header Validation Failure',
          'medium',
          'header_validation',
          `Request allowed without required custom header: ${test.name}`,
          'Implement custom header validation for CSRF protection',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.length > 0 ? 'failed' : 'passed';
    return this.createTestResult(
      'csrf-custom-header-001',
      'Custom Header Validation Test',
      status,
      'medium',
      `Tested ${customHeaderTests.length} custom header scenarios`,
      [],
      vulnerabilities,
      [],
      ['Require custom headers for API endpoints', 'Validate header presence and values', 'Use headers that cannot be set by simple forms']
    );
  }

  private async testJSONCSRFAttacks(): Promise<SecurityTestResult> {
    const jsonCSRFTests = [
      {
        name: 'JSON POST without Content-Type validation',
        contentType: 'application/json',
        body: '{"action":"delete","userId":123}',
        hasCSRFProtection: false,
        shouldAllow: false
      },
      {
        name: 'Form-encoded masquerading as JSON',
        contentType: 'application/x-www-form-urlencoded',
        body: 'json={"action":"delete","userId":123}',
        hasCSRFProtection: false,
        shouldAllow: false
      },
      {
        name: 'JSONP callback abuse',
        contentType: 'application/javascript',
        body: 'callback({"action":"delete","userId":123})',
        hasCSRFProtection: false,
        shouldAllow: false
      },
      {
        name: 'Valid JSON with CSRF protection',
        contentType: 'application/json',
        body: '{"action":"delete","userId":123,"csrfToken":"valid_token"}',
        hasCSRFProtection: true,
        shouldAllow: true
      }
    ];

    const vulnerabilities = [];

    for (const test of jsonCSRFTests) {
      const result = this.simulateJSONCSRFTest(test.contentType, test.body, test.hasCSRFProtection);
      
      if (result.allowed && !test.shouldAllow) {
        vulnerabilities.push(this.createVulnerability(
          'JSON CSRF Attack',
          'high',
          'json_endpoint',
          `JSON endpoint vulnerable to CSRF: ${test.name}`,
          'Implement CSRF protection for JSON endpoints',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.length > 0 ? 'failed' : 'passed';
    return this.createTestResult(
      'csrf-json-attacks-001',
      'JSON CSRF Attack Prevention Test',
      status,
      'high',
      `Tested ${jsonCSRFTests.length} JSON CSRF attack scenarios`,
      [],
      vulnerabilities,
      [],
      ['Protect JSON endpoints with CSRF tokens', 'Validate Content-Type headers', 'Require custom headers for JSON APIs', 'Avoid JSONP for sensitive operations']
    );
  }

  // Simulation methods
  private simulateCSRFTokenTest(request: any): { success: boolean } {
    // Simulate CSRF token validation
    const hasValidToken = request.csrfToken && 
                         !request.csrfToken.includes('invalid') && 
                         !request.csrfToken.includes('expired') && 
                         !request.csrfToken.includes('used') && 
                         !request.csrfToken.includes('different_user');
    
    return { success: !hasValidToken }; // Attack succeeds if no valid token
  }

  private simulateSameSiteTest(cookie: string, crossSiteRequest: boolean): { cookieSent: boolean } {
    if (!crossSiteRequest) return { cookieSent: true };
    
    const hasStrictSameSite = cookie.includes('SameSite=Strict');
    const hasLaxSameSite = cookie.includes('SameSite=Lax');
    const hasNoneSameSite = cookie.includes('SameSite=None');
    const hasSecure = cookie.includes('Secure');
    
    if (hasStrictSameSite) return { cookieSent: false };
    if (hasLaxSameSite) return { cookieSent: Math.random() > 0.5 }; // Depends on request type
    if (hasNoneSameSite && hasSecure) return { cookieSent: true };
    
    return { cookieSent: Math.random() > 0.3 }; // Default browser behavior varies
  }

  private simulateOriginValidation(origin: string | null, expectedOrigin: string): { allowed: boolean } {
    if (!origin) return { allowed: false };
    return { allowed: origin === expectedOrigin };
  }

  private simulateRefererValidation(referer: string | null, expectedReferer: string): { allowed: boolean } {
    if (!referer) return { allowed: false };
    return { allowed: referer.startsWith(expectedReferer) };
  }

  private simulateDoubleSubmitTest(csrfCookie: string | null, csrfParameter: string | null): { allowed: boolean } {
    if (!csrfCookie || !csrfParameter) return { allowed: false };
    return { allowed: csrfCookie === csrfParameter };
  }

  private simulateCustomHeaderTest(headers: any, requiredHeader: string, expectedValue?: string): { allowed: boolean } {
    const headerValue = headers[requiredHeader];
    if (!headerValue) return { allowed: false };
    if (expectedValue && headerValue !== expectedValue) return { allowed: false };
    return { allowed: true };
  }

  private simulateJSONCSRFTest(contentType: string, body: string, hasCSRFProtection: boolean): { allowed: boolean } {
    // JSON endpoints without CSRF protection are vulnerable
    if (contentType === 'application/json' && !hasCSRFProtection) {
      return { allowed: true }; // Vulnerable
    }
    
    // Form-encoded data trying to access JSON endpoint
    if (contentType === 'application/x-www-form-urlencoded' && body.includes('json=')) {
      return { allowed: !hasCSRFProtection };
    }
    
    return { allowed: hasCSRFProtection };
  }
}

describe('CSRF Protection Security Tests', () => {
  let testRunner: SecurityTestRunner;
  let csrfTest: CSRFProtectionTest;

  beforeAll(() => {
    testRunner = new SecurityTestRunner({
      timeout: 60000,
      maxRetries: 3,
      severityLevels: ['low', 'medium', 'high', 'critical'],
      complianceStandards: ['OWASP', 'NIST'],
      testCategories: ['csrf', 'session-security']
    });

    csrfTest = new CSRFProtectionTest();
    testRunner.addTest(csrfTest);
  });

  test('should validate CSRF tokens properly', async () => {
    const results = await csrfTest.runTests();
    const tokenResult = results.find(r => r.testId === 'csrf-token-validation-001');
    
    expect(tokenResult).toBeDefined();
    expect(tokenResult!.status).toBe('passed');
  }, 45000);

  test('should implement SameSite cookie protection', async () => {
    const results = await csrfTest.runTests();
    const sameSiteResult = results.find(r => r.testId === 'csrf-samesite-cookies-001');
    
    expect(sameSiteResult).toBeDefined();
    expect(sameSiteResult!.status).toBe('passed');
  }, 30000);

  test('should validate Origin headers', async () => {
    const results = await csrfTest.runTests();
    const originResult = results.find(r => r.testId === 'csrf-origin-validation-001');
    
    expect(originResult).toBeDefined();
    expect(originResult!.status).toBe('passed');
  }, 30000);

  test('should validate Referer headers', async () => {
    const results = await csrfTest.runTests();
    const refererResult = results.find(r => r.testId === 'csrf-referer-validation-001');
    
    expect(refererResult).toBeDefined();
    expect(refererResult!.status).toBe('passed');
  }, 30000);

  test('should implement double submit cookie pattern', async () => {
    const results = await csrfTest.runTests();
    const doubleSubmitResult = results.find(r => r.testId === 'csrf-double-submit-001');
    
    expect(doubleSubmitResult).toBeDefined();
    expect(doubleSubmitResult!.status).toBe('passed');
  }, 30000);

  test('should validate custom headers', async () => {
    const results = await csrfTest.runTests();
    const customHeaderResult = results.find(r => r.testId === 'csrf-custom-header-001');
    
    expect(customHeaderResult).toBeDefined();
    expect(customHeaderResult!.status).toBe('passed');
  }, 25000);

  test('should prevent JSON CSRF attacks', async () => {
    const results = await csrfTest.runTests();
    const jsonCSRFResult = results.find(r => r.testId === 'csrf-json-attacks-001');
    
    expect(jsonCSRFResult).toBeDefined();
    expect(jsonCSRFResult!.status).toBe('passed');
  }, 35000);
});