const { isExtendedFrom } = require('../types')
const { assert } = require('../assert')

const factory = (Specification) => {
  const functionDefinition = (options = []) => {
    if (!Array.isArray(options)) {
      assert.fail(`options: expected ${options} to be an array`)
    }
    return {
      isCompatible: (t, o = []) =>
        isExtendedFrom(t, Object) &&
        Array.isArray(o) &&
        arraysAreCompatible(options, o),
      isImplemented: (v) => (v instanceof Object) &&
      arrayIsImplemented(options, v),
      delta: (v) => arrayDelta(options, v),
    }
  }
  return functionDefinition
}

module.exports = { factory }
