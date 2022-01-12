export const required = Symbol('required')

const passthroughProxy = (source, target) =>
  new Proxy(target, {
    get: (target, prop) =>
      source[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      Object.getOwnPropertyDescriptor(source),
    has: (target, prop) =>
      prop in source,
    isExtensible: () =>
      Object.isExtensible(source),
    ownKeys: () =>
      Reflect.ownKeys(source),
  })

const curryObject = (fn, args) => {
  const { [required]: properties, ...rest } = Array.isArray(args)
    ? { [required]: args }
    : args
  const result = obj => {
    const state = { ...rest, ...obj }
    const remaining = properties.filter((property) =>
      !state.hasOwnProperty(property))
    return remaining.length
      ? curryObject(fn, { [required]: remaining, ...state })
      : fn(state)
  }
  return passthroughProxy(fn, result)
}

const curryArity = (fn, arity) =>
  arity < 2
    ? fn
    : passthroughProxy(fn, (...args) =>
    (args.length >= arity
      ? fn(...args)
      : curryArity(fn.bind(null, ...args), arity - args.length)))

// TODO: use [this guide](https://www.freecodecamp.org/news/typescript-curry-ramda-types-f747e99744ab/)
// to provide a full typescript implementation.
export const curry = (arity, fn) =>
  typeof arity === 'function'
    ? curry(arity.length, arity)
    : typeof arity === 'object'
      ? curryObject(fn, arity)
      : curryArity(fn, arity)

export const uncurry = fn =>
  (...args) =>
    args.reduce((nextFn, arg) => nextFn(arg), fn)

export const nullary = fn =>
  () =>
    fn()

export const unary = fn =>
  arg =>
    fn(arg)

export const binary = fn =>
  (arg1, arg2) =>
    fn(arg1, arg2)

export const ternary = fn =>
  (arg1, arg2, arg3) =>
    fn(arg1, arg2, arg3)

export const arity = (arity, fn) =>
  (...args) =>
    fn(...args.slice(0, arity))

export { arity as nary }
