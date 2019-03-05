/* eslint-disable no-restricted-syntax */
const { deepStrictEqual } = require('assert')

const { set } = require('./set')

describe('set', () => {
  it('should set an object value', () =>
    deepStrictEqual(set('foo', 42, {}), { foo: 42 }))
  it('should set a nested object value', () =>
    deepStrictEqual(set(['foo', 'bar'], 42, {}), { foo: { bar: 42 } }))
  it('should set a value at the end of an array', () =>
    deepStrictEqual(set(0, 'foo', []), ['foo']))
  it('should set a value at the start of an array', () =>
    deepStrictEqual(set(0, 'foo', ['bar', 42]), ['foo', 42]))
  it('should set a value in the middle of an array', () =>
    deepStrictEqual(set(1, 'foo', [42, 42]), [42, 'foo']))
  it('should set an array value nested in an object', () =>
    deepStrictEqual(set(['foo', 1], 42, { foo: [] }), { foo: [undefined, 42] }))
  it('should set an object value nested in an array', () =>
    deepStrictEqual(
      set([1, 'foo'], 42, [null, { foo: 7 }]), 
      [null, { foo: 42 }]
    ))
  it('should generate intermediate objects and arrays', () =>
    deepStrictEqual(
      set(['foo', 1, 'bar', 2], 42, undefined),
      { foo: [undefined, { bar: [undefined, undefined, 42] }] }
    ))
})
