const {
  isThennable,
  isDate,
  isFunction,
  isNumber,
  isObject,
  isType,
  isError,
  isArray,
  isBoolean,
  typeName,
  isMissing,
  flatten,
} = require('./common')
const assert = require('assert')

describe('common', () => {
  describe('isThennable', () => {
    it('should identify a function "then"', () =>
      assert(isThennable({ then: () => {} })))
    it('should ignore a non-function "then"', () =>
      assert(!isThennable({ then: 42 })))
    it('should ignore a non-"then"', () =>
      assert(!isThennable({ next: () => {} })))
    it('should ignore falsy', () =>
      assert(!isThennable(undefined)))
  })

  describe('isDate', () => {
    it('should identify a date', () =>
      assert(isDate(new Date())))
    it('should ignore a non-date', () =>
      assert(!isDate({})))
    it('should ignore falsy', () =>
      assert(!isDate(undefined)))
  })

  describe('isFunction', () => {
    it('should identify a function', () =>
      assert(isFunction(() => {})))
    it('should ignore a non-function', () =>
      assert(!isFunction({})))
    it('should ignore falsy', () =>
      assert(!isFunction(undefined)))
  })

  describe('isNumber', () => {
    it('should identify a number', () =>
      assert(isNumber(42)))
    it('should ignore a non-number', () =>
      assert(!isNumber({})))
    it('should ignore falsy', () =>
      assert(!isNumber(undefined)))
  })

  describe('isObject', () => {
    it('should identify a pojo', () =>
      assert(isObject({})))
    it('should ignore a non-pojo', () =>
      assert(!isObject(42)))
    it('should ignore a date', () =>
      assert(!isObject(new Date())))
    it('should ignore an array', () =>
      assert(!isObject([])))
  })

  describe('isType', () => {
    it('should identify a type', () =>
      assert(isType(Error)(new Error())))
    it('should ignore a pojo', () =>
      assert(!isType(Error)({})))
  })

  describe('isError', () => {
    it('should identify an error', () =>
      assert(isError(new Error())))
    it('should ignore a pojo', () =>
      assert(!isError({})))
  })

  describe('isArray', () => {
    it('should identify an array', () =>
      assert(isArray([])))
    it('should ignore a non-array', () =>
      assert(!isArray({})))
    it('should ignore falsy', () =>
      assert(!isArray(undefined)))
  })

  describe('isBoolean', () => {
    it('should identify a boolean', () =>
      assert(isBoolean(true) && isBoolean(false)))
    it('should ignore a non-boolean', () =>
      assert(!isBoolean(1)))
    it('should ignore falsy except `false`', () =>
      assert(!isBoolean(undefined)))
  })

  describe('typeName', () => {
    const assertTypeName = (value, expected) =>
      it(`should identify '${value}' as ${expected}`, () =>
        assert.strictEqual(typeName(value), expected))
    assertTypeName(false, 'boolean')
    assertTypeName(true, 'boolean')
    assertTypeName(0, 'number')
    assertTypeName(1.1, 'number')
    assertTypeName(NaN, 'number')
    assertTypeName(0, 'number')
    assertTypeName(undefined, 'undefined')
    assertTypeName(null, 'null')
    assertTypeName('', 'string')
    assertTypeName('foo', 'string')
    assertTypeName({}, 'object')
    assertTypeName(new Date(), 'date')
    assertTypeName([], 'array')
    assertTypeName(() => {}, 'function')
  })

  describe('isMissing', () => {
    it('should identify undefined', () =>
      assert(isMissing(undefined)))
    it('should identify null', () =>
      assert(isMissing(null)))
    it('should ignore falsy', () =>
      assert(!isMissing(0)))
  })

  describe('flatten', () => {
    it('should preserve a non-nested array', () =>
      assert.deepStrictEqual(flatten([1, 2]), [1, 2]))
    it('should flatten a 2-level nested array', () =>
      assert.deepStrictEqual(flatten([1, [2, 3]]), [1, 2, 3]))
    it('should flatten a 3-level nested array', () =>
      assert.deepStrictEqual(flatten([1, [2, [3, 4]]]), [1, 2, 3, 4]))
  })
})
