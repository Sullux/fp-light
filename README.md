# fp-light (WIP)

This is a collection of lightweight utilities for javascript. Many of these utilities are made with functional programming in mind, but functional programming is not required.

This is also a work in progress. Version 1.0.0 should be available by 2019-02-25.

## Libraries

_Coming soon: an all-in-one library to be installed with `npm i @sullux/fp-light`. For now, each module is installed separately._

### Compose
[Documentation](https://github.com/Sullux/fp-light/blob/master/lib/compose/README.md)
```bash
npm i --save @sullux/fp-light-compose
yarn add @sullux/fp-light-compose
```
Provides both async-aware functional composition and immutable, deep object composition.

### Curry
[Documentation](https://github.com/Sullux/fp-light/blob/master/lib/curry/README.md)
```bash
npm i --save @sullux/fp-light-curry
yarn add @sullux/fp-light-curry
```
A utility to create a curried wrapper for any function.

### Hash
[Documentation](https://github.com/Sullux/fp-light/blob/master/lib/hash/README.md)
```bash
npm i --save @sullux/fp-light-hash
yarn add @sullux/fp-light-hash
```
A simple hash implementation suitable for deterministic, highly distributed key generation. NOT SUITABLE FOR CRYPTOGRAPHIC FUNCTIONS.

### Memoize
[Documentation](https://github.com/Sullux/fp-light/blob/master/lib/memoize/README.md)
```bash
npm i --save @sullux/fp-light-memoize
yarn add @sullux/fp-light-memoize
```
A memoizer for any function. Memoization caches function results for a given set of arguments.

### Pipe
[Documentation](https://github.com/Sullux/fp-light/blob/master/lib/pipe/README.md)
```bash
npm i --save @sullux/fp-light-pipe
yarn add @sullux/fp-light-pipe
```
An async-aware pipe implementation.

### Type
[Documentation](https://github.com/Sullux/fp-light/blob/master/lib/type/README.md)
```bash
npm i --save @sullux/fp-light-type
yarn add @sullux/fp-light-type
```
Provides supplemental type information such as constructor name, factory function, prototype heirarchy, type equality testing, etc.

_more to come..._

## Philosophy

> A utility should be able to be copy/pasted directly into another project rather than creating a new module dependency.

Too often, we add large dependencies for small pieces of functionality. The [left pad debacle](https://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/) exemplifies how problematic dependencies can be, and people are continually shocked by the [clutter of modern libraries](https://medium.com/s/silicon-satire/i-peeked-into-my-node-modules-directory-and-you-wont-believe-what-happened-next-b89f63d21558).

"But copying source into your own project adds maintainability debt." Yes, and this debt is _smaller_ than the debt of depending on another library. Additionally, debugging your application is easier when you can easily step through your dependencies or add `console.log` statements to them.

"But you are publishing to NPM too. Aren't you just another dependency?" Yes, and this is why a copy/paste option is a top priority. This is also why:

> Our published modules must NEVER have dependencies.

Every module stands alone. If we ever create a module for use with another package, we will indicate a peer dependency rather than unilaterally dumping that package into your `node_modules`. _Reduced coupling equals reduced complexity._ Our modules don't even depend on each other: every source file can be copy/pasted directly into your code. No exceptions.

> Our code is only published when it has unit test coverage for 100% of statements, branches, functions and lines.

When integrating with the outside world, 100% test coverage is not an effective goal. Unit testing integration points requires a great deal of mocking and delivers little value. The FP libraries, however, do not integrate with real-world systems. This is utility code, which means 100% coverage is both realistic and necessary.

## Contributing

_to do..._
