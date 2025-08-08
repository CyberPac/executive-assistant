// CRITICAL: Fixed Jest Configuration for Executive Assistant
// Addresses ES module compilation issues and TypeScript support

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory
  rootDir: '../..',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,js}',
    '<rootDir>/src/**/*.test.{ts,js}'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transform configuration for TypeScript and ES modules
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', {
          targets: { node: '18' },
          modules: 'auto'
        }]
      ]
    }]
  },
  
  // Module name mapping for path resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/agents/(.*)$': '<rootDir>/src/agents/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Coverage collection from
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/index.ts'
  ],
  
  // Coverage thresholds (starting conservative, increasing over time)
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40
    },
    // Critical components require higher coverage
    'src/agents/agent-manager.ts': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    },
    'src/agents/PEACoordinationSystem.ts': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  
  // Test timeout for performance-critical tests
  testTimeout: 30000,
  
  // Verbose output for debugging
  verbose: true,
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/executive-assistant/node_modules/'
  ],
  
  // Module path ignore patterns
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/test-build/',
    '<rootDir>/test-dist/'
  ],
  
  // Handle ES modules properly
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  
  // Global setup and teardown
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
  
  // Performance monitoring
  performance: true,
  detectOpenHandles: true,
  detectLeaks: true,
  
  // Reporter configuration
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Executive Assistant Test Results',
      outputPath: 'coverage/test-results.html',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }],
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml'
    }]
  ]
};