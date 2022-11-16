import { defineError } from './error.js'
import { isAsync } from './async.js'
import { rest } from './spreadable.js'
import { resolve } from './resolve.js'

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

const typeName = value =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor.name

const typeManagers = new Map()

export const TypeManager = (parent) => {
  const parentTypes = parent && typeManagers.get(parent)
  const types = {}
  let fromParent
  let convertParent
  let isParent
  const from = ({ implicit }) => {
    const from = (...value) => {
      const found =
        implicit.find(({ canConvert }) => !canConvert || canConvert(...value)) ||
          (fromParent && fromParent(...value))
      if (!found) { return }
      const { convert } = found
      return convert ? convert(...value) : value[0]
    }
    return from
  }
  const convert = ({ explicit }, from) => {
    const convert = (...value) => {
      const found =
        from(...value) ||
          explicit.find(({ canConvert }) => !canConvert || canConvert(...value)) ||
          (convertParent && convertParent(...value))
      if (!found) { return }
      const { convert } = found
      return convert ? convert(...value) : value[0]
    }
    return convert
  }
  const is = ({ is: tests }) => {
    const is = (...value) => tests.some((test) => test(...value)) ||
      (isParent && isParent(...value))
    return is
  }
  if (parent) {
    fromParent = from(parent)
    convertParent = convert(parent)
    isParent = is(parent)
  }
  const Type = (
    name,
    spec,
  ) => {
    const existing = types[name]
    if (!spec) {
      return existing?.def
    }
    const def = existing?.def || {
      name,
      symbol: Symbol(name),
    }
    const { implicit = [], explicit = [], is: tests = [] } = spec
    const typeInfo = existing || {
      def,
      implicit,
      explicit,
      is: tests,
    }
    if (existing) {
      existing.implicit.unshift(...(implicit))
      existing.explicit.unshift(...(explicit))
      existing.is.unshift(...(tests))
    } else {
      types[name] = typeInfo
      const parts = name.split('.')
      parts.slice(0, -1).reduce(
        (obj, part) => obj[part] || (obj[part] = {}),
        Type,
      )[parts[parts.length - 1]] = def
    }
    def.from = from(existing || typeInfo)
    def.convert = convert(existing || typeInfo)
    def.is = is(existing || typeInfo)
    return def
  }

  const convertAny = [{}]

  Type.Any = Type('Any', {
    implicit: convertAny,
    explicit: convertAny,
  })

  const result = { Type }
  const Scope = () => TypeManager(result)
  result.Scope = Scope
  Type.Scope = Scope
  typeManagers.set(result, types)
  return result
}

export const { Type, Scope } = TypeManager()

export const js = {
  instanceOf: (type) =>
    (value) =>
      ((value === undefined) && (type === Undefined)) ||
        ((value === null) && (type === Null)) ||
        (value.constructor === type) ||
        (value instanceof type),
  is: (type) =>
    (value) =>
      ((value === undefined) && (type === Undefined)) ||
        ((value === null) && (type === Null)) ||
        (value && (value.constructor === type)),
}

const isJsFunction = js.instanceOf(Function)

const jsTypes = {
  Promise: {
    implicit: [
      { canConvert: js.instanceOf(Promise) },
      {
        canConvert: (v) => isJsFunction(v?.then),
        convert: (v) => Promise.resolve(v),
      },
    ],
    explicit: [
      { convert: (v) => Promise.resolve(v) },
    ],
  },
  Function: {
    is: [],
    implicit: [
      {
        canConvert: ({ [js.Function.invokeSymbol]: invoke }) => !!invoke,
      },
      {
        canConvert: isJsFunction,
        convert: (v) => ({
          [js.Function.invokeSymbol]: v,
          [js.Function.argsSymbol]: v.length === 0
            ? []
            : Array(v.length).fill(Type.Any),
          [js.Function.returnsSymbol]: Type.Any,
        })
      },
      {
        canConvert: (args, fn) =>
          Array.isArray(args) && isJsFunction(fn),
        convert: (args, fn, returns) => ({
          [js.Function.invokeSymbol]: fn,
          [js.Function.argsSymbol]: args,
          [js.Function.returnsSymbol]: returns || Type.Any,
        })
      },
    ],
    explicit: [
      { convert: (v) => js.Function(resolve(v)) }
    ],
  },
  String: {
    is: [js.instanceOf(String)],
    implicit: [
      { canConvert: js.instanceOf(String) },
    ],
    explicit: [
      { canConvert: js.instanceOf(Number), convert: (v) => v.toString() },
    ],
  },
  Object: Type('Object', {
    implicit: [
      { canConvert: Type.is(Object), convert(v) => ({}) }
    ]
  })
}

Object.assign(
  js,
  Object.fromEntries(Object.entries(jsTypes)
    .map(([key, value]) => ([key, Type(`js.${key}`, value)]))),
)

js.Function.invokeSymbol = Symbol('invoke')
js.Function.argsSymbol = Symbol('args')
js.Function.returnsSymbol = Symbol('returns')

const fpTypes = {
  Value: {
    // todo
  }
}
