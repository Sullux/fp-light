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
  passthroughProxy(fn, (...args) =>
    (args.length >= arity
      ? fn(...args)
      : curryArity(fn.bind(null, ...args), arity - args.length)))

/* #AUTODOC#
module: API
name: curry
tags: [Composition, Foundational]
ts: |
  function curry(fn: function): function
  declare function curry(arity: number, fn: function): function
description: |
  Allows partial application of function arguments.

  TODO: use [this guide](https://www.freecodecamp.org/news/typescript-curry-ramda-types-f747e99744ab/)
  to provide a full typescript implementation.
*/
export const curry = (arity, fn) =>
  typeof arity === 'function'
    ? curry(arity.length, arity)
    : typeof arity === 'object'
      ? curryObject(fn, arity)
      : curryArity(fn, arity)

/* #AUTODOC#
module: API
name: uncurry
tags: [Foundational]
ts: |
  declare function uncurry(fn: function): function
description: |
  Allows partial application of function arguments.
*/
export const uncurry = fn =>
  (...args) =>
    args.reduce((nextFn, arg) => nextFn(arg), fn)

/* #AUTODOC#
module: API
name: nullary
tags: [Foundational]
ts: |
  declare function nullary<T>(fn: () => T): (...any[]) => T
description: |
  Given a function, returns a function that invokes the original function
  without passing any arguments through.
*/
export const nullary = fn =>
  () =>
    fn()

/* #AUTODOC#
module: API
name: unary
tags: [Foundational]
ts: |
  declare function unary<T, A>(fn: (arg: A) => T): (arg: A, ...any[]) => T
description: |
  Given a function, returns a function that invokes the original function
  passing only the first argument through.
*/
export const unary = fn =>
  arg =>
    fn(arg)

/* #AUTODOC#
module: API
name: binary
tags: [Foundational]
ts: |
  declare function binary<T, A1, A2>(
    fn: (arg1: A1, arg2: A2) => T
  ): (arg1: A1, arg2: A2, ...any[]) => T
description: |
  Given a function, returns a function that invokes the original function
  passing only the first 2 arguments through.
*/
export const binary = fn =>
  (arg1, arg2) =>
    fn(arg1, arg2)

/* #AUTODOC#
module: API
name: ternary
tags: [Foundational]
ts: |
  declare function ternary<T, A1, A2, A3>(
    fn: (arg1: A1, arg2: A2, arg3: A3) => T
  ): (arg1: A1, arg2: A2, arg3: A3, ...any[]) => T
description: |
  Given a function, returns a function that invokes the original function
  passing only the first 3 arguments through.
*/
export const ternary = fn =>
  (arg1, arg2, arg3) =>
    fn(arg1, arg2, arg3)

/* #AUTODOC#
module: API
name: arity
aliases: [nary]
tags: [Foundational]
ts: |
  declare function arity(arity: number, fn: function): function
description: |
  Given a function, returns a function that invokes the original function
  passing only the first _n_ (`arity`) arguments through.

  TODO: fix the typescript definition
*/
export const arity = (arity, fn) =>
  (...args) =>
    fn(...args.slice(0, arity))

export { arity as nary }
