const { memoize, defaultMemoizeArgsEqual } = require('./memoize')
const { strictEqual, ok } = require('assert')

const notOk = value => ok(!value)

describe('memoize', () => {
  it('should pass through the return value', () =>
    strictEqual(42, memoize(() => 42)()))
  it('should pass through the original value on subsequent call', () => {
    let mutatable = 1
    const memoized = memoize(() => (mutatable += 1))
    strictEqual(2, memoized(42))
    strictEqual(2, memoized(42))
  })
  it('should use a custom equality test', () => {
    let mutatable = 1
    const memoized = memoize(x => (mutatable += x), () => true)
    strictEqual(42, memoized(41))
    strictEqual(42, memoized(1000))
  })
})

describe('defaultMemoizeArgsEqual', () => {
  it('should compare argument length', () =>
    notOk(defaultMemoizeArgsEqual(
      Array(2).fill(42),
      Array(3).fill(42)
    )))
  it('should compare primitive argument equality', () =>
    ok(defaultMemoizeArgsEqual(
      Array(3).fill(42),
      Array(3).fill(42)
    )))
  it('should reject different references', () =>
    notOk(defaultMemoizeArgsEqual(
      [42, {}],
      [42, {}]
    )))
  it('should accept reference equality', () => {
    const value = {}
    ok(defaultMemoizeArgsEqual(
      [42, value],
      [42, value]
    ))
  })
})
