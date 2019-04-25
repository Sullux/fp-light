const { strictEqual, deepStrictEqual } = require('assert')
const { toArray } = require('./to-array')

describe('toArray', () => {
  it('should return the original array', () => {
    const input = ['foo', 42]
    strictEqual(toArray(input), input)
  })
  it('should return an empty array for undefined', () =>
    deepStrictEqual(toArray(), []))
  it('should return an empty array for null', () =>
    deepStrictEqual(toArray(null), []))
  it('should return an empty array for empty string', () =>
    deepStrictEqual(toArray(''), []))
  it('should return an array containing the Date', () => {
    const date = new Date(1000)
    deepStrictEqual(toArray(date), [date])
  })
  it('should return an array containing the function', () => {
    const fn = () => 42
    deepStrictEqual(toArray(fn), [fn])
  })
  it('should return an array containing the number', () =>
    deepStrictEqual(toArray(42), [42]))
  it('should return an array containing the object entries', () =>
    deepStrictEqual(
      toArray({ foo: 42, bar: 'baz'}), 
      [['foo', 42], ['bar', 'baz']],
    ))
})
