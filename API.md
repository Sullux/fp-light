[home](https://github.com/Sullux/fp-light/blob/master/README.md)

# API

* [always(value)](#always) aka `constant`
* [asyncMap](#asyncmap)
* [awaitAll](#awaitall)
* [awaitAny](#awaitany)
* [awaitChain](#awaitchain)
* [awaitDelay](#awaitdelay)
* [call](#call)
* [gather](#gather)
* [compose](#compose)
* [composeObjects](#composeobjects)
* [composeFunctions](#composefunctions)
* [concat](#concat)
* [curry](#curry)
* [filter](#filter)
* [get](#get)
* [hash](#hash)
* [hashFrom](#hashfrom)
* [hashAny](#hashany)
* [hashToString](#hashtostring)
* [hashToDouble](#hashtodouble)
* [hashToInt](#hashtoint)
* [map](#map)
* [memoize](#memoize)
* [defaultMemoizeArgsEqual](#defaultmemoizeargsequal)
* [pipe](#pipe)
* [range](#range)
* [reduce](#reduce)
* [resolve](#resolve)
* [set](#set)
* [setOn](#seton)
* [setValue](#setvalue)
* [setObjectValue](#setobjectvalue)
* [setArrayValue](#setarrayvalue)
* [skip](#skip)
* [slice](#slice)
* [spread](#spread)
* [skip](#skip)
* [tap](#tap)
* [toArray](#toarray)
* [toMap](#tomap)
* [toObject](#toobject)
* [trap](#trap)
* [allProperties](#allproperties)
* [bindAll](#bindall)
* [define](#define)
* [factoryOf](#factoryof)
* [Null](#null)
* [type](#type)
* [typeEquals](#typeequals)
* [Undefined](#undefined)

## always

`always<T>(value: T): T`

The following example uses `always` to return a pre-determined value from a thennable.

```javascript
const { always, curry } = require('@sullux/fp-light')
const AWS = require('aws-sdk')

const s3 = new AWS.s3()

const saveObject = curry((key, object) =>
  s3.putObject({
    Body: JSON.stringify(object),
    Bucket: process.env.BUCKET,
    Key: key,
  }).promise().then(always(object)))
```

## asyncMap

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

## awaitAll

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

## awaitAny

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

## awaitChain

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

## awaitDelay

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

## call

`call(arg, fn)`

The `call` helper can be useful in functional composition. Consider the following example.

```javascript
const { call } = require('@sullux/fp-light-call')
const { get } = require('@sullux/fp-light-get')

const random0To31 = () =>
  Math.floor(Math.random() * 36)

const randomString = length =>
  Array(length)
    .fill()
    .map(random0To31)
    .map(get('toString'))
    .map(call(36))
    .join('')
```

Note that since the call utility accepts an argument first and a function second, the `.map(call(36))` sets up the call `toString(36)` for each input value. This isn't the most efficient example, but it is fully functional and serves as an example of passing a function as the most significant argument to the call utility.

## gather

`gather(fn)`

While this utility doesn't do a complex job, it can help make some functional programming more readable as in the following example.

```javascript
const { gather } = require('@sullux/fp-light-gather')
const { reduce } = require('@sullux/fp-light-reduce')

const callInOrder = gather(reduce(
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

This example gathers functions and passes them to a pipe-like reducer.

## compose

`compose(...args: Function[] | Object[]): Function | Object`

If the first argument is a function, returns the functional composition of the arguments; otherwise, returns the object composition of the arguments.

## composeObjects

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

## composeFunctions

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

## concat

`concat(...iterables: Array<mixed>): Iterator<mixed>`

This function does a shallow concatenation of iterables, objects and values and returns the concatenated iterable. The unit test for the concat function demonstrates how it handles various types of inputs:

```javascript
const { deepStrictEqual } = require('assert')

const { concat } = require('./concat')

const date = new Date()

describe('concat', () => {
  it('should concatenate iterables', () => deepStrictEqual(
    [...concat(
      [1, 2],
      null,
      undefined,
      { foo: 42 },
      function* () { yield 'bar' },
      date,
      concat(true, false, [3, 4]),
    )],
    [1, 2, null, undefined, ['foo', 42], 'bar', date, true, false, 3, 4]
  ))
})
```
## curry

`curry(fn: Function, arity: ?Number): Function`

Returns a function that supports partial argument application. Note: the term "arity" means "number of arguments". If the `arity` is not supplied, the value of `fn.length` is used. Note that `fn.length` will not include optional or _rest_ arguments.

A vanilla example of currying:

```javascript
const add = curry((x, y) => x + y)
add(1, 2) // 3
const increment = add(1)
increment(2) // 3
```

An example showing that optional arguments are _not_ curried by default:

```javascript
// optional argument is not curried!
const mul = curry((x, y = 1) => x * y)
mul(2, 3) // 6
mul(2) // 2
```

An example using arity to explicitly curry an optional argument:

```javascript
const div = curry((x, y = 1) => x / y, 2) // note: arity 2 is explicit
div(6, 3) // 2
const half = div(2)
half(6) // 3
```

## filter

`filter(test: Function, iterator: Iterator<mixed>): Iterator<mixed>`

The advantage to using iterable functions like `filter` over the built-in array functions is that the array functions create an intermediate representation where the iterable functions evaluate lazily. This leads to a lower memory footprint and faster processing in many scenarios.

This example uses the filter and map iterable functions.

```javascript
const { filter } = require('@sullux/fp-light-filter')
const { get } = require('@sullux/fp-light-get')
const { pipe } = require('@sullux/fp-light-pipe')
const { trap } = require('@sullux/fp-light-trap')
const { readFile, readdir } = require('fs')
const { promisify } = require('util')

const readAllObjects = pipe(
  promisify(readdir),
  map(get('toString')),
  map(trap(promisify(readFile))),
  filter(get(1)),
  map(get(1, 'toString')),
  map(JSON.parse),
  Promise.all,
)

module.exports = { readAllObjects }
```

## get

`get(pathParts: (string | number) | (string | number)[], source: any): any`

The `get` function is useful for traversing a property path. The path parts can be strings or numbers. This supports retrieving properties and array elements.

```javascript
const { get } = require('@sullux/fp-light-get')

const object = { foo: [41, 42] }

get(['foo', 1], object) // 42
```

The `get` helper can be useful in functional composition. The following is a more complete example of the `get`function.

```javascript
const { call } = require('@sullux/fp-light-call')
const { get } = require('@sullux/fp-light-get')

const random0To31 = () =>
  Math.floor(Math.random() * 36)

const randomString = length =>
  Array(length)
    .fill()
    .map(random0To31)
    .map(get('toString'))
    .map(call(36))
    .join('')
```

## hash

`hash(outputSize: Number, input: Buffer): Buffer`

This is the core implementation of `hash`. Given an output size (desired length of the output buffer) and an input buffer (data to be hashed), returns the hashed value as a buffer. All of the other functions are convenience functions for this core `hash` implementation.

WARNING: THIS ALGORITHM IS NOT SUITABLE FOR CRYPTOGRAPHIC OPERATIONS. A password hashed with this algorithm could be easily reverse-engineered. This algorithm is for _distribution_, not _obfuscation_. The benefit of this algorithm for distribution scenarios is that it has far better performance than cryptographic hashing.

## hashFrom

`hashFrom(seed: Buffer, input: Buffer): Buffer`

WARNING: this function mutates the `seed` argument. This is the underlying unit of work for the core `hash` function which mutates as a performance optimization. It is surfaced to enable progresssive hashing use cases such as reducers or streaming. The return value is a reference to the `seed` buffer, which is mutated during hashing. A hash reducer might look like the following example:

```javascript
const hashBigArray = (outputSize, bigArray) =>
  bigArray.reduce((seed, value) =>
    seed
      ? hashFrom(seed, JSON.stringify(value))
      : hashAny(outputSize, value))
```

## hashAny

`hashAny(outputSize: Number, input: any): Buffer`

Like `hash`, but will internally create an input buffer from the supplied input value.

## hashToString

`hashToString(outputSize: Number, input: any): String`

Like `hashAny`, but outputs a hex-encoded string instead of a buffer. Because hex encoding is twice as long as the number of bytes in the output buffer, the actual output buffer is half the given outputSize. Odd numbered output sizes are handled gracefully.

## hashToDouble

`hashToDouble(outputSize: Number, input: any): Number`

Like `hashAny`, but outputs a floating point number instead of a buffer.

## hashToInt

`hashToInt(outputSize: Number, input: any): Number`

Like `hashAny`, but outputs a 32-bit integer instead of a buffer. This would be useful in creating a custom hashmap implementation as in the following (incomplete) example:

```javascript
const { hashToInt } = require('@sullux/fp-light-hash')

const hashMap = (from = [], capacity = 128) => {
  const indexOf = key => hashToInt(key) % capacity
  const values = Array(capacity)

  from.map(indexValues =>
    indexValues.map(([key, value]) =>
      values[indexOf(key)] = value)

  return {
    get: (key) => {
      const index = indexOf(key)
      const indexValues = values[index]
      return indexValues && indexValues.reduce((result, [entryKey, value]) =>
        entryKey === key
          ? value
          : result)
    },
    set: (key, value) => {
      const index = indexOf(key)
      const indexValues = values[index]
      return (indexValues
        ? indexValues.push([key, value])
        : values[index] = [[key, value]]) && value
    },
  }
}
```

## map

`map(mapper, iterable)`

Given a mapping function and an iterable, returns an iterable where each input item is mapped to an output item.

```javascript
const { map } = require('@sullux/fp-light-map')

const input = [1, 2, 3]
const output = map(x => x + 1, input)
console.log([...output])
// [2, 3, 4]
```

The behavior of `map` is different from `asyncMap` in a few ways. First, the `map` function will quietly await the resolution of the prior iteration before continuing while `asyncMap` will produce a standalone promise for each iteration. Second, while `map` will only produce a promise after receiving a promise as input, `asyncMap` will return a promise for all iterations.

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

## memoize

`memoize<T>(`
  `fn: (...args: Array<any>) => T, `
  `equal: ?(leftArgs: Array<any>, rightArgs: Array<any>) => boolean`
`): T`

* `fn`: the function to memoize.
* `equal`: (default [defaultMemoizeArgsEqual](#defaultmemoizeargsequal)) the function to test equality of arguments.

When the memoized function is called, it checks to see if the given arguments have already been cached. It checks by calling `equal` for each set of cached arguments. If it finds a match, it returns the corresponding cached result; otherwise, it executes `fn` and caches and returns the result.

The built-in Node.js `require` function is a good example of a memoized function: it will load the required file the first time (incurring asynchronous latency) and will return the originally loaded value on every subsequent call. A naive implementation of an asynchronous `require` might look like this:

```javascript
const { readFile } = require('fs')
const { promisify } = require('util')
const { createContext, runInContext } = require('vm')
const { pipe } = require('@sullux/fp-light-pipe')
const { memoize } = require('@sullux/fp-light-memoize')

const readFileAsync = promisify(readFile)
  .then(data => data.toString())

const createVm = js => {
  const sandbox = {
    ...globals,
    module: { exports: {} },
  }
  const context = createContext(sandbox)
  runInContext(js, context)
  return sandbox.module.exports
}

const requireAsync = memoize(pipe(
  readFileAsync,
  createVm
))

module.exports = { requireAsync }
```

## defaultMemoizeArgsEqual

`defaultMemoizeArgsEqual(leftArgs: Array<any>, rightArgs: Array<any>): boolean`

This is the default equality test for `memoize`. This is a shallow test that compares the argument count and shallow equality of each argument using `Oject.is`. A custom implementation might choose deep equality to enable interface equality over reference equality, for example.

## pipe

`pipe(...steps: Array<Function>): Function`

This is an example of a synchronous pipe:

```javascript
const productOfDouble = pipe(
  value => value + value,
  value => value * value
)

productOfDouble(3) // 36
```

And this is an example of an asynchronous pipe. This example also uses `curry`, `compose`, and the AWS SDK, and is a more practical example of the power of functional pipes.

```javascript
const { always } = require('@sullux/fp-light-always')
const { compose } = require('@sullux/fp-light-compose')
const { curry } = require('@sullux/fp-light-curry')
const { pipe } = require('@sullux/fp-light-pipe')
const AWS = require('aws-sdk')

const s3 = new AWS.s3()

const saveObject = curry((key, object) =>
  s3.putObject({
    Body: JSON.stringify(object),
    Bucket: process.env.BUCKET,
    Key: key,
  }).promise().then(always(object)))

const readObject = key =>
  s3.getObject({
    Bucket: process.env.BUCKET,
    Key: key,
  }).promise()

const decodeObject = ({ Body }) =>
  JSON.parse(Body)

const composeWith = curry(compose, 2)

const extendObject = (key, added) =>
  pipe(
    readObject,
    decodeObject,
    composeWith(added),
    saveObject(key)
  )(key)

module.exports = {
  extendObject
}
```

## range

`range(start: Number, end: Number): Iterable<Number>`

Given a start less than end, iterates forward; otherwise, iterates backwards. All ranges are inclusive. The following tests illustrate the functionality.

```javascript
const { range } = require('./range')
const { deepStrictEqual } = require('assert')

describe('range', () => {
  it('should produce a low to high range', () => deepStrictEqual(
    [...range(1, 3)],
    [1, 2, 3]
  ))
  it('should produce a high to low range', () => deepStrictEqual(
    [...range(3, 1)],
    [3, 2, 1]
  ))
  it('should produce a single digit range', () => deepStrictEqual(
    [...range(1, 1)],
    [1]
  ))
})
```

## reduce

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

## resolve

`resolve(target, input)`

Resolution involves passing the input to the target (if a function) or to any function found on the target (if an object or iterable). If any literal or resolved value anywhere in the result is a thenable, or if the input is a thennable, the return value of `resolve` is a promise; otherwise, the return value is the target after having been fully-resolved with the input.

```javascript
resolve('foo', 42) // 'foo'
resolve(x => x + 1, 42) // 43
resolve(['foo', x => x + 1], 42) // ['foo', 43]
resolve({ foo: 'bar', baz: x => x + 1 }, 42) // { foo: 'bar', baz: 43 }

resolve(x => x + 1, Promise.resolve(42))
  // promise -> 42

resolve({ foo: 'bar', baz: x => Promise.resolve(x + 1) }, 42)
  // promise -> { foo: 'bar', baz: 43 }

resolve(
  {
    foo: Promise.resolve('bar'),
    baz: Promise.resolve(x => Promise.resolve(x + 1))
  },
  Promise.resolve(42)
)
  // promise -> { foo: 'bar', baz: 43 }
```

## set

`set(path, value, input)`

* `path`: string, number or array of strings/numbers. This is the key, index or path of keys/indexes to the property of the input object.
* `value`: the new value to set on the input object.
* `input`: the object or array on which the new value is being set.

The `set` function creates a deep copy of the input with the new value interpolated into the result at the offset denoted by the path. If parts of the path are missing, those parts are created. If a path part is a number, it is assumed to be an offset into an array; otherwise, it is assumed to be a property of an object.

The `set` function can be particularly useful in mapping operations as in the following example.

```javascript
const { map } = require('@sullux/fp-light-map')
const { set } = require('@sullux/fp-light-set')

const people = [
  { name: 'jane' },
  { name: 'jamal' },
  { name: 'zhang' },
]

const inactive = map(set('active', false))

inactive(people)
/*
[
  { name: 'jane', active: false },
  { name: 'jamal', active: false },
  { name: 'xing', active: false },
]
*/
```

## setOn

`setOn(input, path, value)`

Same functionality as [set](#set), but with the arguments rearranged so that the value is the most significant (last) argument.

```javascript
const records = pipe(
  map(setOn({}, 'value'))
  map(set('createTime', Date.now())),
  Array.from,
  setOn({}, 'records')
)

console.log(records([1, 2, 3]))
/*
{
  Records: [
    { value: 1, createTime: 1552058411957 },
    { value: 2, createTime: 1552058411958 },
    { value: 3, createTime: 1552058411959 },
  ]
}
*/
```

## setValue

`setValue(input, key, value)`

* `input`: the object on which to set the value
* `key`: the input key or index at which to set the value
* `value`: the new value of the key or index

The `setValue` function creates a shallow copy of the input object/array with the value interpolated into the result at the given key.

```javascript
const { setValue } = require('@sullux/fp-light-set')

setValue({ foo: 7, bar: 'baz' }, 'foo', 42)
// { foo: 42, bar: 'baz' }

setValue([7, 8, 13], 1, 42)
// [7, 42, 13]
```

## setObjectValue

`setObjectValue(input, key, value)`

The `setObjectValue` function creates a shallow copy of the input object with the value interpolated into the result at the given key. This is the default behavior of `setValue` when the input is not an array.

## setArrayValue

`setArrayValue(input, key, value)`

The `setArrayValue` function creates a shallow copy of the input array with the value interpolated into the result at the given key. This is the default behavior of `setValue` when the input is an array.

## skip

`skip<T>(count: number, iterable: Iterable<T>): Iterable<T>`

If `count` is less than 1, yields all items; otherwise, skips `count` items. If count is greater than the number of items in the iterable, returns an empty iterable.

```javascript
const { skip } = require('./skip')
const { deepStrictEqual } = require('assert')

describe('skip', () => {
  it('should skip zero', () => deepStrictEqual(
    [...skip(0, [1, 2, 3])],
    [1, 2, 3]
  ))
  it('should skip zero with negative skip', () => deepStrictEqual(
    [...skip(-1, [1, 2, 3])],
    [1, 2, 3]
  ))
  it('should skip n values', () => deepStrictEqual(
    [...skip(1, [1, 2, 3])],
    [2, 3]
  ))
  it('should return empty skipping length', () => deepStrictEqual(
    [...skip(3, [1, 2, 3])],
    []
  ))
  it('should return empty skipping greater than length', () => deepStrictEqual(
    [...skip(4, [1, 2, 3])],
    []
  ))
})
```

## slice

`slice<T>(start: number, end: number, iterable: Iterable<T>): Iterable<T>`

If `start` is less than 1, begins at the first item; otherwise, begins at the one-based start item. If end is greater than the number of items in the iterable, returns through the last item; otherwise, returns through the end item (inclusive).

NOTE: since `slice` is a count-based operation, all offsets are 1-based.

```javascript
const { slice } = require('./slice')
const { deepStrictEqual } = require('assert')

describe('slice', () => {
  it('should return empty when end = begin', () => deepStrictEqual(
    [...slice(2, 2, [1, 2, 3])],
    []
  ))
  it('should return empty when end > begin', () => deepStrictEqual(
    [...slice(3, 2, [1, 2, 3])],
    []
  ))
  it('should return first element when start < 1', () => deepStrictEqual(
    [...slice(-1, 3, [1, 2, 3])],
    [1, 2]
  ))
  it('should return last element when end > length', () => deepStrictEqual(
    [...slice(2, 5, [1, 2, 3])],
    [2, 3]
  ))
  it('should return a slice', () => deepStrictEqual(
    [...slice(2, 4, [1, 2, 3, 4])],
    [2, 3]
  ))
})
```

## spread

`spread<T>(fn: (...Array<mixed>) => T): (args: Array<mixed>) => T`

While this utility doesn't do a complex job, it can help make some functional programming more readable as in the following example.

```javascript
const { pipe } = require('@sullux/fp-light-pipe')
const { range } = require('@sullux/fp-light-range')
const { spread } = require('@sullux/fp-light-spread')

const print1ToN = pipe(
  range(1),
  spread(console.log)
)

print1ToN(5)
// 1 2 3 4 5
```

## skip

`take<T>(count: number, iterable: Iterable<T>): Iterable<T>`

If `count` is less than 1, yields no items; otherwise, yields `count` items. If count is greater than the number of items in the iterable, yields all items.

```javascript
const { take } = require('./take')
const { deepStrictEqual } = require('assert')

describe('take', () => {
  it('should take all values when given length', () => deepStrictEqual(
    [...take(3, [1, 2, 3])],
    [1, 2, 3]
  ))
  it('should take all values when given greater than length', () => deepStrictEqual(
    [...take(4, [1, 2, 3])],
    [1, 2, 3]
  ))
  it('should take some values when given less than length', () => deepStrictEqual(
    [...take(2, [1, 2, 3])],
    [1, 2]
  ))
  it('should return empty when given zero', () => deepStrictEqual(
    [...take(0, [1, 2, 3])],
    []
  ))
  it('should return empty when given less than zero', () => deepStrictEqual(
    [...take(-1, [1, 2, 3])],
    []
  ))
})
```

## tap

`tap<T>((aside: any) => T): (T) => T`

Aliases: `aside`, `dispatch`

Creates a function that calls the wrapped function but always returns the original argument. The return value of the wrapped function is ignored. NOTE: if the return value of the wrapped function is thennable, `tap` will return a promise that awaits the thennable and resolves to the original value.

```javascript
const { tap } = require('@sullux/fp-light-tap')
const { strictEqual } = require('assert')

describe('tap', () => {
  it('should call the wrapped function', () => {
    let mutable
    tap(v => { mutable = v })(42)
    strictEqual(mutable, 42)
  })
  it('should return the input value', () =>
    strictEqual(tap(() => 7)(42), 42))
  it('should return a promise resolving to the input value', () =>
    tap(v => Promise.resolve(7))(42)
      .then(v => strictEqual(v, 42)))
})
```

Or a somewhat practical example of an `s3Bucket` implementation with a `putObject` function:

```javascript
const { curry } = require('@sullux/fp-light-curry')
const { tap } = require('@sullux/fp-light-tap')
const { pipe } = require('@sullux/fp-light-pipe')

const s3 = new (require('aws-sdk')).S3

const putObjectParams = curry((bucket, { key, data }) => ({
  Bucket: bucket,
  Key: key,
  Data: JSON.stringify(data),
}))

const putObject = params =>
  s3.putObject(params).promise()

const s3Bucket = (bucket) => ({
  putObject: pipe(
    putObjectParams(bucket),
    tap(console.log),
    putObject,
    tap(console.log),
  ),
})
```

## toArray

`toArray(any)`

If the input is already an array, the original input is returned. If the input is iterable, it is spread into a new array. The values `null`, `undefined` and `''` (empty string) produce an empty array. A `Date`, `function` or `number` value is returned in a single-element array, while objects return an array of entries (as from `Object.entries`).

```javascript
const { toArray } = require('@sullux/fp-light-to-array')

toArray() // []

toArray(null) // []

toArray('') // []

toArray('foo') // ['f', 'o', 'o']

toArray(42) // [42]

toArray(new Date()) // [Date: 2019-03-01T14:56:53.812Z]

toArray(() => 42) // { Function: [Function] }

toArray({ foo: 42, bar: 'baz' }) // [['foo', 42], ['bar', 'baz']]
```

## toMap

`toMap(any)`

Produces an map from the given input value. If the input is iterable, `toMap` assumes that each entry is a two-element array of key and value.

```javascript
const { toMap } = require('@sullux/fp-light-to-map')

toMap() // []

toMap(null) // []

toMap([['foo', 'bar'], ['baz', 42]]) // [['foo', 'bar'], ['baz' 42]]

toMap({ foo: 42 }) // [['foo', 42]]

toMap(new Date()) // [['Date', '2019-03-01T14:56:53.812Z']]

toMap(42) // [['Number': 42]]

toMap('foo') // [['String': 'foo']]

toMap(() => 42) // [['Function': () => 42]]
```

## toObject

`toObject(any)`

Produces an object from the given input value. If the input is iterable, `toObject` assumes that each entry is a two-element array of key and value.

```javascript
const { toObject } = require('@sullux/fp-light-to-object')

toObject() // { 'Undefined': undefined }

toObject(null) // { 'Null': null }

toObject([['foo', 'bar'], ['baz', 42]]) // { foo: 'bar', baz: 42 }

toObject({ foo: 42 }) // { foo: 42 }

toObject(new Date()) // { Date: 2019-03-01T14:56:53.812Z }

toObject(42) // { Number: 42 }

toObject('foo') // { String: 'foo' }

toObject(() => 42) // { Function: [Function] }
```

## trap

`trap(critical: (...mixed[]) => [] | Promise): (...mixed[]) => [] | Promise<[]>`

The trap function can accept two types of values: a function or a thennable. When passed a function, trap returns a wrapped function that will return or resolve to a callback-style array in the form of `[error, result]`. When passed a thennable, trap will return a promise that resolves to the callback-style `[error, result]` array.

Following is an example that uses error trapping. This example exports a function that is made to be used in a directory of json files. The `readAllObjects` function reads all files in the given directory, parses them, and returns a promise that resolves to the array of all the objects read from the files.

The reason error trapping is so important in this example is that file systems are inconsistent. Instead of checking for the existence or type of a file, recommended practice is to try to read the file and ignore errors. Note that this example will still resolve to an error if the file data cannot be parsed as JSON.

```javascript
const { filter } = require('@sullux/fp-light-filter')
const { get } = require('@sullux/fp-light-get')
const { pipe } = require('@sullux/fp-light-pipe')
const { trap } = require('@sullux/fp-light-trap')
const { readFile, readdir } = require('fs')
const { promisify } = require('util')

const readAllObjects = pipe(
  promisify(readdir),
  map(get('toString')),
  map(trap(promisify(readFile))),
  filter(get(1)),
  map(get(1, 'toString')),
  map(JSON.parse),
  Promise.all,
)

module.exports = { readAllObjects }
```

## allProperties

`allProperties(object: any): { [name: string | Symbol]: Descriptor }`

Enumerates the properties of the given object and every prototype in the prototype chain of the given object, returning a map of property names/symbols to descriptors. See the [Node.js reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) for `Object.defineProperty` for details about the descriptors.

Note that the result includes non-enumerable properties. The following example shows the REPL output of the function.

```javascript
allProperties(Error('reasons'))
/*
{ stack:
   { value: 'Error: reasons\n    at repl:1:15\n    at ContextifyScript.Script.runInThisContext (vm.js:50:33)\n    at REPLServer.defaultEval (repl.js:240:29)\n    at bound (domain.js:301:14)\n    at REPLServer.runBound [as eval] (domain.js:314:12)\n    at REPLServer.onLine (repl.js:468:10)\n    at emitOne (events.js:121:20)\n    at REPLServer.emit (events.js:211:7)\n    at REPLServer.Interface._onLine (readline.js:280:10)\n    at REPLServer.Interface._line (readline.js:629:8)',
     writable: true,
     enumerable: false,
     configurable: true },
  message:
   { value: '',
     writable: true,
     enumerable: false,
     configurable: true },
  constructor:
   { value: [Function: Object],
     writable: true,
     enumerable: false,
     configurable: true },
  name:
   { value: 'Error',
     writable: true,
     enumerable: false,
     configurable: true },
  toString:
   { value: [Function: toString],
     writable: true,
     enumerable: false,
     configurable: true },
  __defineGetter__:
   { value: [Function: __defineGetter__],
     writable: true,
     enumerable: false,
     configurable: true },
  __defineSetter__:
   { value: [Function: __defineSetter__],
     writable: true,
     enumerable: false,
     configurable: true },
  hasOwnProperty:
   { value: [Function: hasOwnProperty],
     writable: true,
     enumerable: false,
     configurable: true },
  __lookupGetter__:
   { value: [Function: __lookupGetter__],
     writable: true,
     enumerable: false,
     configurable: true },
  __lookupSetter__:
   { value: [Function: __lookupSetter__],
     writable: true,
     enumerable: false,
     configurable: true },
  isPrototypeOf:
   { value: [Function: isPrototypeOf],
     writable: true,
     enumerable: false,
     configurable: true },
  propertyIsEnumerable:
   { value: [Function: propertyIsEnumerable],
     writable: true,
     enumerable: false,
     configurable: true },
  valueOf:
   { value: [Function: valueOf],
     writable: true,
     enumerable: false,
     configurable: true },
  __proto__:
   { get: [Function: get __proto__],
     set: [Function: set __proto__],
     enumerable: false,
     configurable: true },
  toLocaleString:
   { value: [Function: toLocaleString],
     writable: true,
     enumerable: false,
     configurable: true } }
*/
```

## bindAll

`bindAll<T>(object: T): T`

Iterates all properties on the given object and the object's prototype chain and binds all functions to the given object. This solves a wide range of bugs that occur when an instance function is called out of context. The following test demonstrates the solution.

```javascript
const { strictEqual, throws } = require('assert')

const { bindAll } = require('@sullux/fp-light-type')

class Foo {
  constructor() {
    this.x = 42
  }
  xString() {
    return this.x.toString()
  }
}

describe('bindAll', () => {
  it('should throw without binding', () => {
    const unbound = new Foo()
    throws(unbound.xString)
  })
  it('should work properly with binding', () => {
    const bound = bindAll(new Foo())
    strictEqual(bound.xString(), '42')
  })
})
```

## define

`define(name: string, options: ?{`
  `extend: ?Function,`
  `construct: ?(...args: mixed[]) => Object,`
  `enumerable: ?{ [name: String | Symbol]: mixed },`
  `hidden: ?{ [name: String | Symbol]: mixed },`
  `properties: ?{ [name: String | Symbol]: Descriptor },`
  `describe,`
`}): Function`

At the most basic level, the define utiliy defines a function that will behave the same whether called as a factory or as a constructor.

```javascript
const Foo = define('Foo')
const foo1 = Foo()
const foo2 = new Foo()
```

is equivalent to

```javascript
function Foo () {
  return new.target
    ? this
    : Object.setPrototypeOf({}, Foo.prototype)
const foo1 = bindAll(Foo())
const foo2 = bindAll(new Foo())
}
```

While this removes much of the underlying complexity of constructors and factories, defining a type would not be useful without the various options.

### extend

Sets the parent constructor of the given type. The following example demonstrates defining a custom error.

```javascript
const FooError = define('FooError', { extend: Error })
const error = FooError()
error instanceof FooError // true
error instanceof Error // true
```

### construct

Allows a custom-constructed base object for a new instance of the type. The construct function's `this` is the new instance and the return value of the construct function will be also be composed onto the new instance.

```javascript
const FooError = define('FooError', {
  extend: Error,
  construct(message) {
    this.id = 'Foo123'
    return Error(message)
  },
})
const error = new FooError('reasons')
error.id // Foo123
error.message // reasons
error.stack
/*
Error: reasons
    at FooError.construct (repl:1:76)
    ...etc.
*/
```

### enumerable

Defines enumerable properties to be added to the defined prototype. Defining a property as _enumerable_ is similar to making it public in the sense that it is discoverable by looping structures and functions that iterate enumerable properties such as `Object.keys`.

Note that the following is the same example as for [construct](#construct) except that instead of modifying each instance during construction, the `id` property is now an enumerable property of the prototype.

```javascript
const FooError = define('FooError', {
  extend: Error,
  construct: Error,
  enumerable: { id: 'Foo123' },
})
const error = new FooError('reasons')
error.id // Foo123
error.message // reasons
error.stack
/*
Error: reasons
    at FooError.construct (repl:1:76)
    ...etc.
*/
```

### hidden

Defines hidden (non-enumerable) properties on the defined prototype. Note that a hidden property is not private in the traditional sense because it can still be accessed externally. It is only hidden from discovery by looping structures and functions that iterate enumerable properties.

```javascript
const Foo = define('Foo', { hidden: { secret: 42 } })
const foo = new Foo()
Object.keys(foo).includes('secret') // false
foo.secret // 42
```

### properties

Defines [property descriptors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description) for the defined prototype. This allows the definition of properties with getters and setters, non-configurable properties, etc.

```javascript
const Foo = define('Foo', {
  properties: {
    answer: { get() { return 42 } },
  },
})
const foo = new Foo()
Object.keys(foo).includes('answer') // false
foo.answer = 1
foo.answer // 42
```

### describe

The describe function is a special helper that is called by the [Node.js utility function](https://nodejs.org/api/util.html#util_util_inspect_object_options) `util.inspect()` to generate a string representation of an object. This is called by the REPL to provide console output.

```javascript
const Foo = define('Foo', { describe: () => 'instance of Foo' })
const Bar = define('Bar')
console.log(new Foo())
// instance of Foo
console.log(new Bar())
// [Object Bar]
```

## factoryOf

`factoryOf(value: any): Function`

Given a value, returns the factory of the value.

Example:

```javascript
const { strictEqual } = require('assert')
const { factoryOf } = require('@sullux/fp-light-type')

strictEqual(factoryOf(true), Boolean)
```

## Null

`Null(): null`

Provided as the missing factory/constructor for `null`.

Example:

```javascript
const { strictEqual } = require('assert')
const { Null, factoryOf } = require('@sullux/fp-light-type')

strictEqual(Null(), null)
strictEqual(factoryOf(null), Null)
```

## type

`type(value: any): { `
`  jstype: string, `
`  name: string, `
`  factory: Function, `
`  inheritance: Array<string> `
`}`

Returns a map of information about the type of the given value.

* `jstype`: the native type as reported by `typeof value`.
* `name`: the name of the factory function for this type.
* `factory`: the factory function for this type.
* `inheritance`: an array of all factory functions within the prototype chain from the factory of the given value through the final factory `Object`.

Example:

```javascript
const { type } = require('@sullux/fp-light-type')

console.log(type(true))
/*
{ jstype: 'boolean',
  name: 'Boolean',
  factory: [Function: Boolean],
  inheritance: [ [Function: Boolean], [Function: Object] ] }
*/
```

## typeEquals

`typeEquals(first: any, second: any): boolean`

Given two values, returns true if the values share the same factory function.

Example:

```javascript
const { ok } = require('assert')
const { typeEquals } = require('@sullux/fp-light-type')

ok(typeEquals(false, true))
ok(typeEquals(null, null))
ok(!typeEquals(null, undefined))
```

### Undefined

`Undefined(): undefined`

Provided as the missing factory/constructor for `undefined`.

Example:

```javascript
const { strictEqual } = require('assert')
const { Undefined, factoryOf } = require('@sullux/fp-light-type')

strictEqual(Undefined(), undefined)
strictEqual(factoryOf(undefined), Undefined)
```
