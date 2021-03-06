# Foundational

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

_Tags: `{{Composition}}`, `{{Foundational}}`_

_Aliases: `nary`_

_Description_

Given a function, returns a function that invokes the original function
passing only the first _n_ (`arity`) arguments through.

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

_Tags: `{{Composition}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given a function, returns a function that invokes the original function
passing only the first 2 arguments through.

_Examples_

to do...

## curry

```typescript
function curry(fn: function): function
declare function curry(arity: number, fn: function): function
```

_Tags: `{{Composition}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Allows partial application of function arguments.

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

## gather

```typescript
declare function gather(<arg>: <type>): <type>
```

_Tags: `{{Composition}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

<add description here>

_Examples_

<add code blocks and explanations here>


## isAsync

```typescript
declare function isAsync(value: any): boolean
declare function isPromise(value: any): boolean
declare function isThennable(value: any): boolean
```

_Tags: `{{Async}}`, `{{Foundational}}`_

_Aliases: `isPromise`, `isThennable`_

_Description_

Given any value, returns true if the value is thennable; otherwise, returns
false.

_Examples_

```javascript
const asyncValue = Promise.resolve(42)
const value = 42
isAsync(value) // false
isAsync(asyncValue) // true
```


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

_Tags: `{{Composition}}`, `{{Foundational}}`_

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

A helper to simplify the process of overriding properties and function call
behavior. See the ECMA [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
documentation for details.

Note that in the case of frozen, sealed or inextensible objects, the return
value is _not_ a proxy. Javascript goes to great lengths to ensure that
proxying such objects fails. If the target is sealed, the return object is a
manual merge of the target with the given properties.

_Examples_

Add a property to a frozen object.

```javascript
const obj = Object.freeze({ foo: 'bar' })
const addBiz = override({ biz: 'baz' })
const bizObj = addBiz(obj)
console.log(bizObj)
// { foo: 'bar', biz: 'baz' }
```

Add a property to an array.

```javascript
const array = [1, 2, 3]
const withSum = override(
{ properties: { sum: array.reduce((s, v) => s + v, 0) } },
array,
)
console.log(withSum)
// [ 1, 2, 3 ]
console.log(withSum.sum)
// 6
```

Override a function.

```javascript
const fn = n => n * 2
console.log(fn(21))
// 42
const overridden = override(
{ apply: (target, thisArg, args) => target(args[0] + 1) },
fn,
)
console.log(overridden(20))
// 42
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

A curried implementation of proxy creation. See the ECMA [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
documentation for details.

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


## spread

```typescript
declare function spread<T>(fn: (...args: any) => T): (args: any[]) => T
```

_Tags: `{{Composition}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given a function that accepts arguments, return a function that accepts an
array of arguments and spreads them to the underlying function on invocation.

_Examples_

Spreading to allow logging array elements individually:

```javascript
const logSquares = pipe(
map(square(_)),
spread(console.log),
)
logSquares([2, 3])
// 4 8
```


## ternary

```typescript
declare function ternary<T, A1, A2, A3>(
fn: (arg1: A1, arg2: A2, arg3: A3) => T
): (arg1: A1, arg2: A2, arg3: A3, ...any[]) => T
```

_Tags: `{{Composition}}`, `{{Foundational}}`_

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

Tracing is off by default. Turning tracing on will have a dramatic effect on
performance (up to 10x slower than without tracing). To turn on tracing, set
the environment variable FP_LIGHT_TRACE=on.

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

_Tags: `{{Composition}}`, `{{Foundational}}`_

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

_Tags: `{{Composition}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Allows partial application of function arguments.

_Examples_

to do...
