import { isFunction, isString, Primitive } from './compare.js'

const primitiveTypes = [
  'number',
  'bigint',
  'boolean',
  'undefined',
  'symbol',
]

const isPrimitive = (v) => primitiveTypes.includes(v)

export function ConstructorNotAllowedError (name) {
  const self = new.target
    ? this
    : Object.setPrototypeOf({}, ConstructorNotAllowedError.prototype)
  self.code = 'ERR_CONSTRUCTOR_NOT_ALLOWED'
  self.message = `${name} cannot be instantiated with \`new\``
  return self
}
ConstructorNotAllowedError.prototype = Object.create(Error.prototype)

const factoryTemplate = `${function __name__ (...args) {
  if (new.target) {
    throw ConstructorNotAllowedError('__name__')
  }
  const instance = __name__.construct(...args)
  return instance
}.toString()}; return __name__`

export const Factory = (name, construct) => {
  // todo: validate name
  const factoryString = factoryTemplate.replace(/__name__/g, name)
  const factory = (new Function(factoryString))()
  factory.construct = construct
  Factory.instances.add(factory)
  return factory
}
Factory.instances = new WeakSet()
Object.defineProperty(Factory, Symbol.hasInstance, {
  value: (v) => Factory.instances.has(v),
})

const constructorTemplate = `${function __name__ (...args) {
  const self = new.target
    ? this
    : Object.setPrototypeOf({}, __name__.prototype)
  __name__.init(self, ...args)
  return self
}.toString()}; return __name__`

export const Constructor = (name, init) => {
  // todo: validate name
  const constructorString = constructorTemplate.replace(/__name__/g, name)
  const constructor = (new Function(constructorString))()
  constructor.init = init
  Constructor.instances.add(constructor)
  return constructor
}
Constructor.instances = new WeakSet()
Object.defineProperty(Constructor, Symbol.hasInstance, {
  value: (v) => Constructor.instances.has(v),
})

const canBox = (v) => (v === null) || primitiveTypes.includes(v)
const unbox = (value) =>
  value === null
    ? () => null
    : (typeof value) === 'number'
        ? (hint) => hint === 'string' ? String(value) : value
        : (typeof value) === 'string'
            ? (hint) => hint === 'number' ? Number(value) : value
            : () => value
export const boxed = (Symbol.fp || (Symbol.fp = {})).boxed = Symbol('fp.boxed')
export const Box = Factory(
  'Box',
  (value) => canBox(value)
    ? { [boxed]: value, [Symbol.toPrimitive]: unbox(value) }
    : value,
)

/* {
  name,
  construct,
  init,
  properties,
  implements,
  inherits,
} */
export const Type = (name, options) => {
  if ((!name && !options) || (!isString.$(name))) {
    return Type(name?.name || 'Anonymous', name)
  }
  // todo: validate name
  if (isFunction.$(options)) {
    return Type(name, { construct: options })
  }
  const factory = Factory(name)
  factory.instances = new WeakSet()
  const {
    construct = (v) => {
      const value = (v instanceof Primitive) ? [v] : v
      factory.instances.add(value)
      return value
    },
    properties,
    implements: i,
    inherits,
  } = (options || {})
  factory.construct = construct
  if (inherits) {
    factory.prototype = Object.create(inherits.prototype)
  }
  Type.instances.add(factory)
  const instances = factory.instances = new WeakSet()
  // todo
  return factory
}
Type.instances = new WeakSet()
Type.properties = {
  isConstructed: Boolean,
}
Object.defineProperty(Type, Symbol.hasInstance, {
  value: v => Type.instances.has(v),
})
