# Composition

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

A curried implementation of proxy creation. See the ECMA [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
documentation for details.

_Examples_

to do...

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
