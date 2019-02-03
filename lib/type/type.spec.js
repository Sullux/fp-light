const { deepStrictEqual, strictEqual, throws } = require('assert')

const { type, Undefined, Null } = require('./type')

describe('type', () => {
  it('should type undefined', () =>
    deepStrictEqual(
      type(),
      {
        jstype: 'undefined',
        isFalsy: true,
        isTruthy: false,
        factory: Undefined,
        inheritence: [Undefined, Object],
      }
    ))
  it('should type null', () =>
    deepStrictEqual(
      type(null),
      {
        jstype: 'object',
        isFalsy: true,
        isTruthy: false,
        factory: Null,
        inheritence: [Null, Object],
      }
    ))
  it('should type false', () =>
    deepStrictEqual(
      type(false),
      {
        jstype: 'boolean',
        isFalsy: true,
        isTruthy: false,
        factory: Boolean,
        inheritence: [Boolean, Object],
      }
    ))
  it('should type true', () =>
    deepStrictEqual(
      type(true),
      {
        jstype: 'boolean',
        isFalsy: false,
        isTruthy: true,
        factory: Boolean,
        inheritence: [Boolean, Object],
      }
    ))
  it('should type falsy number', () =>
    deepStrictEqual(
      type(0),
      {
        jstype: 'number',
        isFalsy: true,
        isTruthy: false,
        factory: Number,
        inheritence: [Number, Object],
      }
    ))
  it('should type number', () =>
    deepStrictEqual(
      type(1),
      {
        jstype: 'number',
        isFalsy: false,
        isTruthy: true,
        factory: Number,
        inheritence: [Number, Object],
      }
    ))
  it('should type falsy string', () =>
    deepStrictEqual(
      type(''),
      {
        jstype: 'string',
        isFalsy: true,
        isTruthy: false,
        factory: String,
        inheritence: [String, Object],
      }
    ))
  it('should type string', () =>
    deepStrictEqual(
      type('foo'),
      {
        jstype: 'string',
        isFalsy: false,
        isTruthy: true,
        factory: String,
        inheritence: [String, Object],
      }
    ))
  it('should type array', () =>
    deepStrictEqual(
      type(['foo']),
      {
        jstype: 'object',
        isFalsy: false,
        isTruthy: true,
        factory: Array,
        inheritence: [Array, Object],
      }
    ))
  it('should type date', () =>
    deepStrictEqual(
      type(new Date()),
      {
        jstype: 'object',
        isFalsy: false,
        isTruthy: true,
        factory: Date,
        inheritence: [Date, Object],
      }
    ))
  it('should type extended class', () => {
    class Foo {}
    class Bar extends Foo {}
    deepStrictEqual(
      type(new Bar()),
      {
        jstype: 'object',
        isFalsy: false,
        isTruthy: true,
        factory: Bar,
        inheritence: [Bar, Foo, Object],
      }
    )
  })
})

describe('Undefined', () => {
  it('should return undefined', () =>
    strictEqual(Undefined(), undefined))
  it('should throw when constructed', () =>
    throws(() => new Undefined()))
})

describe('Null', () => {
  it('should return null', () =>
    strictEqual(Null(), null))
  it('should throw when constructed', () =>
    throws(() => new Null()))
})
