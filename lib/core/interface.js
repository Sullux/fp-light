const { Spreadable } = require('./spreadable')

function Undefined () { }

function Null () { return null }

const interfacePath = Symbol.interfacePath

const withPath = (fn, path) => {
  if (fn[interfacePath]) {
    return withPath((v) => fn(v), [...fn[interfacePath], ...path])
  }
  fn[interfacePath] = path
  return fn
}

const implementsUndefined = (path) =>
  withPath((v) => v === undefined, [...path, undefined])

const implementsNull = (path) =>
  withPath((v) => v === null, [...path, null])

const isCapital = (c) => c && (c <= 'Z') && (c >= 'A')

const implementsConstructor = (constructor, path) =>
  constructor === Undefined
    ? implementsUndefined(path)
    : constructor === Null
      ? implementsNull(path)
      : withPath((v) => v.constructor === constructor, [...path, constructor])

const implementsFunction = (fn, path) =>
  withPath((v) => fn(v), [...path, fn])

const restProperty = Symbol('...')

const implementsObject = (s, path) => {
  const specKeys = Object.keys(s)
  const { [restProperty]: restSpec, ...specs } =
    Object.fromEntries(specKeys.map((key) => ([key, spec(s[key], [...path, key])])))
  const test = (v) => {
    const allProps = Object.keys(v)
    const { remaining: unmetProps, result } = allProps.reduce(
      ({ remaining, result }, prop) => {
        const thisSpec = remaining[prop]
        if (!thisSpec) {
          return restSpec && restSpec(v[prop])
            ? { remaining, result }
            : { remaining, result: [...result, [...path, prop]] }
        }
        if (!thisSpec(v[prop])) {
          return { result: false }
        }
        const { [prop]: ignore, ...rest } = remaining
        return { remaining: rest, result }
      },
      { remaining: { ...specs }, result: [] },
    )
    return Object.entries(unmetProps).reduce(
      (result, [key, test]) =>
        result && ((key === restProperty) || test(v[key])),
      true,
    )
  }
  return withPath(test, [...path, Object])
}

const implementsArray = (s, path) =>
  spec(...s.map((s, i) => spec(s, [...path, i])))

const spec = (s, path = []) =>
  console.log() || s === undefined
    ? implementsUndefined(path)
    : s === null
      ? implementsNull(path)
      : ((s instanceof Function) || (typeof s === 'function'))
          ? s.name && isCapital(s.name[0])
              ? implementsConstructor(s, path)
              : implementsFunction(s, path)
          : s.constructor === Object
            ? implementsObject(s, path)
            : Array.isArray(s)
              ? implementsArray(s, path)
              : (v) => v === s

const interfaceSpecification = Symbol.for('fp.interface.specification')
const isInterface = (i) => Reflect.has(i, interfaceSpecification)

function Interface (s) {
  if (isInterface(s)) { return s }
  const test = spec(s)
  test[interfaceSpecification] = s
  return Spreadable(i)
}
Object.defineProperty(Interface, Symbol.hasInstance, {
  value: isInterface,
})

const any = Interface()
Spreadable(Undefined)
Spreadable(Null)
Spreadable(Interface)

module.exports = {
  Undefined,
  Null,
  interfaceSpecification,
  isInterface,
  Interface,
  I: Interface,
  any,
}
