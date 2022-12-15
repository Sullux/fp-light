const { Any, isExtendedFrom } = require('../types')
const { assert } = require('../assert')

const functionSignature = Symbol.for('fp.specification.functionSignature')
const defaultSignature = [
  Array,
  [
    [Array, [[...Any]]],
    [Any],
  ],
]

const signature = (fn) => fn?.[functionSignature] || defaultSignature

const factory = (Specification) => {
  const functionsAreCompatible = (o1, o2) =>
    Specification.isCompatible(o1, o2)

  const functionIsImplemented = (options, v) =>
    Specification.isImplemented(options, signature(v))

  const functionDelta = (options, v) =>
    Specification.delta(options, signature(v))

  const functionDefinition = (options = defaultSignature) => {
    if (!Array.isArray(options)) {
      assert.fail(`options: expected ${options} to be an array`)
    }
    return {
      isCompatible: (t = Function, o = defaultSignature) =>
        isExtendedFrom(t, Function) &&
        Array.isArray(o) &&
        functionsAreCompatible(options, o),
      isImplemented: (v) => functionIsImplemented(options, v),
      delta: (v) => functionDelta(options, v),
    }
  }
  return functionDefinition
}

module.exports = { factory, functionSignature }
