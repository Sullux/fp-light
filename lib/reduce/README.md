[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-reduce

`npm i @sullux/fp-light-reduce`
[source](https://github.com/Sullux/fp-light/blob/master/lib/reduce/reduce.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/reduce/reduce.spec.js)

Similar to the [built-in Javascript function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) `Array.prototype.reduce`, but accepts the iterable as the last argument.

* [reduce](#reduce)

### reduce

`reduce<T, U, V>(`
`  reducer: (U, T, Number, Iterable<T>) => U ,`
`  initialState,`
`  iterable: Iterable<T>`
`): V`

Reduces an iterable to a single value. The reducer function has the following signature:

`reducer<T, U>(state: U, value: T, index: Number, iterable: Iterable<T>)`

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

The next example is a reference implementation of a waterfall function. This takes a list of asynchronous functions and executes them sequentially, with each waiting to begin until the previous asynchronous function has completed. Note that since the reduce function is curried, passing two of the three arguments returns a function that accepts the single, third argument (the iterable of asynchronous functions).

```javascript
const { reduce } = require('@sullux/fp-light-reduce')
const { readFile, writeFile } = require('fs')
const { promisify } = require('util')
const { safeDump } = require('js-yaml')

// a general-purpose waterfall function using reduce
const waterfall = reduce(
  (working, next) => working.then(next),
  Promise.resolve()
)

// read a json file and write it back to disk as a yml file
waterfall([
  async () => {
    console.log('reading file')
    const data = await promisify(readFile)('foo.json')
    console.log('done reading file')
    return JSON.parse(data)
  },
  async data => {
    console.log('writing file')
    await promisify(writeFile)('foo.yaml', safeDump(data))
    console.log('done writing file')
  }
])
// reading file
// done reading file
// writing file
// done writing file
```
