const { curry, memoize } = require('./fn')
const { is } = require('./compare')
const { object } = require('./object')
const { isString, flatten, promisify } = require('./common')
const { pipe } = require('./pipe')
const { fail } = require('assert')

const mock = (name) => {
  const mocked = (...args) => {
    const calls = mocked.calls || (mocked.calls = [])
    calls.push(args)
    return mocked.impl
      ? mocked.impl(...args)
      : mocked.returned
  }
  return Object.assign(mocked, {
    toString: memoize(() =>
      (name
        ? `${name}()`
        : 'mocked()')),
    returns: (value) => {
      mocked.returned = value
      return mocked
    },
    implements: (impl) => {
      mocked.impl = impl
      return mocked
    },
    callsAre: is(mocked.calls),
  })
}

const compare = {
  is,
  isNot: (expected, actual) => !is(expected, actual),
  equal: (expected, actual) => expected === actual,
  notEqual: (expected, actual) => expected !== actual,
  exists: actual => !!actual,
  notExists: actual => !actual
}

const assert = {
  is: curry((expected, actual) =>
    is(expected, actual) || fail(actual, expected, undefined, 'is')),
  equal: curry((expected, actual) =>
    expected === actual || fail(actual, expected, undefined, 'equal')),
  notEqual: curry((expected, actual) =>
    expected !== actual || fail(actual, expected, undefined, 'not equal'))
}

const executeTestCase = (fn, testCase) =>
  true // todo

const test = pipe(
  fn => ({ fn, spec: fn.spec }),
  ({ fn, spec }) => spec.every(testCase => executeTestCase(fn, testCase))
)

module.exports = {
  mock,
  compare,
  assert,
}
