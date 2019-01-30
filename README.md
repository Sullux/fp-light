# Pipette
--------------------------------------------------------------------------------

This library facilitates functional programming in JavaScript.

## Chain

The chain function starts a chain by creating the first link resolving to a given value. In that sense, the `chain` function is very similar to the `Promise.resolve` function.

### Chain Usage

`chain(value?: any): link`

Conceptually, a chain is a sequence of `link` monads. Since links implement a `then` method, they can be used interchangeably with Promises. Here is an example of a chain within a unit test:

```javascript
const { chain } = require('pipette')
const assert = require('assert')

const theNumberOfThineCounting = 3

describe('chain', () => {
  it('should resolve to 3', () => {
    return chain(theNumberOfThineCounting)
      .then(v => v + 2)
      .tap(v => console.log('Five!', v)) // Five! 5
      .then(v => Promise.resolve(v - 2))
      .tap(v => console.log('Three, sir!', v)) // Three, sir! 3
      .then(v => assert.strictEqual(v, theNumberOfThineCounting))
  })
})
```
Notice that because a chain can slide easily from synchronous to asynchronous, and because each link is a thennable, returning a chain from a test is no different from returning an actual `Promise`: Mocha will wait for the promise-like-object to resolve or reject.

A chain is said to be synchronous if the starting value is not a promise and no link in the chain returns a promise. Note the following examples of synchronous and asynchronous chains:

```javascript
const { chain } = require('pipette')

const increment = v => v + 1

// Synchronous
chain(1)
  .then(increment)
  .then(increment)
  .tap(v => console.log('Three, sir!', v)) // Three, sir! 3

// Asynchronous
chain(Promise.resolve(1))
  .then(increment)
  .then(increment)
  .tap(v => console.log('Three, sir!', v)) // Three, sir! 3
```
In ES6 (Node.js >= 8.x), the `await` keyword can act as a unifying feature for chains. The `await` keyword can be safely used with synchronous and asynchronous chains, making it so the consuming code does not need to know implementation details to use a link. Consider the following example.

```javascript
const answer = await lookItUp()
```
We know that the `lookItUp` function returns a chain, but we do not need to know if it is a synchronous or asynchronous chain. All links implement the `then` method, so the `await` keyword will work regardless of the underlying implementation.

### Chain API

Since the `chain` function returns a `link`, see [link](#link) below for the full API.

## Link

The link is the monad of which chains are constructed.

### Link Usage

`link(value?: any, err?: Error): link`

For readability, the preferred way to create a link is with the `chain` method or from one of the continuation methods in the [link API](#link-api). In practice, all the following usages are equivalent. The preferred patterns are marked as `GOOD`.

```javascript
const { chain, link } = require('pipette')

// GOOD
chain(3)
  .tap(console.log) // 3

// BAD
link(3)
  .tap(console.log) // 3

// GOOD
chain()
  .then(() => throw new Error('Not happy!'))
  .catch(console.log) // Error: Not happy!

// BAD
link(undefined, new Error('Is this really what you want?'))
  .catch(console.log) // Error: Is this really what you want?
```
### Link API

This is the API of a `link` object.

| name | type | description |
| ---- | ---- | ----------- |
| then | `(onResolved?: (any): any, onRejected?: (Error): any): link` | Create a link that will resolve to the return value of the `onResolved` or `onRejected` function. |
| first | | |
| all | | |
| | | |
| | | |
| | | |
| | | |
| | | |
