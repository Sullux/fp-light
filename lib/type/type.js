const { inspect: { custom } } = require('util')

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

const inheritanceOf = (proto, chain = []) =>
  (proto === null
    ? chain
    : inheritanceOf(Object.getPrototypeOf(proto), [...chain, proto.constructor]))

const factoryOf = value =>
  (value === undefined
    ? Undefined
    : value === null
      ? Null
      : Object.getPrototypeOf(value).constructor)

const type = (value) => {
  const jstype = typeof value
  const factory = factoryOf(value)
  return Object.freeze({
    jstype,
    name: factory.name,
    factory,
    inheritance: value === undefined
      ? [Undefined, Object]
      : value === null
        ? [Null, Object]
        : inheritanceOf(Object.getPrototypeOf(value))
  })
}

const typeEquals = curry((first, second) =>
  factoryOf(first) === factoryOf(second))

module.exports = Object.freeze({
  type,
  typeEquals,
  factoryOf,
  Null,
  Undefined,
})
