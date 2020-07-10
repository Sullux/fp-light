# API

## appendedName

```typescript
declare function appendedName<T as function>(fn: T, ?name: string): T
```

_Tags: `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given a function, returns the function with its name overridden. The original
function name is suffixed with the given suffix in angled brackets.

_Examples_

```javascript
const product = compilable((x, y) => x * y)
const triple = appendName(product(3), '3')
console.log(triple.name) // product<3>
```


## arity

```typescript
declare function arity(arity: number, fn: function): function
```

_Tags: `{{Foundational}}`_

_Aliases: `nary`_

_Description_

Given a function, returns a function that invokes the original function
passing only the first _n_ (`arity`) arguments through.

TODO: fix the typescript definition

_Examples_

to do...

## awaitAll

```typescript
declare function awaitAll(value: Iterable<any>): Promise<any[]>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

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

```typescript
declare function awaitAny(promises: Iterable<any>): Promise<any>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

_Aliases: `race`_

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

```typescript
declare function awaitArray(value: Iterable<any>): any[] | Promise<any[]>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given an iterable, deep awaits each value and then resolves to an array or
promise-to-array of the resolved values in original input order.
```

_Examples_

to do...

## awaitDelay

```typescript
declare function awaitDelay(ms: number) => Promise<void>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

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


## awaitObject

```typescript
declare function awaitObject(value: object): object | Promise<object>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given an object, deep awaits each value and then resolves to an object or
promise-to-object with each async value resolved to a synchronous value.
```

_Examples_

to do...

## binary

```typescript
declare function binary<T, A1, A2>(
fn: (arg1: A1, arg2: A2) => T
): (arg1: A1, arg2: A2, ...any[]) => T
```

_Tags: `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given a function, returns a function that invokes the original function
passing only the first 2 arguments through.

_Examples_

to do...

## compare

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Compares two values returning `< 0` if the first value is less than the
second, `0` if the values are equal, and `> 0` if the first value is greater
than the second. When types do not match, comparison is done on type name.
For numbers, `NaN` is always greater than real numbers.

For errors, the type, code and message are compared while other properties
such as the stack trace are ignored. This allows errors to be equal if they
are identical except for stack trace or custom properties.

For functions, the function text is compared.

Arrays and objects are deep compared. Nested values are compared using all of
the above rules.

_Examples_

to do...

## comparer

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

A symbol to use to define a custom comparer function for an object.

_Examples_

```javascript
const compareColors = ({r: r1, g: g1, b: b1}, {r: r2, g: g2, b: b2}) =>
(r1 - r2) || (g1 - g2) || (b1 - b2)

Color.prototype[comparer] = compareColors

const colors = [
new Color(50, 40, 60),
new Color(40, 50, 60),
new Color(60, 50, 40),
]

