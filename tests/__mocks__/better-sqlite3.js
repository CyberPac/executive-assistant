/**
 * Mock for better-sqlite3 - fixes native module dependency issues
 */

// Mock database class
class MockDatabase {
  constructor() {
    this.isOpen = true;
    this.inTransaction = false;
  }

  prepare(sql) {
    const mockStatement = {
      run: () => ({ changes: 1, lastInsertRowid: 1 }),
      get: () => ({ id: 1, data: 'mock-data' }),
      all: () => [{ id: 1, data: 'mock-data' }],
      iterate: function* () {
        yield { id: 1, data: 'mock-data' };
      },
      pluck: () => ({ all: () => ['mock-value'] }),
      bind: () => mockStatement,
      safeIntegers: () => mockStatement,
      raw: () => mockStatement,
      columns: () => mockStatement,
      finalize: () => {}
    };
    return mockStatement;
  }

  exec(sql) {
    return this;
  }

  close() {
    this.isOpen = false;
    return this;
  }

  transaction(fn) {
    return (...args) => {
      this.inTransaction = true;
      try {
        const result = fn(...args);
        this.inTransaction = false;
        return result;
      } catch (error) {
        this.inTransaction = false;
        throw error;
      }
    };
  }

  pragma(statement, options) {
    return [];
  }

  backup(destination, options) {
    return Promise.resolve();
  }

  serialize(options) {
    return Buffer.from('mock-database-content');
  }

  function(name, options, fn) {
    return this;
  }

  aggregate(name, options) {
    return this;
  }

  defaultSafeIntegers(toggle) {
    return this;
  }

  unsafeMode(unsafe) {
    return this;
  }
}

// Mock the Database constructor function
function Database(filename, options) {
  return new MockDatabase();
}

// Add static methods to Database
Database.SqliteError = class SqliteError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = 'SqliteError';
  }
};

module.exports = Database;
module.exports.default = Database;