import { awaitAll } from './async'
import { isThennable } from './type'
import { get } from './get'

/* #AUTODOC#
module: API
name: argument
aliases: [identity, _]
tags: [Convenience Functions]
description: |
  Given a value, returns that value. This is useful in cases where a callable
  object needs to resolve the input into the output. This can also be useful in
  cases where two logical branches must return a function, but where one branch
  exhibits the "no change" logic (i.e. returns the original argument).
examples: |
  This example demonstrates the branch-to-no-change logic. The `log` function
  uses `argument` to pass logged values straight through to `console.log` while
  the `logObject` function uses the JSON serializer.

  ```javascript
  const logWith = serialize =>
    value =>
      console.log(serialize(value))

  // log plain values
  const log = logWith(argument)

  // log serialized values
  const logObject = logWith(JSON.stringify)
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
export const argument = x => x
export {
  argument as identity,
  argument as _,
}

const callObject = (callable) => {
  const entries = Object.entries(callable)
  const allCalls = entries.map(([,value]) => call(value))
  const reconstruct = values =>
    values.reduce(
      (result, value, i) => {
        result[entries[i][0]] = value
        return result
      },
      {}
    )
  return input => {
    let isAsync
    const results = allCalls.map(call => {
      const result = call(input)
      if (isAsync) {
        return result
      }
      if (isThennable(result)) {
        isAsync = true
      }
      return result
    })
    return isAsync
      ? awaitAll(results).then(reconstruct)
      : reconstruct(results)
  }
}

const callIterable = (callable) => {
  const calls = (Array.isArray(callable) ? callable : [...callable]).map(call)
  return input => {
    let awaiting
    const result = calls.map((c) => {
      if (awaiting) {
        return (awaiting = awaiting.then(() =>
          isThennable(c) ? c.then(c2 => c2(input)) : c(input)))
      }
      const value = isThennable(c) ? c.then(c2 => c2(input)) : c(input)
      return isThennable(value)
        ? (awaiting = value)
        : value
    })
    return awaiting ? awaitAll(result) : result
  }
}

const isConstant = callable =>
  (callable === null) ||
    (callable === undefined) ||
    (typeof callable === 'boolean') ||
    (callable instanceof Date)

const callSync = (callable) =>
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
    callableObject:
      bar: foo
    transformedObject:
      bar: { $: value }
    callableArray:
      - foo
    transformedArray:
      - { $: value }
    callableComplexObject:
      missing: null
      bool: true
      date: { $: date }
      fn:
        $mock: [object => stringValue]
      string: foo
      array: { $: callableArray }
      object: { $: callableObject }
    transformedComplexObject:
      missing: null
      bool: true
      date: { $: date }
      fn: { $: stringValue }
      string: { $: value }
      array: { $: transformedArray }
      object: { $: transformedObject }
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
        - propertyName => object => value
    - signature: callable:Array => Any? => Array
      tests:
        - callableArray => object => transformedArray
    - signature: callable:Object => Any? => Object
      tests:
        - callableObject => object => transformedObject
        - callableComplexObject => object => transformedComplexObject
    # TODO: add tests for various async cases
*/
export const call = callable =>
  isThennable(callable)
    ? async input => call(await callable)(input)
    : callSync(callable)

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
