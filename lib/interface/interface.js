const { Scope, ScopeContext } = require('../core/scope')
const { isType } = require('../core/types')

class InvalidInterfaceSpecificationError extends Error {}
const interfaces = Symbol.for('fp.interfaces')
const isInterface = (value) => {
  for (const i of Scope.current.context[interfaces]) {
    if (i === value) { return true }
  }
  return false
}
Scope.current.context[interfaces] = ScopeContext([])

// AND
const Intersection = (...interfaces) => {
  if (interfaces.some(({ isIntersection }) => isIntersection)) {
    const allIntersects = interfaces.map((i) => i.isIntersection
      ? i.extending
      : i).flat()
    return Intersection(...allIntersects)
  }
  const i = Object.freeze({
    name: `(${interfaces.map(({ name }) => name).join('&')})`,
    isImplemented: (v) => interfaces.every((i) => i.isImplemented(v)),
    context: interfaces.map(({ context }) => context),
    extending: interfaces,
    extend: (context) => Interface({ extending: i, context }),
    extends: (compare) => interfaces.every(({ extends: e }) => e(compare)),
    apply: (value) => {
      const applications = interfaces.map(({ apply }) => apply(value))
        .filter((v) => v)
      return applications.length
        ? Intersection(...applications)
        : undefined
    },
    isIntersection: true,
    intersect: (...interfaces) => Intersection(i, ...interfaces),
    union: (...interfaces) => Union(i, ...interfaces),
  })
  return i
}
Object.defineProperty(Intersection, Symbol.hasInstance, {
  value: (v) => !!v.isIntersection,
})

// OR
const Union = (...interfaces) => {
  if (interfaces.some(({ isUnion }) => isUnion)) {
    const allUnions = interfaces.map((i) => i.isUnion
      ? i.extending
      : i).flat()
    return Union(...allUnions)
  }
  const i = Object.freeze({
    name: `(${interfaces.map(({ name }) => name).join('|')})`,
    isImplemented: (v) => interfaces.some((i) => i.isImplemented(v)),
    context: interfaces.map(({ context }) => context),
    extending: interfaces,
    extend: (context) => Interface({ extending: i, context }),
    extends: (compare) => interfaces.some(({ extends: e }) => e(compare)),
    apply: (value) => {
      const applied = interfaces.map(({ apply }) => apply(value))
      return applied.includes(undefined)
        ? undefined
        : Union(...applied)
    },
    isUnion: true,
    intersect: (...interfaces) => Intersection(i, ...interfaces),
    union: (...interfaces) => Union(i, ...interfaces),
  })
  return i
}
Object.defineProperty(Union, Symbol.hasInstance, {
  value: (v) => !!v.isUnion,
})

const Interface = ({
  name,
  isImplemented,
  context,
  extending,
  extend,
  apply,
  intersect,
  union,
}) => {
  const fullName = name ||
    extending?.name ||
    (context && JSON.stringify(context)) ||
    '(anonymous)'
  const i = Object.freeze({
    name: fullName,
    isImplemented: extending
      ? isImplemented
          ? (v) => isImplemented(v, context, i)
          : (v) => extending.isImplemented(v, context, i)
      : (v) => isImplemented(v, context, i),
    context,
    extending: extending,
    extend: extend ||
      ((context) => Interface({ extending: i, context })),
    extends: (compare) =>
      extending && (
        (compare === i) ||
        (compare === extending) ||
        extending.extends(compare)
      ),
    // test against a value and return a "missing" interface or undefined
    apply: apply
      ? (value) => apply(value, context, i)
      : extending
        ? (value) => extending.apply(value, context, i)
        : (value) => i.isImplemented(value) ? undefined : i,
    intersect: (...interfaces) => (intersect || Intersection)(i, ...interfaces),
    union: (...interfaces) => (union || Union)(i, ...interfaces),
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
Interface.Intersection = Intersection
Interface.Union = Union
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
  if (value instanceof Interface) { return value }
  const existing = trackedInterfaces.get(value)
  if (existing) { return existing }
  const i = Interface.infer(value)
  trackedInterfaces.set(value, i)
  return i
}
Interface.assign = (value, i) => {
  if (!(value instanceof Object)) {
    const message = 'tried to assign an interface to a primitive'
    const err = new InvalidInterfaceSpecificationError(message)
    err.code = 'ERR_INVALID_INTERFACE_SPECIFICATION'
    err.value = value
    throw err
  }
  trackedInterfaces.set(value, i)
}
Interface.get = (value) => {
  if (!(value instanceof Object)) {
    return Interface.infer(value)
  }
  return trackedInterfaces.get(value)
}
// Infer an interface definition from the given value
Interface.infer = (value) => {
  if (value instanceof Interface) { return value }
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
