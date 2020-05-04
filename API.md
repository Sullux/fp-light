# API

## awaitAll

_Aliases: `(none)`_

_Description_

Given an iterable, waits for all promises to resolve and then resolves to an
array of the resolved values in original input order.

_Examples_

```javascript
const first = Promise.resolve(41)
const second = 42
const third = Promise.resolve(43)
awaitAll([first, second, third]) // [41, 42, 43]
```

## awaitAny

_Aliases: `(none)`_

_Description_

Given an iterable, waits for the first promise from that iterable to resolve.

_Examples_

```javascript
const first = awaitDelay(10).then(() => 41)
const second = 42
const third = Promise.resolve(43)
awaitAny([first, second, third]) // 42
```

## awaitDelay

_Aliases: `(none)`_

_Description_

Given a number of milliseconds, resolves after the milliseconds have elapsed.

_Examples_

```javascript
const first = awaitDelay(10).then(() => 41)
const second = Promise.resolve(42)
awaitAny([first, second]) // 42
awaitAll([first, second]) // [41, 42]
```

## compare

_Aliases: `(none)`_

_Description_

Compares two values returning `< 0` if the first value is less than the
second, `0` if the values are equal, and `> 0` if the first value is greater
than the second. When types do not match, comparison is done on type name.
For numbers, `NaN` is always greater than real numbers.

For errors, the type, code and message are compared while other properties
such as the stack trace are ignored. This allows errors to be equal if they
are identical except for stack trace or custom properties.

For functions, the function text is compared.

Arrays and objects are deep compared. Nested values are compared using all of
the above rules.

_Examples_

to do...
## comparer

_Aliases: `(none)`_

_Description_

A symbol to use to define a custom comparer function for an object.

_Examples_

```javascript
const compareColors = ({r: r1, g: g1, b: b1}, {r: r2, g: g2, b: b2}) =>
  (r1 - r2) || (g1 - g2) || (b1 - b2)

Color.prototype[comparer] = compareColors

const colors = [
  new Color(50, 40, 60),
  new Color(40, 50, 60),
  new Color(60, 50, 40),
]

console.log(colors.sort(compare))
// [
//   { r: 40, g: 50, b: 60 },
//   { r: 50, g: 40, b: 60 },
//   { r: 60, g: 50, b: 40 }
// ]
```

## compareTypes

_Aliases: `(none)`_

_Description_

Compares types returning `< 0`, `0` or `> 0`. The type name is used for the
comparison.

_Examples_

to do...
## constant

_Aliases: `$`, `always`, `just`, `scalar`_

_Description_

Given a value, returns a nullary function that will always return the original
value. NOTE: as a convenience, if multiple arguments are passed to this
function it will resort to the behavior of `tag()`; thus

```javascript
$`before ${_} after`
```
is identical to

```javascript
tag`before ${_} after`
```

_Examples_

```javascript
const meaning = constant('42')
meaning() // 42
meaning('foo') // 42
```

## equal

_Aliases: `deepEqual`, `eq`_

_Description_

Using the same rules as the `compare` function, compares two values and
returns true if the two values are comparable. This function is suitable for
deep equality.

_Examples_

to do...
## identity

_Aliases: `argument`, `_`_

_Description_

Given a value, returns that value. This is useful in cases where a resolvable
object needs to resolve the input into the output. This can also be useful in
cases where two logical branches must return a function, but where one branch
exhibits the "no change" logic (i.e. a function that returns the original
argument).

Additionally, `identity` proxies the property accessor such that an accessed
property returns a function that will retrieve that property from the given
argument. This means that `identity.foo` returns a function shaped like
`value => value.foo` and `identity[3]` returns a function shaped like
`value => value[3]`. Note that properties are resolved safely, meaning
`identity` will never throw on undefined.

_Examples_

This example demonstrates the branch-to-no-change logic. The `log` function
uses `identity` to pass logged values straight through to `console.log` while
the `logObject` function uses the JSON serializer.

```javascript
const logWith = serialize =>
  value =>
    console.log(serialize(value))

// log plain values
const log = logWith(identity)

// log serialized values
const logObject = logWith(JSON.stringify)
```

This example uses the `_` alias and the property accessor to mimic the
behavior of Scala's underscore operator.

```javascript
const area = multiply(_.x, _.y)

area({ x: 2, y: 3 }) // 6
```

This example shows how `identity` protects against accessing properties of
undefined values.

