/**
 * Jest Configuration for Security Tests
 * Executive Assistant Security Testing Framework
 */

module.exports = {
  // Use the main Jest configuration as base
  ...require('../../executive-assistant/jest.config.js'),

  // Override specific settings for security tests
  displayName: 'Security Tests',
  testMatch: [
    '**/tests/security/**/*.test.(ts|js)',
    '**/tests/security/**/*.spec.(ts|js)'
  ],
  
  // Security-specific test environment
  testEnvironment: 'node',
  
  // Extended timeout for security scans
  testTimeout: 600000, // 10 minutes
  
  // Setup files for security testing
  setupFilesAfterEnv: [
    '<rootDir>/tests/security/setup/security-test-setup.ts'
  ],
  
  // Coverage configuration for security tests
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    'tests/security/**/*.{ts,js}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/reports/**'
  ],
  
  // Coverage thresholds - strict for security code
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './tests/security/core/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  
  // Coverage reporting
  coverageDirectory: '<rootDir>/reports/security/coverage',
  coverageReporters: [
    'text',
    'text-summary', 
    'html',
    'json',
    'lcov',
    'clover'
  ],
  
  // Custom reporters for security test results
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: '<rootDir>/reports/security',
      filename: 'security-test-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Executive Assistant Security Test Report',
      logoImgPath: undefined,
      includeFailureMsg: true,
      includeSuiteFailure: true
    }],
    ['jest-junit', {
      outputDirectory: '<rootDir>/reports/security',
      outputName: 'security-junit.xml',
      suiteName: 'Security Tests',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      usePathForSuiteName: true
    }]
  ],
  
  // Module resolution for security tests
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@security/(.*)$': '<rootDir>/tests/security/$1'
  },
  
  // Global variables for security tests
  globals: {
    'ts-jest': {
      useESM: false,
      tsconfig: {
        module: 'commonjs',
        target: 'es2020',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      }
    },
    // Security test configuration
    SECURITY_TEST_MODE: true,
    SECURITY_SCAN_TIMEOUT: 300000, // 5 minutes
    VULNERABILITY_THRESHOLD: 0,
    COMPLIANCE_THRESHOLD: 95
  },
  
  // Test sequencing - run in order for security tests
  maxWorkers: 1, // Sequential execution for security tests
  
  // Retry configuration for flaky security scans
  retry: 1,
  
  // Verbose output for security test debugging
  verbose: true,
  
  // Custom test results processor
  testResultsProcessor: '<rootDir>/tests/security/processors/security-results-processor.js',
  
  // Transform configuration
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: false
    }],
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // Files to ignore during transformation
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/reports/',
    '/dist/'
  ],
  
  // Watch mode configuration (disabled for CI)
  watchman: false,
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Cache configuration
  cache: false, // Disable cache for consistent security test results
  
  // Notification configuration for security test failures
  notify: true,
  notifyMode: 'failure-change',
  
  // Custom matchers and assertions
  setupFilesAfterEnv: [
    '<rootDir>/tests/security/matchers/security-matchers.ts'
  ]
};