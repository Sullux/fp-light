const {
  deepStrictEqual,
  strictEqual,
  ok,
} = require('assert')

const {
  type,
  typeEquals,
  factoryOf,
  Undefined,
  Null,
} = require('./type')

describe('type', () => {
  it('should type undefined', () =>
    deepStrictEqual(
      type(),
      {
        jstype: 'undefined',
        name: 'Undefined',
        factory: Undefined,
        inheritance: [Undefined, Object],
      }
    ))
  it('should type null', () =>
    deepStrictEqual(
      type(null),
      {
        jstype: 'object',
        name: 'Null',
        factory: Null,
        inheritance: [Null, Object],
      }
    ))
  it('should type false', () =>
    deepStrictEqual(
      type(false),
      {
        jstype: 'boolean',
        name: 'Boolean',
        factory: Boolean,
        inheritance: [Boolean, Object],
      }
    ))
  it('should type true', () =>
    deepStrictEqual(
      type(true),
      {
        jstype: 'boolean',
        name: 'Boolean',
        factory: Boolean,
        inheritance: [Boolean, Object],
      }
    ))
  it('should type falsy number', () =>
    deepStrictEqual(
      type(0),
      {
        jstype: 'number',
        name: 'Number',
        factory: Number,
        inheritance: [Number, Object],
      }
    ))
  it('should type number', () =>
    deepStrictEqual(
      type(1),
      {
        jstype: 'number',
        name: 'Number',
        factory: Number,
        inheritance: [Number, Object],
      }
    ))
  it('should type falsy string', () =>
    deepStrictEqual(
      type(''),
      {
        jstype: 'string',
        name: 'String',
        factory: String,
        inheritance: [String, Object],
      }
    ))
  it('should type string', () =>
    deepStrictEqual(
      type('foo'),
      {
        jstype: 'string',
        name: 'String',
        factory: String,
        inheritance: [String, Object],
      }
    ))
  it('should type array', () =>
    deepStrictEqual(
      type(['foo']),
      {
        jstype: 'object',
        name: 'Array',
        factory: Array,
        inheritance: [Array, Object],
      }
    ))
  it('should type date', () =>
    deepStrictEqual(
      type(new Date()),
      {
        jstype: 'object',
        name: 'Date',
        factory: Date,
        inheritance: [Date, Object],
      }
    ))
  it('should type extended class', () => {
    class Foo {}
    class Bar extends Foo {}
    deepStrictEqual(
      type(new Bar()),
      {
        jstype: 'object',
        name: 'Bar',
        factory: Bar,
        inheritance: [Bar, Foo, Object],
      }
    )
  })
})

describe('typeEquals', () => {
  it('should equal undefined', () =>
    ok(typeEquals(undefined, undefined)))
  it('should equal null', () =>
    ok(typeEquals(null, null)))
  it('should not equal null', () =>
    ok(!typeEquals(undefined, null)))
  it('should equal sring', () =>
    ok(typeEquals('foo')('bar')))
})

describe('factoryOf', () => {
  it('should have a factory of Undefined', () =>
    strictEqual(factoryOf(), Undefined))
  it('should have a factory of Null', () =>
    strictEqual(factoryOf(null), Null))
  it('should have a factory of Boolean', () =>
    strictEqual(factoryOf(false), Boolean))
})

describe('Undefined', () => {
  it('should return undefined', () =>
    strictEqual(Undefined(), undefined))
})

describe('Null', () => {
  it('should return null', () =>
    strictEqual(Null(), null))
})