```javascript
const inners = map(_.nums[0])

inners([
  { nums: [42, 43] },
  {}, // this would throw if accessing literally with v => v.nums[0]
  { nums: [44] },
])
// [42, undefined, 44]
```

## is

_Aliases: `isExactly`, `same`, `strictEqual`_

_Description_

Determines strict equality. Same as `===` except returns true if both values
are `NaN`. This does not perform deep equality.

_Examples_

```javascript
is.$(Number('foo'), Number('bar')) // true
is.$(42, 42) // true
is.$({}, {}) // false
const x = {}
const y = x
is.$(x, y) // true
```

## isArray

_Aliases: `(none)`_

_Description_

Returns true if the value is an array.

_Examples_

to do...
## isAsync

_Aliases: `isPromise`, `isThennable`_

_Description_

Given any value, returns true if the value is thennable; otherwise, returns false.

_Examples_

```javascript
const asyncValue = Promise.resolve(42)
const value = 42
isAsync(value) // false
isAsync(asyncValue) // true
```

## isBoolean

_Aliases: `(none)`_

_Description_

Returns true if the value is a boolean.

_Examples_

to do...
## isDate

_Aliases: `(none)`_

_Description_

Returns true if the value is a date.

_Examples_

to do...
## isDefined

_Aliases: `exists`_

_Description_

Returns true if the value is neither `undefined` nor `null`.

_Examples_

to do...
## isError

_Aliases: `(none)`_

_Description_

Returns true if the value is an error.

_Examples_

to do...
## isExactType

_Aliases: `sameType`, `strictEqualType`_

_Description_

Given a type (constructor function) and a value, returns true if the value's
constructor is the given type.

_Examples_

```javascript
isExactType.$(Number, 3) // true
isExactType.$(String, 'foo') // true
isExactType.$(Object, { x: 42 }) // true
isExactType.$(Object, new Map()) // false
```

## isFalsy

_Aliases: `falsy`_

_Description_

Returns true if the value is `undefined`, `null`, `0`, `NaN`, `''` or `false`.

_Examples_

to do...
## isFunction

_Aliases: `(none)`_

_Description_

Returns true if the value is a function.

_Examples_

to do...
## isIterable

_Aliases: `(none)`_

_Description_

Returns true if the value is an iterable.

_Examples_

to do...
## isMap

_Aliases: `(none)`_

_Description_

Returns true if the value is a map.

_Examples_

to do...
## isMissing

_Aliases: `notExists`_

_Description_

Returns true if the value is `undefined` or `null`.

_Examples_

to do...
## isNull

_Aliases: `(none)`_

_Description_

Returns true if the value is `null`.

_Examples_

to do...
## isNumber

_Aliases: `(none)`_

_Description_

Returns true if the value is a number. Note that this returns false for the
value `NaN`.

_Examples_

to do...
## isObject

_Aliases: `(none)`_

_Description_

Returns true if the value is a plain object.

_Examples_

to do...
## isSet

_Aliases: `(none)`_

_Description_

Returns true if the value is a set.

_Examples_

to do...
## isString

_Aliases: `(none)`_

_Description_

Returns true if the value is a string.

_Examples_

to do...
## isSymbol

_Aliases: `(none)`_

_Description_

Returns true if the value is a symbol.

_Examples_

to do...
## isTruthy

_Aliases: `truthy`_

_Description_

Returns true if the value is not `undefined`, `null`, `0`, `NaN`, `''` or
`false`.

_Examples_

to do...
## isType

_Aliases: `(none)`_

_Description_

Given a type (constructor function) and a value, returns true if the value's
constructor is the given type or if the value is an instance of the type.

_Examples_

to do...
## isUndefined

_Aliases: `(none)`_

_Description_

Returns true if the value is `undefined`.

_Examples_

to do...
## pipe

_Aliases: `I`_

_Description_

Piping is the basis for the FP library. A pipe is a unary function (accepts
a single argument) that is composed of a sequence of other functions. When
called, the pipe passes the argument to its first function. The result of that
call is passed to the second function, etc. The result of the last function is
the return value of the pipe. For this documentation, we will refer to these
functions as "steps" in the pipe.

In addition to the vanilla form of piping described above, this pipe
implementation adds the additional feature of treating each step as a
callable (see [call]({{call}}) for more information). That means that instead
of a function, a step could be a string, array, object or any valid callable.

The other benefit of this pipe implementation is that since it is based on
[pipeWith]({{pipeWith}}), it will gracefully handle async values. If the input
argument to the pipe or to any step is a promise, the foundational pipe
infrastructure will wait for the promise to resolve before passing the
resolved value to the next step.

