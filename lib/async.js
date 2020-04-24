/* eslint-disable no-restricted-syntax */
const syncMap = function* (mapper, iterable) {
  for (const v of iterable) {
    yield mapper(v)
  }
}

/* #AUTODOC#
module: API
name: toAsync
aliases: [toPromise, resolve, toThennable]
tags: [Async]
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
definition:
  types:
    Any: ~Object
    AnyAsync:
      $Promise: Any
  context:
    life: 42
    asyncLife:
      $resolve: { $: life }
  specs:
    - signature: value:Any? => AnyAsync
      tests:
        - life => asyncLife
        - asyncLife => asyncLife
*/
export const toAsync = value =>
  isAsync(value)
    ? value
    : Promise.resolve(value)

export {
  toAsync as toPromise,
  toAsync as resolve,
  toAsync as toThennable,
}

/* #AUTODOC#
module: API
name: isAsync
aliases: [isPromise, isThennable]
tags: [Async]
description: |
  Given any value, returns true if the value is thennable; otherwise, returns false.
examples: |
  ```javascript
  const asyncValue = Promise.resolve(42)
  const value = 42
  isAsync(value) // false
  isAsync(asyncValue) // true
  ```
definition:
  types:
    Any: ~Object
    AnyAsync:
      $Promise: Any
  context:
    life: 42
    asyncLife:
      $resolve: { $: life }
  specs:
    - signature: value:Any? => Boolean
      tests:
        - life => false
        - asyncLife => true
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
tags: [Async]
description: |
  Given an error, returns a rejected promise for the error.
examples: |
  ```javascript
  const error = new Error('reasons')
  const rejection = reject(error)
  rejection.catch(caught => caught === error) // true
  ```
definition:
  types:
    Rejection:
      $!Promise: Error
  context:
    error:
      $Error: { message: reasons }
    rejection:
      $reject: { $: error }
  specs:
    - signature: value:Error => Rejection
      tests:
        - 'error => rejection'
*/
export const reject = value =>
  Promise.reject(value)

/* #AUTODOC#
module: API
name: awaitAll
tags: [Async]
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
definition:
  types:
    Any: ~Object
    AnyAsync:
      $Promise: Any
    AsyncArray: [Any|AnyAsync]
  context:
    allSync: [41, 42, 43]
    someAsync:
      - 41
      - { $resolve: 42 }
      - 43
    allAsync:
      - { $resolve: 41 }
      - { $resolve: 42 }
      - { $resolve: 43 }
    allResolved:
      $resolve: [41, 42, 43]
  specs:
    - signature: promises:AsyncArray => Array
      tests:
        - allSync => allResolved
        - someAsync => allResolved
        - allAsync => allResolved
*/
export const awaitAll = promises =>
  Promise.all(syncMap(toAsync, promises))

/* #AUTODOC#
module: API
name: awaitAny
tags: [Async]
description: |
  Given an iterable, waits for the first promise from that iterable to resolve.
examples: |
  ```javascript
  const first = awaitDelay(10).then(() => 41)
  const second = 42
  const third = Promise.resolve(43)
  awaitAny([first, second, third]) // 42
  ```
definition:
  types:
    Any: ~Object
    AnyAsync:
      $Promise: Any
    AsyncArray: [Any|AnyAsync]
  context:
    asyncValues:
      - { $afterDelay: [10, 41] }
      - 42
      - { $resolve: 43 }
    asyncResult:
      $resolve: 42
  specs:
    - signature: promises:AsyncArray => Array
      tests:
        - asyncValues => asyncResult
*/
export const awaitAny = promises =>
  Promise.race(syncMap(toAsync, promises))

/* #AUTODOC#
module: API
name: awaitDelay
tags: [Async]
description: |
  Given a number of milliseconds, resolves after the milliseconds have elapsed.
examples: |
  ```javascript
  const first = awaitDelay(10).then(() => 41)
  const second = Promise.resolve(42)
  awaitAny([first, second]) // 42
  awaitAll([first, second]) // [41, 42]
  ```
definition:
  types:
    Any: ~Object
    AnyAsync:
      $Promise: Any
    AsyncArray: [Any|AnyAsync]
  context:
    milliseconds: 10
    asyncUndefined: { $resolve: undefined }
  specs:
    - signature: promises:AsyncArray => Array
      tests:
        - milliseconds => asyncUndefined
*/
export const awaitDelay = ms =>
  new Promise(resolve => setTimeout(resolve, ms))
