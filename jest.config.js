module.exports = {
  // TypeScript preset
  preset: 'ts-jest',
  // Use Node.js environment
  testEnvironment: 'node',
  
  // Run both JavaScript and TypeScript tests
  testMatch: [
    '**/*.test.js',
    '**/*.test.ts'
  ],
  
  // TypeScript transformation
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // Test setup (disabled for debugging)
  // setupFilesAfterEnv: ['<rootDir>/tests/setup-simple.js'],
  
  // Coverage configuration
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Test configuration
  testTimeout: 30000,
  verbose: true,
  passWithNoTests: true,
  
  // File extensions
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // Paths to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // Worker configuration
  maxWorkers: '50%',
  
  // Clear mocks
  clearMocks: true,
  restoreMocks: true,
  
  // Fix haste collision
  haste: {
    forceNodeFilesystemAPI: true
  },
  
  // Add roots
  roots: [
    '<rootDir>/tests'
  ]
};