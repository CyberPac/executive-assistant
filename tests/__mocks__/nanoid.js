// Mock nanoid for consistent test IDs
const nanoid = jest.fn(() => 'mock-id-' + Math.random().toString(36).substr(2, 9));
nanoid.customAlphabet = jest.fn(() => () => 'mock-custom-id-' + Math.random().toString(36).substr(2, 9));

module.exports = { nanoid };
module.exports.nanoid = nanoid;