console.log(colors.sort(compare))
// [
//   { r: 40, g: 50, b: 60 },
//   { r: 50, g: 40, b: 60 },
//   { r: 60, g: 50, b: 40 }
// ]
```


## compareTypes

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Compares types returning `< 0`, `0` or `> 0`. The type name is used for the
comparison.

_Examples_

to do...

## compose

```typescript
declare function compose(...steps: resolvable[]): (initialValue: any) => any
```

_Tags: `{{Compilable}}`, `{{Composition}}`_

_Aliases: `f`_

_Description_

This is the inverse of {{pipe}}.

_Examples_

to do...

## constant

```typescript
// todo: typescript declaration
```

_Tags: `{{Convenience Functions}}`_

_Aliases: `$`, `always`, `just`, `scalar`_

_Description_

Given a value, returns a nullary function that will always return the original
value. NOTE: as a convenience, if multiple arguments are passed to this
function it will resort to the behavior of `tag()`; thus

```javascript
$`before ${_} after`
```
is identical to

```javascript
tag`before ${_} after`
```

_Examples_

```javascript
const meaning = constant('42')
meaning() // 42
meaning('foo') // 42
```


## curry

```typescript
function curry(fn: function): function
declare function curry(arity: number, fn: function): function
```

_Tags: `{{Composition}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Allows partial application of function arguments.

TODO: use [this guide](https://www.freecodecamp.org/news/typescript-curry-ramda-types-f747e99744ab/)
to provide a full typescript implementation.

_Examples_

to do...

## deepAwait

```typescript
declare function deepAwait(value: any): any | Promise<any>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given any value, awaits and/or deep awaits using the {{#awaitArray}} and
{{#awaitObject}} functions and then resolves to the synchronous or
asynchronous result.
```

_Examples_

to do...

## equal

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `deepEqual`, `eq`_

_Description_

Using the same rules as the `compare` function, compares two values and
returns true if the two values are comparable. This function is suitable for
deep equality.

_Examples_

to do...

## functionName

```typescript
declare functionName(fn: function): string
```

_Tags: `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given a function, returns a human-readable name. This is either the name
property of the function or the first line of its `toString()` value limited
to a maximum of 12 characters.

_Examples_

to do...

## identity

```typescript
// todo: typescript declaration
```

_Tags: `{{Convenience Functions}}`, `{{Spreadable}}`_

_Aliases: `argument`, `_`_

_Description_

Given a value, returns that value. This is useful in cases where a resolvable
object needs to resolve the input into the output. This can also be useful in
cases where two logical branches must return a function, but where one branch
exhibits the "no change" logic (i.e. a function that returns the original
argument).

Additionally, `identity` proxies the property accessor such that an accessed
property returns a function that will retrieve that property from the given
argument. This means that `identity.foo` returns a function shaped like
`value => value.foo` and `identity[3]` returns a function shaped like
`value => value[3]`. Note that properties are resolved safely, meaning
`identity` will never throw on undefined.

_Examples_

This example demonstrates the branch-to-no-change logic. The `log` function
uses `identity` to pass logged values straight through to `console.log` while
the `logObject` function uses the JSON serializer.

```javascript
const logWith = serialize =>
value =>
console.log(serialize(value))

// log plain values
const log = logWith(identity)

// log serialized values
const logObject = logWith(JSON.stringify)
```

This example uses the `_` alias and the property accessor to mimic the
behavior of Scala's underscore operator.

```javascript
const area = multiply(_.x, _.y)

area({ x: 2, y: 3 }) // 6
```

This example shows how `identity` protects against accessing properties of
undefined values.

```javascript
const inners = map(_.nums[0])

inners([
{ nums: [42, 43] },
{}, // this would throw if accessing literally with v => v.nums[0]
{ nums: [44] },
])
// [42, undefined, 44]
```


## is

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `isExactly`, `same`, `strictEqual`_

_Description_

Determines strict equality. Same as `===` except returns true if both values
are `NaN`. This does not perform deep equality.

_Examples_

```javascript
is.$(Number('foo'), Number('bar')) // true
is.$(42, 42) // true
is.$({}, {}) // false
const x = {}
const y = x
is.$(x, y) // true
```


## isArray

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is an array.

_Examples_

to do...

## isAsync

```typescript
declare function isAsync(value: any): boolean
declare function isPromise(value: any): boolean
declare function isThennable(value: any): boolean
```

_Tags: `{{Async}}`, `{{Foundational}}`_

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


## isBoolean

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is a boolean.

_Examples_

to do...

## isDate

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is a date.

_Examples_

to do...

## isDefined

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `exists`_

_Description_

Returns true if the value is neither `undefined` nor `null`.

_Examples_

to do...

## isError

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is an error.

_Examples_

to do...

## isExactType

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `sameType`, `strictEqualType`_

_Description_

Given a type (constructor function) and a value, returns true if the value's
constructor is the given type.

_Examples_

```javascript
isExactType.$(Number, 3) // true
isExactType.$(String, 'foo') // true
isExactType.$(Object, { x: 42 }) // true
isExactType.$(Object, new Map()) // false
```


## isFalsy

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `falsy`_

_Description_

Returns true if the value is `undefined`, `null`, `0`, `NaN`, `''` or `false`.

_Examples_

to do...

## isFunction

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is a function.

_Examples_

to do...

## isIterable

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is an iterable.

_Examples_

to do...

## isMap

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is a map.

_Examples_

to do...

## isMissing

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `notExists`_

_Description_

Returns true if the value is `undefined` or `null`.

_Examples_

to do...

## isNull

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is `null`.

_Examples_

to do...

## isNumber

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is a number. Note that this returns false for the
value `NaN`.

_Examples_

to do...

## isObject

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is a plain object.

_Examples_

to do...

## isSet

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is a set.

_Examples_

to do...

## isString

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is a string.

_Examples_

to do...

## isSymbol

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is a symbol.

_Examples_

to do...

## isTruthy

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `truthy`_

_Description_

Returns true if the value is not `undefined`, `null`, `0`, `NaN`, `''` or
`false`.

_Examples_

to do...

## isType

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Given a type (constructor function) and a value, returns true if the value's
constructor is the given type or if the value is an instance of the type.

_Examples_

to do...

## isUndefined

```typescript
// todo: typescript declaration
```

_Tags: `{{Comparison}}`_

_Aliases: `(none)`_

_Description_

Returns true if the value is `undefined`.

_Examples_

to do...

## MissingPipeArgumentError

```typescript
declare function MissingPipeArgumentError (
this: MissingPipeArgumentError | undefined | void,
arg: any,
index: number
) : MissingPipeArgumentError extends Error
```

_Tags: `{{Error}}`_

_Aliases: `(none)`_

_Description_

undefined
_Examples_

to do...

## named

```typescript
declare function named<T as function>(fn: T, ?name: string): T
```

_Tags: `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given a function, returns the function with its name overridden. If no name is
given and the function has a `name` property, the original function is
returned. If the function has no `name` property and no name is given, the
name is overridden with the output of the `functionName` function.

_Examples_

to do...

## nullary

```typescript
declare function nullary<T>(fn: () => T): (...any[]) => T
```

_Tags: `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given a function, returns a function that invokes the original function
without passing any arguments through.

_Examples_

to do...

## override

```typescript
function override<T, P>({ properties: P }): (T) => T extends P
function override<T, P, A extends function>({
properties: P,
apply: A,
}): (T) => T extends A, P
declare function override<T, P, A extends function, F extends object>({
properties: P,
apply: A,
prototype: F,
}): (T) => T extends A, P
```

_Tags: `{{Foundational}}`, `{{Composition}}`_

_Aliases: `(none)`_

_Description_

undefined
_Examples_

to do...

## pipe

```typescript
declare function pipe(...steps: resolvable[]): (initialValue: any) => any
```

_Tags: `{{Compilable}}`, `{{Composition}}`_

_Aliases: `I`_

_Description_

Piping is the basis for the FP library. A pipe is a unary function (accepts
a single argument) that is composed of a sequence of other functions. When
called, the pipe passes the argument to its first function. The result of that
call is passed to the second function, etc. The result of the last function is
the return value of the pipe. For this documentation, we will refer to these
functions as "steps" in the pipe.

In addition to the vanilla form of piping described above, this pipe
implementation adds the additional feature of resolving each step of the pipe.
That means that instead of a function, a step could be an array, object,
string literal, etc.

_Examples_

A simple pipe.

```javascript
const productOfIncrement = pipe(
add(1),
mul(2),
)

productOfIncrement(3) // 8
```

A pipe with various resolving steps. This is a no-frills but fully-working
example. Note that the two pipes include asynchronous steps, but that those
steps will be automagically awaited by the piping infrastructure.

```javascript
const { dynamoDB: { documentClient } } = require('@sullux/aws-sdk')()

const tableName = process.env.TABLE_NAME
const keyName = process.env.KEY_NAME

const getItem = pipe(
{ TableName: tableName, Key: { [keyName]: _ } },
documentClient.get,
_.Item,
)

const putItem = pipe(
{ TableName: $tableName, Item: _ },
documentClient.put,
'Attributes',
)
```


## proxy

```typescript
type ProxyTarget = object | function
type ProxyDefinition = {
get: (target: ProxyTarget, prop: string) => any,
getOwnPropertyDescriptor: (target: ProxyTarget, prop: string) => object,
getPrototypeOf: () => function,
has: (target: ProxyTarget, prop: string): boolean,
ownKeys: (target: ProxyTarget) => string[],
}
declare function proxy<T>(definition: ProxyDefinition, target: T): T
```

_Tags: `{{Foundational}}`, `{{Composition}}`_

_Aliases: `(none)`_

_Description_

undefined
_Examples_

to do...

## reject

```typescript
declare function reject<T>(value: T): Promise<T>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

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

```typescript
// todo: typescript declaration
```

_Tags: `{{Foundational}}`_

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


## tag

```typescript
// todo: typescript declaration
```

_Tags: `{{Convenience Functions}}`, `{{Strings}}`_

_Aliases: `template`_

_Description_

Used as a tag for a template literal, returns a function that will resolve to
the interpolated string.

_Examples_

```javascript
pipe(
tap(console.log),
tag`first ${_.x} then ${_.y}`,
tap(console.log),
)({ x: 'foo', y: 'bar' })
```

outputs:

```
{ x: 'foo', y: 'bar' }
first foo then bar
```


## ternary

```typescript
declare function ternary<T, A1, A2, A3>(
fn: (arg1: A1, arg2: A2, arg3: A3) => T
): (arg1: A1, arg2: A2, arg3: A3, ...any[]) => T
```

_Tags: `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given a function, returns a function that invokes the original function
passing only the first 3 arguments through.

_Examples_

to do...

## toAsync

```typescript
declare function toAsync<T>(value: T): Promise<T>
declare function toPromise<T>(value: T): Promise<T>
declare function toThennable<T>(value: T): Promise<T>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

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


## trace

```typescript
declare function trace<T as function>(fn: T): T
```

_Tags: `{{Foundational}}`, `{{Environment}}`_

_Aliases: `(none)`_

_Description_

Given a function, returns the function with additional error processing. A
traced function, when it throws an error, will have a different stack trace
from an untraced function. The thrown error will also have additional
properties to aid in debugging.

Turning off tracing can improve performance. To turn off tracing in your app,
set the environment variable FP_LIGHT_TRACE=off.

_Examples_

to do...

## typeName

```typescript
// todo: typescript declaration
```

_Tags: `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Returns the name of the type as a string. For `null` and `undefined` returns
`'Null'` and `'Undefined'` respectively.

_Examples_

to do...

## unary

```typescript
declare function unary<T, A>(fn: (arg: A) => T): (arg: A, ...any[]) => T
```

_Tags: `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given a function, returns a function that invokes the original function
passing only the first argument through.

_Examples_

to do...

## uncurry

```typescript
declare function uncurry(fn: function): function
```

_Tags: `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Allows partial application of function arguments.

_Examples_

to do...

## Undefined

```typescript
// todo: typescript declaration
```

_Tags: `{{Convenience Functions}}`, `{{Types}}`_

_Aliases: `(none)`_

_Description_

A stand-in constructor for the value `undefined`.

_Examples_

to do...

## Undefined

```typescript
// todo: typescript declaration
```

_Tags: `{{Convenience Functions}}`, `{{Types}}`_

_Aliases: `(none)`_

_Description_

A stand-in constructor for the value `null`.

_Examples_

to do...
