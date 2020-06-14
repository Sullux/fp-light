# Foundational

## appendedName

_Aliases: `(none)`_

_Description_

Given a function, returns the function with its name overridden. If no name is
given and the function has a `name` property, the original function is
returned. If the function has no `name` property and no name is given, the
name is overridden with the output of the `functionName` function.

_Examples_

to do...
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

## awaitArray

_Aliases: `(none)`_

_Description_

Given an iterable, deep awaits each value and then resolves to an array of the
resolved values in original input order.
```

_Examples_

to do...
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

## functionName

_Aliases: `(none)`_

_Description_

Given a function, returns a human-readable name. This is either the name
property of the function or the first line of its `toString()` value limited
to a maximum of 12 characters.

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

## named

_Aliases: `(none)`_

_Description_

Given a function, returns the function with its name overridden. If no name is
given and the function has a `name` property, the original function is
returned. If the function has no `name` property and no name is given, the
name is overridden with the output of the `functionName` function.

_Examples_

to do...
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
