# fp-light (WIP)

This is a collection of lightweight utilities for javascript. Many of these utilities are made with functional programming in mind, but functional programming is not required.

## Functions

This is a library of functions. Each function is a [pure function](https://en.wikipedia.org/wiki/Pure_function), and no function has any dependencies. To install the whole library:

```bash
npm install --save @sullux/fp-light
# or
yarn add @sullux/fp-light
```

If you only want a subset of functions, each function can be installed individually. For example, if you only want the `pipe` and `map` functions, use this:

```bash
npm install --save @sullux/fp-light-pipe
npm install --save @sullux/fp-light-map
# or
yarn add @sullux/fp-light-pipe
yarn add @sullux/fp-light-map
```
Every function in this library is safe to use by itself. None of these functions has dependencies of any sort. Every library -- including the complete `fp-light` library -- is 100% unit tested and is published as a single, minified source file.

| Function | Description |
| -------- | ----------- |
| [always](https://github.com/Sullux/fp-light/tree/master/lib/always) | The always utility wraps a static value in a function. While simple as far as utilities go, it can add readability to functional code. |
| [call](https://github.com/Sullux/fp-light/tree/master/lib/call) | The purpose of the `call` helper is to allow the function to be passed as the most significant argument. |
| [collect](https://github.com/Sullux/fp-light/tree/master/lib/collect) | The collect utility creates a function that accepts _n_ arguments and passes them to the wrapped function in a single array argument. |
| [compose](https://github.com/Sullux/fp-light/tree/master/lib/compose) | Compose has different meanings for objects than for functions. Functional composition is the inverse of [piping](../pipe/README.md). Object composition is the recursive combination of the fields of multiple input objects into a single output object. |
| [concat](https://github.com/Sullux/fp-light/tree/master/lib/concat) | Concatenates values into a single iterable. |
| [curry](https://github.com/Sullux/fp-light/tree/master/lib/curry) | To _curry_ a function is to make it so that arguments can be progressively applied. |
| [filter](https://github.com/Sullux/fp-light/tree/master/lib/filter) | The filter function works similarly to the built in `Array.prototype.filter` function except that the iterable is the most significant (last) argument. |
| [get](https://github.com/Sullux/fp-light/tree/master/lib/get) | The purpose of the `get` helper is to |
| [hash](https://github.com/Sullux/fp-light/tree/master/lib/hash) | This is a quick hashing algorithm for use in hash maps and other implementations that demand deterministic but well-distributed values based on not-well-distributed input values. |
| [map](https://github.com/Sullux/fp-light/tree/master/lib/map) | Similar to the [built-in Javascript function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) `Array.prototype.map`, but accepts the iterable as the second argument. |
| [memoize](https://github.com/Sullux/fp-light/tree/master/lib/memoize) | Memoization is the caching of results for a given set of arguments. Memoization is useful for pure functions that have a high computational cost or asynchronous latency. |
| [pipe](https://github.com/Sullux/fp-light/tree/master/lib/pipe) | A pipe is a function comprised of a sequence of functions where the initial argument is passed to the first function, the result of that is passed to the second function and so on, and where the final result is the return value of the last function in the sequence. |
| [range](https://github.com/Sullux/fp-light/tree/master/lib/range) | Creates an iterable of integers spanning the given range. This can be a good way to functionally implement _next n items_ logic or _repeat n times_ logic. |
| [reduce](https://github.com/Sullux/fp-light/tree/master/lib/reduce) | Similar to the [built-in Javascript function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) `Array.prototype.reduce`, but accepts the iterable as the last argument. |
| [skip](https://github.com/Sullux/fp-light/tree/master/lib/skip) | Creates an iterable that skips the first _n_ items of the given iterable. |
| [slice](https://github.com/Sullux/fp-light/tree/master/lib/slice) | Creates an iterable that starts at the _start_ item and ends at the _end_ item (inclusive) of the given iterable. |
| [spread](https://github.com/Sullux/fp-light/tree/master/lib/spread) | The spread utility creates a function that accepts an array and spreads the array elements as arguments to the wrapped function. |
| [take](https://github.com/Sullux/fp-light/tree/master/lib/take) | Creates an iterable that takes the first _n_ items of the given iterable. |
| [trap](https://github.com/Sullux/fp-light/tree/master/lib/trap) | The trap helper allows for a more functional approach to error handling. |
| [type](https://github.com/Sullux/fp-light/tree/master/lib/type) | The `type` function supplements the scattered and inconsistent type-related functionality in Javascript. This includes supplying proper factory functions for `undefined` and `null`, the only values in Javascript that are missing a native factory. This also includes a utility to define new types in a consistent way. |

## Philosophy

> A utility should be able to be copy/pasted directly into another project rather than creating a new module dependency.

Too often, we add large dependencies for small pieces of functionality. The [left pad debacle](https://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/) exemplifies how problematic dependencies can be, and people are continually shocked by the [clutter of modern libraries](https://medium.com/s/silicon-satire/i-peeked-into-my-node-modules-directory-and-you-wont-believe-what-happened-next-b89f63d21558).

"But copying source into your own project adds maintainability debt." Yes, and this debt is often _smaller_ than the debt of depending on another library. Additionally, debugging your application is easier when you can easily step through your dependencies or add `console.log` statements to them.

"But you are publishing to NPM too. Aren't you just another dependency?" Yes, and this is why a copy/paste option is a top priority. This is also why:

> Our published modules must NEVER have dependencies.

Every module stands alone. If we ever create a module for use with another package, we will indicate a peer dependency rather than unilaterally dumping that package into your `node_modules`. _Reduced coupling equals reduced complexity._ Our modules don't even depend on each other: every source file can be copy/pasted directly into your code. No exceptions.

> Our code is only published when it has unit test coverage for 100% of statements, branches, functions and lines.

When integrating with external systems, 100% test coverage is not an effective goal. Unit testing integration points requires a great deal of mocking and delivers little value. The FP libraries, however, do not integrate with real-world systems. This is utility code, which means 100% coverage is both realistic and necessary.

## Contributing

_to do..._
