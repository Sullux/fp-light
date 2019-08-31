/* eslint-disable max-classes-per-file */
const { deepStrictEqual } = require('assert')

const {
  validate,
  validateExactType,
  validateInterface,
  validateOrdered,
  validateType,
} = require('./validate')

const error1 = new Error('reasons')
const error2 = new Error('more reasons')
const error3 = new Error('reasons')
error3.code = 'ERR_REASONS'
const error4 = new Error('more reasons')
error4.code = 'ERR_REASONS'
const error5 = new Error('reasons')
error5.foo = 42
const error6 = new Error('reasons')
error6.foo = 42

describe('validate', () => {
  const specs = [
    // types
    ['invalidate by type', 42, true, ['expected type Number; got Boolean']],
    // values
    ['invalidate numbers', 42, 41, ['expected 42; got 41']],
    ['validate numbers', 42, 42, []],
    // dates
    [
      'invalidate dates',
      new Date(1567263860000),
      new Date(1567263869999),
      ['expected Date(1567263860000); got Date(1567263869999)'],
    ],
    ['validate dates', new Date(1567263860000), new Date(1567263860000), []],
    // errors
    [
      'invalidate errors on messages',
      error1,
      error2,
      ['expected Error: reasons; got Error: more reasons'],
    ],
    [
      'invalidate errors on codes',
      error1,
      error3,
      ['expected Error: reasons; got Error ERR_REASONS: reasons'],
    ],
    [
      'validate errors on different messages but same codes',
      error3,
      error4,
      [],
    ],
    [
      'invalidate errors on extra properties',
      error5,
      error1,
      ['`foo`: expected type Number; got Undefined'],
    ],
    [
      'validate errors with extra properties',
      error5,
      error6,
      [],
    ],
    // arrays
    [
      'invalidate arrays',
      ['a', 42],
      ['a', true],
      ['`1`: expected type Number; got Boolean'],
    ],
    ['validate arrays', ['a', 42], ['a', 42], []],
    [
      'invalidate nested arrays',
      ['a', [1, 42]],
      ['a', [1, true]],
      ['`1`: `1`: expected type Number; got Boolean'],
    ],
    ['validate nested arrays', ['a', [true, 42]], ['a', [true, 42]], []],
    // interface
    [
      'invalidate objects',
      { a: 42 },
      { b: 42 },
      ['`a`: expected type Number; got Undefined'],
    ],
    ['validate objects', { a: 42 }, { a: 42, b: true }, []],
    [
      'invalidate nested objects',
      { a: { b: 42 } },
      { a: { b: false } },
      ['`a`: `b`: expected type Number; got Boolean'],
    ],
    ['validate nested objects', { a: { b: 42 } }, { a: { b: 42, c: 1 } }, []],
  ]
  specs.map(([text, expected, actual, problems]) =>
    it(`should ${text}`, () =>
      deepStrictEqual(validate(expected)(actual), problems)))
})

class FooError extends Error {}
class BarError extends FooError {}

describe('validateExactType', () => {
  it('should validate exact type', () =>
    deepStrictEqual(validateExactType(BarError)(new BarError()), []))
  it('should invalidate inherited type', () =>
    deepStrictEqual(
      validateExactType(FooError)(new BarError()),
      ['expected type FooError; got BarError←FooError←Error'],
    ))
})

describe('validateType', () => {
  it('should validate exact type', () =>
    deepStrictEqual(validateType(BarError)(new BarError()), []))
  it('should validate inherited type', () =>
    deepStrictEqual(validateType(FooError)(new BarError()), []))
  it('should invalidate unrelated type', () =>
    deepStrictEqual(
      validateExactType(Boolean)(new BarError()),
      ['expected type Boolean; got BarError←FooError←Error'],
    ))
})

describe('validateInterface', () => {
  it('should validate complex types', () =>
    deepStrictEqual(
      validateInterface({
        foo: { bar: ['baz', 42] },
      })({
        foo: { bar: ['baz', 42, 43], biz: true },
      }),
      []
    ))
  it('should invalidate complex types', () =>
    deepStrictEqual(
      validateInterface({
        foo: { bar: ['baz', 42] },
      })({
        foo: { bar: ['baz', 43], biz: true },
      }),
      ['`foo`: `bar`: `1`: expected 42; got 43']
    ))
})

describe.only('validateOrdered', () => {
  it('should validate complex arrays', () =>
    deepStrictEqual(
      validateOrdered([
        { bar: ['baz', 42] },
        { biz: true },
      ])([
        { bar: ['baz', 42, 43] },
        { biz: true },
      ]),
      []
    ))
  it('should invalidate complex arrays', () =>
    deepStrictEqual(
      validateOrdered([
        { bar: ['baz', 42] },
        { biz: true },
      ])([
        { bar: ['baz', 43] },
        { biz: true },
      ]),
      ['`0`: `bar`: `1`: expected 42; got 43']
    ))
})
