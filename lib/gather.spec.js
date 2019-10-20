const { deepStrictEqual } = require('assert')

const { gather } = require('./gather')

describe('gather', () => {
  it('should pass an empty array for no arguments', () =>
    deepStrictEqual(gather(args => args)(), []))
  it('should pass a single element array', () =>
    deepStrictEqual(gather(args => args)(42), [42]))
  it('should pass all arguments', () =>
    deepStrictEqual(gather(args => args)('foo', 42), ['foo', 42]))
})
