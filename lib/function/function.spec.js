const { curry, memoize } = require('./')
const assert = require('assert')

describe('fn', () => {
  describe('curry', () => {
    it('should not affect a parameterless function', () =>
      assert.strictEqual(curry(() => 'foo')(), 'foo'))
    it('should not affect a single-parameter function', () =>
      assert.strictEqual(curry(arg => arg)('foo'), 'foo'))
    it('should curry a two-parameter function', () =>
      assert.strictEqual(curry((arg1, arg2) => arg1 + arg2)('a')('b'), 'ab'))
    it('should allow multi-argument calls on a curried function', () =>
      assert.strictEqual(curry((arg1, arg2) => arg1 + arg2)('a', 'b'), 'ab'))
    it('should allow multi- plus single-argument calls on a curried function', () =>
      assert.strictEqual(curry((arg1, arg2, arg3) => arg1 + arg2 + arg3)('a', 'b')('c'), 'abc'))
    it('should ignore optional parameters', () =>
      assert.strictEqual(curry((arg1, ...args) => arg1 + args.length)(42), 42))
    it('should respect explicit arity', () =>
      assert.strictEqual(
        curry((arg1, ...args) => arg1 + args.length, 2)(42)('foo'),
        43
      ))
  })

  describe('memoize', () => {
    it('should pass through the return value', () =>
      assert.strictEqual(42, memoize(() => 42)()))
    it('should pass through the original value on subsequent call', () => {
      let mutatable = 1
      const memoized = memoize(i => (mutatable += 1))
      assert.strictEqual(2, memoized(42))
      assert.strictEqual(2, memoized(42))
    })
  })
})
