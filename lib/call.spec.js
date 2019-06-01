const { strictEqual } = require('assert')

const { call } = require('./call')

describe('call', () => {
  it('should pass the argument to the high order function', () =>
    strictEqual(call(42)(x => x.toString(10)), '42'))
  it('should call the high order function without an argument', () =>
    strictEqual(call()(x => x === undefined), true))
  it('should call the function when called with both arguments', () =>
    strictEqual(call(42, x => x.toString()), '42'))
})
