const { inspect } = require('util')

const INVALID_TYPE_ERROR = 'ERR_INVALID_TYPE'

const invalidTypeError = (type) => {
  const message = `"${inspect(type)}" is not a valid type expression.`
  const error = new Error(message)
  error.code = INVALID_TYPE_ERROR
  throw error
}

const isInvalidTypeError = ({ code }) =>
  code === INVALID_TYPE_ERROR

const isArrayOf = (types) => {
  const tests = types.map(is)
  return value =>
    Array.isArray(value) && tests.every((test, i) => test(value[i]))
}

const isMapOf = (map) => {
  const tests = Object.entries(map).map(([key, value]) => ([key, is(value)]))
  return value =>
    value && tests.every(([key, test]) => test(value[key]))
}

const isString = value =>
  typeof value === 'string' || value instanceof String

const isNumber = value =>
  typeof value === 'number' || value instanceof Number

const typeNameMap = {
  string: isString,
  number: isNumber,
}

const constructorMap = new Map([
  [String, isString],
  [Number, isNumber],
])

const is = type =>
  typeof type === 'string'
    ? typeNameMap[type] || (value => (typeof value) === type)
    : typeof type === 'function'
      ? constructorMap.get(type) || (value => value instanceof type)
      : Array.isArray(type)
        ? isArrayOf(type)
        : (type === null) || (type === undefined)
          ? value => value === type
          : type.constructor === Object
            ? isMapOf(type)
            : invalidTypeError(type)

const isAny = types => {
  const tests = types.map(is)
  return value => tests.some(test => test(value))
}

const isNull = is(null)
const isUndefined = is(undefined)
const isMissing = value => (value === null) || (value === undefined)
const isDate = is(Date)
const isArray = value => Array.isArray(value)
const isRegExp = is(RegExp)
const isThennable = value =>
  value && value.then && (typeof value.then === 'function')
const isPlainObject = value =>
  value && value.constructor === Object
const isSet = is(Set)
const isMap = is(Map)
const isPromise = is(Promise)

module.exports = {
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
}
