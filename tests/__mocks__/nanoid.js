// Mock nanoid for consistent test IDs
const nanoid = jest.fn(() => 'mock-nanoid-id-12345');
nanoid.customAlphabet = jest.fn(() => () => 'mock-custom-id-12345');

module.exports = { nanoid };
module.exports.nanoid = nanoid;
