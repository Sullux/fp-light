const { Scope, ScopeContext } = require('../core/scope')
const { isType } = require('../core/types')
const { isConstructor } = require('../core/helpers')

class InvalidInterfaceSpecificationError extends Error {}
const interfaces = Symbol.for('fp.interfaces')
const isInterface = (value) => {
  for (const i of Scope.current.context[interfaces]) {
    if (i === value) { return true }
  }
  return false
}
Scope.current.context[interfaces] = ScopeContext([])

const Interface = ({
  name,
  isImplemented,
  context,
  extending,
  extend,
}) => {
  const fullName = name || extending?.name || '(anonymous)'
  const i = Object.freeze({
    name: fullName,
    isImplemented: extending
      ? isImplemented
          ? (v) => extending.isImplemented(v, context) &&
            isImplemented(v, context)
          : (v) => extending.isImplemented(v, context)
      : (v) => isImplemented(v, context),
    context,
    extending: extending,
    extend: extend ||
      ((context) => Interface.define({ extending: i, context })),
  })
  const interfaceList = Scope.current.context[interfaces]
  interfaceList.push(i)
  if (name) {
    Scope.current.context[fullName] = i
  }
  return i
}
Object.defineProperty(Interface, Symbol.hasInstance, {
  value: isInterface,
})
const interfacesFromType = new Map()
Interface.fromType = (type) => {
  const existing = interfacesFromType.get(type)
  if (existing) { return existing }
  const i = Interface({
    name: type.name,
    isImplemented: (v) => isType(type, v),
  })
  interfacesFromType.set(type, i)
  return i
}
Interface.Any = Interface({
  name: 'Any',
  isImplemented: () => true,
})
Interface.None = Interface({
  name: 'None',
  isImplemented: () => false,
})
Interface.Undefined = Interface({
  name: 'Undefined',
  isImplemented: (v) => v === undefined,
})
Interface.Null = Interface({
  name: 'Null',
  isImplemented: (v) => v === null,
})
Interface.Spread = Interface({
  name: 'Spread',
  isImplemented: (v, context) => v.isImplemented(context),
})
const interfaceSpecifications = Symbol.for('fp.interfaceSpecifications')
Scope.current.context[interfaceSpecifications] = ScopeContext([])
Interface.defineSpecification = ({ name, infer, construct }) => {
  const specs = Scope.current.context[interfaceSpecifications]
  specs.push({ name, infer, construct })
}
const trackedInterfaces = new WeakMap()
// Return an interface for the given specification
Interface.of = (value) => {
  if (!(value instanceof Object)) { return Interface.infer(value) }
  const existing = trackedInterfaces.get(value)
  if (existing) { return existing }
  const i = Interface.infer(value)
  trackedInterfaces.set(value, i)
  return i
}
// Infer an interface definition from the given value
Interface.infer = (value) => {
  for (const spec of Scope.current.context[interfaceSpecifications]) {
    const i = spec.infer(value)
    if (i) { return i }
  }
  const err =
    new InvalidInterfaceSpecificationError('invalid interface specification')
  err.code = 'ERR_INVALID_INTERFACE_SPECIFICATION'
  err.value = value
  throw err
}
// Construct an interface with the given arguments
Interface.from = (...args) => {
  for (const spec of Scope.current.context[interfaceSpecifications]) {
    const i = spec.construct(...args)
    if (i) { return i }
  }
}

module.exports = {
  InvalidInterfaceSpecificationError,
  Interface,
  I: Interface,
}
