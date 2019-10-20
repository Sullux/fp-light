/* eslint-disable no-restricted-syntax */
const { strictEqual, deepStrictEqual } = require('assert')

const { get, getFrom } = require('./get')

describe('get', () => {
  it('should return the argument on missing path parts', () =>
    deepStrictEqual(get()({ foo: 42 }), { foo: 42 }))
  it('should return the argument on null path parts', () =>
    deepStrictEqual(get(null)({ foo: 42 }), { foo: 42 }))
  it('should return the argument on empty path parts', () =>
    deepStrictEqual(get([])({ foo: 42 }), { foo: 42 }))
  it('should return the argument on empty string path parts', () =>
    deepStrictEqual(get([])({ foo: 42 }), { foo: 42 }))
  it('should return an object property', () =>
    strictEqual(get('foo')({ foo: 42 }), 42))
  it('should return a nested object property', () =>
    strictEqual(get(['foo', 'bar'])({ foo: { bar: 42 } }), 42))
  it('should return an array element', () =>
    strictEqual(get(1)([41, 42]), 42))
  it('should return a nested array element', () =>
    strictEqual(get([1, 1])([41, [41.5, 42]]), 42))
  it('should return an array element nested in a property', () =>
    strictEqual(get(['foo', 1])({ foo: [41, 42] }), 42))
  it('should stop chaining on null', () =>
    strictEqual(get(['foo', 'bar'])({ foo: null }), undefined))
  it('should stop chaining on undefined', () =>
    strictEqual(get(['foo', 'bar'])({}), undefined))
  it('should return a nested object property from path', () =>
    strictEqual(get('foo.bar')({ foo: { bar: 42 } }), 42))
  it('should return an array element from path', () =>
    strictEqual(get('1')([41, 42]), 42))
  it('should return a nested array element from path', () =>
    strictEqual(get('1.1')([41, [41.5, 42]]), 42))
  it('should return an array element nested in a property from path', () =>
    strictEqual(get('foo.1')({ foo: [41, 42] }), 42))
})

describe('getFrom', () => {
  it('should get from an object', () =>
    strictEqual(getFrom({ foo: 42 })('foo'), 42))
})
