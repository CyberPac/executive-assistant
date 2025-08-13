/**
 * Basic Types and Enums Tests
 * Tests core type definitions without TypeScript compilation dependencies
 */

describe('Core Types Structure', () => {
  test('Package structure exists', () => {
    const fs = require('fs');
    const path = require('path');
    
    const srcDir = path.join(__dirname, '../../src');
    const typesDir = path.join(srcDir, 'types');
    
    expect(fs.existsSync(srcDir)).toBe(true);
    expect(fs.existsSync(typesDir)).toBe(true);
    
    // Check for key type files
    const expectedTypeFiles = [
      'enums.ts',
      'pea-agent-types.ts',
      'global.d.ts'
    ];
    
    expectedTypeFiles.forEach(file => {
      const filePath = path.join(typesDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('Agent structure exists', () => {
    const fs = require('fs');
    const path = require('path');
    
    const agentsDir = path.join(__dirname, '../../src/agents');
    expect(fs.existsSync(agentsDir)).toBe(true);
    
    // Check for key agent directories
    const expectedAgentDirs = [
      'communication-manager',
      'document-intelligence',
      'executive-orchestrator',
      'financial-intelligence',
      'security-privacy',
      'travel-logistics'
    ];
    
    expectedAgentDirs.forEach(dir => {
      const dirPath = path.join(agentsDir, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
    });
  });

  test('Core configuration files exist', () => {
    const fs = require('fs');
    const path = require('path');
    
    const rootDir = path.join(__dirname, '../..');
    const configFiles = [
      'package.json',
      'tsconfig.json',
      'jest.config.js'
    ];
    
    configFiles.forEach(file => {
      const filePath = path.join(rootDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});

describe('File Content Validation', () => {
  test('TypeScript config contains required settings', () => {
    const fs = require('fs');
    const path = require('path');
    
    const tsconfigPath = path.join(__dirname, '../../tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    expect(tsconfig).toHaveProperty('compilerOptions');
    expect(tsconfig.compilerOptions).toHaveProperty('target');
    expect(tsconfig.compilerOptions).toHaveProperty('module');
    expect(tsconfig.compilerOptions).toHaveProperty('baseUrl');
    expect(tsconfig.compilerOptions).toHaveProperty('paths');
    
    // Check path mappings for testing
    expect(tsconfig.compilerOptions.paths).toHaveProperty('@/*');
    expect(tsconfig.compilerOptions.paths['@/*']).toContain('./src/*');
  });

  test('Jest config contains required settings', () => {
    const jestConfig = require('../../jest.config.js');
    
    // Verify TypeScript transform configuration (we use explicit transform instead of preset)
    const transformKeys = Object.keys(jestConfig.transform);
    const tsTransformKey = transformKeys.find(key => key.includes('(ts|tsx)'));
    expect(tsTransformKey).toBeDefined();
    expect(jestConfig.transform[tsTransformKey][0]).toBe('ts-jest');
    expect(jestConfig).toHaveProperty('testEnvironment', 'node');
    expect(jestConfig).toHaveProperty('testMatch');
    expect(jestConfig).toHaveProperty('moduleNameMapper');
    expect(jestConfig).toHaveProperty('setupFilesAfterEnv');
    
    expect(Array.isArray(jestConfig.testMatch)).toBe(true);
    expect(jestConfig.testMatch.length).toBeGreaterThan(0);
    
    // Verify module name mapping for aliases  
    const mapperKeys = Object.keys(jestConfig.moduleNameMapper);
    const aliasKey = mapperKeys.find(key => key.includes('@/'));
    expect(aliasKey).toBeDefined();
    expect(jestConfig.moduleNameMapper[aliasKey]).toBe('<rootDir>/src/$1');
  });

  test('Package.json has required dependencies', () => {
    const packageJson = require('../../package.json');
    
    expect(packageJson).toHaveProperty('dependencies');
    expect(packageJson).toHaveProperty('devDependencies');
    
    // Check for key runtime dependencies
    const requiredDeps = ['typescript', 'tsx', 'better-sqlite3'];
    requiredDeps.forEach(dep => {
      expect(packageJson.dependencies).toHaveProperty(dep);
    });
    
    // Check for key test dependencies
    const requiredTestDeps = ['jest', 'ts-jest', '@types/jest'];
    requiredTestDeps.forEach(dep => {
      expect(packageJson.devDependencies).toHaveProperty(dep);
    });
    
    // Verify test scripts
    expect(packageJson.scripts).toHaveProperty('test', 'jest');
    expect(packageJson.scripts).toHaveProperty('build', 'tsc --noEmit false --outDir dist');
  });
});

describe('Module System Compatibility', () => {
  test('Can parse TypeScript files as text', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Try to read a sample TypeScript file
    const sampleTsFile = path.join(__dirname, '../../src/types/enums.ts');
    
    if (fs.existsSync(sampleTsFile)) {
      const content = fs.readFileSync(sampleTsFile, 'utf8');
      
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content).toMatch(/export\s+(enum|interface|type|const)/);
    }
  });

  test('Can validate basic TypeScript syntax patterns', () => {
    const fs = require('fs');
    const path = require('path');
    
    const agentFile = path.join(__dirname, '../../src/agents/agent-manager.ts');
    
    if (fs.existsSync(agentFile)) {
      const content = fs.readFileSync(agentFile, 'utf8');
      
      // Look for TypeScript patterns
      expect(content).toMatch(/class\s+\w+/); // Should have class definitions
      expect(content).toMatch(/interface\s+\w+|type\s+\w+/); // Should have type definitions
      expect(content).toMatch(/export/); // Should have exports
    }
  });

  test('Directory structure is logical', () => {
    const fs = require('fs');
    const path = require('path');
    
    const srcDir = path.join(__dirname, '../../src');
    const srcContents = fs.readdirSync(srcDir);
    
    // Should have organized subdirectories
    expect(srcContents).toContain('agents');
    expect(srcContents).toContain('types');
    expect(srcContents).toContain('utils');
    
    // Each directory should contain files
    ['agents', 'types', 'utils'].forEach(dir => {
      const dirPath = path.join(srcDir, dir);
      const dirContents = fs.readdirSync(dirPath);
      expect(dirContents.length).toBeGreaterThan(0);
    });
  });
});