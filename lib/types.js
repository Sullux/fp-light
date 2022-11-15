import { defineError } from './error.js'
import { isAsync } from './async.js'

export const ImplicitConversionError = defineError(
  'ImplicitConversionError',
  'ERR_IMPLICIT_CONVERSION',
  (from, to) => `cannot implicitly convert from "${from}" to "${to}"`
)

export const ExplicitConversionError = defineError(
  'ExplicitConversionError',
  'ERR_EXPLICIT_CONVERSION',
  (from, to) => `cannot explicitly convert from "${from}" to "${to}"`
)

const typeStack = Symbol('typeStack')
globalThis[typeStack] = { types: {} }

export const Scope = (def) => {
  const previous = globalThis[typeStack]
  globalThis[typeStack] = { types: { ...previous.types }, scope: def }
  const result = def()
  if (isAsync(result)) {
    return result.then((asyncResult) => {
      globalThis[typeStack] = previous
      return asyncResult
    })
  }
  globalThis[typeStack] = previous
  return result
}

const typeName = value =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor.name

export const Type = (
  name,
  spec,
) => {
  if (!spec) {
    return globalThis[typeStack][name]
  }
  const {
    generics, // ['Bar']
    implicit, // [{ canConvert: () => {}, convert: () => {} }]
    explicit, // [{ canConvert: () => {}, convert: () => {} }]
  } = spec
  const typeDef = (type) => undefined // todo
  const { types } = globalThis[typeStack]
  const entries = types[name] || (types[name] = [])
  entries.unshift(typeDef)
  return typeDef
}

Type.instanceOf = (type) =>
  (value) =>
    ((value === undefined) && (type === Undefined)) ||
      ((value === null) && (type === Null)) ||
      (value.constructor === type) ||
      (value instanceof type)

Type.is = (type) =>
  (value) =>
    ((value === undefined) && (type === Undefined)) ||
      ((value === null) && (type === Null)) ||
      (value && (value.constructor === type))

const convertAny = [{}]

Type.Any = Type('Any', {
  implicit: convertAny,
  explicit: convertAny,
})

const isJsFunction = Type.instanceOf(Function)

export const js = {
  Promise: Type('Promise', {
    implicit: [
      { canConvert: Type.instanceOf(Promise) },
      { canConvert: (v) => isJsFunction(v?.then), convert: (v) => Promise.resolve(v) }
    ],
    explicit: [
      { convert: (v) => Promise.resolve(v) }
    ]
  }),
  Function: Type('Function', {
    implicit: [
      { canConvert: isJsFunction },
    ],
    explicit: [
      // todo
    ],
  }),
  String: Type('String', {
    implicit: [
      { canConvert: Type.instanceOf(String) },
    ],
    explicit: [
      { canConvert: Type.instanceOf(Number), convert: (v) => v.toString() },
    ],
  }),
  Object: Type('Object', {
    implicit: [
      { canConvert: Type.is(Object), convert(v) => ({}) }
    ]
  })
}
