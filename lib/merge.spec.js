const { deepStrictEqual, ok, strictEqual } = require('assert')
const { merge } = require('./merge')

const notOk = value => ok(!value)

describe('merge', () => {
  it('should merge objects', () => deepStrictEqual(
    merge([{ foo: 42, bar: false }, { bar: true, baz: 42 }]),
    { foo: 42, bar: true, baz: 42 }
  ))
  it('should freeze merged objects', () => {
    const merged = merge([{}, { foo: 42 }])
    merged.x = 'fail'
    notOk(merged.x)
    merged.foo = 43
    strictEqual(merged.foo, 42)
  })
  it('should merge nested objects', () => {
    const merged = merge([
      { outer: { foo: 42, bar: false } },
      { outer: { bar: true, baz: 42 } }
    ])
    deepStrictEqual(merged, { outer: { foo: 42, bar: true, baz: 42 } })
  })
  it('should not treat dates as objects', () => {
    const date = new Date()
    const merged = merge([
      { foo: {}, bar: date },
      { foo: date, bar: {} }
    ])
    deepStrictEqual(merged, { foo: date, bar: {} })
  })
  it('should not treat iterables as objects', () => {
    const iterable = [42]
    const merged = merge([
      { foo: {}, bar: iterable },
      { foo: iterable, bar: {} }
    ])
    deepStrictEqual(merged, { foo: iterable, bar: {} })
  })
})
