const { Any, isExtendedFrom } = require('../types')

const functionSignature = Symbol.for('fp.specification.functionSignature')
const defaultSignature = [
  [[...Any]],
  [Any],
]

const toSpec = ([args, returns]) => ([
  Array,
  [
    [Array, args],
    returns,
  ],
])

const fromSpec = ([, [[, args], returns]]) => ([args, returns])

const signature = (fn) =>
  fn?.[functionSignature] || defaultSignature

const factory = (Specification) => {
  const functionsAreCompatible = (o1, o2) =>
    Specification.isCompatible(o1, toSpec(o2))

  const functionIsImplemented = (options, v) =>
    Specification.isImplemented(options, toSpec(signature(v)))

  const functionDelta = (options, v) =>
    functionsAreCompatible(options, signature(v))
      ? []
      : fromSpec(options)

  const functionDefinition = (signature = defaultSignature) => {
    const options = toSpec(signature)
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
