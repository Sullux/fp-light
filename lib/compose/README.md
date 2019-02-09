## fp-light-compose

`npm i @sullux/fp-light-compose`
[source](https://github.com/Sullux/fp-light/blob/master/lib/compose/compose.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/compose/compose.spec.js)

Compose has different meanings for objects as for functions. Functional composition is the inverse of [piping](../pipe/README.md). Object composition is the recursive combination of the fields of multiple input objects into a single output object.

* [compose](#compose)
* [composeObjects](#composeobjects)
* [composeFunctions](#composefunctions)

### compose

`compose(...args: Function[] | Object[]): Function | Object`

If the first argument is a function, returns the functional composition of the arguments; otherwise, returns the object composition of the arguments.

### composeObjects

`composeObjects(...objects: Object[]) : Object`

Performs a deep composition of the given objects and returns an immutably-composed object. Note: this is different from the shallow composition offered by the spread operator or the `Object.Assign()` function. The following test illustrates the difference.

```javascript
const { deepStrictEqual } = require('assert')
const { composeObjects } = require('@sullux/fp-light-compose')

const first = {
  outer: {
    isFirst: true,
    inner: {
      foo: 42
    }
  }
}

const second = {
  outer: {
    isFirst: false,
    inner: {
      bar: 'baz'
    }
  }
}

const composed = composeObjects(first, second)
const spread = { ...first, ...second }
const assign = Object.assign({}, first, second)

deepStrictEqual(composed, {
  outer: {
    isFirst: false,
    inner: {
      foo: 42, // here because of deep composition
      bar: 'baz'
    }
  }
})

deepStrictEqual(spread, {
  outer: {
    isFirst: false,
    inner: {
      bar: 'baz' // `foo` is missing because of shallow composition
    }
  }
})

deepStrictEqual(spread, assign) // assign and spread are both shallow
```
Some other notes about object composition:

* The composed object and all composed nested objects are immutable.
* Composition uses last-in-wins logic unless both child values are composable.
* Child values are composable if both values are of type object and neither value is a date or an iterable.

### composeFunctions

Composition is a core principle of functional programming. When the result of one function is the argument to another function, the classical notation is as follows:

```javascript
third(second(first(42)))
```

The result of `first(42)` is passed to `second`, and the result of that is passed to `third`. The composition of these functions looks like the following test.

```javascript
const { strictEqual } = require('assert')
const { composeFunctions } = require('@sullux/fp-light-compose')

const first = x => x / 2
const second = x => x / 7
const third = x => x + 39

const allThree = composeFunctions(third, second, first)

strictEqual(
  third(second(first(42))), // manually composed
  allThree(42)              // pre-composed
)

strictEqual(allThree(42), 42)
```

The following example demonstrates how `composeFunctions` is the exact inverse of `pipe`.

```javascript
const { strictEqual } = require('assert')
const { composeFunctions } = require('@sullux/fp-light-compose')
const { pipe } = require('@sullux/fp-light-pipe')

const first = x => x / 2
const second = x => x / 7
const third = x => x + 39

strictEqual(
  compose(third, second, first)(42),
  pipe(first, second, third)(42)
)
```

Functional composition is async-aware. If a composed function returns a thenable (such as a `Promise`), the each subsequent function will be invoked on the resolved value and the composition will return a `Promise` to the final result. This is demonstrated in the following example.

```javascript
const { strictEqual } = require('assert')
const { compose } = require('@sullux/fp-light-compose')

const doubleOfSquare = compose(
  value => value + value,
  value => Promise.resolve(value * value)
)

doubleOfSquare(3)
  .then(result => strictEqual(result, 18))
```
