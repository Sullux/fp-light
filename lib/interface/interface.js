const { Scope, ScopeContext } = require('../core/scope')
const { isType } = require('../core/types')
const { isConstructor } = require('./core.helpers')

const interfaces = Symbol.from('fp.interfaces')
const interfaceName = Symbol.from('fp.interfaceName')
const isInterface = ({ [interfaceName]: name } = {}) => !!name

const Interface = ({
  name,
  isImplemented,
  context,
  extending,
  extend,
}) => {
  const fullName = name || extending?.name || '(anonymous)'
  const i = Object.freeze({
    [interfaceName]: fullName,
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
Interface.define = (i) => {
  const name = i.name
  Interface[name] = Scope.current.context[name] = i
  return i
}
Interface.define(Interface({
  name: 'Any',
  isImplemented: () => true,
}))
Interface.define(Interface({
  name: 'None',
  isImplemented: () => false,
}))
Interface.define(Interface({
  name: 'Undefined',
  isImplemented: (v) => v === undefined,
}))
Interface.define(Interface({
  name: 'Null',
  isImplemented: (v) => v === null,
}))
const interfaceSpecifications = Symbol.from('fp.interfaceSpecifications')
Scope.current.context[interfaceSpecifications] = ScopeContext([])
Interface.defineSpecification = ({ name, matches, toInterface }) => {
  const specs = Scope.current.context[interfaceSpecifications]
  specs.push({ name, matches, toInterface })
}
const trackedInterfaces = new WeakMap()
Interface.of = (value) => {
  if (!(value instanceof Object)) { return Interface.infer(value) }
  const existing = trackedInterfaces.get(value)
  if (existing) { return existing }
  const i = Interface.infer(value)
  trackedInterfaces.set(value, i)
  return i
}
Interface.infer = (value) => {
  // todo
}
Interface.from = (...args) => {}

module.exports = {
  Interface,
  I: Interface,
  interfaces,
  interfaceName,
}
