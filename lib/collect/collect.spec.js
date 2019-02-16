const { deepStrictEqual } = require('assert')

const { collect } = require('./collect')

describe('collect', () => {
  it('should pass an empty array for no arguments', () =>
    deepStrictEqual(collect(args => args)(), []))
  it('should pass a single element array', () =>
    deepStrictEqual(collect(args => args)(42), [42]))
  it('should pass all arguments', () =>
    deepStrictEqual(collect(args => args)('foo', 42), ['foo', 42]))
})
