**Home** | [Full API](https://github.com/Sullux/fp-light/blob/master/API.md)
| [Tutorial](https://github.com/Sullux/fp-light/blob/master/TUTORIAL.md)
| [Project Setup Guide](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE.md) ([CJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-CJS.md) / [MJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-MJS.md))

# fp-light

This is a functional programming library with a focus on point-free coding style
and abstracting the complexity of asynchronous programming. This library has no
dependencies, so adding it to your project does not introduce any bloat.

In This README:

* [Installation](#installation)
* [Basic Usage](#basic-usage)
* [Important Concepts](#important-concepts)
* [Development](#development)

Other Documentation:

* [Full API](https://github.com/Sullux/fp-light/blob/master/API.md)
* [Tutorial](https://github.com/Sullux/fp-light/blob/master/TUTORIAL.md)
* [Project Setup Guide](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE.md)

## Installation

```bash
npm i -P @sullux/fp-light
# or
yarn add @sullux/fp-light
```

## Basic Usage

There are three schools of thought for this library. Some will see it as a collection of helper functions and will prefer to require/import them one by one as needed, along the lines of:

```javascript
const { pipe, when } = require('@sullux/fp-light')
// or
import { pipe, when } from '@sullux/fp-light'

const download = pipe(
  when(foo, bar),
  // etc.
)
```

The upside to this is that the helper functions are directly usable in code with no prefix and each code file is directly portable to other projects. The downside is that in practice this adds a heavy development and maintenance burden.

The second school of thought still holds that these are helper functions, but prefers to eliminate the maintenance burden in favor of a readability cost. This is our least favorite option, but it may indeed work best for some people:

```javascript
const fp = require('@sullux/fp-light')
// or
import * as fp from '@sullux/fp-light'

const download = fp.pipe(
  fp.when(foo, bar),
  // etc.
)
```

The upsides to this are that each file is still directly portable to other projects and there is less development and maintenance burden. The downside is readability, as prefixes are a longstanding cause of readability problems in code. If the `with` statement was not deprecated, combining this pattern with `with(fp) { ... }` might make this the best of all three patterns; unfortunately, `with` is deprecated and we're stuck with prefixes.

The third school of thought is our preferred approach: we hold that the functions in this library are more like language elements than helper functions, and as with Javascript language elements, they should be global:

```javascript
// in index.js:
const fp = require('@sullux/fp-light')
// or
import * as fp from '@sullux/fp-light'
// make them global:
Object.assign(globalThis, fp)

// anywhere in this file or others:
const download = pipe(
  when(foo, bar),
  // etc.
)
```

This is another way to accomplish Option 1, but shifting the maintenance burden to the project level rather than the file level. To be clear, there is still some setup to be done, such as:

* adding the FP language elements to the linter as globals
* creating a workaround for the test runner since it does not usually enter the app in `index.js`
* adding documentation so that subsequent development and maintenance personnel are not confused

We have created this guide to help with this setup process:

[Guide To Globalizing The FP Language Elements](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE.md)

Regarding complete documentation, the full [API](https://github.com/Sullux/fp-light/blob/master/API.md) includes all exports from this library. There are a lot of them. Organizing them into something other than an alphabetical encyclopedia of exports is on our to-do list, but for now, that's what we have.

## Important Concepts

The single most important concept for understanding this library is to understand that most of these functions do not do what they say; instead, they _compile a new function that will do what they say when called_. Here is a simple example you can run in the REPL (assuming you have the FP library installed locally):

```javascript
Object.assign(globalThis, require('@sullux/fp-light'))
const assert = require('assert')
const answer = add(1, 2)
assert(answer !== 3)
assert((typeof answer) === 'function')
const actualAnswer = answer()
assert(actualAnswer === 3)
```

Note that `add(1, 2)` does NOT return a number; it returns a _function_. When a function behaves like this here in FP Light Land we refer to it as a _compilable_ function. Maybe that's not the best name, but that's what we've got: the `add` function is a compilable function.

The big question on your mind at this point might be...why???

To answer that, let's look at the `pipe` function. Pipe is one of the most common utility functions and can be found in almost all language productivity libraries (functional or otherwise) including lodash, Ramda, etc. Here is an example of a simple pipe as it might work in any of these libraries (we've skipped some imports here for brevity):

```javascript
const s3ToLocal = pipe(
  (key) => ({ Bucket: MY_BUCKET, Key: key }),
  s3.getObject,
  (result) => result.then(({ Body, ETag }) => saveFile(ETag, Body)),
)
```

Notice that the result of the `pipe` function is another function. In a sense, all `pipe` does is use each step we've gien it to compile the _actual_ `s3ToLocal` function. The `pipe` function is compilable! It compiles the actual `s3ToLocal` function!

Now lets look at that same function, but using the FP Light library the way it is intended to be used:

```javascript
const s3ToLocal = pipe(
  { Bucket: MY_BUCKET, Key: _ },
  s3.getObject, // not compilable: we're handing the function to the pipe
  writeFile(_.ETag, _.Body), // compilable: we're handing back a new function!
)
```

We've already seen why `pipe` is compilable: it compiles a number of steps into a single function call. In the above example, consider the `writeFile` at the end. Saving the file is supposed to be the last step in the pipe, so we can't actually _call_ it there on line 4. Instead, that call _compiles_ a final function, and then that final function is being passed to the pipe. Also note that `s3.getObject` is not being called here because it is not compilable! It is just a plain old function and must be passed to the pipe verbatim.

Here's the fully-working example with all the appropriate imports, and we've even gone one better and made `s3.getObject` compilable too:

```javascript
const { writeFile: writeFileLegacy } = require('node:fs/promises')
const { s3 } = require('@sullux/aws-sdk')()
const MY_BUCKET = 'foo'

const writeFile = compilable(writeFileLegacy, { count: 2 })
const getObject = compilable(s3.getObject, { count: 1 })

const s3ToLocal = pipe(
  getObject({ Bucket: MY_BUCKET, Key: _ }),
  writeFile(_.ETag, _.Body),
)

// usage: s3ToLocal('myCoolKey')

module.exports = { s3ToLocal }
```

This example is fully-working. Using your own bucket and key on your own AWS account you should be able to run this code yourself. The use of the underscore to represent the incoming argument was borrowed from Scala, and is discussed in more detail under its proper name [identity](https://github.com/Sullux/fp-light/blob/master/API.md#identity).

If you are interested, continue the journey in the [full tutorial](https://github.com/Sullux/fp-light/blob/master/TUTORIAL.md).

## Development

Please use your best judgement. We all know how this works. If you submit a PR, please make sure the build succeeds and the tests pass. Please ensure that your changes are properly unit tested where relevant and please include updated documentation as necessary.
