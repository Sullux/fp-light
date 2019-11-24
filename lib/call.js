import { awaitAll } from './async'
import { isThennable } from './type'
import { get } from './get'

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
  const spreadableProxy = {
    get: (target, property) => {
      return property === symbol
        ? fn
        : target[property]
    },
    getOwnPropertyDescriptor: (target, property) => {
      return property === symbol
        ? { value: fn, configurable: true, enumerable: true }
        : Reflect.getOwnPropertyDescriptor(target, property)
    },
    ownKeys: (target) => {
      return [
        symbol,
        ...Reflect.ownKeys(target)
      ]
    }
  }
  return new Proxy(fn, spreadableProxy)
}

const spreadIdentity = spreadableSymbol()

const targetPropertyIfExists = (target, property) =>
 input => {
    const value = target(input)
    return value && value[property]
  }

const identityProxy = {
  get: (target, property) => {
    property === spreadIdentity
      ? target
      : new Proxy(targetPropertyIfExists(target, property), identityProxy)},
  getOwnPropertyDescriptor: (target, property) =>
    property === spreadIdentity
      ? { value: target, configurable: true, enumerable: true }
      : { value: undefined, configurable: true },
  ownKeys: () => ([spreadIdentity]),
}

/* #AUTODOC#
module: API
name: identity
aliases: [argument, _]
tags: [Convenience Functions, Spreadable]
description: |
  Given a value, returns that value. This is useful in cases where a callable
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
export const identity = new Proxy(v => v, identityProxy)
export {
  identity as argument,
  identity as _,
}

const callObject = (callable) => {
  const spread = Symbol('spread')
  const entries = Reflect.ownKeys(callable)
    .map(key => {
      const value = callable[key]
      return isSpreadableSymbol(key)
        ? [spread, value]
        : [key, call(value)]
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
      (state, [key, call]) => {
        const result = call(input)
        if (isThennable(result)) {
          if (isThennable(state)) {
            return Promise.all([result, state])
              .then(([value, target]) => mutate(target, key, value))
          }
          return result.then(value => mutate(state, key, value))
        }
        if (isThennable(state)) {
          return state.then(target => mutate(target, key, result))
        }
        return mutate(state, key, result)
      },
      {},
    )
  }
}

const firstSpreadable = value => {
  if (!value) {
    return false
  }
  const key = Reflect.ownKeys(value).find(isSpreadableSymbol)
  return key
    ? value[key]
    : false
}

const callIterable = (callable) => {
  const calls = (Array.isArray(callable) ? callable : [...callable]).map(call)
  return input => {
    const result = calls.reduce(
      (result, c) => {
        const callToSpread = firstSpreadable(c)
        const value = callToSpread
          ? callToSpread(input)
          : c(input)
        const mutate = (mutable, added) => {
          if (callToSpread) {
            added.map(a => mutable.push(a))
            return mutable
          }
          mutable.push(added)
          return mutable
        }
        const append = r => {
          if (isThennable(value)) {
            return value.then(v => mutate(r, v))
          }
          return mutate(r, value)
        }
        return isThennable(result)
          ? result.then(append)
          : append(result)
      },
      [],
    )
    return result
  }
}

const isConstant = callable =>
  (callable === null) ||
    ['string', 'boolean', 'number', 'undefined'].includes(typeof callable) ||
    (callable instanceof Date) ||
    (callable instanceof RegExp) // todo: special handling of regex?

/* #AUTODOC#
module: API
name: call
tags: [Callable]
description: |
  The `call` function is arguably the most important function in this library.
  It is a curried function that accepts a _callable_ and an input value. A
  _callable_ is one of:

  * a function;
  * a string that will be treated as a `get(string)` function;
  * an object that will be treated as an unordered list of key/value pairs where
    the values are themselves callables;
  * an iterable that will be treated as an ordered list of callables;
  * a literal value to pass through; or
  * a promise resolving to any of the above.

  Additionally, a callable can include or return a promise or a value that
  includes promises such as an array of promises or an object with a property
  that is a promise.

  Throughout this documentation, functions that accept callables will be
  notated as such. Some examples are `compose`, `pipe` and `map`.
examples: |
  ```javascript
  const setOnFoo = call({ foo: _ })

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

  values.map(call('foo'))
  // [41, 42, 43]

  // remap the foo element to bar for each element

  values.map(call({ bar: 'foo' }))
  // [
  //   { bar: 41 },
  //   { bar: 42 },
  //   { bar: 43 },
  // ]
  ```

  This example includes promises.

  ```javascript
  const values = [41, toAsync(42), 43]

  const incrementedOnFoo = call({ foo: x => x + 1 })

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
    callableObject:
      bar: foo
      biz: { $mock: [value => stringValue] }
    transformedObject:
      bar: foo
      biz: { $: stringValue }
    callableArray:
      - foo
      - { $mock: [value => stringValue] }
    transformedArray:
      - foo
      - { $: stringValue }
    callableComplexObject:
      missing: null
      bool: true
      date: { $: date }
      fn: { $mock: [value => stringValue] }
      string: foo
      array: { $: callableArray }
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
    - signature: callable:Null => Any? => Null
      tests:
        - null => => null
        - null => value => null
    - signature: callable:Undefined => Any? => Undefined
      tests:
        - => =>
        - => value =>
    - signature: callable:Boolean => Any? => Boolean
      tests:
        - true => => true
        - true => value => true
        - false => => false
        - false => value => false
    - signature: callable:Date => Any? => Date
      tests:
        - date => => date
        - date => value => date
    - signature: callable:Function => Any? => Any?
      tests:
        - toString => value => stringValue
    - signature: callable:String => Any? => Any?
      tests:
        - stringValue => value => stringValue
    - signature: callable:Array => Any? => Array
      tests:
        - callableArray => value => transformedArray
    - signature: callable:Object => Any? => Object
      tests:
        - callableObject => value => transformedObject
        - callableComplexObject => value => transformedComplexObject
    # TODO: add tests for various async cases
*/
export const call = (callable) =>
  isConstant(callable)
    ? () => callable
    : typeof callable === 'function'
      ? callable
      : typeof callable === 'string'
        ? get(callable)
        : typeof callable === 'object'
          ? callable[Symbol.iterator]
            ? callIterable(callable)
            : callObject(callable)
          : () => callable

export const toCallable = fn =>
  (...args) => {
    const callables = args.map(call)
    const result = callables.some(isThennable)
      ? (...input) =>
        awaitAll(callables)
          .then(resolvedCallables => fn(...resolvedCallables)(...input))
      : fn(...callables)
    Object.defineProperty(result, 'name', { value: fn.name })
    // todo: add more debugging features
    return result
  }
