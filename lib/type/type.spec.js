const { deepStrictEqual, strictEqual, throws } = require('assert')

const { type, Undefined, Null } = require('./type')

describe('type', () => {
  it('should type undefined', () =>
    deepStrictEqual(
      type(),
      {
        jstype: 'undefined',
        factory: Undefined,
        inheritence: [Undefined, Object],
      }
    ))
  it('should type null', () =>
    deepStrictEqual(
      type(null),
      {
        jstype: 'object',
        factory: Null,
        inheritence: [Null, Object],
      }
    ))
  it('should type false', () =>
    deepStrictEqual(
      type(false),
      {
        jstype: 'boolean',
        factory: Boolean,
        inheritence: [Boolean, Object],
      }
    ))
  it('should type true', () =>
    deepStrictEqual(
      type(true),
      {
        jstype: 'boolean',
        factory: Boolean,
        inheritence: [Boolean, Object],
      }
    ))
  it('should type falsy number', () =>
    deepStrictEqual(
      type(0),
      {
        jstype: 'number',
        factory: Number,
        inheritence: [Number, Object],
      }
    ))
  it('should type number', () =>
    deepStrictEqual(
      type(1),
      {
        jstype: 'number',
        factory: Number,
        inheritence: [Number, Object],
      }
    ))
  it('should type falsy string', () =>
    deepStrictEqual(
      type(''),
      {
        jstype: 'string',
        factory: String,
        inheritence: [String, Object],
      }
    ))
  it('should type string', () =>
    deepStrictEqual(
      type('foo'),
      {
        jstype: 'string',
        factory: String,
        inheritence: [String, Object],
      }
    ))
  it('should type array', () =>
    deepStrictEqual(
      type(['foo']),
      {
        jstype: 'object',
        factory: Array,
        inheritence: [Array, Object],
      }
    ))
  it('should type date', () =>
    deepStrictEqual(
      type(new Date()),
      {
        jstype: 'object',
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
