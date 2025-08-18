/**
 * Modern Jest Configuration for Executive Assistant
 * Unified configuration with TypeScript support and multi-environment testing
 */

const config = {
  // Test environment
  testEnvironment: 'node',
  
  // Project root directory
  rootDir: '.',
  
  // Test discovery patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts}',
    '<rootDir>/tests/**/*.spec.{js,ts}'
  ],
  
  // TypeScript transformation - Fixed to override Jest defaults
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: {
          target: 'ES2022',
          module: 'CommonJS',
          moduleResolution: 'node',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          allowJs: true,
          strict: false,
          noImplicitAny: false,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          declaration: false,
          baseUrl: '.',
          paths: {
            '@/*': ['./src/*'],
            '@tests/*': ['./tests/*']
          }
        },
        isolatedModules: true
      }
    ],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Module name mapping for path aliases and dependency fixes
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@security/(.*)$': '<rootDir>/tests/security/$1',
    // Fix ESM dependencies
    '^nanoid$': '<rootDir>/tests/__mocks__/nanoid.js',
    '^better-sqlite3$': '<rootDir>/tests/__mocks__/better-sqlite3.js',
    '^ws$': '<rootDir>/tests/__mocks__/ws.js'
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/jest.setup.js'
  ],
  
  // Coverage configuration - ENFORCED IN CI
  collectCoverage: true, // Always collect coverage
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json', 'clover'],
  
  // Fail builds on coverage thresholds
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/tests/__mocks__/',
    '/tests/fixtures/',
    '\.d\.ts$'
  ],
  
  // Coverage thresholds - STRICTLY ENFORCED
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Per-directory thresholds
    './src/core/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/agents/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    },
    './src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
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
  
  // Transform ignore patterns - Fix ESM issues
  transformIgnorePatterns: [
    'node_modules/(?!(nanoid)/)'
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
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
      // Inherit TypeScript transform from root config
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            useESM: false,
            tsconfig: {
              target: 'ES2022',
              module: 'CommonJS',
              moduleResolution: 'node',
              allowSyntheticDefaultImports: true,
              esModuleInterop: true,
              allowJs: true,
              strict: false,
              noImplicitAny: false,
              skipLibCheck: true,
              forceConsistentCasingInFileNames: true,
              resolveJsonModule: true,
              declaration: false,
              baseUrl: '.',
              paths: {
                '@/*': ['./src/*'],
                '@tests/*': ['./tests/*']
              }
            },
            isolatedModules: true
          }
        ],
        '^.+\\.(js|jsx)$': 'babel-jest'
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1',
        '^@security/(.*)$': '<rootDir>/tests/security/$1',
        '^nanoid$': '<rootDir>/tests/__mocks__/nanoid.js',
        '^better-sqlite3$': '<rootDir>/tests/__mocks__/better-sqlite3.js',
        '^ws$': '<rootDir>/tests/__mocks__/ws.js'
      }
    },
    {
      displayName: 'Security Tests', 
      testMatch: [
        '<rootDir>/tests/security/**/*.test.{js,ts}',
        '<rootDir>/tests/security/**/*.spec.{js,ts}'
      ],
      testEnvironment: 'node',
      // Note: testTimeout is configured at project level differently
      maxWorkers: 1, // Sequential execution for security tests
      setupFilesAfterEnv: [
        '<rootDir>/tests/jest.setup.js'
      ],
      // Inherit TypeScript transform from root config
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            useESM: false,
            tsconfig: {
              target: 'ES2022',
              module: 'CommonJS',
              moduleResolution: 'node',
              allowSyntheticDefaultImports: true,
              esModuleInterop: true,
              allowJs: true,
              strict: false,
              noImplicitAny: false,
              skipLibCheck: true,
              forceConsistentCasingInFileNames: true,
              resolveJsonModule: true,
              declaration: false,
              baseUrl: '.',
              paths: {
                '@/*': ['./src/*'],
                '@tests/*': ['./tests/*']
              }
            },
            isolatedModules: true
          }
        ],
        '^.+\\.(js|jsx)$': 'babel-jest'
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1',
        '^@security/(.*)$': '<rootDir>/tests/security/$1',
        '^nanoid$': '<rootDir>/tests/__mocks__/nanoid.js',
        '^better-sqlite3$': '<rootDir>/tests/__mocks__/better-sqlite3.js',
        '^ws$': '<rootDir>/tests/__mocks__/ws.js'
      },
      // Security-specific coverage requirements - CRITICAL ENFORCEMENT
      coverageThreshold: {
        global: {
          branches: 95,
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