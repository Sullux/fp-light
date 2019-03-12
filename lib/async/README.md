[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-async

`npm i @sullux/fp-light-async`  
[source](https://github.com/Sullux/fp-light/blob/master/lib/async/async.js)  
[test](https://github.com/Sullux/fp-light/blob/master/lib/async/async.spec.js)  

This module provides various asynchronous helpers.

* [asyncMap](#asyncmap)
* [awaitAll](#awaitall)
* [awaitAny](#awaitany)
* [awaitChain](#awaitchain)
* [awaitDelay](#awaitdelay)
* [resolves](#resolves)
* [rejects](#rejects)

### asyncMap

`asyncMap(mapper, iterable)`

Given a mapper and an input iterable, returns an iterable of promises. This is subtly different from the standard `map` function in a few ways. First, the `map` function will quietly await the resolution of the prior iteration before continuing while `asyncMap` will produce a standalone promise for each iteration. Second, while `map` will only produce a promise after receiving a promise as input, `asyncMap` will return a promise for all iterations.

```javascript
const { map } = require('@sullux/fp-light-map')
const { asyncMap } = require('@sullux/fp-light-async')

const a = 1
const b = 2
const c = 3

const mapExample = () => {
  const mapped = map(v => v + 1, [Promise.resolve(a), b, c])
  
  const longhand = Promise.resolve(a)
    .then(a => a + 1)
    .then(a => [a, b + 1])
    .then([a, b] => [a, b, c + 1])
}

const asyncMapExample = () => {
  const asyncMapped = asyncMap(v => v + 1, [a, b, c]])
  
  const longhand = [
    Promise.resolve(a + 1),
    Promise.resolve(b + 1),
    Promise.resolve(c + 1),
  ]
}

```

### awaitAll

`awaitAll(promises)`

Similar to `Promise.all()`.

```javascript
describe('awaitAll', () => {
  it('should resolve when all promises have resolved', () => 
    awaitAll([Promise.resolve('foo'), Promise.resolve(42)])
      .then(result => deepStrictEqual(result, ['foo', 42])))
  it('should reject when any promise rejects', () => {
    const error = new Error('reasons')
    return awaitAll([Promise.resolve('foo'), Promise.reject(error)])
      .then(value => ([undefined, value]), error => [error])
      .then(result => deepStrictEqual(result, [error]))
  })
})
```

### awaitAny

`awaitAny(promises)`

Similar to `Promise.race()`.

```javascript
describe('awaitAny', () => {
  it('should resolve when the first promise resolves', () => 
    awaitAny([awaitDelay(5).then(() => 'foo'), Promise.resolve(42)])
      .then(result => strictEqual(result, 42)))
  it('should reject when the first promise rejects', () => {
    const error = new Error('reasons')
    return awaitAny([awaitDelay(5), Promise.reject(error)])
      .then(value => ([undefined, value]), error => [error])
      .then(result => deepStrictEqual(result, [error]))
  })
})
```

### awaitChain

`awaitChain(functions)`

Similar to the `waterfall()` function from the pre-promise era _Async_ library. This function calls each function and awaits the resolution of the result before passing the result to the next function. The result of the final function is the return value.

```javascript
describe('awaitChain', () => {
  it('should chain all functions', () =>
    awaitChain([() => awaitDelay(5), () => Promise.resolve(42)])
      .then(result => strictEqual(result, 42)))
  it('should chain non-function values', () =>
    awaitChain([() => awaitDelay(5), 42])
      .then(result => strictEqual(result, 42)))
  it('should reject when any promise rejects', () => {
    const error = new Error('reasons')
    return awaitChain([Promise.resolve('foo'), Promise.reject(error)])
      .then(value => ([undefined, value]), error => [error])
      .then(result => deepStrictEqual(result, [error]))
  })
})
```

### awaitDelay

`awaitDelay(ms)`

Returns a promise that will resolve after the given number of milliseconds.

```javascript
describe('awaitDelay', () => {
  it('should delay the given milliseconds', () => {
    const start = Date.now()
    return awaitDelay(5)
      .then(() => ok((Date.now() - start) > 4))
  })
})
```

### resolves

`resolves(value)`

Returns a function whose result is a promise that resolves to the given value. `resolves(42)` is equivalent to `() => Promise.resolve(42)`.

```javascript
describe('resolves', () => {
  it('should create a function that returns a resolved promise', () =>
    resolves(42)()
      .then(result => strictEqual(result, 42)))
})
```

### rejects

`rejects(error)`

Returns a function whose result is a promise that rejects with the given error. `rejects(myError)` is equivalent to `() => Promise.reject(myError)`.

```javascript
describe('rejects', () => {
  it('should create a function that returns a rejected promise', () => {
    const error = new Error('reasons')
    return rejects(error)()
      .then(value => ([undefined, value]), error => [error])
      .then(result => deepStrictEqual(result, [error]))
  })
})
```
