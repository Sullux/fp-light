/* eslint-disable no-restricted-syntax */
const syncMap = function* (mapper, iterable) {
  for (const v of iterable) {
    yield mapper(v)
  }
}

/* #AUTODOC#
module: API
name: toAsync
aliases: [toPromise, toThennable]
tags: [Async, Foundational]
ts: |
  declare function toAsync<T>(value: T): Promise<T>
  declare function toPromise<T>(value: T): Promise<T>
  declare function toThennable<T>(value: T): Promise<T>
description: |
  Given a value that may or may not be thennable, returns a thennable.
examples: |
  ```javascript
  const asyncValue = Promise.resolve(42)
  const value = 42
  toAsync(asyncValue).then(console.log) // 42
  toAsync(value).then(console.log) // 42
  isThennable(toAsync(value)) // true
  ```
*/
export const toAsync = value =>
  isAsync(value)
    ? value
    : Promise.resolve(value)

export {
  toAsync as toPromise,
  toAsync as toThennable,
}

/* #AUTODOC#
module: API
name: isAsync
aliases: [isPromise, isThennable]
tags: [Async, Foundational]
ts: |
  declare function isAsync(value: any): boolean
  declare function isPromise(value: any): boolean
  declare function isThennable(value: any): boolean
description: |
  Given any value, returns true if the value is thennable; otherwise, returns false.
examples: |
  ```javascript
  const asyncValue = Promise.resolve(42)
  const value = 42
  isAsync(value) // false
  isAsync(asyncValue) // true
  ```
*/
export const isAsync = value =>
  !!(value && value.then && (typeof value.then === 'function'))

export {
  isAsync as isPromise,
  isAsync as isThennable,
}

/* #AUTODOC#
module: API
name: reject
tags: [Async, Foundational]
ts: |
  declare function reject<T>(value: T): Promise<T>
description: |
  Given an error, returns a rejected promise for the error.
examples: |
  ```javascript
  const error = new Error('reasons')
  const rejection = reject(error)
  rejection.catch(caught => caught === error) // true
  ```
*/
export const reject = value =>
  Promise.reject(value)

/* #AUTODOC#
module: API
name: awaitAll
tags: [Async, Foundational]
ts: |
  declare function awaitAll(value: Iterable<any>): Promise<any[]>
description: |
  Given an iterable, waits for all promises to resolve and then resolves to an
  array of the resolved values in original input order.
examples: |
  ```javascript
  const first = Promise.resolve(41)
  const second = 42
  const third = Promise.resolve(43)
  awaitAll([first, second, third]) // [41, 42, 43]
  ```
*/
export const awaitAll = promises =>
  Promise.all(syncMap(toAsync, promises))

/* #AUTODOC#
module: API
name: awaitArray
tags: [Async, Foundational]
ts: |
  declare function awaitArray(value: Iterable<any>): any[] | Promise<any[]>
description: |
  Given an iterable, deep awaits each value and then resolves to an array or
  promise-to-array of the resolved values in original input order.
  ```
*/
export const awaitArray = value =>
  value.reduce(
    (state, item) => {
      const result = deepAwait(item)
      return isAsync(state)
        ? Promise.all([state, result]).then(([s, i]) => ([...s, i]))
      : isAsync(result)
        ? result.then(i => ([...state, i]))
        : [...state, result]
    },
    [],
  )

/* #AUTODOC#
module: API
name: awaitObject
tags: [Async, Foundational]
ts: |
  declare function awaitObject(value: object): object | Promise<object>
description: |
  Given an object, deep awaits each value and then resolves to an object or
  promise-to-object with each async value resolved to a synchronous value.
  ```
*/
export const awaitObject = value => {
  // todo: use a map to protect against recursion
  const pairs = Object.entries(value).reduce(
    (state, [key, item]) => {
      const result = deepAwait(item)
      return isAsync(state)
        ? Promise.all([state, result]).then(([s, i]) => ([...s, [key, i]]))
      : isAsync(result)
        ? result.then(i => ([...state, [key, i]]))
        : [...state, [key, result]]
    },
    [],
  )
  const toObject = input =>
    input.reduce(
      (state, [key, item]) => {
        state[key] = item
        return state
      },
      {},
    )
  return isAsync(pairs)
    ? pairs.then(toObject)
    : toObject(pairs)
}

/* #AUTODOC#
module: API
name: deepAwait
tags: [Async, Foundational]
ts: |
  declare function deepAwait(value: any): any | Promise<any>
description: |
  Given any value, awaits and/or deep awaits using the {{#awaitArray}} and
  {{#awaitObject}} functions and then resolves to the synchronous or
  asynchronous result.
  ```
*/
export const deepAwait = value =>
  !value
    ? value
  : isAsync(value)
    ? value.then(deepAwait)
  : Array.isArray(value)
    ? awaitArray(value)
  : value.constructor === Object
    ? awaitObject(value)
  : value

/* #AUTODOC#
module: API
name: awaitAny
aliases: [race]
tags: [Async, Foundational]
ts: |
  declare function awaitAny(promises: Iterable<any>): Promise<any>
description: |
  Given an iterable, waits for the first promise from that iterable to resolve.
examples: |
  ```javascript
  const first = awaitDelay(10).then(() => 41)
  const second = 42
  const third = Promise.resolve(43)
  awaitAny([first, second, third]) // 42
  ```
*/
export const awaitAny = promises =>
  Promise.race(syncMap(toAsync, promises))

export { awaitAny as race }

/* #AUTODOC#
module: API
name: awaitDelay
tags: [Async, Foundational]
ts: |
  declare function awaitDelay(ms: number) => Promise<void>
description: |
  Given a number of milliseconds, resolves after the milliseconds have elapsed.
examples: |
  ```javascript
  const first = awaitDelay(10).then(() => 41)
  const second = Promise.resolve(42)
  awaitAny([first, second]) // 42
  awaitAll([first, second]) // [41, 42]
  ```
*/
export const awaitDelay = ms =>
  new Promise(resolve => setTimeout(resolve, ms))
