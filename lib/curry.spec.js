const { curried, curry, required } = require('./curry')
const assert = require('assert')

describe('curry', () => {
  it('should not affect a parameterless function', () =>
    assert.strictEqual(curry(() => 'foo')(), 'foo'))
  it('should not affect a single-parameter function', () =>
    assert.strictEqual(curry(arg => arg)('foo'), 'foo'))
  it('should curry a two-parameter function', () =>
    assert.strictEqual(curry((arg1, arg2) => arg1 + arg2)('a')('b'), 'ab'))
  it('should allow multi-argument calls on a curried function', () =>
    assert.strictEqual(curry((arg1, arg2) => arg1 + arg2)('a', 'b'), 'ab'))
  it('should allow multi- plus single-argument calls on a curried function',
    () =>
      assert.strictEqual(
        curry((arg1, arg2, arg3) => arg1 + arg2 + arg3)('a', 'b')('c'),
        'abc',
      ))
  it('should ignore optional parameters', () =>
    assert.strictEqual(curry((arg1, ...args) => arg1 + args.length)(42), 42))
  it('should respect explicit arity', () =>
    assert.strictEqual(
      curry((arg1, ...args) => arg1 + args.length, 2)(42)('foo'),
      43
    ))
  it('should partially apply object properties', () => {
    const curried = curry(
      ({ foo, bar }) => foo + bar,
      { [required]: ['foo', 'bar'] },
    )
    assert.strictEqual(curried({ foo: 41 })({ bar: 1 }), 42)
  })
  it('should fully apply object properties when all provided', () => {
    const curried = curry(
      ({ foo, bar }) => foo + bar,
      { [required]: ['foo', 'bar'] },
    )
    assert.strictEqual(curried({ foo: 41, bar: 1 }), 42)
  })
  it('should fully apply object properties with defaults', () => {
    const curried = curry(
      ({ foo, bar }) => foo + bar,
      { [required]: ['foo', 'bar'], bar: 1 },
    )
    assert.strictEqual(curried({ foo: 41 }), 42)
  })
  it('should maintain a reference to the original function', () => {
    const originalFn = ({ foo, bar }) => foo + bar
    const fn = curry(
      originalFn,
      { [required]: ['foo', 'bar'] },
    )
    assert.strictEqual(fn({ foo: 41 })[curried], originalFn)
  })
  it('should preserve the original function name', () => {
    const originalFn = ({ foo, bar }) => foo + bar
    const fn = curry(
      originalFn,
      { [required]: ['foo', 'bar'] },
    )
    assert.strictEqual(fn({ foo: 41 }).name, originalFn.name)
  })
})
