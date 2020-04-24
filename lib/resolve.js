import { awaitAll, isAsync } from './async'
import { trace } from './trace'

export const spreadableSymbol = () => Symbol('spreadable')

export const isSpreadableSymbol = s =>
  (typeof s === 'symbol') &&
    (s.toString() === 'Symbol(spreadable)')

export const isSpreadable = value =>
  !!value && Reflect.ownKeys(value).some(isSpreadableSymbol)

export const toSpreadable = fn => {
  if (isSpreadable(fn)) {
    return fn
  }
  const symbol = spreadableSymbol()
  const overrides = {
    [symbol]: fn,
    [Symbol.iterator]: [fn][Symbol.iterator],
  }
  const spreadableProxy = {
    get: (target, prop) =>
      overrides[prop] || target[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      overrides[prop]
        ? Object.getOwnPropertyDescriptor(overrides, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (target, prop) =>
      (prop in overrides) || (prop in target),
    ownKeys: (target) =>
      [...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)],
  }
  return new Proxy(fn, spreadableProxy)
}

const spreadIdentity = spreadableSymbol()
const arraySpread = Symbol('arraySpread')

const targetPropertyIfExists = (target, property) =>
  (input) => {
    const value = target(input)
    return value && value[property]
  }

const identityProxy = {
  get: (target, property) => {
    if (property === arraySpread) {
      return false
    }
    if (property === Symbol.iterator) {
      return function* () {
        yield { [arraySpread]: target }
      }
    }
    return property === arraySpread
      ? false
      : property === Symbol.iterator
        ? function* () { yield { [arraySpread]: target } }
        : property === spreadIdentity
          ? target
          : new Proxy(targetPropertyIfExists(target, property), identityProxy)
  },
  getOwnPropertyDescriptor: (target, property) =>
    property === spreadIdentity
      ? { value: target, configurable: true, enumerable: true }
      : Object.getOwnPropertyDescriptor(target, property),
  ownKeys: (target) => ([...Reflect.ownKeys(target), spreadIdentity, Symbol.iterator]),
}

/* #AUTODOC#
module: API
name: identity
aliases: [argument, _]
tags: [Convenience Functions, Spreadable]
description: |
  Given a value, returns that value. This is useful in cases where a resolvable
  object needs to resolve the input into the output. This can also be useful in
  cases where two logical branches must return a function, but where one branch
  exhibits the "no change" logic (i.e. a function that returns the original
  argument).

  Additionally, `identity` proxies the property accessor such that an accessed
  property returns a function that will retrieve that property from the given
  argument. This means that `identity.foo` returns a function shaped like
  `value => value.foo` and `identity[3]` returns a function shaped like
  `value => value[3]`. Note that properties are resolved safely, meaning
  `identity` will never throw on undefined.
examples: |
  This example demonstrates the branch-to-no-change logic. The `log` function
  uses `identity` to pass logged values straight through to `console.log` while
  the `logObject` function uses the JSON serializer.

  ```javascript
  const logWith = serialize =>
    value =>
      console.log(serialize(value))

  // log plain values
  const log = logWith(identity)

  // log serialized values
  const logObject = logWith(JSON.stringify)
  ```

  This example uses the `_` alias and the property accessor to mimic the
  behavior of Scala's underscore operator.

  ```javascript
  const area = multiply(_.x, _.y)

  area({ x: 2, y: 3 }) // 6
  ```

  This example shows how `identity` protects against accessing properties of
  undefined values.

  ```javascript
  const inners = map(_.nums[0])

  inners([
    { nums: [42, 43] },
    {}, // this would throw if accessing literally with v => v.nums[0]
    { nums: [44] },
  ])
  // [42, undefined, 44]
  ```

definition:
  types:
    Any: ~Object
  context:
    value: 42
  specs:
    - signature: value:Any? => Any
      tests:
        - value => value
        - null => null
*/
export const identity = new Proxy(
  function identity (v){ return v },
  identityProxy,
)

export {
  identity as argument,
  identity as _,
}

const resolveObject = (predicate) => {
  const spread = Symbol('spread')
  const entries = Reflect.ownKeys(predicate)
    .map(key => {
      const value = predicate[key]
      return isSpreadableSymbol(key)
        ? [spread, value]
        : [key, resolve(value)]
    })
  return input => {
    const mutate = (target, key, value) => {
      if (value === undefined) {
        return target
      }
      if (key === spread) {
        return Object.assign(target, value)
      }
      target[key] = value
      return target
    }
    return entries.reduce(
      (state, [key, resolve]) => {
        const result = resolve(input)
        if (isAsync(result)) {
          if (isAsync(state)) {
            return Promise.all([result, state])
              .then(([value, target]) => mutate(target, key, value))
          }
          return result.then(value => mutate(state, key, value))
        }
        if (isAsync(state)) {
          return state.then(target => mutate(target, key, result))
        }
        return mutate(state, key, result)
      },
      {},
    )
  }
}

const iterableToArray = (value) => {
  if (Array.isArray(value)) {
    return value
  }
  if (!value || !value[Symbol.iterator]) {
    throw TypeError(`${value} is not iterable`)
  }
  return [...value]
}

const resolveIterable = (predicate) => {
  const resolves = (Array.isArray(predicate) ? predicate : [...predicate])
    .map(c => (c && c[arraySpread]) ? c : resolve(c))
  return input => {
    const result = resolves.reduce(
      (result, c) => {
        const resolveToSpread = c && c[arraySpread]
        const getSpreadValues = () => {
          const values = iterableToArray(resolveToSpread(input))
          return values.some(isAsync)
            ? awaitAll(values)
            : values
        }
        const value = resolveToSpread
          ? getSpreadValues()
          : c(input)
        const mutate = (mutable, added) => {
          if (resolveToSpread) {
            added.map(a => mutable.push(a))
            return mutable
          }
          mutable.push(added)
          return mutable
        }
        const append = r => {
          if (isAsync(value)) {
            return value.then(v => mutate(r, v))
          }
          return mutate(r, value)
        }
        return isAsync(result)
          ? result.then(append)
          : append(result)
      },
      [],
    )
    return result
  }
}

const isConstant = predicate =>
  (predicate === null) ||
    ['string', 'boolean', 'number', 'undefined'].includes(typeof predicate) ||
    (predicate instanceof Date) ||
    (predicate instanceof RegExp) // todo: special handling of regex?

const resolveProxy = (predicate, resolve) => {
  const overrides = { '$resolve': predicate }
  return new Proxy(resolve, {
    get: (target, prop) =>
      overrides[prop] || target[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      overrides[prop]
        ? Object.getOwnPropertyDescriptor(overrides, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (target, prop) =>
      (prop in overrides) || (prop in target),
    ownKeys: (target) =>
      [...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)],
  })
}

export const isResolve = predicate =>
  ((typeof predicate) === 'function') && ('$resolve' in predicate)

/* #AUTODOC#
module: API
name: resolve
tags: [Foundational]
description: |
  The `resolve` function is arguably the most important function in this library.
  It is a curried function that accepts a _resolve predicate_ and an input value. A
  _resolve predicate_ is one of:

  * a function;
  * an object that will be treated as an unordered list of key/value pairs where
    the values are themselves resolvables;
  * an iterable that will be treated as an ordered list of resolvables;
  * a literal value to pass through; or
  * a promise resolving to any of the above.

  Additionally, a resolve predicate can include or return a promise or a value that
  includes promises such as an array of promises or an object with a property
  that is a promise.
examples: |
  ```javascript
  const setOnFoo = resolve({ foo: _ })

  setOnFoo(42) // { foo: 42 }
  setOnFoo()   // { foo: undefined }
  ```

  These examples use a more complex value.

  ```javascript
  const values = [
    { foo: 41 },
    { foo: 42 },
    { foo: 43 },
  ]

  // extract the foo property of each element

  values.map(resolve(_.foo))
  // [41, 42, 43]

  // remap the foo element to bar for each element

  values.map(resolve({ bar: _.foo }))
  // [
  //   { bar: 41 },
  //   { bar: 42 },
  //   { bar: 43 },
  // ]
  ```

  This example includes promises.

  ```javascript
  const values = [41, toAsync(42), 43]

  const incrementedOnFoo = resolve({ foo: x => x + 1 })

  const process = async () =>
    console.log(await values.map(incrementedOnFoo))

  process()
  // [
  //   { foo: 42 },
  //   { foo: 43 },
  //   { foo: 44 },
  // ]
  ```
definition:
  types:
    Any: ~Object
  context:
    value: 42
    stringValue: '42'
    date: { $Date: '2019-10-19' }
    toString:
      $mock: [value => stringValue]
    propertyName: foo
    object:
      foo: { $: value }
    objectWithString:
      foo: bar
    resolvableObject:
      bar: foo
      biz: { $mock: [value => stringValue] }
    transformedObject:
      bar: foo
      biz: { $: stringValue }
    resolvableArray:
      - foo
      - { $mock: [value => stringValue] }
    transformedArray:
      - foo
      - { $: stringValue }
    resolvableComplexObject:
      missing: null
      bool: true
      date: { $: date }
      fn: { $mock: [value => stringValue] }
      string: foo
      array: { $: resolvableArray }
      object: { $lib: _ }
    transformedComplexObject:
      missing: null
      bool: true
      date: { $: date }
      fn: { $: stringValue }
      string: foo
      array: { $: transformedArray }
      object: { $: value }
  specs:
    - signature: resolvable:Null => Any? => Null
      tests:
        - null => => null
        - null => value => null
    - signature: resolvable:Undefined => Any? => Undefined
      tests:
        - => =>
        - => value =>
    - signature: resolvable:Boolean => Any? => Boolean
      tests:
        - true => => true
        - true => value => true
        - false => => false
        - false => value => false
    - signature: resolvable:Date => Any? => Date
      tests:
        - date => => date
        - date => value => date
    - signature: resolvable:Function => Any? => Any?
      tests:
        - toString => value => stringValue
    - signature: resolvable:String => Any? => Any?
      tests:
        - stringValue => value => stringValue
    - signature: resolvable:Array => Any? => Array
      tests:
        - resolvableArray => value => transformedArray
    - signature: resolvable:Object => Any? => Object
      tests:
        - resolvableObject => value => transformedObject
        - resolvableComplexObject => value => transformedComplexObject
*/
export const resolve = (predicate) =>
  resolveProxy(predicate, isConstant(predicate)
    ? () => predicate
    : typeof predicate === 'function'
      ? predicate
      : typeof predicate === 'object'
        ? predicate[Symbol.iterator]
          ? resolveIterable(predicate)
          : resolveObject(predicate)
        : () => predicate)

const resolvableProxy = (fn, resolvable) => {
  const overrides = { '$': fn }
  return new Proxy(fn, {
    get: (target, prop) =>
      overrides[prop] || target[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      overrides[prop]
        ? Object.getOwnPropertyDescriptor(overrides, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (target, prop) =>
      (prop in overrides) || (prop in target),
    ownKeys: (target) =>
      [...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)],
    apply: (ignore, thisArg, args) =>
      resolvable.apply(thisArg, args),
  })
}

export const resolvable = fn => {
  const resolvable = (...args) => {
    const resolvableArgs = args.map(resolve)
    return value => {
      const results = resolvableArgs.map(c => c(value))
      return results.some(isAsync)
        ? awaitAll(isAsync).then(resolvedResults => fn(...resolvedResults))
        : fn(...results)
    }
  }
  return trace(resolvableProxy(fn, resolvable))
}

export { resolvable as toResolvable }

export const isResolvable = fn =>
  ((typeof fn) === 'function') && ((typeof fn.$) === 'function')