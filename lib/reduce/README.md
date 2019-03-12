[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-reduce

`npm i @sullux/fp-light-reduce`
[source](https://github.com/Sullux/fp-light/blob/master/lib/reduce/reduce.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/reduce/reduce.spec.js)

Similar to the [built-in Javascript function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) `Array.prototype.reduce`, but accepts the iterable as the last argument.

* [reduce](#reduce)

### reduce

`reduce(reducer, initialState, iterable)`

Reduces an iterable to a single value by combining (reducing) the previous (or initial) state with the current value.

The reducer function has the following signature:

`reducer(state, value, index, iterable)`

* `state`: the return value of the previous iteration, or the `initialState` if this is the first iteration.
* `value`: the current value of the iteration.
* `index`: the zero-based offset of the current iteration.
* `iterable`: the original iterable being reduced.

While a reducer can technically take the above four arguments, it is rare to need more than the first two arguments.

The reduce function is one of cornerstones of functional programming. The following example turns an array of key/value pairs into an object.

```javascript
const { reduce } = require('@sullux/fp-light-reduce')

const pairs = [
  [foo: 'bar'],
  [baz: 42],
]

const composedObject = reduce(
  (object, [key, value]) => ({ ...object, [key]: value }),
  {},
  pairs,
)

console.log(composedObject)
// { foo: 'bar', baz: 42 }
```

Because the `reduce` function is async aware, promises are resolved between calls to the reducer. This makes the reduce function an ideal implementation of the classic _waterfall_ pattern.
