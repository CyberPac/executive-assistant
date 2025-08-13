/**
 * Modern Jest Configuration for Executive Assistant
 * Unified configuration with TypeScript support and multi-environment testing
 */

const config = {
  // Use TypeScript preset for ts-jest
  preset: 'ts-jest',
  
  // Test environment
  testEnvironment: 'node',
  
  // Project root directory
  rootDir: '.',
  
  // Test discovery patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts}',
    '<rootDir>/tests/**/*.spec.{js,ts}'
  ],
  
  // TypeScript transformation - Modern syntax
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: {
          module: 'commonjs',
          target: 'es2020',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          types: ['jest', 'node']
        }
      }
    ],
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@security/(.*)$': '<rootDir>/tests/security/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/jest.setup.js'
  ],
  
  // Coverage configuration
  collectCoverage: false, // Enable on demand
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Test configuration
  testTimeout: 30000,
  verbose: true,
  passWithNoTests: true,
  
  // File extensions Jest recognizes
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Paths to ignore during testing
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/reports/'
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // Worker configuration for parallel testing
  maxWorkers: '50%',
  
  // Mock configuration
  clearMocks: true,
  restoreMocks: true,
  
  // Haste configuration
  haste: {
    forceNodeFilesystemAPI: true
  },
  
  // Error handling
  errorOnDeprecated: true,
  
  // Projects for environment-specific testing
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.{js,ts}',
        '<rootDir>/tests/basic-*.test.{js,ts}',
        '<rootDir>/tests/compilation-*.test.{js,ts}'
      ],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js']
    },
    {
      displayName: 'Security Tests', 
      testMatch: [
        '<rootDir>/tests/security/**/*.test.{js,ts}',
        '<rootDir>/tests/security/**/*.spec.{js,ts}'
      ],
      testEnvironment: 'node',
      timeout: 600000, // 10 minutes for security scans
      maxWorkers: 1, // Sequential execution for security tests
      setupFilesAfterEnv: [
        '<rootDir>/tests/jest.setup.js'
      ],
      // Security-specific coverage requirements
      coverageThreshold: {
        global: {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95
        }
      },
      // Security test reporting
      coverageDirectory: '<rootDir>/reports/security/coverage'
    }
  ],
  
  // Global test reporting
  reporters: [
    'default'
    // Note: Additional reporters disabled due to missing dependencies
    // Enable after installing: jest-html-reporters, jest-junit
  ],
  
  // Cache configuration
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Watch mode configuration
  watchman: false, // Disabled for better performance in containers
  
  // Notification configuration
  notify: false, // Disabled for CI environments
  
  // Global variables available in tests
  globals: {
    TEST_MODE: true,
    NODE_ENV: 'test'
  }
};

module.exports = config;