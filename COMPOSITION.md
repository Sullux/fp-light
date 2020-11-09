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
