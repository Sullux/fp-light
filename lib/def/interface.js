/* eslint no-new-func: 0 */
const { Scope, ScopeContext } = require('../core/scope')
const {
  isString,
  isFunction,
  unwrapped,
  isConstructor,
} = require('../core/helpers')
const {
  isExtendedFrom,
  isExactType,
  isType,
  typeName,
} = require('../core/types')

const interfaces = Symbol.for('fp.interfaces')
Scope.current.context[interfaces] = ScopeContext()

const escapedName = (name) => name.replace(/|/g, '\\|')
  .replace(/:/g, '\\:')
  .replace(/\\/g, '\\\\')

const allInterfaces = new WeakMap()
const isInterface = (i) => allInterfaces.get(i)

const interfaceProperty = (value, offsets) => Array.isArray(value)
  ? [value]
  : isExactType(Object, value)
    ? interfaceProperties(Object.entries(value), offsets)
    : isExactType(Map, value)
      ? interfaceProperties([...value.entries()], offsets)
      : isFunction(value)
        ? [[Interface.properties.isValid, value]]
        : false

const interfaceProperties = (array, offsets = []) => array.reduce(
  (result, value, i) => {
    const currentOffsets = [...offsets, i]
    const keyValues = interfaceProperty(value, currentOffsets)
    if (!keyValues) {
      const formattedOffsets = currentOffsets.join('][')
      throw new TypeError(
        unwrapped(`each property entry must be an Array of [key, value], an
          Object, a Map or a Function`),
        { cause: `properties[${formattedOffsets}]` },
      )
    }
    return [...result, ...keyValues]
  },
  [],
)

const interfaceImplementsInterface = (i1, i2) =>
  i2.every(([key, value]) => (key === Interface.properties.extends) ||
    i1.find((eKey, eValue) => (key === eKey) && (value === eValue)))

const propertyEntriesWithExtensions = (entries) => {
  const currentInterfaces = Scope.current.context[interfaces]
  // first find out what we are extending
  const extensions = entries
    .filter(([key]) => key === Interface.properties.extends)
    .map(([, value]) => value)
  // now add all the properties from every interface we are extending
  let expandedEntries = [...entries]
  if (extensions.length) {
    for (const existing of currentInterfaces) {
      if (extensions.includes(existing)) {
        expandedEntries = [...expandedEntries, ...existing.properties]
      }
    }
  }
  // now search for interfaces we are incidentally extending
  for (const existing of currentInterfaces) {
    if (interfaceImplementsInterface(expandedEntries, existing)) {
      expandedEntries.push([Interface.properties.extends, existing])
    }
  }
  // now deduplicate our expanded entries
  return expandedEntries.reduce(
    (result, [k1, v1]) => result.some(([k2, v2]) => (k1 === k2) && (v1 === v2))
      ? result
      : [...result, [k1, v1]],
    [],
  )
}

const defineInterface = ({
  name: explicitName,
  properties: explicitProperties = [],
  context = {},
} = {}) => {
  const currentInterfaces = Scope.current.context[interfaces]
  if (explicitName && (!isString(explicitName))) {
    throw new TypeError(
      `name must be a string; got "${explicitName}"`,
      { cause: 'name' },
    )
  }
  if (!isExactType(Object, context)) {
    throw new TypeError(
      `context must be an Object; got ${typeName(context)}`,
      { cause: 'context' },
    )
  }
  const propertyEntries = isExactType(Object, explicitProperties)
    ? Object.entries(explicitProperties)
    : isExactType(Map, explicitProperties)
      ? [...explicitProperties.entries()]
      : isFunction(explicitProperties)
        ? [Interface.properties.isValid, explicitProperties]
        : explicitProperties
  if (!Array.isArray(propertyEntries)) {
    throw new TypeError(
      'properties must be an Object, Map, Array or Function',
      { cause: 'properties' },
    )
  }
  const properties = Object.freeze(propertyEntriesWithExtensions(
    interfaceProperties(propertyEntries),
  ))
  const name = explicitName && escapedName(explicitName)
  const { invoke, isValid, extends: extending } = Interface.properties
  const newInterface = Object.freeze({
    [Interface.invoke]: (value) => Interface.convert(newInterface, value),
    properties,
    name: name || '{anonymous}',
    context: Object.freeze({ ...context }),
    of: (...params) => {
      // TODO!!!
    },
    // test a value and return true if the value implements the interface
    testValue: (v) => {
      if (!properties.length) { return true }
      for (const [key, propertyInterface] of properties) {
        const ok = (key === extending) ||
          ((key === invoke) && propertyInterface.test(v)) ||
          ((key === isValid) && propertyInterface(v)) ||
          ((propertyInterface.test(v[key])))
        if (!ok) return false
      }
      return true
    },
    compareValue: (v) => properties.filter(([key, propertyInterface]) => !(
      (key === extending) ||
          ((key === invoke) && propertyInterface.test(v)) ||
        ((key === isValid) && propertyInterface(v)) ||
        ((propertyInterface.test(v[key])))
    )),
    testInterface: (i) => (i === newInterface) ||
      (properties.length === 0) ||
      properties.some(([key, propertyInterface]) =>
        (key === extending) && (propertyInterface === i)),
    compareInterface: (i) => {
      if (i === newInterface) { return [] }
      const result = []
      for (const [key, propertyInterface] of properties) {
        if (key === extending) {
          if (propertyInterface === i) { return [] }
          continue
        }
        if (key === isValid) {
          if (!i.properties.some(([k, v]) =>
            (k === isValid) && (v === propertyInterface))) {
            result.push([key, propertyInterface])
          }
          continue
        }
        const compareProperties = i.properties
          // find matching properties
          .filter(([k]) => (k === key))
          // compare to the current property interface
          .map(([, v]) => propertyInterface.compareInterface(v))
          // flatten the results
          .flat()
        if (compareProperties.length) {
          result.push(key, compareProperties)
        }
      }
      return result
    },
  })
  currentInterfaces.push(newInterface)
  return newInterface
}

