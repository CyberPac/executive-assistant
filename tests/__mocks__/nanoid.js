/**
 * Mock for nanoid - fixes ESM compatibility issues
 */

// Mock the default export (nanoid function)
const nanoid = () => 'mock-nanoid-id-12345';

// Mock the customAlphabet function
const customAlphabet = (alphabet, size) => {
  return () => `mock-custom-${size || 21}`;
};

// Mock the urlAlphabet export
const urlAlphabet = 'Unescape6789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

module.exports = {
  nanoid,
  customAlphabet,
  urlAlphabet,
  __esModule: true,
  default: nanoid
};