_Examples_

A simple pipe.

```javascript
const productOfIncrement = pipe(
  x => x + 1,
  x => x * 2,
)

productOfIncrement(3) // 8
```

A pipe with various callables. This is a no-frills but fully-working example.
Note that the two pipes include asynchronous steps, but that those steps will
be automagically awaited by the piping infrastructure.

```javascript
const { dynamoDB: { documentClient } } = require('@sullux/aws-sdk')()

const $tableName = $(process.env.TABLE_NAME)
const keyName = process.env.KEY_NAME

const getItem = pipe(
  { TableName: $tableName, Key: { [keyName]: _ } },
  documentClient.get,
  'Item',
)

const putItem = pipe(
  { TableName: $tableName, Item: _ },
  documentClient.put,
  'Attributes',
)

// test the above functions assuming the configured key name is "id"
const testIncrementValue = async (id) => {
  const item = await getItem(id)
  console.log(item) // { id: 'foo', value: 41 }
  await putItem({ ...item, value: item.value + 1 })
  const updatedItem = await getItem(id)
  console.log(updatedItem) // { id: 'foo', value: 42 }
  return updatedItem
}

testIncrementFooValue('foo')
```

This is a rewrite of the test function from the previous example. This
illustrates some of the benefits of declarative piping versus procedural code.
This example assumes that `keyName`, `getItem` and `putItem` are defined as in
the previous example.

```javascript
const testIncrementValue = pipe(
  getItem,
  tap(console.log), // { id: 'foo', value: 41 }
  { ..._, value: increment('value') },
  tap(putItem),
  f(getItem, keyName),
  tap(console.log), // { id: 'foo', value: 42 }
)
```

## reject

_Aliases: `(none)`_

_Description_

Given an error, returns a rejected promise for the error.

_Examples_

```javascript
const error = new Error('reasons')
const rejection = reject(error)
rejection.catch(caught => caught === error) // true
```

## resolve

_Aliases: `(none)`_

_Description_

The `resolve` function is arguably the most important function in this library.
It is a curried function that accepts a _resolve predicate_ and an input value. A
_resolve predicate_ is one of:

* a function;
* an object that will be treated as an unordered list of key/value pairs where
  the values are themselves resolvables;
* an iterable that will be treated as an ordered list of resolvables; or
* a literal value to pass through;

Additionally, a resolve predicate can include or return a promise or a value that
includes promises such as an array of promises or an object with a property
that is a promise.

_Examples_

```javascript
const setOnFoo = resolve({ foo: _ })

setOnFoo(42) // { foo: 42 }
setOnFoo()   // { foo: undefined }
```

These examples use a more complex value.

```javascript
const values = [
  { foo: 41 },
  { foo: 42 },
  { foo: 43 },
]

// extract the foo property of each element

values.map(resolve(_.foo))
// [41, 42, 43]

// remap the foo element to bar for each element

values.map(resolve({ bar: _.foo }))
// [
//   { bar: 41 },
//   { bar: 42 },
//   { bar: 43 },
// ]
```

This example includes promises.

```javascript
const values = [41, toAsync(42), 43]

const incrementedOnFoo = resolve({ foo: x => x + 1 })

const process = async () =>
  console.log(await values.map(incrementedOnFoo))

process()
// [
//   { foo: 42 },
//   { foo: 43 },
//   { foo: 44 },
// ]
```

## tag

_Aliases: `template`_

_Description_

Used as a tag for a template literal, returns a function that will resolve to
the interpolated string.

_Examples_

```javascript
pipe(
  tap(console.log),
  tag`first ${_.x} then ${_.y}`,
  tap(console.log),
)({ x: 'foo', y: 'bar' })
```

outputs:

```
{ x: 'foo', y: 'bar' }
first foo then bar
```

## toAsync

_Aliases: `toPromise`, `toThennable`_

_Description_

Given a value that may or may not be thennable, returns a thennable.

_Examples_

```javascript
const asyncValue = Promise.resolve(42)
const value = 42
toAsync(asyncValue).then(console.log) // 42
toAsync(value).then(console.log) // 42
isThennable(toAsync(value)) // true
```

## Undefined

_Aliases: `(none)`_

_Description_

A stand-in constructor for the value `undefined`.

_Examples_

to do...
## Undefined

_Aliases: `(none)`_

_Description_

A stand-in constructor for the value `null`.

_Examples_

to do...