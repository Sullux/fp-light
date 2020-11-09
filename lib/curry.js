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

/* #AUTODOC#
module: API
name: curry
tags: [Composition, Foundational]
ts: |
  function curry(fn: function): function
  declare function curry(arity: number, fn: function): function
description: |
  Allows partial application of function arguments.
specs:
  - !spec
    name: curry
    fn: !js curry
    tests:
      - name: should pass through when arity 0
        input: [!js () => true]
        output: !js v => v() === true
      - name: should pass through when arity 1
        input: [!js (arg) => arg]
        output: !js v => v(42) === 42
      - name: should allow partial application of arity 2
        input:
          - !js |
              (arg1, arg2) => arg1 + arg2
        output: !js |
          v => v(40)(2) === 42
      - name: should allow complete application of arity 2
        input:
          - !js |
              (arg1, arg2) => arg1 + arg2
        output: !js |
          v => v(40, 2) === 42
      - name: should pass through when explicit arity 0
        input: [!js () => true, 0]
        output: !js v => v() === true
      - name: should pass through when explicit arity 1
        input: [!js (arg) => arg, 1]
        output: !js v => v(42) === 42
      - name: should allow partial application of explicit arity 2
        input:
          - !js |
              (arg1, arg2, arg3 = 0) => arg1 + arg2 + arg3
          - 2
        output: !js |
          v => v(40)(2) === 42
      - name: should allow complete application of explicit arity 2
        input:
          - !js |
              (arg1, arg2, arg3 = 0) => arg1 + arg2 + arg3
          - 2
        output: !js |
          v => v(40, 2) === 42
      - name: should allow application of additional args with explicit arity 2
        input:
          - !js |
              (arg1, arg2, arg3 = 0) => arg1 + arg2 + arg3
          - 2
        output: !js |
          v => v(40, 1, 1) === 42
*/
// TODO: use [this guide](https://www.freecodecamp.org/news/typescript-curry-ramda-types-f747e99744ab/)
// to provide a full typescript implementation.
export const curry = (arity, fn) =>
  typeof arity === 'function'
    ? curry(arity.length, arity)
    : typeof arity === 'object'
      ? curryObject(fn, arity)
      : curryArity(fn, arity)

/* #AUTODOC#
module: API
name: uncurry
tags: [Composition, Foundational]
ts: |
  declare function uncurry(fn: function): function
description: |
  Allows partial application of function arguments.
specs:
  - !spec
    name: uncurry
    fn: !js uncurry
    tests:
      - name: should apply all args
        input:
          - !js |
              v1 => v2 => v1 + v2
        output: !js |
          f => f(40, 2) === 42
*/
export const uncurry = fn =>
  (...args) =>
    args.reduce((nextFn, arg) => nextFn(arg), fn)

/* #AUTODOC#
module: API
name: nullary
tags: [Composition, Foundational]
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
tags: [Composition, Foundational]
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
tags: [Composition, Foundational]
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
tags: [Composition, Foundational]
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
tags: [Composition, Foundational]
ts: |
  declare function arity(arity: number, fn: function): function
description: |
  Given a function, returns a function that invokes the original function
  passing only the first _n_ (`arity`) arguments through.
*/
export const arity = (arity, fn) =>
  (...args) =>
    fn(...args.slice(0, arity))

export { arity as nary }
