[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-memoize

`npm i @sullux/fp-light-memoize`
[source](https://github.com/Sullux/fp-light/blob/master/lib/memoize/memoize.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/memoize/memoize.spec.js)

Memoization is the caching of results for a given set of arguments. Memoization is useful for pure functions that have a high computational cost or asynchronous latency.

* [memoize](#memoize)
* [defaultMemoizeArgsEqual](#defaultmemoizeargsequal)

### memoize

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

### defaultMemoizeArgsEqual

`defaultMemoizeArgsEqual(leftArgs: Array<any>, rightArgs: Array<any>): boolean`

This is the default equality test for `memoize`. This is a shallow test that compares the argument count and shallow equality of each argument using `Oject.is`. A custom implementation might choose deep equality to enable interface equality over reference equality, for example.
