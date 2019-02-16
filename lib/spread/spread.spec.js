const { deepStrictEqual } = require('assert')

const { spread } = require('./spread')

describe('spread', () => {
  it('should succeed with no argument', () =>
    deepStrictEqual(
      spread((x, y) => ({ x, y }))(),
      { x: undefined, y: undefined }
    ))
  it('should succeed with an empty array', () =>
    deepStrictEqual(
      spread((x, y) => ({ x, y }))([]),
      { x: undefined, y: undefined }
    ))
  it('should spread partial argument list', () =>
    deepStrictEqual(
      spread((x, y) => ({ x, y }))(['foo']),
      { x: 'foo', y: undefined }
    ))
  it('should spread all arguments', () =>
    deepStrictEqual(
      spread((x, y) => ({ x, y }))(['foo', 42]),
      { x: 'foo', y: 42 }
    ))
})
