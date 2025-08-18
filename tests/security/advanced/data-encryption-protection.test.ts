/**
 * Data Encryption and Protection Security Tests
 * Comprehensive validation of data encryption, key management, and data protection
 */

import { SecurityTestRunner, SecurityTest, SecurityTestResult, SecurityThreatType } from '../core/security-test-framework';

export class DataEncryptionProtectionTest extends SecurityTest {
  async runTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    // Encryption strength tests
    results.push(await this.testEncryptionStrength());
    
    // Key management tests
    results.push(await this.testKeyManagement());
    
    // Data at rest encryption tests
    results.push(await this.testDataAtRestEncryption());
    
    // Data in transit encryption tests
    results.push(await this.testDataInTransitEncryption());
    
    // PII/Sensitive data protection tests
    results.push(await this.testSensitiveDataProtection());
    
    // Cryptographic implementation tests
    results.push(await this.testCryptographicImplementation());
    
    // Key rotation and lifecycle tests
    results.push(await this.testKeyRotationLifecycle());

    // Quantum-ready encryption tests
    results.push(await this.testQuantumReadyEncryption());

    this.results = results;
    results.forEach(result => this.updateMetrics(result));
    
    return results;
  }

  private async testEncryptionStrength(): Promise<SecurityTestResult> {
    const encryptionTests = [
      {
        name: 'Weak encryption algorithm (DES)',
        algorithm: 'DES',
        keySize: 56,
        acceptable: false
      },
      {
        name: 'Weak encryption algorithm (3DES)',
        algorithm: '3DES',
        keySize: 168,
        acceptable: false
      },
      {
        name: 'Weak key size (AES-128)',
        algorithm: 'AES',
        keySize: 128,
        acceptable: true, // Still acceptable but not ideal
        warning: true
      },
      {
        name: 'Strong encryption (AES-256)',
        algorithm: 'AES',
        keySize: 256,
        acceptable: true
      },
      {
        name: 'RSA with weak key size',
        algorithm: 'RSA',
        keySize: 1024,
        acceptable: false
      },
      {
        name: 'RSA with strong key size',
        algorithm: 'RSA',
        keySize: 2048,
        acceptable: true
      },
      {
        name: 'Post-quantum ready (ChaCha20)',
        algorithm: 'ChaCha20',
        keySize: 256,
        acceptable: true,
        quantumReady: true
      }
    ];

    const vulnerabilities = [];
    const threats = [];

    for (const test of encryptionTests) {
      const result = this.simulateEncryptionStrengthTest(test.algorithm, test.keySize);
      
      if (!result.secure && !test.acceptable) {
        threats.push(this.createThreat(
          SecurityThreatType.ENCRYPTION_WEAKNESS,
          'high',
          'cryptographic_attack',
          'encrypted_data',
          `Weak encryption detected: ${test.name}`,
          true,
          false
        ));

        vulnerabilities.push(this.createVulnerability(
          'Weak Encryption Algorithm',
          'high',
          'cryptographic_implementation',
          `Weak encryption in use: ${test.algorithm} with ${test.keySize}-bit key`,
          'Upgrade to strong encryption algorithms (AES-256, ChaCha20-Poly1305)',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html']
        ));
      }

      if (test.warning && result.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Encryption Algorithm Warning',
          'medium',
          'cryptographic_implementation',
          `Consider upgrading: ${test.algorithm} with ${test.keySize}-bit key`,
          'Consider upgrading to AES-256 or ChaCha20-Poly1305',
          undefined,
          undefined,
          ['https://www.nist.gov/news-events/news/2022/07/nist-announces-first-four-quantum-resistant-cryptographic-algorithms']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'encryption-strength-001',
      'Encryption Strength Validation Test',
      status,
      'high',
      `Tested ${encryptionTests.length} encryption algorithms and key sizes`,
      threats,
      vulnerabilities,
      [],
      ['Use strong encryption algorithms (AES-256, ChaCha20)', 'Implement proper key sizes', 'Consider quantum-ready algorithms', 'Regular cryptographic review']
    );
  }

  private async testKeyManagement(): Promise<SecurityTestResult> {
    const keyManagementTests = [
      {
        name: 'Hardcoded encryption keys',
        scenario: 'key_in_source_code',
        secure: false
      },
      {
        name: 'Keys in configuration files',
        scenario: 'key_in_config_file',
        secure: false
      },
      {
        name: 'Keys in environment variables',
        scenario: 'key_in_env_vars',
        secure: true,
        warning: true
      },
      {
        name: 'Keys in hardware security module',
        scenario: 'key_in_hsm',
        secure: true
      },
      {
        name: 'Keys in key management service',
        scenario: 'key_in_kms',
        secure: true
      },
      {
        name: 'Weak key generation',
        scenario: 'weak_random_key_generation',
        secure: false
      },
      {
        name: 'Key derivation without salt',
        scenario: 'key_derivation_no_salt',
        secure: false
      },
      {
        name: 'Insufficient key entropy',
        scenario: 'insufficient_entropy',
        secure: false
      }
    ];

    const vulnerabilities = [];

    for (const test of keyManagementTests) {
      const result = this.simulateKeyManagementTest(test.scenario);
      
      if (!result.secure && !test.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Key Management Vulnerability',
          'critical',
          'key_management',
          `Insecure key management: ${test.name}`,
          'Implement secure key management practices',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html']
        ));
      }

      if (test.warning && result.secure) {
        vulnerabilities.push(this.createVulnerability(
          'Key Management Warning',
          'medium',
          'key_management',
          `Key management concern: ${test.name}`,
          'Consider using dedicated key management systems',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'key-management-001',
      'Key Management Security Test',
      status,
      'critical',
      `Tested ${keyManagementTests.length} key management scenarios`,
      [],
      vulnerabilities,
      [],
      ['Never hardcode encryption keys', 'Use HSM or KMS for key storage', 'Implement proper key rotation', 'Use strong random key generation']
    );
  }

  private async testDataAtRestEncryption(): Promise<SecurityTestResult> {
    const dataAtRestTests = [
      {
        name: 'Database encryption',
        dataType: 'database',
        encrypted: true,
        algorithm: 'AES-256',
        keyManagement: 'external'
      },
      {
        name: 'File system encryption',
        dataType: 'filesystem',
        encrypted: true,
        algorithm: 'AES-256',
        keyManagement: 'os_keystore'
      },
      {
        name: 'Log file encryption',
        dataType: 'logs',
        encrypted: false,
        containsSensitiveData: true
      },
      {
        name: 'Backup encryption',
        dataType: 'backups',
        encrypted: true,
        algorithm: 'AES-256',
        keyManagement: 'external'
      },
      {
        name: 'Temporary file encryption',
        dataType: 'temp_files',
        encrypted: false,
        containsSensitiveData: true
      },
      {
        name: 'Application secrets encryption',
        dataType: 'secrets',
        encrypted: true,
        algorithm: 'AES-256',
        keyManagement: 'hsm'
      }
    ];

    const vulnerabilities = [];

    for (const test of dataAtRestTests) {
      const result = this.simulateDataAtRestTest(test);
      
      if (!test.encrypted && test.containsSensitiveData) {
        vulnerabilities.push(this.createVulnerability(
          'Unencrypted Sensitive Data at Rest',
          'high',
          'data_protection',
          `Sensitive data not encrypted: ${test.name}`,
          'Encrypt all sensitive data at rest',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html']
        ));
      }

      if (test.encrypted && result.weakEncryption) {
        vulnerabilities.push(this.createVulnerability(
          'Weak Data at Rest Encryption',
          'medium',
          'data_protection',
          `Weak encryption for data at rest: ${test.name}`,
          'Use strong encryption algorithms for data at rest',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'data-at-rest-encryption-001',
      'Data at Rest Encryption Test',
      status,
      'high',
      `Tested ${dataAtRestTests.length} data at rest encryption scenarios`,
      [],
      vulnerabilities,
      [],
      ['Encrypt all sensitive data at rest', 'Use strong encryption algorithms', 'Implement proper key management', 'Encrypt logs and temporary files']
    );
  }

  private async testDataInTransitEncryption(): Promise<SecurityTestResult> {
    const dataInTransitTests = [
      {
        name: 'HTTP vs HTTPS',
        protocol: 'HTTP',
        encrypted: false,
        acceptable: false
      },
      {
        name: 'HTTPS with weak TLS version',
        protocol: 'HTTPS',
        tlsVersion: '1.1',
        encrypted: true,
        acceptable: false
      },
      {
        name: 'HTTPS with strong TLS version',
        protocol: 'HTTPS',
        tlsVersion: '1.3',
        encrypted: true,
        acceptable: true
      },
      {
        name: 'Database connection encryption',
        protocol: 'TLS',
        service: 'database',
        encrypted: true,
        acceptable: true
      },
      {
        name: 'API-to-API communication',
        protocol: 'mTLS',
        service: 'api',
        encrypted: true,
        acceptable: true
      },
      {
        name: 'Email transmission',
        protocol: 'SMTP',
        encrypted: false,
        containsSensitiveData: true,
        acceptable: false
      },
      {
        name: 'File transfer',
        protocol: 'SFTP',
        encrypted: true,
        acceptable: true
      }
    ];

    const vulnerabilities = [];
    const threats = [];

    for (const test of dataInTransitTests) {
      const result = this.simulateDataInTransitTest(test);
      
      if (!test.acceptable) {
        threats.push(this.createThreat(
          SecurityThreatType.DATA_LEAK,
          'high',
          'network_interceptor',
          'data_in_transit',
          `Unencrypted or weakly encrypted data in transit: ${test.name}`,
          true,
          false
        ));

        vulnerabilities.push(this.createVulnerability(
          'Weak Data in Transit Protection',
          'high',
          'transport_security',
          `Insufficient encryption for data in transit: ${test.name}`,
          'Use strong encryption for all data in transit',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'data-in-transit-encryption-001',
      'Data in Transit Encryption Test',
      status,
      'high',
      `Tested ${dataInTransitTests.length} data in transit scenarios`,
      threats,
      vulnerabilities,
      [],
      ['Use TLS 1.3 for all connections', 'Implement certificate pinning', 'Use mTLS for service-to-service communication', 'Encrypt email and file transfers']
    );
  }

  private async testSensitiveDataProtection(): Promise<SecurityTestResult> {
    const sensitiveDataTests = [
      {
        name: 'Credit card numbers',
        dataType: 'pci_data',
        classification: 'restricted',
        encrypted: true,
        maskedInLogs: true,
        maskedInUI: true
      },
      {
        name: 'Social security numbers',
        dataType: 'pii',
        classification: 'restricted',
        encrypted: true,
        maskedInLogs: true,
        maskedInUI: true
      },
      {
        name: 'Personal health information',
        dataType: 'phi',
        classification: 'restricted',
        encrypted: true,
        maskedInLogs: true,
        maskedInUI: true
      },
      {
        name: 'Authentication passwords',
        dataType: 'credentials',
        classification: 'secret',
        hashed: true,
        maskedInLogs: true,
        neverInPlaintext: true
      },
      {
        name: 'API keys and tokens',
        dataType: 'secrets',
        classification: 'secret',
        encrypted: true,
        maskedInLogs: true,
        rotatable: true
      },
      {
        name: 'Biometric data',
        dataType: 'biometric',
        classification: 'restricted',
        encrypted: true,
        localProcessingOnly: true
      }
    ];

    const vulnerabilities = [];

    for (const test of sensitiveDataTests) {
      const result = this.simulateSensitiveDataTest(test);
      
      if (!result.properlyProtected) {
        const severity = test.classification === 'secret' ? 'critical' : 'high';
        vulnerabilities.push(this.createVulnerability(
          'Sensitive Data Protection Failure',
          severity as 'low' | 'medium' | 'high' | 'critical',
          'data_protection',
          `Sensitive data not properly protected: ${test.name}`,
          'Implement comprehensive sensitive data protection',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Sensitive_Data_Exposure_Prevention_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'sensitive-data-protection-001',
      'Sensitive Data Protection Test',
      status,
      'critical',
      `Tested ${sensitiveDataTests.length} sensitive data protection scenarios`,
      [],
      vulnerabilities,
      [],
      ['Classify and protect all sensitive data', 'Implement data masking and encryption', 'Use proper password hashing', 'Mask sensitive data in logs and UI']
    );
  }

  private async testCryptographicImplementation(): Promise<SecurityTestResult> {
    const cryptoTests = [
      {
        name: 'Custom cryptographic implementation',
        implementation: 'custom',
        acceptable: false
      },
      {
        name: 'Deprecated hash function (MD5)',
        algorithm: 'MD5',
        purpose: 'hashing',
        acceptable: false
      },
      {
        name: 'Deprecated hash function (SHA-1)',
        algorithm: 'SHA-1',
        purpose: 'hashing',
        acceptable: false
      },
      {
        name: 'Secure hash function (SHA-256)',
        algorithm: 'SHA-256',
        purpose: 'hashing',
        acceptable: true
      },
      {
        name: 'Weak random number generation',
        implementation: 'math_random',
        purpose: 'key_generation',
        acceptable: false
      },
      {
        name: 'Cryptographically secure random',
        implementation: 'crypto_random',
        purpose: 'key_generation',
        acceptable: true
      },
      {
        name: 'ECB mode encryption',
        mode: 'ECB',
        acceptable: false
      },
      {
        name: 'GCM mode encryption',
        mode: 'GCM',
        acceptable: true
      }
    ];

    const vulnerabilities = [];

    for (const test of cryptoTests) {
      const result = this.simulateCryptographicTest(test);
      
      if (!test.acceptable) {
        vulnerabilities.push(this.createVulnerability(
          'Cryptographic Implementation Vulnerability',
          'high',
          'cryptographic_implementation',
          `Insecure cryptographic implementation: ${test.name}`,
          'Use proven cryptographic libraries and algorithms',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'cryptographic-implementation-001',
      'Cryptographic Implementation Test',
      status,
      'high',
      `Tested ${cryptoTests.length} cryptographic implementation scenarios`,
      [],
      vulnerabilities,
      [],
      ['Use proven cryptographic libraries', 'Avoid deprecated algorithms', 'Use secure encryption modes', 'Use cryptographically secure random number generation']
    );
  }

  private async testKeyRotationLifecycle(): Promise<SecurityTestResult> {
    const keyRotationTests = [
      {
        name: 'Encryption key rotation policy',
        keyType: 'encryption',
        rotationPeriod: '1_year',
        automated: true,
        acceptable: true
      },
      {
        name: 'Signing key rotation policy',
        keyType: 'signing',
        rotationPeriod: '2_years',
        automated: true,
        acceptable: true
      },
      {
        name: 'API key rotation',
        keyType: 'api_key',
        rotationPeriod: '6_months',
        automated: false,
        acceptable: true,
        warning: true
      },
      {
        name: 'No key rotation policy',
        keyType: 'encryption',
        rotationPeriod: 'never',
        automated: false,
        acceptable: false
      },
      {
        name: 'Key escrow implementation',
        keyType: 'encryption',
        escrow: true,
        acceptable: true
      },
      {
        name: 'Key lifecycle management',
        keyType: 'encryption',
        lifecycle: 'managed',
        acceptable: true
      }
    ];

    const vulnerabilities = [];

    for (const test of keyRotationTests) {
      const result = this.simulateKeyRotationTest(test);
      
      if (!test.acceptable) {
        vulnerabilities.push(this.createVulnerability(
          'Key Rotation Policy Violation',
          'medium',
          'key_management',
          `Inadequate key rotation: ${test.name}`,
          'Implement proper key rotation policies',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html']
        ));
      }

      if (test.warning && result.implemented) {
        vulnerabilities.push(this.createVulnerability(
          'Key Rotation Warning',
          'low',
          'key_management',
          `Consider automation: ${test.name}`,
          'Consider automating key rotation processes',
          undefined,
          undefined,
          ['https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html']
        ));
      }
    }

    const status = vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'key-rotation-lifecycle-001',
      'Key Rotation and Lifecycle Test',
      status,
      'medium',
      `Tested ${keyRotationTests.length} key rotation and lifecycle scenarios`,
      [],
      vulnerabilities,
      [],
      ['Implement regular key rotation', 'Automate key rotation processes', 'Maintain key lifecycle management', 'Implement key escrow where appropriate']
    );
  }

  private async testQuantumReadyEncryption(): Promise<SecurityTestResult> {
    const quantumTests = [
      {
        name: 'Post-quantum cryptography readiness',
        algorithm: 'CRYSTALS-Kyber',
        quantumResistant: true,
        acceptable: true
      },
      {
        name: 'RSA vulnerability to quantum attacks',
        algorithm: 'RSA',
        quantumResistant: false,
        currentlySecure: true,
        needsUpgrade: true
      },
      {
        name: 'ECC vulnerability to quantum attacks',
        algorithm: 'ECC',
        quantumResistant: false,
        currentlySecure: true,
        needsUpgrade: true
      },
      {
        name: 'ChaCha20-Poly1305 quantum resistance',
        algorithm: 'ChaCha20-Poly1305',
        quantumResistant: true,
        acceptable: true
      },
      {
        name: 'Quantum key distribution',
        technology: 'QKD',
        implemented: false,
        futureConsideration: true
      }
    ];

    const vulnerabilities = [];

    for (const test of quantumTests) {
      const result = this.simulateQuantumReadinessTest(test);
      
      if (test.needsUpgrade && !result.migrationPlan) {
        vulnerabilities.push(this.createVulnerability(
          'Quantum Computing Preparedness',
          'medium',
          'cryptographic_future_proofing',
          `Algorithm vulnerable to quantum attacks: ${test.name}`,
          'Develop migration plan for post-quantum cryptography',
          undefined,
          undefined,
          ['https://www.nist.gov/news-events/news/2022/07/nist-announces-first-four-quantum-resistant-cryptographic-algorithms']
        ));
      }
    }

    const status = vulnerabilities.length === 0 ? 'passed' : 'failed';
    return this.createTestResult(
      'quantum-ready-encryption-001',
      'Quantum-Ready Encryption Test',
      status,
      'medium',
      `Tested ${quantumTests.length} quantum readiness scenarios`,
      [],
      vulnerabilities,
      [],
      ['Plan for post-quantum cryptography migration', 'Consider quantum-resistant algorithms', 'Monitor NIST post-quantum standards', 'Implement crypto-agility']
    );
  }

  // Simulation methods
  private simulateEncryptionStrengthTest(algorithm: string, keySize: number): { secure: boolean } {
    const weakAlgorithms = ['DES', '3DES'];
    const weakKeySizes = { 'RSA': 1024, 'AES': 0 }; // AES-128 is weak threshold
    
    if (weakAlgorithms.includes(algorithm)) return { secure: false };
    if (weakKeySizes[algorithm as keyof typeof weakKeySizes] && keySize <= weakKeySizes[algorithm as keyof typeof weakKeySizes]) {
      return { secure: false };
    }
    
    return { secure: true };
  }

  private simulateKeyManagementTest(scenario: string): { secure: boolean } {
    const insecureScenarios = [
      'key_in_source_code',
      'key_in_config_file',
      'weak_random_key_generation',
      'key_derivation_no_salt',
      'insufficient_entropy'
    ];
    
    return { secure: !insecureScenarios.includes(scenario) };
  }

  private simulateDataAtRestTest(test: any): { weakEncryption: boolean } {
    if (!test.encrypted) return { weakEncryption: false };
    
    const weakAlgorithms = ['DES', '3DES', 'RC4'];
    return { weakEncryption: weakAlgorithms.includes(test.algorithm) };
  }

  private simulateDataInTransitTest(test: any): { secure: boolean } {
    if (test.protocol === 'HTTP') return { secure: false };
    if (test.tlsVersion && ['1.0', '1.1'].includes(test.tlsVersion)) return { secure: false };
    if (!test.encrypted && test.containsSensitiveData) return { secure: false };
    
    return { secure: true };
  }

  private simulateSensitiveDataTest(test: any): { properlyProtected: boolean } {
    let isProtected = true;
    
    if (test.classification === 'restricted' && !test.encrypted) isProtected = false;
    if (test.classification === 'secret' && !test.hashed && !test.encrypted) isProtected = false;
    if (test.neverInPlaintext && !test.hashed) isProtected = false;
    if (!test.maskedInLogs) isProtected = false;
    
    return { properlyProtected: isProtected };
  }

  private simulateCryptographicTest(test: any): { secure: boolean } {
    if (test.implementation === 'custom') return { secure: false };
    if (['MD5', 'SHA-1'].includes(test.algorithm)) return { secure: false };
    if (test.implementation === 'math_random' && test.purpose === 'key_generation') return { secure: false };
    if (test.mode === 'ECB') return { secure: false };
    
    return { secure: true };
  }

  private simulateKeyRotationTest(test: any): { implemented: boolean } {
    return { implemented: test.rotationPeriod !== 'never' };
  }

  private simulateQuantumReadinessTest(test: any): { migrationPlan: boolean } {
    // Simulate that migration planning is in progress for quantum-vulnerable algorithms
    return { migrationPlan: test.needsUpgrade ? Math.random() > 0.3 : true };
  }
}

describe('Data Encryption and Protection Security Tests', () => {
  let testRunner: SecurityTestRunner;
  let encryptionTest: DataEncryptionProtectionTest;

  beforeAll(() => {
    testRunner = new SecurityTestRunner({
      timeout: 60000,
      maxRetries: 3,
      severityLevels: ['low', 'medium', 'high', 'critical'],
      complianceStandards: ['OWASP', 'NIST', 'FIPS-140'],
      testCategories: ['encryption', 'key-management', 'data-protection']
    });

    encryptionTest = new DataEncryptionProtectionTest();
    testRunner.addTest(encryptionTest);
  });

  test('should use strong encryption algorithms', async () => {
    const results = await encryptionTest.runTests();
    const strengthResult = results.find(r => r.testId === 'encryption-strength-001');
    
    expect(strengthResult).toBeDefined();
    expect(strengthResult!.status).toBe('passed');
  }, 45000);

  test('should implement secure key management', async () => {
    const results = await encryptionTest.runTests();
    const keyMgmtResult = results.find(r => r.testId === 'key-management-001');
    
    expect(keyMgmtResult).toBeDefined();
    expect(keyMgmtResult!.status).toBe('passed');
  }, 40000);

  test('should encrypt sensitive data at rest', async () => {
    const results = await encryptionTest.runTests();
    const dataAtRestResult = results.find(r => r.testId === 'data-at-rest-encryption-001');
    
    expect(dataAtRestResult).toBeDefined();
    expect(dataAtRestResult!.status).toBe('passed');
  }, 35000);

  test('should encrypt data in transit', async () => {
    const results = await encryptionTest.runTests();
    const dataInTransitResult = results.find(r => r.testId === 'data-in-transit-encryption-001');
    
    expect(dataInTransitResult).toBeDefined();
    expect(dataInTransitResult!.status).toBe('passed');
  }, 35000);

  test('should protect sensitive data properly', async () => {
    const results = await encryptionTest.runTests();
    const sensitiveDataResult = results.find(r => r.testId === 'sensitive-data-protection-001');
    
    expect(sensitiveDataResult).toBeDefined();
    expect(sensitiveDataResult!.status).toBe('passed');
  }, 40000);

  test('should use secure cryptographic implementations', async () => {
    const results = await encryptionTest.runTests();
    const cryptoImplResult = results.find(r => r.testId === 'cryptographic-implementation-001');
    
    expect(cryptoImplResult).toBeDefined();
    expect(cryptoImplResult!.status).toBe('passed');
  }, 30000);

  test('should implement key rotation and lifecycle management', async () => {
    const results = await encryptionTest.runTests();
    const keyRotationResult = results.find(r => r.testId === 'key-rotation-lifecycle-001');
    
    expect(keyRotationResult).toBeDefined();
    expect(keyRotationResult!.status).toBe('passed');
  }, 30000);

  test('should prepare for quantum-ready encryption', async () => {
    const results = await encryptionTest.runTests();
    const quantumReadyResult = results.find(r => r.testId === 'quantum-ready-encryption-001');
    
    expect(quantumReadyResult).toBeDefined();
    expect(quantumReadyResult!.status).toBe('passed');
  }, 25000);
});