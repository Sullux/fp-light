/* eslint-disable no-restricted-syntax */
const { strictEqual, throws } = require('assert')

const { get } = require('./get')

describe('get', () => {
  it('should return an object property', () =>
    strictEqual(get('foo', { foo: 42 }), 42))
  it('should return a nested object property', () =>
    strictEqual(get(['foo', 'bar'], { foo: { bar: 42 } }), 42))
  it('should return an array element', () =>
    strictEqual(get(1, [41, 42]), 42))
  it('should return a nested array element', () =>
    strictEqual(get([1, 1], [41, [41.5, 42]]), 42))
  it('should return an array element nested in a property', () =>
    strictEqual(get(['foo', 1], { foo: [41, 42] }), 42))
  it('should return a bound function', () => {
    class Foo {
      constructor(x) {
        this.x = x
      }
      foo() {
        return this.x
      }
    }
    const unbound = (new Foo(42)).foo
    throws(unbound)
    strictEqual(get('foo', new Foo(42))(), 42)
  })
  it('should stop chaining on null', () =>
    strictEqual(get(['foo', 'bar'], { foo: null }), undefined))
  it('should stop chaining on undefined', () =>
    strictEqual(get(['foo', 'bar'], {}), undefined))
})
