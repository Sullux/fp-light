const base = require('./jest.base.config')

module.exports = {
  ...base,
  testMatch: [
    '**/*.integration.js',
  ],
  testEnvironment: 'node',
}
