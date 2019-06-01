[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-resolve

`npm i @sullux/fp-light-resolve`  
[source](https://github.com/Sullux/fp-light/blob/master/lib/resolve/resolve.js)  
[test](https://github.com/Sullux/fp-light/blob/master/lib/resolve/resolve.spec.js)

Deeply resolves all functions and promises.

* [resolve](#resolve)

### resolve

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
