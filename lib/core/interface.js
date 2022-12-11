const { Null, Undefined } = require('./types')
const { isSpread, Spreadable, spreadFunction } = require('./spreadable')
const {
  isCapital,
  functionName,
  isFunction,
} = require('./helpers')

const withStack = (stack, label, spec, test) => ([
  ...stack,
  [label, spec, test],
])

const implementsUndefined = (stack) =>
  withStack(stack, 'undefined', undefined, (v) => v === undefined)

const implementsNull = (stack) =>
  withStack(stack, 'null', null, (v) => v === null)

const implementsConstructor = (constructor, stack) => withStack(
  stack,
  `instanceof ${functionName(constructor)}`,
  constructor,
  (v) => v instanceof constructor,
)

const implementsFunction = (fn, stack) =>
  withStack(stack, functionName(fn), fn, (v) => !!fn(v))

const restProperty = Symbol('...')

const implementsEntry = (entry, stack) => {
  const [key, value] = entry
  if (isSpread(value)) {
    return implementsEntry([restProperty, value[spreadFunction]], stack)
  }
  const keyTest = isFunction(key) && spec(key)
  const valueTest = spec(value)
  return keyTest
    ? withStack(stack, 'Entry', entry, [keyTest, valueTest])
    : withStack(stack, key, entry, [valueTest])
}

const implementsObject = (s, stack) => {
  const subStack = []
  return withStack(
    stack,
    'Object',
    s,
    Object.entries(s).map((e) => implementsEntry(e, subStack)),
  )
}

const implementsArray = (s, stack) => {
  const subStack = []
  return withStack(stack, 'Array', s, s.map((v) => spec(v, subStack)))
}

const implementsPrimitive = (s, stack) =>
  withStack(stack, s.constructor.name, s, (v) => v === s)

const spec = (s, stack = []) =>
  s === undefined
    ? implementsUndefined(stack)
    : s === null
      ? implementsNull(stack)
      : isInterface
        ? [...stack, s[interfaceSpecification]]
        : isFunction(s)
          ? isCapital(s?.name?.[0])
              ? implementsConstructor(s, stack)
              : implementsFunction(s, stack)
          : s.constructor === Object
            ? implementsObject(s, stack)
            : Array.isArray(s)
              ? implementsArray(s, stack)
              : implementsPrimitive(s, stack)

const interfaceSpecification = Symbol.for('fp.interface.specification')
const isInterface = (i) => Reflect.has(i, interfaceSpecification)
const interfaces = new WeakMap()

function Interface (s) {
  if (isInterface(s)) { return s }
  const existing = (s instanceof Object) && interfaces.get(s)
  if (existing) { return existing }
  const apply = spec(s)
  apply[interfaceSpecification] = s
  interfaces.set(s, apply)
  return Spreadable(apply)
}
Object.defineProperty(Interface, Symbol.hasInstance, {
  value: isInterface,
})

const any = Interface(true)
const none = Interface(false)
const strictly = (s) => Array.isArray(s)
  ? Interface([...s, ...none])
  : s?.constructor === Object
    ? Interface({ ...s, ...none })
    : ((s instanceof Function) || (typeof s === 'function')) &&
      isCapital(s?.name?.[0])
        ? Interface((v) => v.constructor === constructor)
        : Interface(s)

const Entry = (key, value) => Interface(implementsEntry([key, value]), [])

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
  none,
  strictly,
  Entry,
}
