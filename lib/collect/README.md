[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-collect

`npm i @sullux/fp-light-collect`
[source](https://github.com/Sullux/fp-light/blob/master/lib/collect/collect.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/collect/collect.spec.js)

The collect utility creates a function that accepts _n_ arguments and passes them to the wrapped function in a single array argument.

* [collect](#collect)

### collect

`collect<T>(fn: (Array<mixed>) => T): (...args: Array<mixed>) => T`

While this utility doesn't do a complex job, it can help make some functional programming more readable as in the following example.

```javascript
const { collect } = require('@sullux/fp-light-collect')
const { reduce } = require('@sullux/fp-light-reduce')

const callInOrder = collect(reduce(
  (result, next) => next(result),
  undefined,
))

callInOrder(
  () => console.log('starting'),
  () => 40 + 2,
  value => console.log('ended with', value)
)
/*
starting
ended with 42
*/
```

This example collects functions and passes them to a pipe-like reducer.
