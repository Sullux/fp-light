const { toObject } = require('./to-object')
const { strictEqual, deepStrictEqual } = require('assert')

describe('toObject', () => {
  it('should handle undefined', () => 
    deepStrictEqual(toObject(), { 'Undefined': undefined }))
  it('should handle null', () =>  
    deepStrictEqual(toObject(null), { 'Null': null }))
  it('should handle iterables', () =>  
    deepStrictEqual(
      toObject([['foo', 'bar'], ['baz', 42]]), 
      { foo: 'bar', baz: 42 })
    )
  it('should handle objects', () => {
    const object = { foo: 42 }
    strictEqual(toObject(object), object)
  })
  it('should handle dates', () => {
    const date = new Date()
    deepStrictEqual(toObject(date), { Date: date })
  })
  it('should handle primitives', () => {
    deepStrictEqual(toObject(42), { Number: 42 })
    deepStrictEqual(toObject('foo'), { String: 'foo' })
    const f = () => 42
    deepStrictEqual(toObject(f), { Function: f })
  })
})
