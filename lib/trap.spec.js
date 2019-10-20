const { deepStrictEqual } = require('assert')

const { trap } = require('./trap')

const error = new Error('reasons')

describe('trap', () => {
  it('should return the result', () =>
    deepStrictEqual(trap(x => x + 2)(40), [undefined, 42]))
  it('should return the error', () =>
    deepStrictEqual(trap(() => { throw error })(), [error]))
  it('should resolve the thennable result', () =>
    trap(Promise.resolve(42))
      .then((result => deepStrictEqual(result, [undefined, 42]))))
  it('should resolve the thennable error', () =>
    trap(Promise.reject(error))
      .then((result => deepStrictEqual(result, [error]))))
  it('should resolve the async result', () =>
    trap(x => Promise.resolve(x))(42)
      .then((result => deepStrictEqual(result, [undefined, 42]))))
  it('should resolve the async error', () =>
    trap(() => Promise.reject(error))()
      .then((result => deepStrictEqual(result, [error]))))
})
