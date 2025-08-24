// Mock better-sqlite3 for testing
class MockDatabase {
  constructor() {
    this.isOpen = true;
  }

  prepare(sql) {
    return {
      run: jest.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
      get: jest.fn(() => ({ id: 1, data: 'test' })),
      all: jest.fn(() => [{ id: 1, data: 'test' }]),
      finalize: jest.fn()
    };
  }

  exec(sql) {
    return this;
  }

  close() {
    this.isOpen = false;
  }
}

module.exports = MockDatabase;
