const { Any } = require('../types')
const { assert } = require('../assert')
const { stringDefinition } = require('./stringDefinition')

const specificationType = Symbol.for('fp.interface.specificationType')
const isSpecification = (type) => !!type?.[specificationType]
const specifications = new WeakMap()

function Specification (type, define = () => {}) {
  assert.isFunction(type)
  const specificationTemplate = (options) => {
    const definition = define(options) || {}
    // can match the interface definition (String {maxLength: 5} == String)
    const isCompatible = definition.isCompatible || ((t) => t === type)
    // the given value fits this specification ('foo' ~~ String)
    const isImplemented = definition.isImplemented ||
      ((v) => v instanceof type)
    // the unmatched part of the value ({ foo: 42 } ~~ Object { foo, bar } ?? bar)
    const delta = definition.delta ||
      ((v) => isImplemented(v) ? [] : [type, options])
    return { type, options, isCompatible, isImplemented, delta }
  }
  const existing = specifications.get(type) || []
  specificationTemplate[specificationType] = type
  specifications.set(type, [specificationTemplate, ...existing])
  return specificationTemplate
}
Object.defineProperties(Specification, {
  [Symbol.hasInstance]: { value: isSpecification },
  for: {
    value: (type) => {
      const existing = specifications.get(type)
      return existing?.[0] || Specification(type)
    },
  },
})

const { factory: objectDefinitionFactory, objectSpread } =
  require('./objectDefinition')
const { factory: functionDefinitionFactory, functionSignature } =
  require('./functionDefinition')
// const objectDefinition = require('./objectDefinition').factory(Specification)
const objectDefinition = objectDefinitionFactory(Specification)
const arrayDefinition = require('./arrayDefinition').factory(Specification)
const functionDefinition = functionDefinitionFactory(Specification)

const defaultSpecifications = {
  String: Specification(String, stringDefinition),
  Object: Specification(Object, objectDefinition),
  Array: Specification(Array, arrayDefinition),
  Any: Specification(Any),
  Function: Specification(Function, functionDefinition),
  // todo: add remaining types
}

Object.assign(Specification, defaultSpecifications)

Specification.isCompatible = ([t1, o1], [t2, o2]) =>
  Specification.for(t1)(o1).isCompatible(t2, o2)
Specification.isImplemented = ([t, o], v) =>
  Specification.for(t)(o).isImplemented(v)
Specification.delta = ([t, o], v) =>
  Specification.for(t)(o).delta(v)

module.exports = {
  Specification,
  specificationType,
  isSpecification,
  objectSpread,
  functionSignature,
}
