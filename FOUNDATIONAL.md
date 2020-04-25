# Foundational

## resolve

_Aliases: `(none)`_

_Description_

The `resolve` function is arguably the most important function in this library.
It is a curried function that accepts a _resolve predicate_ and an input value. A
_resolve predicate_ is one of:

* a function;
* an object that will be treated as an unordered list of key/value pairs where
  the values are themselves resolvables;
* an iterable that will be treated as an ordered list of resolvables;
* a literal value to pass through; or
* a promise resolving to any of the above.

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
