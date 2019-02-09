[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-curry

`npm i @sullux/fp-light-curry`
[source](https://github.com/Sullux/fp-light/blob/master/lib/curry/curry.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/curry/curry.spec.js)

To _curry_ a function is to make it so that arguments can be progressively applied.

* [curry](#curry)

The following example demonstrates an uncurried function versus a manually curried function.

```javascript
const uncurriedAdd = (x, y) => x + y
uncurriedAdd(1, 2) // 3
uncurriedAdd(1) // NaN

const add = x => y => x + y
add(1)(2) // 3
add(1) // function
const increment = add(1)
increment(2) // 3
```

### curry

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
