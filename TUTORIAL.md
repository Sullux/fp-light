[Home](https://github.com/Sullux/fp-light/blob/master/README.md) | [Full API](https://github.com/Sullux/fp-light/blob/master/API.md)
| **Tutorial**
| [Project Setup Guide](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE.md) ([CJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-CJS.md) / [MJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-MJS.md))

# Tutorial

* [The Lowly Pipe](#the-lowly-pipe)
* [Compilables for Dummies](#compilables-for-dummies)
* [We Can't Underscore This Enough](#we-can-t-underscore-this-enough)
* [Testing My Resolve](#testing-my-resolve)
* [Betting The Spread](#betting-the-spread)
* [Seeing Dollar Signs](#seeing-dollar-signs)
* [Reading Comprehension](#reading-comprehension)
* [Pales By Comparison](#pales-by-comparison)
* [Wrapping Up](#wrapping-up)

## The Lowly Pipe

The easiest place to start the FP Light library is with the [pipe](https://github.com/Sullux/fp-light/blob/master/API.md#pipe). Most language helper libraries have a `pipe` function (lodash, Ramda, etc.) and they mostly work the same way: you give it a list of functions and it gives you back a new function that will call everything in your list one by one, each time passing the result of the previous call as the argument to the next call. Here's a simple example:

```javascript
const incrementAndDouble = pipe(
  (x) => x + 1,
  (x) => x * 2,
)

assert(incrementAndDouble(20) === 42)
```

We created a pipe that will add 1 to the first argument and then multiply the result by 2. When we call our function with 20, we get 42.

There is a very important concept to surface here at the beginning: the `pipe` function is not a normal function. It is a function that compiles to a new function. When we called `pipe`, we gave it a list of steps and it gave us back our `incrementAndDouble` function. Here in FP Light Land, we like to say that the pipe _compiled_ our named function.

So how does this differ from all the other `pipe` functions? It differs in a few very significant ways. First, our pipe can intrinsically handle promises. (NOTE: we will use "async values" and "promises" interchangeably because they are the same thing.)

```javascript
// their pipe:
const incrementAndDoubleFail = lodash.pipe(
  async (x) => x + 1,
  async (x) => x * 2,
)

assert(incrementAndDouble(20) === 42) // Promise(NaN) !== 42
```

What went wrong? Well, unfortunately, the second step can never work becase `x` is not a number; it is a _promise_ to a number. When the pipe calls `(x) => x * 2`, it is passing the result of the previous step. Unfortunately, the previous step returned a promise, so we get the dreaded `NaN`. How could we fix it?

```javascript
// their pipe:
const incrementAndDoubleFail = lodash.pipe(
  async (x) => x + 1,
  async (x) => (await x) * 2,
)

assert((await incrementAndDouble(20)) === 42) // OK
```

This should fix the problem, but we don't like it. We are now changing the implementation of the 2nd function because of the first function, and in that case, why are we using a pipe at all? The whole purpose of the pipe is to allow each step to be a separate concern.

Enter the FP Light pipe:

```javascript
// our pipe:
const incrementAndDouble = pipe(
  async (x) => x + 1,
  async (x) => x * 2,
)

assert((await incrementAndDouble(20)) === 42) // OK
```

No fuss. The FP Light pipe will internally await promises before calling the next function. Problem solved.

Next, let's start making this more useful.

```javascript
const add = (x, y) => x + y
const double = (x) => x * 2

const incrementAndDouble = pipe(
  (x) => add(x, 1),
  double,
)

assert(incrementAndDouble(20) === 42) // OK
```

The abstraction is kind of nice. The second step of the pipe is very clear. Unfortunately, the first step is a little ugly. This is because we have a function that takes more than a single argument.

_If our function accepts more than one argument, it would be more convenient for it to compile a new function._

The ideal would be, instead of the awkward `(x) => add(x, 1)`, for us to just pass `add(1)` to the pipe. We can't do it with our original implementation though. We'd need something like this:

```javascript
const add = (x) => (y) => x + y
const double = (x) => x * 2

const incrementAndDouble = pipe(
  add(1),
  double,
)

assert(incrementAndDouble(20) === 42) // OK
```

Much nicer. The problem is that now the `add` function can _only_ be called one argument at a time. We can no longer call it like `add(1, 2)`.

The age-old solution to this problem is called currying. We don't like to use a lot of functional programming jargon, so we don't talk about currying very much, but the idea behind currying is that each time you call a function you apply one or more arguments until you've git it all the arguments it wants, at which point it executes and gives you a result. This would work for our situation:

```javascript
const add = curry((x, y) => x + y)
const double = (x) => x * 2

const incrementAndDouble = pipe(
  add(1),
  double,
)

assert(incrementAndDouble(20) === 42) // OK
```

This works, and our `add` function can alterantely be called with both arguments at the same time. This is the best of all worlds.

## Compilables for Dummies

As we saw in the last chapter, our pipe is good at working with single arguments. If we want more than a single argument, however, we will probably need to package it up in an array or an object. Consider this example:

```javascript
const F2_TO_M2 = 0.092903

const areaInM2 = pipe(
  ({ x, y }) => x * y, // computes the area in square feet
  (x) => x * F2_TO_M2, // converts square feet to square meters
)

const input = { x: 20, y: 30 }
assert(areaInM2(input) === 55.7418) // OK
```

We can create a `mul` function along the lines of `(x, y) => x * y`. We can even curry it so that we can compile a multiplication by the constant `F2_TO_M2` for the second step of the pipe. We can't fix the problem of pulling values from an object though. Here's the problem:

```javascript
const mul = curry((x, y) => x * y)

const areaInM2 = pipe(
  ({ x, y }) => mul(x, y), // any way to clean this up?
  mul(F2_TO_M2),
)
```

It is time to introduce the first real magic of this library. The pipe that can handle promises is good, but it's not magic. More like...slight of hand. The _identity_ function, on the other hand, is actual magic. It is implemented as `identity`, but it has a more useful alias: `_`.

The `_`, which we'll just call _identity_ from now on, is a function that returns the incoming argument. That sounds about as useful as an altimeter on an automobile, but just wait. We're going to give this car some wings.

```javascript
const mul = compilable((x, y) => x * y)

const areaInM2 = pipe(
  mul(_.x, _.y),
  mul(F2_TO_M2),
)
```

Hot take: this is very readable. We can see that we're multiplying the `x` and `y` properties of the incoming object, and then we can see that we're multiplying the result by a constant on the next step of the pipe.

But how? And what is that _compilable_ thing that we're using instead of `curry`?

We've talked already about how some functions, like the pipe, don't actually do work when you first call them. Instead, they compile a new function that will do the work when it gets its missing arguments. That's kind of what currying means too: our curried `add` function from the previous chapter just returned a new function if we called it with a single argument. It _compiled_ another add function that was pre-loaded with the first argument.

The `compilable` function goes way further than `curry`. In addition to currying, compilable will also examine arguments to see if they are functions. If they are, they will be put on the list to be called _before_ the final logic is executed.

Let's break this down.

```javascript
const aFuncThatReturns2 = (ignored) => {
  console.log('just got called with ', ignored)
  return 2 // this is what they'll get back
}

const mul = compilable((x, y) => x * y)

const double = mul(aFuncThatReturns2)

assert(double(21) === 42) // OK
// console: just got called with 21
```

This is weird, but please stay with us. Notice that when we call the `mul` function we are passing it another function. The `mul` function is _compiling_ our `double` function. When our `double` function finally gets called with `21`, the first thing it does is passes `21` to `aFuncThatReturns2`. From that, it gets back an answer: `2`. Then the `double` function passes `2` and `21` to the `mul` implementation.

This is a lot like the pipe: the compiler is going to get values back from all the little functions and then pass those values to the underlying implementation at call time.

_Almost all functions in the FP Light library, including `pipe`, are compilable._

Now that we've talked about how we can pass functions to functions and the compiler will resolve them all, let's take a closer look at that magical `identity` underscore.

## We Can't Underscore This Enough

The `identity` function, or `_`, doesn't do much on its own.

```javascript
assert(identity(42) === _(42) === 42) // OK
```

What good is a function that just returns whatever it has been handed? Well, we'll come to that. First, though, let's see some more interesting things.

```javascript
const data = {
  foo: 42
}

assert(_.foo(data) === 42) // OK
```

This is already more interesting. If `_` just returns whatever it has been handed, it seems that `_.foo` is a different function that will return the `foo` property of whatever it gets handed. That's...handy.

```javascript
const F_TO_M = 0.3048

const widthInMeters = pipe(
  _.x,
  mul(F_TO_M)
)

const dimensions = { x: 50, y: 30 }
assert(widthInMeters(dimensions) === 15.24) // OK
```

Notice that in the first step of the pipe, we are giving the pipe a function that retrieves the `x` property of whatever it gets passed, and in the second step we are multiplying it by the constant. We are already seeing some of the readability benefits of the identity.

But while the pipe is easy to reason about because we always think of it as taking functions and compiling them into a pipeline, remember that the `mul` function is also compilable. That means it will compile its arguments (even if they are functions) into a final logic as well. That means we don't even need a pipe here.

```javascript
const F_TO_M = 0.3048

const widthInMeters = mul(_.x, F_TO_M)

const dimensions = { x: 50, y: 30 }
assert(widthInMeters(dimensions) === 15.24) // OK
```

Identity also works with array offsets:

```javascript
const F_TO_M = 0.3048

const widthInMeters = mul(_[0], F_TO_M)

const dimensions = [50, 30]
assert(widthInMeters(dimensions) === 15.24) // OK
```

Note the `mul` function is now being passed an identity function of `_[0]`.

Are you starting to see how useful that identity function can be? You don't even need to stick to FP Light constructs. Identity is great in vanilla comprehensions:

```javascript
const dimensions = [
  { x: 20, y: 30 },
  { x: 27, y: 15 },
  { x: 42, y: 75 },
]

const actual = dimensions.map(_.x) // vanilla js map
const expected = [20, 27, 42]
assert(equal.$(expected, actual))
```

See how we're using the built-in js `map` function and passing it an identity function?

_What's that weird dollar sign doing in there? Well, that's because the `equal` function is compilable. If you want to call the underlying implementation of a compilable function, just call its `$` property. It's useful in exactly this sort of instance. Also useful in unit testing your compilable functions._

## Testing My Resolve

One of the challenges of compilables is that they need every argument to be a function. That puts us in an awkward position when some of our arguments are numbers, strings, objects or arrays. Consider this thought experiment:

```javascript
// here's kind of what a compilable looks like spelled out:
const add = (x, y) =>
  (arg) =>
    x(arg) + y(arg)

const addFooAndBar = add(_.foo, _.bar)
console.log(addFooAndBar({ foo: 40, bar: 2 }))
// 42
```

This is a useful thought experiment for understanding compilables. You can see that `add` is a two-step function: the first time we call it we pass two functions (`x` and `y`) and it gives us back a new function. When we call that new function it applies its argument to `x` and `y`, adds the results and gives us back a final answer.

This is all good and well, but what happens when one of our arguments is not a function?

```javascript
const add = (x, y) =>
  (arg) =>
    x(arg) + y(arg)

const add2ToFoo = add(_.foo, 2)
console.log(add2ToFoo({ foo: 40 }))
// Uncaught TypeError: y is not a function
```

We could fix this by passing an anonymous function instead of the literal `2` i.e. `add(_.foo, () => 2)`, but that costs time and readability. Enter the concept of `resolve`.

The `resolve` function intelligently turns everything into a function. Here are some examples of what we get when we resolve various types of values:

| Resolve | Equivalent Compiled Result |
|---|---|
| `resolve(true)` | `() => true` |
| `resolve(2)` | `() => 2` |
| `resolve('foo')` | `() => 'foo'` |
| `resolve(console.log)` | `console.log` |
| `resolve({ foo: _ })` | `(arg) => ({ foo: _(arg) })` |
| `resolve([_.x, _.y])` | `(arg) => ([_.x(arg), _.y(arg)])` |
| `resolve({ foo: [_.x, _.y] })` | `(arg) => ({ foo: [_.x(arg), _.y(arg)] })` |

This starts to get a little thick to read, so here it is spelled out in plain english:

| Given | We Get This |
|---|---|
| A function | The function. Unchanged. |
| A primitive | A function that returns the primitive (string, number, boolean, etc.). |
| A plain object | A function that recursively applies `resolve` to each property of the object. |
| An array | A function that recursively applies `resolve` to each element of the array. |

Let's go back to our example before that errored out, but this time let's use `resolve` on each of the arguments.

```javascript
const add = (x, y) => {
  const rx = resolve(x)
  const ry = resolve(y)
  return (arg) =>
    rx(arg) + ry(arg)
}

const add2ToFoo = add(_.foo, 2)
console.log(add2ToFoo({ foo: 40 }))
// 42
```

This is a critically important concept in this library, so it may be worth re-reading the above example. Notice that we are now resolving (intelligently creating functions out of) our two arguments. Because `resolve` will turn the number `2` into `() => 2`, our code doesn't blow up anymore.

Of course, this looks like a lot of work to do every time. Our code would end up peppered with calls to `resolve` if we coded like this, and that harms readability. Luckily, we almost never have to use the `resolve` function ourselves, and here's why:

_All compilable function arguments are resolved during compilation._

The power of this pattern cannot be overstated. Since all arguments are passed to `resolve` under the hood, it means we don't even need to pass functions to our pipes: we can pass objects and arrays as well. Consider this:

```javascript
const MY_BUCKET = 'foo'

const s3ToLocal = pipe(
  { Bucket: MY_BUCKET, Key: _ },
  s3.getObject,
  aside(writeFile(_.ETag, _.Body)),
  { fileName: _.ETag },
)
// usage:
// const { fileName } = await s3ToLocal('my-cool-key')
```

Notice how there are objects in our pipe? Pipe is compilable; therefore, each step in the pipe is passed to `resolve` under the hood. What do we get when we resolve an object? We get a function that recursively resolves each property of the function. Here's the above pipe in plain English:

1. Create an object with `Bucket` set to my constant and `Key` set to the incoming argument.
1. Pass the object to the `s3.getObject` function.
1. Write the file to disk using the `ETag` of the result for the file name and the `Body` of the result for the file contents, then return the same object I got at the beginning of this step (that's what `aside` does: ignores the result and returns the one from the previous step; useful for logging and other side effects).
1. Return an object with `fileName` set to the `ETag` of the previous result.

Could we make the above pipe even cleaner? Yes, by making the `getObject` call compilable. Since it is not compilable, we have to call it in two steps: step one, build the object; step 2, call the function. If it was compilable, we could use a single step like `getObject({ Bucket: MY_BUCKET, Key: _ })`. Let's play with that idea. Here's a code-complete example that you can use yourself. All you have to do is set your proper AWS bucket name and object key.

```javascript
const { writeFile: writeFileLegacy } = require('node:fs/promises')
const { s3 } = require('@sullux/aws-sdk')()
const MY_BUCKET = 'foo'

const writeFile = compilable(writeFileLegacy, { count: 2 })
const getObject = compilable(s3.getObject, { count: 1 })

const s3ToLocal = pipe(
  getObject({ Bucket: MY_BUCKET, Key: _ }),
  aside(writeFile(_.ETag, _.Body)),
  { fileName: _.ETag },
)

module.exports = { s3ToLocal }
```

Since the resolves that are happening in the compile step are recursive, the FP Light library intrinsically supports composition. In this case we moved the object resolution into the `getObject` call, and we can keep nesting functions all day.

There is one thing happening in this example that we have thusfar glossed over: asynchronous resolution. You may have noticed that two of the above functions return promises (`getObject` and `writeFile`). This is the final important point about resolution and compilability:

_Resolves and compilables are automatically async-aware._

You can try to trick it all you want, but the `resolve` function will not be confused by promises. Here are some general principles:

* When resolving an object, all async properties will be resolved concurrently (i.e. with `Promise.all()`).
* When resolving an array, all async properties are chained to resolve in order (i.e. with `.then()`).

Here are some examples that illustrate how different types of values resolve:

```javascript
resolve({ foo: getObject('foo'), bar: getObject('bar') })
// equivalent to:
async (arg) => {
  // process in parallel
  const [foo, bar] = await Promise.all([
    getObject('foo')(arg),
    getObject('bar')(arg),
  ])
  return { foo, bar }
}

resolve([getObject('foo'), getObject('bar')])
// equivalent to:
async (arg) => {
  // wait for foo to finish before bar begins
  const foo = await getObject('foo')(arg)
  const bar = await getObject('bar')(arg)
  return [foo, bar]
}
```

We will not go into a lesson on paralellism in Javascript except to point out that there is a major performance difference between the two patterns (whether you are using FP Light or not). Awaiting each in turn (the second example) will generally take twice as long as running them in parallel (the first example).

We will revisit paralellism in the comprehension section of this tutorial.

## Betting The Spread

Now that we have a handle on resolution, it is time to revisit some additional features of `identity`, our friendly neighborhood underscore. Let's go back to our S3 object download. In our earlier iteration we were using the ETag as the file name. In reality, we may prefer to use the key. Consider this snippet:

```javascript
const s3ToLocal = pipe(
  {
    object: getObject({ Bucket: MY_BUCKET, Key: _ }),
    key: _,
  },
  aside(writeFile(_.key, _.object.Body)),
  { fileName: _.key },
)
```

So far, so good. In the first step we're still downloading the object, but we're also preserving the key so that we can use it later instead of the ETag. This is mostly fine. My only complaint is that we're holding onto the entire response from `getObject` when we really only need the object body. Luckily, there is an easy solution:

_All resolved and compiled functions are also identities._

This is the rewritten function:

```javascript
const s3ToLocal = pipe(
  {
    object: getObject({ Bucket: MY_BUCKET, Key: _ }).Body, // <-- here!
    key: _,
  },
  aside(writeFile(_.key, _.object)),
  { fileName: _.key },
)
```

Because `getObject` is compilable, it returns a compiled function. That compiled function can be treated like the identity function. Here is roughly how the above would compile:

```javascript
// getObject({ Bucket: MY_BUCKET, Key: _ }).Body
// compiles to this:
async (arg) => {
  const result = await getObject({ Bucket: MY_BUCKET, Key: arg })
  return result.Body
}
```

It also might be useful to think of it like this:

```javascript
// getObject({ Bucket: MY_BUCKET, Key: _ }).Body
// is equivalent to this:
pipe(
  getObject({ Bucket: MY_BUCKET, Key: _ }),
  _.Body,
)
```

Just like resolved/compiled functions, identity is async-aware so it will await the result before returning a property of the result. And just like the bare identity function, resolved/compiled functions support array index notation, chaining, etc.

This is all well and good, but what does this chapter have to do with spreading? Now that we've talked through identity, resolution and compilation a bit, we can finally return to arguably the most powerful feature of the identity: the ability to spread it. Consider this:

```javascript
const s3ToLocal = pipe(
  { Bucket: MY_BUCKET, Key: _ },
  { ..._, ...getObject(_) },
  aside(writeFile(_.Key, _.Body)),
  { fileName: _.Key },
)
```

You may be thinking that this is a misprint. One can't spread a function -- Javascript give us anything useful. We can try it in the REPL with `const x = { ...(() => {}) }`, but that just gives us an empty object. So what's happening here?

_Magic._

Feel free to play around in the source code. If you can figure it out, more power to you. We wrote the thing and we're not even sure _we_ really understand it. But it works!

## Seeing Dollar Signs

The dollar sign has three uses in the FP Light library. First, it is a property available on compilables, where it refers to the underlying implementation.

```javascript
const underlyingAdd = (x, y) => x + y
const add = compilable(underlyingAdd)

assert((typeof add(1, 2)) === 'function') // OK
assert(add.$(1, 2) === 3) // OK
assert(add.$ === underlyingAdd) // OK
```

Second, it is the _literal_ operator. If you play with nested value resolution you will see how sometimes we need a function that we can trust to always return a constant value. One reason might be the value of `undefined`. Without wading into controversy over the existance and proper use of `null` and `undefined` in Javascript, the FP Light library tends to treat `undefined` values as _missing_. If we are building an object and we are handed a property `foo: undefined`, the output object will not include a `foo` property at all.

```javascript
const request = resolve({
  ..._,
  offset: undefined,
})

const actual = request({ key: 'foo', value: 'bar' })
console.log(actual)
/*
{
  key: 'foo',
  value: 'bar'
}
*/
```

Notice that the `offset` property is completely missing from the result. That is because it was `undefined`, and in FP Light, undefined means missing. Enter the literal operator:

```javascript
const request = resolve({
  key: _.key,
  value: _.value,
  offset: $(undefined),
})

const actual = request({ key: 'foo', value: 'bar' })
console.log(actual)
/*
{
  key: 'foo',
  value: 'bar',
  offset: undefined
}
*/
```

Using the literal operator, we are ensuring that FP does not skip the `offset` property. We are handing it a function that equates to `() => undefined`. We could have used an anonymous function explicitly if we wanted, but the literal operator makes it more readable and makes the intent clearer.

The third, and possibly coolest, use of the literal operater is in string concatenation. First, let's take a look at the problem:

```javascript
const now = Date.now

const buildKey = pipe(
  { key: _, now },
  ({ key, now }) => `${key}_${now}`,
)

const key = buildKey('foo')
console.log(key)
// foo_1702806892503
```

The example is a bit contrived, but the idea is clear: we frequently need to concatenate strings, and there's no good way to do it without breaking arguments into an anonymous function. Enter the literal operator.

```javascript
const now = Date.now

const buildKey = pipe(
  { key: _, now },
  $`${_.key}_${_.now}`,
)

const key = buildKey('foo')
console.log(key)
// foo_1702806892503
```

While it is slightly awkward to have the dollar sign in front of the string template, once you get used to it this is incredibly powerful. Like most FP Light operators, using the literal operator in this way creates a function.

```javascript
const double = (x) => x * 2

const talkAboutDoubles = $`the number ${_} doubled is ${double}`

console.log(talkAboutDoubles(21))
// the number 21 doubled is 42
```

The above `talkAboutDoubles` function is equivalent to this:

```javascript
const talkAboutDoubles = (arg) =>
  `the number ${_(arg)} doubled is ${double(arg)}`
```

While not technically a compilable, you can see that `$` behaves like a compilable in that it produces a function that accepts a single argument and applies that argument to the functions it was compiled with.

## Reading Comprehension

_List comprehension_ is a fancy term for "doing something with an array". Javascript has a lot of really great comprehension functions, so we decided they needed some FP counterparts. Consider this:

```javascript
const downloadAll = pipe(
  (keys) => Promise.all(keys.map(s3ToLocal.$)),
  aside(console.log),
)
```

Meh. It's ok, but clearly we can do better. First, it would be nice to get rid of the anonymous function. Second, since `Array.map()` doesn't know what to do with a compilable, we have to pass it the underlying implementation with `s3ToLocal.$`. Third, while the pipe may be async aware, the native implementation is not, so we need to `Promise.all()` the results.

None of this is the end of the world, but it's far from ideal from a readability perspective. And FP Light is all about the readability. Here's our way:

```javascript
const downloadAll = pipe(
  map(s3ToLocal),
  aside(console.log),
)
// or alternately:
const downloadAll = map(pipe(s3ToLocal, aside(console.log)))
```

There's the clean FP Light we all know and love. There is one very important thing to note, however:

_All comprehension function in FP Light, including `map`, `reduce`, etc., are sequential._

That means the two examples above are NOT equivalent. The first example, using the native mapper, executes all the downloads concurrently and then uses `Promise.all()` to wait until they are all complete. The FP Light comprehension functions, on the other hand, are linear: each step will await the completion of the previous step. Here it is spelled out:

```javascript
const keys = ['key1', 'key2', 'key3']

// native
keys.map(s3ToLocal.$)
// equivalent to
const results = Promise.all([
  s3ToLocal.$('key1'),
  s3ToLocal.$('key2'),
  s3ToLocal.$('key3'),
]) // these are all running at the same time

// FP Light
map(s3ToLocal)(keys)
// equivalent to
const result1 = await s3ToLocal.$('key1')
const result2 = await s3ToLocal.$('key2')
const result3 = await s3ToLocal.$('key3')
// each one waited for the previous to finish
```

This is a critically important concept. FP Light always assumes that if you are dealing with async items in an array, they are to be completed sequentially rather than concurrently. The same is true within a pipe or with the resolution of an array. If you want things to be mapped concurrently, you must explicitly use the `parallel` function instead of the `map` function:

```javascript
const keys = ['key1', 'key2', 'key3']

// native
keys.map(s3ToLocal.$) // all running at the same time

// FP Light
parallel(s3ToLocal)(keys) // all running at the same time!
map(s3ToLocal)(keys) // running one after another!
```

With that out of the way, there are some further differences between the FP Light comprehension functions and the built-ins. Here are some highlights:

* The argument order may be different than one would expect: the mapper goes first and the array goes second i.e. `map(myMappingFunction, myArray)`. This is because `map` is compilable and passing it the mapper (the first argument) happens during the compilation step while the array is passed later at runtime.
* There are no 2nd and 3rd arguments passed to your mapper function. The 2nd argument to a native mapper is the index within the array. If you are using that index, your use case is probably better suited to the `reduce` function rather than the `map` function.
* The 3rd argument to a native mapper is a reference to the source array. In FP Light we can do one better: the `_base` function (see below).

When using FP Light in production, one of the challenges we found is that we often needed to refer to a higher-level construct from within our mapper. Here is an example of what we mean:

```javascript
// usage: { bucket: 'foo', keys: ['foo', 'bar'] }
const downloadAll = pipe(
  {
    keys: map({ key: _ }, _.keys), // create an object for each key
    bucket: $`${BUCKET_PREFIX}_${_.bucket}`, // set a prefixed bucket name
  }
  // now map the downlods in parallel
  parallel(
    s3ToLocal({ Bucket: _.bucket, Key: _.key }), // <-- here's the magic
    _.keys,
  )
)
```

The challenge is in the `s3ToLocal` call. First, note that we are mapping on the `_.keys` property. Each key is being passed to the compiled call to `s3ToLocal`. So far so good. But here's the problem: when we call `s3ToLocal`, we are composing an object using the prefixed bucket name and the key. The problem is that there is no bucket name available in the `{ key: 'foo' }` objects.

The FP Light comprehension functions do a little bit of magic when mapping objects. For mapped objects (but not primitives), the value automatically proxies the original argument that was passed to the `map` function. Here's a clear example of what we mean:

```javascript
const sameFirstWords = map($`${_.word1, _.word2, _.specialWord}`, _.special)

const input = {
  word1: 'hello',
  word2: 'to',
  special: [
    { specialWord: 'you' },
    { specialWord: 'me' },
    { specialWord: 'everyone' },
  ],
}

console.log(sameFirstWords(input))
/*
hello to you
hello to me
hello to everyone
*/
```

We are telling the mapper to use the `_.special` array, but our mapping function is also seemlessly accessing the properties of the top-level `input` object. In this way we are able to pass additional context to comprehensions. Note that this does _not_ work when mapping over primitive values like strings, although we are currently working on a solution for that.

It is outside the scope of this guide to cover each of the FP Light comprehension functions, but will give you a quick rundown on some of the best ones:

**`reduce`** _The OG comprehension._

```javascript
const listOfWords = reduce({
  state: '',
  reducer: when(is(_.i, 0), _.value, $`${_.state}, ${_.value}`),
})
console.log(listOfWords(['you', 'me', 'everyone']))
// you, me, everyone
```

**`groupBy`** _Group entries by key._

```javascript
const modulusOf3 = groupBy(mod(_, 3))
console.log(modulusOf3([4, 9, 5, 17, 10]))
// Map(3) { 1 => [ 4, 10 ], 0 => [ 9 ], 2 => [ 5, 17 ] }
```

**`filter`** _Exclude non-matching entries._

```javascript
const onlyValidKeys = filter(_.key)
const keys = [
  { key: 'foo' },
  null,
  undefined,
  { key: '' },
  [],
  { key: 'bar' },
]
console.log(onlyValidKeys(keys))
// [{ key: 'foo' }, { key: 'bar' }]
```

**`join`** _Perform a database-style join between two arrays._

```javascript
const keys = [{ key: 'foo', acct: '1234' }, { key: 'bar', acct: '6789' }]
const objects = [
  { Key: 'foo', Bucket: 'bucket1' },
  { Key: 'bar', Bucket: 'bucket2' },
  { Key: 'baz', Bucket: 'bucket2' },
]
const data = { keys, objects }

const keysWithBuckets = join({
  left: _.keys,
  right: _.objects,
  on: is(_.left.key, _.right.Key),
  map: { ..._.left, bucket: _.right.Bucket, },
})

console.log(keysWithBuckets(data))
/* [
  { key: 'foo', acct: '1234', bucket: 'bucket1' },
  { key: 'bar', acct: '6789', bucket: 'bucket2' }
] */
```

**`sort`** _Sort an array with the chosen sort logic._

```javascript
const objects = [
  { Key: 'foo', Bucket: 'bucket1' },
  { Key: 'bar', Bucket: 'bucket2' },
  { Key: 'baz', Bucket: 'bucket2' },
]
const sortByKey = sort(comparing(_.Key))
console.log(sortByKey(objects))
/* [
  { Key: 'bar', Bucket: 'bucket2' },
  { Key: 'baz', Bucket: 'bucket2' },
  { Key: 'foo', Bucket: 'bucket1' }
] */
```

There are many more functions and many more ways to use the above functions, but that's a quick overview to get you started.

## Pales By Comparison

By this point in the tutorial you've seen a few comparison functions. Now it's time to dig deeper.

Comparison can be a challenge in Javascript. There are two major reasons for that. The first is Javascript's type system, which some might charitably call "peculiar" and which we might less charitably call "a steaming pile". It's not the fact that Javascript is loosly-typed -- we like that part -- it's just that we end up with things like this REPL session:

```bash
> typeof 'foo'
'string'
> typeof String('foo')
'string'
> typeof new String('foo')
'object'
```

[sigh]

And the weirdness gets worse from there.

```bash
> typeof undefined
'undefined'
> typeof null
'object'
> 1 === 1
true
> NaN === NaN
false
> 1 === '1'
false
> 1 == '1'
true
```

And we haven't even gotten to prototypal inheritance and the general _charlie foxtrot_ of OOP relics that have wormed their way into our fair programming language.

The second major challenge with comparison in Javascript is the difference between semantic comparison and literal comparison. Should `1 == '1'`? Should the two objects `{ foo: 'bar' }` and `{ foo: 'bar', baz: undefined }` be treated as equivalent? How about `null` vs `undefined`?

Most of the intrinsic issues we cannot fix. We _can_, however, provide some tools to make these challenges less painful. For starters, let's tackle equality.

**`is`** _alias `strictEqual`, roughly equivalent to the `===` operator_

The `is` function compares two values and returns true if they are either strict equal (`===`) or if they are both `NaN`.

```javascript
is.$(1, 1) // true
is.$({}, {}) // false
is.$(NaN, NaN) // true
```

**`equal`** _Uses complex rules to deeply compare two values for equivalence._

The `equal` function is far more complex than the `is` function because it is forced to make value judgements about what counts as equal. Those details are discussed in more detail below when we discuss the `compare` function, but this is the basic usage:

```javascript
equal.$(1, 1) // true
equal.$({}, {}) // true
equal.$({ foo: 'bar' }, { foo: 'bar', baz: undefined }) // false
equal.$([40, '2', { foo: 'bar' }], [40, '2', { foo: 'bar' }]) // true
equal.$(Date('2023-12-18'), Date('12/18/2023')) // true
```

Types in Javascript seem a bit messy to us because they occur on two levels: the native type and the constructor. There are only a small number of native types, and everything falls into one of those types. We can see this on the REPL with the `typeof` operator:

```bash
> typeof 'foo'
'string'
> typeof {}
'object'
> typeof []
'object'
> typeof null
'object'
```

Besides `'string'`, `'number'` and a handful of others, everything else is an object (including `null`, oddly). Since the `typeof` doesn't give enough information, we are left to check constructors, but that's a bit of an awkward process given that there are two values in Javascript that do not have a constructor: `undefined` and `null`.

For that reason, we have created the missing constructors.

```bash
> null instanceof Null
true
> undefined instanceof Undefined
true
> Null()
null
> Undefined()
undefined
> constructor.$(null)
Null
> constructor.$(undefined)
Undefined
```

You may have also noticed that we made a `constructor` function (alias `typeOf`). This function is safe to use with any value, including `null` and `undefined`. There is also a `typeName` function that returns the string name of the constructor function. This allows us to detect, for example, if something is a POJO with `typeOf(x) === Object`.

There are a few more helpers regarding types. The first is that we added a constructor called `Primitive`. That lets us do things like:

```bash
> 42 instanceOf Primitive
true
> 'foo' instanceOf Primitive
true
```

There is also a constructor `Any` which, just as it sounds, will return true for any `instanceOf` comparison.

Next we have the `isType` and `isExactType` functions which do what they sound like.

```bash
> isType.$(Error, new SyntaxError())
true
> isType.$(SyntaxError, new SyntaxError())
true
> isType.$(Primitive, 42)
true
> isExactType.$(Error, new SyntaxError())
false
> isExactType.$(SyntaxError, new SyntaxError())
true
> isExactType.$(Primitive, 42)
false
```

And finally, the `isExtendedFrom` function, which accepts two constructors and returns true if the second one is a parent of the first.

```bash
> isExtendedFrom.$(SyntaxError, Error)
true
> isExtendedFrom.$(Array, Object)
true
> isExtendedFrom.$(Number, Any)
true
```

Along with these general helpers there is also a long list of specific helpers, including:

* `isUndefined`
* `isNull`
* `isDefined` (alias `exists`: true for anything other than `undefined` or `null`)
* `isMissing` (alias `notExists`: true for `undefined` or `null`)
* `isTruthy` (alias `truthy`: true for everything but `0`, `''`, `null`, `undefined`, or `false`)
* `isFalsy` (alias `falsy`: true for `0`, `''`, `null`, `undefined`, or `false`)
* `isArray`
* `isBoolean`
* `isDate`
* `isError`
* `isFunction`
* `isMap`
* `isNumber`
* `isObject`
* `isSet`
* `isString`
* `isSymbol`
* `isIterable`

Finally we come to the core of equivalence, sorting and more, the engine that makes it all work: the `compare` function. As the name implies, the compare function compares two values and returns a number < 0 if the first is "less than" the 2nd, 0 if they are equivalent, and > 1 if the first is "greater than" the second.

The FP Light `compare` function can compare any two values. When the values are of different types, the function will fall back on comparing their type names. That means if you have an array of mixed numbers and strings, all the numbers will be sorted before all the strings because `compare.$('Number', 'String') === -1`.

```bash
> c('foo', 42)
1
> c(42, 'foo')
-1
> c('foo', 'foo')
0
```

Types are compared using strict name equality of their constructors. This may not be perfect, but it seems like the least bad option to us. If the type names are the same, the following roughly describes the logic used to compare the values:

* If a custom `comparer` is defined, use that (see below)
* Boolean: `false < true`
* Number: `NaN < Number.NEGATIVE_INFINITY < Number.MIN_VALUE < Number.MAX_VALUE < Number.POSITIVE_INFINITY`
* Date: compare the milliseconds from epoch for each value (from `value.getTime()`)
* Error: if both values are `instanceOf Error`, compare their `name`, `code` and `message` properties
* String: `leftValue.localeCompare(rightValue)`
* RegExp: convert both to strings and compare the strings
* Array:
  * recursively compare each element
  * as soon as a there is a non-zero result, return that result
  * if all elements are equivalent (0), compare the array lengths as numbers
* Set: produce a sorted array of each value and compare the arrays
* Object:
  * if both objects are iterable, produce a sorted array for each iterable and compare the arrays
  * compare key-by-key:
    1. use `Reflect.ownKeys` to get a list of keys from the first object
    1. for each key, compare the left value to the right value
    1. as soon as there is a non-zero result, return that result
    1. if all key/values are equivalent (0), compare the key counts for each object
* Map:
  * create an array of `[key, value]` pairs, sorted by `key`, for each `Map`
  * compare the two arrays
* Function: compare the `toString` values of each function

Note that in the above logic, anytime the word "compare" is used it indicates recursively calling the compare function from within the current comparison. That is how even deeply nested objects and arrays are deeply compared for equality.

The FP Light library exports a symbol called `comparer`. This is meant to support custom comparison implementations: this property should be set to a function that accepts two arguments, compares them, and returns the numeric result of the comparison. This can be applied to individual objects or to a prototype. Consider this example:

```javascript
const compareRecords = (left, right) => {
  const { timestamp: t1, ...lprops } = left
  const { timestamp: t2, ...rprops } = right
  return compare.$(lprops, rprops)
}

const o1 = {
  id: 23,
  list: [4, 5, 6],
  timestamp: 1703003543952,
  [comparer]: compareRecords,
}
const o1 = {
  id: 23,
  list: [4, 5, 6],
  timestamp: 1703003565278,
  [comparer]: compareRecords,
}

assert(compare.$(01, 02) === 0) // OK
assert(equal.$(01, 02)) // OK
```

Some would put this comparer onto a prototype, but we're adding it to each object explicitly to make the example clear.

Notice that not only does the comparison now skip the timestamp and show the two objects as equivalent, but the `equal` function also shows them as equal. That is because `equal` uses `compare` under the hood.

Because equivalence is based on comparison in FP Light, and because comparison can be shaped by modifying prototypes, literally all of the above comparison rules can be overridden in your project. If you don't like the way we compare strings, you can set `String.prototype[comparer] = myCoolStringComparer` at the entry point of your project and you have now globally overridden the default FP Light string comparison/equivalence logic.

Before we wrap this chapter, we should point out one more nifty helper: the `comparing` function. This is designed to make sorting easier, but you can use it however you like. The `comparing` function accepts a single argument: a function that is applied to a left value and a right value. It then returns a `compare()` of the two values. Here it is in action:

```javascript
const compareX = comparing(_.x)

const o1 = { x: 'foo' }
const o2 = { x: 'bar' }

assert(compareX(o1, o2) === 1) // OK
```

And here it is in a sorting use case:

```javascript
const list = [
  { x: 'foo' },
  { x: 'bar' },
  { x: 'baz' },
]

const expectedSortedResult = [
  { x: 'bar' },
  { x: 'baz' },
  { x: 'foo' },
]

const sortedList = sort.$(comparing(_.x), list)

assert(equal.$(sortedList, expectedSortedResult))
```

In this case the custom comparer really isn't necessary since the default comparison would already sort these into the correct order, but for more complex scenarios the `comparing` helper makes sorting much easier.

## Wrapping Up

We have covered some of the high points and general areas of the FP Light library, but there is a _lot_ more to discover. We haven't talked about any of the mathematical or bitwise helpers, the string helpers, the validation helpers and a number of others. Since we can't prattle on forever, we'll just quickly mention some important functions and features we haven't talked about yet and then we'll leave you to read the full API on your own time.

**`trap`** _Wraps a function in an error-safe layer and returns a two-element array of `[error, result]` in a similar style to old-school Node callbacks._

```javascript
const { readFile: readFileNative } = reuire('node:fs/promises')
const readFile = compilable(pipe(
  {
    fileName: _,
    result: trap(readFileNative), // returns [Error?, Buffer?]
  },
  {
    fileName: _.fileName,
    error: _.result[0],
    data: _.result[1],
  },
))
```

**`tap`** _Alias `aside`. Wraps a function in a layer such that the wrapped function's return value will be ignored and the original argument is returned instead._

```javascript
const { writeFile: writeFileLegacy } = require('node:fs/promises')
const writeFile = compilable(({ name, data }) => writeFile(name, data))

const saveFile = pipe(
  tap(writeFile), // ignore the return value of writeFile
  { name: _.name, bytesWritten: _.data.length },
  tap(console.log) // ignore the return value of console.log
)

const result = await saveFile({ name: 'foo.txt', data: 'bar' })
const expectedResult = { name: 'foo.txt', bytesWritten: 3 }
assert(equal.$(result, expectedResult)) // OK
```

Some people prefer to use `aside` instead of the more functional-programming-camp `tap` since _aside_ is a more descriptive name, but we've provided them both without judgement.

**`compilable` Options** _The `compilable` function has an optional second `options` argument._

There are two options for `compilable`: `count` and `skip`. The `count` option is a number and is used in cases where the number of arguments cannot be determined programatically. The `skip` option is also a number and tells the compiler not to resolve the first _n_ arguments.

```javascript
const baseAdd = (a, b) => a + b
assert(baseAdd.length === 2) // OK
// this is how we get the argument count programatically

const baseMul = (a, b = 0) => a * b
// unfortunately, when an argument has a default, it doesn't count
assert(baseMul.length === 1) // OK

const add = compilable(add) // no need for special treatment
const mul = compilable(mul, { count: 2 }) // needs a count!
```

The argument count is not always important. It is fine to use the _rest_ operator in the argument list for a compilable. The important thing is for the `count` to express the _minimum_ number of required arguments.

The `skip` option might be hard to grok at first. Why would we want to _not_ resolve some of our arguments? The answer is that we do not want to resolve an argument _when we expect it to be a function_. The best example is `map`. If we didn't use the `skip` option, we could not have a compilable `map` function.

```javascript
const add = compilable((x, y) => x + y)

const addXAndY = add(_.x, _.y)
// What is happening here? What does addXAndY look like inside?
const deconstructedAddXAndY = (arg) => {
  const impl = (x, y) => x + y
  const rx = _.x(arg) // since _.x is a function, call it
  const ry = _.y(arg) // since _.y is a function, call it
  return impl(rx, ry) // now use them in the underlying implementation
}

addXAndY({ x: 2, y: 40 }) // 42
```

This is all good and well, so now let's look at a deconstructed implementation of `map`:

```javascript
const map = compilable((mapper, array) => array.map(mapper))

const onlyX = map(_.x, _.array)
// What is happening here? What does onlyX look like inside?
const deconstructedOnlyX = (arg) => {
  const impl = (mapper, array) => array.map(mapper)
  const rmapper = _.x(arg) // oops -- _.x was supposed to be our mapper!
  const rarray = _.array(arg)
  impl(rmapper, rarray) // rmapper is undefined!
}

const input = { array: [{ x: 40, y: 17 }, { x: 2, y: 11 }] }
console.log(onlyX(input))
// TypeError: undefined is not a function
```

You can see that when we passed in the `{ array: [] }` object, the resolver is trying to get property `x` from it and then use _that_ as our mapper. That is wrong! We needed the resolver to _skip_ our resolver and pass it all the way into the map function unchanged, like this:

```javascript
const map = compilable((mapper, array) => array.map(mapper), { skip: 1 })

const onlyX = map(_.x, _.array)
// What is happening here? What does onlyX look like inside?
const deconstructedOnlyX = (arg) => {
  const impl = (mapper, array) => array.map(mapper)
  const rmapper = _.x // don't resolve _.x -- skip it!
  const rarray = _.array(arg)
  impl(rmapper, rarray) // rmapper is _.x as we intended
}

const input = { array: [{ x: 40, y: 17 }, { x: 2, y: 11 }] }
console.log(onlyX(input))
// [40, 2]
```

While `count` and `skip` are the only two options to `compilable`, the next interation of the FP Light library will introduce compile-time checks such as type checking.

**`Spread`** _Wraps a function with a layer that takes an array and passes them to the wrapped function as individual arguments._

```javascript
const logArray = spread(console.log)
logArray([1, 2, 3])
// 1 2 3
```

This can be useful in pipes where only a single argument can be passed from step to step; thus, passing an array and using `spread` to spread the array into a function allows you to call multi-argument functions inside a pipe.

**`when`** _Similar to a ternary expression, if argument 1 evaluates to truthy, return argument 2; else, return argument 3._

There is one important way in which `when` is different from a classic ternary: the third argument (the _else_ case) is optional. If there is no third argument, it defaults to `_` meaning _the original value is returned_. Here is an example with only 2 arguments:

```javascript
const toNumber = pipe(
  Number,
  when(isNaN, 0),
)

toNumber(42)
// 42
toNumber('foo')
// 0
```

In this example we pass the value to `Number()` which will either give us back a valid number or `NaN`. If we get `NaN`, we return 0; otherwise we return the number.

The next example uses multiple conditional expressions with all three arguments.

```javascript
const mkdirRecursiveAndRetry = pipe(
  tap(mkdirRecursive(_.arg.name)),
  ({ arg }) => saveFile(arg), // anonymous function is mandatory here
)

const onSaveFileFailed = when(
  startsWith('ENOENT', _.error.message),
  mkdirRecursiveAndRetry,
  fail(_.error),
)

const maybeSaveFile = {
  arg: _,
  error: trap(writeFile(_.name, _.data))[0],
}

const saveFile = pipe(
  maybeSaveFile,
  when(
    _.error,
    onSaveFileFailed,
    _.arg.name,
  )
)
```

We wanted to finish with this example because it makes use of a number of constructs and ideas we have covered in this section. This example uses `tap`, `trap` and `when`; it introduces one of the many helper functions `startsWith`; and it also hints at a hidden gotcha in this declarative style of programming.

If you notice the above comment _anonymous function is mandatory here_, you may wonder why. This is because of the Javascript compiler: we can't compile a call to `saveFile` into our pipe yet because `saveFile` has not been declared! Instead, we have to make an anonymous function. That way the anonymous function won't be compiled (by Javascript) until later, after `saveFile` has been compiled (by Javascript).

At present, we see this as the biggest weakness of the FP Light library. There really isn't a good solution to this problem since it is fundamental to the Javascript compiler.

That said, we want to highlight how readable this declarative style can be. Most of the above could have been jammed into a single pipe, but FP Light's composability allows us to refactor each part of the process and give each part a meaningful name. Notice that `maybeSaveFile` is an object instead of a function, but since the pipe will automagically deep resolve that object, the result is a `saveFile` function that is simple, clean, easy to read and easy to reason about.

_And on that note, that's all we have time for in this tutorlial. We hope you learned enough to be as enthusiastic about this style of coding as we are. Feel free to skim the [full API](https://github.com/Sullux/fp-light/blob/master/API.md) to see more examples and to get a glimpse of the functions we didn't have time to talk about here._
