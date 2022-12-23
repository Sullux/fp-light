const { functionName, unwrapped, is, equal, isFunction } = require('./helpers')
const { isExtendedFrom } = require('./types')

function Assertion (test, ErrorType = Error) {
  if (!isExtendedFrom(ErrorType, Error)) {
    const message = unwrapped(`argument ErrorType: expected type of Error;
      got "${functionName(ErrorType)}"`)
    throw new Error(message)
  }
  const assertion = (...args) => {
    const result = test(...args)
    if (!result) {
      return args[0]
    }
    const errorArgs = Array.isArray(result) ? result : [result]
    throw new ErrorType(...errorArgs)
  }
  return assertion
}

const assert = Assertion((value, message) => value ? false : [message])
const assertNot = Assertion((value, message) => !value ? false : [message])
const assertIsNot = Assertion((x, y, message) =>
  !is(x, y) ? false : [message || `expected ${x} not to be ${y}`])
const assertEqual = Assertion((x, y, message) =>
  equal(x, y) ? false : [message || `expected ${x} to equal ${y}`])
const assertNotEqual = Assertion((x, y, message) =>
  !equal(x, y) ? false : [message || `expected ${x} not to equal ${y}`])
const assertIsFunction = Assertion((x, message) =>
  isFunction(x) ? false : [message || `expected ${x} to be a function`])
const assertIsNotFunction = Assertion((x, message) =>
  !isFunction(x) ? false : [message || `expected ${x} not to be a function`])

const assertions = {
  fail: Assertion((reason) => ([reason])),
  is: Assertion((x, y, message) =>
    is(x, y) ? false : [message || `expected ${x} to be ${y}`]),
  isNot: assertIsNot,
  equal: assertEqual,
  notEqual: assertNotEqual,
  truthy: assert,
  ok: assert,
  exists: assert,
  falsy: assertNot,
  not: assertNot,
  isFunction: assertIsFunction,
}

const negativeAssertions = {
  is: assertIsNot,
  equal: assertNotEqual,
  isFunction: assertIsNotFunction,
}

Object.assign(assertNot, negativeAssertions)

module.exports = {
  assert: Object.assign(assert, assertions),
  Assertion,
}