// /////////////////////////////////////////////////////////////////////////
// Definition
const Interface = {}

Object.defineProperty(Interface, Symbol.hasInstance, {
  value: isInterface,
})

Interface.properties = Object.freeze({
  invoke: Symbol.for('fp.interface.properties.invoke'),
  isValid: Symbol.for('fp.interface.properties.isValid'),
  extends: Symbol.for('fp.interface.properties.extends'),
  implicit: Symbol.for('fp.interface.properties.implicit'),
  explicit: Symbol.for('fp.interface.properties.explicit'),
  param: Symbol.for('fp.interface.properties.param'),
})

Interface.define = defineInterface

Interface.for = (name) => {
  if (!name || !isString(name)) {
    throw new TypeError(
      `name must be a non-empty string; got "${name}"`,
      { cause: 'name' },
    )
  }
  return Scope.current.context[interfaces][name] || null
}

const conversions = Symbol.for('fp.interface.conversions')
Scope.current.context[conversions] = ScopeContext([])

const defineConversion = (iFrom, iTo, convert, errors, isExplicit) => {
  const explicit = !!isExplicit
  const implicit = !explicit
  if (isString(iFrom)) {
    return Interface.explicit(Interface.for(iFrom), iTo, convert)
  }
  if (isString(iTo)) {
    return Interface.explicit(iFrom, Interface.for(iTo), convert)
  }
  if (!isInterface(iFrom)) {
    throw new TypeError(
      'iFrom must be an interface',
      { cause: 'iFrom' },
    )
  }
  if (!isInterface(iTo)) {
    throw new TypeError(
      'iTo must be an interface',
      { cause: 'iTo' },
    )
  }
  if (convert && !isFunction(convert)) {
    throw new TypeError(
      'convert must be an function',
      { cause: 'convert' },
    )
  }
  if (
    !Array.isArray(errors) ||
      !errors.every((e) => isConstructor(e) && isExtendedFrom(e, Error))
  ) {
    throw new TypeError(
      'errors must be an array of error constructors',
      { cause: 'errors' },
    )
  }
  const conversion = Object.freeze({
    iFrom,
    iTo,
    convert: convert || undefined,
    errors,
    explicit,
    implicit,
  })
  const allConversions = Scope.current.context[conversions]
  const newConversions = []
  for (const c of allConversions) {
    if (c.iFrom === iTo) {
      const strategy = (explicit || c.implicit)
        ? { explicit, implicit }
        : { explicit: true, implicit: false }
      newConversions.push(Object.freeze({
        iFrom,
        iTo: c.iTo,
        errors: [...errors, ...c.errors],
        convert: convert ? (v) => c.convert(convert(v)) : c.convert,
        ...strategy,
      }))
    }
  }
  allConversions.push(conversion, ...newConversions.reverse())
  return conversion
}

Interface.explicit = (iFrom, iTo, convert, errors = []) =>
  defineConversion(iFrom, iTo, convert, errors, true)

Interface.implicit = (iFrom, iTo, convert) =>
  defineConversion(iFrom, iTo, convert, [], false)

Interface.getImplicitConversion = (iFrom, iTo) => {
  const allConversions = Scope.current.context[conversions]
  for (const c of allConversions) {
    const { iFrom: iFrom2, iTo: iTo2, implicit } = c
    if ((iFrom === iFrom2) && (iTo === iTo2) && implicit) { return c }
  }
  return null
}

Interface.getConversion = (iFrom, iTo) => {
  const allConversions = Scope.current.context[conversions]
  for (const c of allConversions) {
    const { iFrom: iFrom2, iTo: iTo2 } = c
    if ((iFrom === iFrom2) && (iTo === iTo2)) { return c }
  }
  return null
}

const IInterface = Interface.define({
  name: 'Interface',
  properties: isInterface,
})

const IAny = Interface.define({
  name: 'Any',
  properties: [],
})

const IExplicitErrors = Interface.define({
  name: 'ExplicitErrors',
  properties: (v) => !v || (
    Array.isArray(v) &&
    (v.length === 0 || v.every((e) => isExtendedFrom(e, Error)))
  ),
})

Interface.param = (name) => ({
  [Interface.properties.param]: name,
})

const IExplicit = Interface.define({
  name: 'Explicit',
  params: { IFrom: IInterface, ITo: IInterface },
  properties: {
    iFrom: Interface.param('IFrom'),
    iTo: Interface.param('ITo'),
    errors: IExplicitErrors,
  },
})

const IImplicit = Interface.define({
  name: 'Implicit',
  params: { IFrom: IInterface, ITo: IInterface },
  properties: {
    iFrom: Interface.param('IFrom'),
    iTo: Interface.param('ITo'),
  },
})

Object.freeze(Interface)

module.exports = {
  IAny,
  IExplicit,
  IInterface,
  IImplicit,
  Interface,
  I: Interface,
}
