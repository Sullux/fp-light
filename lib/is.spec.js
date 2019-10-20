const {
  deepStrictEqual,
  throws,
} = require('assert')

const {
  INVALID_TYPE_ERROR,
  is,
  isAny,
  isArray,
  isArrayOf,
  isDate,
  isInvalidTypeError,
  isMap,
  isMapOf,
  isMissing,
  isNull,
  isNumber,
  isPlainObject,
  isPromise,
  isRegExp,
  isSet,
  isString,
  isThennable,
  isUndefined,
} = require('./is')

describe('is', () => {
  describe('is', () => {
    it('should use a typeof test with a string', () => deepStrictEqual(
      [is('string')('foo'), is('function')('bar')],
      [true, false],
    ))
    it('should use an instanceof test with a function', () => deepStrictEqual(
      [is(String)('foo'), is(Function)(42)],
      [true, false],
    ))
    it('should test each element with an array', () => deepStrictEqual(
      [
        is(['string', Number])(['foo', 42]),
        is([Number, 'function'])([42, 'bar']),
      ],
      [true, false],
    ))
    it('should test each entry with an object', () => deepStrictEqual(
      [
        is({ a: 'string', b: Number })({ a: 'foo', b: 42 }),
        is({ a: 'string', b: Function })({ a: 'foo', b: 42 }),
      ],
      [true, false],
    ))
    it('should throw when not a string, function, array or POJO', () => throws(
      () => is(42),
      { code: INVALID_TYPE_ERROR },
    ))
    it('should throw when an array or POJO contains an invalid type', () =>
      throws(
        () => is({ a: 'string', b: [42] }),
        { code: INVALID_TYPE_ERROR },
      ))
    it('should correctly test each type of number', () => deepStrictEqual(
      [
        is('number')(42),
        is(Number)(42),
        is('number')(new Number(42)),
        is(Number)(new Number(42)),
      ],
      [true, true, true, true],
    ))
    it('should correctly test each type of string', () => deepStrictEqual(
      [
        is('string')('42'),
        is(String)('42'),
        is('string')(new String('42')),
        is(String)(new String('42')),
      ],
      [true, true, true, true],
    ))
    it('should correctly test null', () => deepStrictEqual(
      [is(null)(null), is(null)(undefined)],
      [true, false]
    ))
    it('should correctly test undefined', () => deepStrictEqual(
      [is(undefined)(undefined), is(undefined)(null)],
      [true, false]
    ))
  })

  describe('isAny', () => {
    it('should return true for at least one match', () => deepStrictEqual(
      [isAny(['string', 'number'])(42), isAny(['string', 'number'])({})],
      [true, false],
    ))
  })

  describe('isArray', () => {
    it('should test an array', () => deepStrictEqual(
      [isArray([42]), isArray(42)],
      [true, false],
    ))
  })

  describe('isArrayOf', () => {
    it('should return true when all elements are present', () =>
      deepStrictEqual(
        [
          isArrayOf(['string', Number])(['foo', 42]),
          isArrayOf(['string', Number])(['foo', 42, 'other']),
          isArrayOf(['number', Function])([42, 'bar']),
        ],
        [true, true, false],
      ))
  })

  describe('isDate', () => {
    it('should test a date', () => deepStrictEqual(
      [isDate(new Date()), isDate(42)],
      [true, false],
    ))
  })

  describe('isInvalidTypeError', () => {
    const invalidTypeError = () => {
      const error = new Error('reasons')
      error.code = INVALID_TYPE_ERROR
      return error
    }
    it('should test an invalid type error', () => deepStrictEqual(
      [
        isInvalidTypeError(invalidTypeError()),
        isInvalidTypeError({ code: INVALID_TYPE_ERROR }),
        isInvalidTypeError({}),
      ],
      [true, true, false],
    ))
  })

  describe('isMap', () => {
    it('should return true for a map', () => deepStrictEqual(
      [isMap(new Map([['foo', 42]])), isMap({ foo: 42 })],
      [true, false],
    ))
  })

  describe('isMapOf', () => {
    it('should return true when all properties are present', () =>
      deepStrictEqual(
        [
          isMapOf({ a: 'string', b: Number })({ a: 'foo', b: 42 }),
          isMapOf({ a: 'string', b: Number })({ a: 'foo', b: 42, c: null }),
          isMapOf({ a: 'string', b: Function })({ a: 'foo', b: 42 }),
        ],
        [true, true, false],
      ))
  })

  describe('isMissing', () => {
    it('should return true for null and undefined', () => deepStrictEqual(
      [isMissing(null), isMissing(undefined), isMissing(false)],
      [true, true, false],
    ))
  })

  describe('isNull', () => {
    it('should return true for null', () => deepStrictEqual(
      [isNull(null), isNull(undefined), isNull(false)],
      [true, false, false],
    ))
  })

  describe('isNumber', () => {
    it('should correctly test each type of number', () => deepStrictEqual(
      [
        isNumber(42),
        isNumber(new Number(42)),
        isNumber('42')
      ],
      [true, true, false],
    ))
  })

  describe('isPlainObject', () => {
    it('should return true for a plain object', () => deepStrictEqual(
      [isPlainObject({ foo: 42 }), isPlainObject([42])],
      [true, false],
    ))
  })

  describe('isPromise', () => {
    it('should return true for a promise', () => deepStrictEqual(
      [isPromise(Promise.resolve(42)), isPromise({ then: () => {} })],
      [true, false],
    ))
  })

  describe('isRegExp', () => {
    it('should return true for a regular expression', () => deepStrictEqual(
      [isRegExp(/foo/), isRegExp(new RegExp('foo')), isRegExp('foo')],
      [true, true, false],
    ))
  })

  describe('isSet', () => {
    it('should return true for a set', () => deepStrictEqual(
      [isSet(new Set(['foo', 42])), isSet({ foo: 42 })],
      [true, false],
    ))
  })

  describe('isString', () => {
    it('should correctly test each type of string', () => deepStrictEqual(
      [
        isString('42'),
        isString(new String('42')),
        isString(42)
      ],
      [true, true, false],
    ))
  })

  describe('isSet', () => {
    it('should return true for a set', () => deepStrictEqual(
      [isSet(new Set(['foo', 42])), isSet({ foo: 42 })],
      [true, false],
    ))
  })

  describe('isThennable', () => {
    it('should return true for a thennable', () => deepStrictEqual(
      [
        isThennable(Promise.resolve(42)),
        isThennable({ then: () => {} }),
        isThennable({ then: 'foo' }),
      ],
      [true, true, false],
    ))
  })

  describe('isUndefined', () => {
    it('should return true for undefined', () => deepStrictEqual(
      [isUndefined(null), isUndefined(undefined), isUndefined(false)],
      [false, true, false],
    ))
  })
})
