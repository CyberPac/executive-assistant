/**
 * Simple TypeScript Test to Verify ts-jest is Working
 */

interface TestInterface {
  id: string;
  value: number;
}

describe('TypeScript Functionality Test', () => {
  it('should handle TypeScript types correctly', () => {
    const testObj: TestInterface = {
      id: 'test-123',
      value: 42
    };
    
    expect(testObj.id).toBe('test-123');
    expect(testObj.value).toBe(42);
  });

  it('should handle async/await', async () => {
    const asyncFunction = async (): Promise<string> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve('success'), 10);
      });
    };

    const result = await asyncFunction();
    expect(result).toBe('success');
  });

  it('should handle TypeScript export syntax', () => {
    // This tests that ts-jest can parse TypeScript syntax
    type TestType = {
      name: string;
      count: number;
    };

    const item: TestType = {
      name: 'test-item',
      count: 5
    };

    expect(item.name).toBe('test-item');
    expect(item.count).toBe(5);
  });
});