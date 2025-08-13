/**
 * Base Mock Factory Interface and Utilities
 * Provides type-safe foundation for all mock factory implementations
 */

import { DeepPartial } from '../../../../src/types/test-types';

/**
 * Core interface for all mock factories
 * Ensures consistent API across all mock implementations
 */
export interface MockFactory<T> {
  /**
   * Creates a new mock instance with optional overrides
   */
  create(overrides?: DeepPartial<T>): jest.Mocked<T>;
  
  /**
   * Resets all mock state and call history
   */
  reset(): void;
  
  /**
   * Configures default values for future mock instances
   */
  configure(defaults: Partial<T>): void;
  
  /**
   * Validates that mock structure matches interface requirements
   */
  validate(mock: jest.Mocked<T>): MockValidationResult;
}

/**
 * Result of mock validation operations
 */
export interface MockValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingProperties: string[];
  typeConflicts: Array<{ property: string; expected: string; actual: string }>;
}

/**
 * Base abstract class implementing common mock factory functionality
 */
export abstract class BaseMockFactory<T> implements MockFactory<T> {
  protected defaults: Partial<T> = {};
  protected createdMocks: jest.Mocked<T>[] = [];
  
  abstract create(overrides?: DeepPartial<T>): jest.Mocked<T>;
  
  /**
   * Reset all created mocks and clear defaults
   */
  reset(): void {
    this.createdMocks.forEach(mock => {
      if (mock && typeof mock === 'object') {
        Object.keys(mock).forEach(key => {
          const mockFn = (mock as any)[key];
          if (jest.isMockFunction(mockFn)) {
            mockFn.mockReset();
          }
        });
      }
    });
    this.createdMocks = [];
    this.defaults = {};
  }
  
  /**
   * Set default values for future mock instances
   */
  configure(defaults: Partial<T>): void {
    this.defaults = { ...this.defaults, ...defaults };
  }
  
  /**
   * Validate mock structure against type requirements
   */
  validate(mock: jest.Mocked<T>): MockValidationResult {
    const result: MockValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingProperties: [],
      typeConflicts: []
    };
    
    if (!mock || typeof mock !== 'object') {
      result.isValid = false;
      result.errors.push('Mock is not a valid object');
      return result;
    }
    
    // Validate that all functions are properly mocked
    const expectedInterface = this.getExpectedInterface();
    for (const [property, expectedType] of Object.entries(expectedInterface)) {
      const actualValue = (mock as any)[property];
      
      if (actualValue === undefined) {
        result.missingProperties.push(property);
        result.isValid = false;
      } else if (expectedType === 'function' && !jest.isMockFunction(actualValue)) {
        result.typeConflicts.push({
          property,
          expected: 'jest.MockedFunction',
          actual: typeof actualValue
        });
        result.warnings.push(`Property '${property}' should be a jest mock function`);
      }
    }
    
    return result;
  }
  
  /**
   * Abstract method to define expected interface structure
   * Must be implemented by concrete factory classes
   */
  protected abstract getExpectedInterface(): Record<string, string>;
  
  /**
   * Merge defaults, overrides, and base values with proper type safety
   */
  protected mergeValues<U>(base: U, overrides?: DeepPartial<U>): U {
    if (!overrides) return base;
    
    const result = { ...base };
    
    for (const key in overrides) {
      const override = overrides[key];
      if (override !== undefined) {
        if (typeof override === 'object' && override !== null && !Array.isArray(override)) {
          (result as any)[key] = this.mergeValues((base as any)[key] || {}, override);
        } else {
          (result as any)[key] = override;
        }
      }
    }
    
    return result;
  }
  
  /**
   * Create a properly typed Jest mock function
   */
  protected createMockFunction<TArgs extends any[], TReturn>(
    implementation?: (...args: TArgs) => TReturn
  ): jest.MockedFunction<(...args: TArgs) => TReturn> {
    const mockFn = jest.fn<TReturn, TArgs>();
    if (implementation) {
      mockFn.mockImplementation(implementation);
    }
    return mockFn;
  }
  
  /**
   * Track created mock for lifecycle management
   */
  protected trackMock(mock: jest.Mocked<T>): jest.Mocked<T> {
    this.createdMocks.push(mock);
    return mock;
  }
}

/**
 * Utility functions for mock validation and testing
 */
export class MockValidationHelpers {
  /**
   * Assert that a mock is properly configured
   */
  static assertMockValid<T>(mock: jest.Mocked<T>, factory: MockFactory<T>): void {
    const validation = factory.validate(mock);
    
    if (!validation.isValid) {
      const errorMessage = [
        'Mock validation failed:',
        ...validation.errors.map(e => `  - ${e}`),
        ...validation.missingProperties.map(p => `  - Missing property: ${p}`),
        ...validation.typeConflicts.map(c => `  - Type conflict on ${c.property}: expected ${c.expected}, got ${c.actual}`)
      ].join('\n');
      
      throw new Error(errorMessage);
    }
    
    if (validation.warnings.length > 0) {
      console.warn('Mock validation warnings:', validation.warnings);
    }
  }
  
  /**
   * Check if all mock functions in an object have been called
   */
  static assertAllMocksCalled(mock: any): void {
    const uncalledMocks: string[] = [];
    
    const checkObject = (obj: any, path = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (jest.isMockFunction(value)) {
          if ((value as jest.MockedFunction<any>).mock.calls.length === 0) {
            uncalledMocks.push(currentPath);
          }
        } else if (typeof value === 'object' && value !== null) {
          checkObject(value, currentPath);
        }
      }
    };
    
    checkObject(mock);
    
    if (uncalledMocks.length > 0) {
      throw new Error(`Uncalled mock functions: ${uncalledMocks.join(', ')}`);
    }
  }
  
  /**
   * Get performance metrics for mock operations
   */
  static getMockPerformanceMetrics(mock: any): MockPerformanceMetrics {
    let totalCalls = 0;
    let totalExecutionTime = 0;
    const functionMetrics: Array<{ name: string; calls: number; avgTime: number }> = [];
    
    const analyzeObject = (obj: any, path = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (jest.isMockFunction(value)) {
          const mockFn = value as jest.MockedFunction<any>;
          const calls = mockFn.mock.calls.length;
          totalCalls += calls;
          
          // Estimate execution time (simplified)
          const avgTime = calls > 0 ? 1 : 0; // 1ms average per call
          totalExecutionTime += avgTime * calls;
          
          functionMetrics.push({
            name: currentPath,
            calls,
            avgTime
          });
        } else if (typeof value === 'object' && value !== null) {
          analyzeObject(value, currentPath);
        }
      }
    };
    
    analyzeObject(mock);
    
    return {
      totalCalls,
      totalExecutionTime,
      averageCallTime: totalCalls > 0 ? totalExecutionTime / totalCalls : 0,
      functionMetrics
    };
  }
}

export interface MockPerformanceMetrics {
  totalCalls: number;
  totalExecutionTime: number;
  averageCallTime: number;
  functionMetrics: Array<{ name: string; calls: number; avgTime: number }>;
}