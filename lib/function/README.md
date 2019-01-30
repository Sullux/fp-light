# fp-light/function

From the [fp-light library](https://github.com/sullux/fp-light).

`npm i @sullux/fp-light-function`

## curry

Given a function, returns a version of the function that allows partial application of arguments.

**Signature**

```javascript
curry(fn: Function, arity?: number = fn.length): Function
```

* `fn`: The function to which to allow partial argument application.
* `arity`: optional. The number of arguments to wait for before invoking.
* _returns_: The curried function.

**Examples**

Uncurried vs curried:

```javascript
const { curry } = require('@sullux/fp-light-function')
const { log } = console

// uncurried
const add = (first, second) => first + second

const firstValue = 2
const secondValue = 3

log(add(firstValue, secondValue)) // 5
log(add(firstValue)) // NaN

// curried
const progressiveAdd = curry(add)
const addToFirstValue = progressiveAdd(firstValue)

log(addToFirstValue()) // [Function]
log(addToFirstValue(secondValue)) // 5
log(addToFirstValue(40)) // 42
```

With explicit arity:

```javascript
const { curry } = require('@sullux/fp-light-function')

const log = curry(console.log, 2) // wait for at least 2 args before executing
log('something') // [Function]
log('something', 'else') // something else

const debug = log('DEBUG:')

debug() // [Function]
debug('foo') // DEBUG: foo
debug('foo', 'bar') // DEBUG: foo bar
```

**Copy/Paste**

```javascript
const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))
```

## memoize

Given a pure function, returns a function that will remember the result of the given function for the given arguments. In essence, given the same arguments, this will return the original value that was returned the first time this function was called with those arguments.

**Signature**

```javascript
memoize(fn: Function): Function
```

* `fn`: The function that caches results for a unique list of arguments.
* _returns_: The curried function.

**Examples**

This example is intentionally bad, but illustrates the caching properties of memoization.

```javascript
const { memoize } = require('@sullux/fp-light-function')

const mutableThing = 1
const increaseMutableThing = memoize(count => (mutableThing += count))

increaseMutableThing(1) // 2
increaseMutableThing(2) // 4
increaseMutableThing(38) // 42
increaseMutableThing(1) // 2
increaseMutableThing(2) // 4
increaseMutableThing(3) // 45
```

**Copy/Paste**

```javascript
const memoize = (fn) => {
  const cache = {}
  const serialize = value =>
    (typeof value === 'function'
      ? value.toString()
      : JSON.stringify(value))
  return (...args) =>
    (key => (cache.hasOwnProperty(key)
      ? cache[key]
      : (cache[key] = fn(...args))))(serialize(args))
}
```

## pipe

Given arguments of functions (and/or arrays of functions), returns a function that will pass its argument(s) to the first function; then will pass the result of that to the second function; finally returning the value returned by the last function. If any function returns a thennable, will chain the remaining function calls as `.then(nextFunction)` to make the async behavior transparent.

**Signature**

```javascript
pipe(...steps: Function | Array<Function | Array<Function>>): Function
```

* `steps`: each argument can be a function or an array of functions that will be flattened into a single array of steps (internally).
* _returns_: The pipeline function.

**Examples**

Saving a record to DynamoDB:

```javascript
const { pipe, curry } = require('@sullux/fp-light-function')
const dynamodb = new require('aws-sdk').DynamoDB()

const ddbParams = (record) => ({
  Item: {
    Title: { S: record.title },
    Artist: { S: record.artist },
    Data: { S: JSON.stringify(record) }
  },
  TableName: process.env.DDB_TABLE_NAME
})

const saveRecord = curry((ddb, params) =>
  ddb.putItem(params).promise())

const consumedCapacity = ({
  ConsumedCapacity: { TableName, WriteCapacityUnits }
}) => ({
  table: TableName,
  writeCapacityUnits: WriteCapacityUnits,
})

const debug = curry(console.log, 2)('DEBUG')

const saveToDynamo = pipe(
  ddbParams,
  saveRecord,
  consumedCapacity,
  debug
)

saveToDynamo({ title: 'Smells Like Teen Spirit', artist: 'Nirvana' })
  .then(() => console.log('done'))
```

**Copy/Paste**

```javascript
const flatten = values =>
  values.reduce((flattened, value) =>
    (Array.isArray(value)
      ? flattened.concat(flatten(value))
      : flattened.concat([value])), [])

const isThennable = value =>
  value && value.then && (typeof value.then === 'function')

const pipe = (...steps) => initialValue =>
  flatten(steps).reduce((value, step) => (step
    ? isThennable(value)
      ? value.then(step)
      : step(value)
    : value), initialValue)
```
