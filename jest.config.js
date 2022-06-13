// Global Jest Configuration

const base = require('./jest.base.config')// eslint-disable-line import/no-unresolved

module.exports = {
  ...base,
  moduleDirectories: [
    'node_modules',
  ],
  // collectCoverage: true,
  coverageDirectory: './coverage/jest',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/utils/testUtils.js',
    '/src/utils/stringMinusOne.js',
    '/src/utils/hashToUuid.js',
    '/src/utils/s3/s3.js', // TODO: fill in the missing coverage and remove this
    '/src/utils/api/queries.js', // TODO: fix
  ],
  // coverageThreshold: {
  //   global: {
  //     statements: 100,
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //   },
  // },
}
