const { inspect: { custom } } = require('util')
const { runInNewContext } = require('vm')

const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

function Null() {
  if (new.target) {
    this[Symbol.toPrimitave] = () => null
    this.toString = () => 'null'
    this.valueOf = () => null
    this[custom] = () => '[Null]'
    return this
  }
  return null
}
Object.defineProperty(
  Null.prototype,
  Symbol.toStringTag,
  { value: 'Null', writable: false }
)

function Undefined() {
  if (new.target) {
    this[Symbol.toPrimitave] = () => {}
    this.toString = () => 'undefined'
    this.valueOf = () => {}
    this[custom] = () => '\x1B[38;5;240m[Undefined]\x1B[39m'
    return this
  }
}
Object.defineProperty(
  Undefined.prototype,
  Symbol.toStringTag,
  { value: 'Undefined', writable: false }
)

const undefinedInstance = new Undefined()
const nullInstance = new Null()

const safeObject = object =>
  (object === undefined
    ? undefinedInstance
    : object === null
      ? nullInstance
      : object)

const prototypeChainIterable = function* (prototype) {
  if (!prototype) {
    return
  }
  yield prototype
  yield* prototypeChainIterable(Object.getPrototypeOf(prototype))
}

const prototypeChain = object =>
  [...prototypeChainIterable(Object.getPrototypeOf(safeObject(object)))]

const factoryOf = object =>
  safeObject(object).constructor

const type = (value) => {
  const jstype = typeof value
  const chain = prototypeChain(value)
  const factoryChain = chain.map(factoryOf)
  const [factory] = factoryChain
  return Object.freeze({
    jstype,
    name: factory.name,
    factory,
    factoryChain,
  })
}

const typeEquals = curry((first, second) =>
  factoryOf(first) === factoryOf(second))

const definitionText = name => `
  function ${name} (...args) {
    const self = new.target
      ? this
      : Object.setPrototypeOf({}, ${name}.prototype)
    construct(self, args)
    return self
  }
`

const allProperties = object =>
  [object, ...prototypeChain(object)]
    .reduce(
      (props, o) => ({ ...props, ...Object.getOwnPropertyDescriptors(o) }),
      {}
    )

const bindAllProperties = (object, properties) =>
  Object.entries(properties).forEach(([key, { value }]) =>
    (typeof value === 'function'
      // eslint-disable-next-line no-param-reassign
      ? properties[key].value = value.bind(object)
      : value)) || properties

const bindAll = object =>
  Object.defineProperties(
    object,
    bindAllProperties(object, allProperties(object))
  )

const define = (
  name,
  {
    extend = Object,
    construct,
    enumerable = {},
    hidden = {},
    properties = {},
    describe,
  } = {},
) => {
  const prototype = Object.create(extend.prototype)
  const combinedProperties = [
    ...Object.entries(enumerable)
      .map(([key, value]) =>
        ([key, { value, enumerable: true, configurable: true }])),
    ...Object.entries(hidden)
      .map(([key, value]) => ([key, { value, configurable: true }])),
    ...Object.entries(properties)
  ].reduce(
    (result, [propertyName, definition]) =>
      ({ ...result, [propertyName]: definition }),
    {}
  )
  Object.defineProperties(prototype, combinedProperties)
  const sandbox = {
    construct: (self, args) => {
      if (construct) {
        const constructed = construct.call(self, ...args)
        if (constructed) {
          Object.defineProperties(self, allProperties(constructed))
        }
      }
      // eslint-disable-next-line no-param-reassign
      self[custom] = describe || (() => `[Object ${name}]`)
      bindAll(self)
    }
  }
  runInNewContext(definitionText(name), sandbox)
  const definition = sandbox[name]
  definition.prototype = prototype
  prototype.constructor = definition
  return definition
}

module.exports = Object.freeze({
  allProperties,
  bindAll,
  define,
  factoryOf,
  Null,
  type,
  typeEquals,
  Undefined,
})
