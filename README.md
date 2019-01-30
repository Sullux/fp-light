# fp-light

This is a collection of lightweight utilities for javascript. Many of these utilities are made with functional programming in mind, but functional programming is not required.

## Philosophy

> As much as possible, a utility function should be able to be copy/pasted directly into another project rather than creating a new module dependency.

Too often, we add large dependencies for small pieces of functionality. The [left pad debacle](https://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/) exemplifies how problematic dependencies can be, and people are continually shocked by the [clutter of modern libraries](https://medium.com/s/silicon-satire/i-peeked-into-my-node-modules-directory-and-you-wont-believe-what-happened-next-b89f63d21558).

"But copying source into your own project adds maintainability debt." Yes, and this debt is _smaller_ than the debt of depending on another library. Additionally, debugging your application is easier when you can easily step through your dependencies or add `console.log` statements to them.

"But you are publishing to NPM too. Aren't you just another dependency?" Yes, and this is why a copy/paste option is a top priority. This is also why:

> Our published modules must NEVER have dependencies.

Every module stands alone. If we ever create a module for use with another package, we will indicate a peer dependency rather than unilaterally dumping that package into your `node_modules`. _Reduced coupling equals reduced complexity._

> Our code is only published when it has unit test coverage for 100% of statements, branches, functions and lines.

When integrating with the outside world, 100% test coverage is not an effective goal. Unit testing integration points requires a great deal of mocking and delivers no real value. These libraries, however, do not integrate with systems. This is utility code, which means 100% coverage is both realistic and necessary.

## Libraries

[function](function/README.md)

_more to come..._

## Contributing

_to do..._
