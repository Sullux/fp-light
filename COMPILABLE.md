# Compilable

## bitand

```typescript
declare function bitand(x: int, y: int): int
```

_Tags: `{{Bitwise}}`, `{{Compilable}}`_

_Aliases: `band`, `bitwise.and`, `bit.and`_

_Description_

Performs the bitwise AND operation as with the `&` operator.

_Examples_

to do...

## bitnot

```typescript
declare function bitnot(x: int): int
```

_Tags: `{{Bitwise}}`, `{{Compilable}}`_

_Aliases: `bnot`, `bitwise.not`, `bit.not`_

_Description_

Performs the bitwise NOT operation as with the `~` operator.

_Examples_

to do...

## bitor

```typescript
declare function bitor(x: int, y: int): int
```

_Tags: `{{Bitwise}}`, `{{Compilable}}`_

_Aliases: `bor`, `bitwise.or`, `bit.or`_

_Description_

Performs the bitwise OR operation as with the `|` operator.

_Examples_

to do...

## bitxor

```typescript
declare function bitxor(x: int, y: int): int
```

_Tags: `{{Bitwise}}`, `{{Compilable}}`_

_Aliases: `bxor`, `bitwise.xor`, `bit.xor`_

_Description_

Performs the bitwise XOR operation as with the `^` operator.

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

## delay

```typescript
declare function delay<T>(ms: number, input: T) => Promise<T>
```

_Tags: `{{Async}}`, `{{Compilable}}`, `{{Side Effect}}`_

_Aliases: `(none)`_

_Description_

Given a number of milliseconds, resolves after the milliseconds have elapsed.

_Examples_

```javascript
const saveAndLoad = pipe(
saveRecord,
delay(100), // wait 100 ms before loading
loadRecord,
)
```


## leftShift

```typescript
declare function leftShift(x: int, y: int): int
```

_Tags: `{{Bitwise}}`, `{{Compilable}}`_

_Aliases: `lshift`_

_Description_

Performs the left shift operation as with the `<<` operator.

_Examples_

to do...

## parallel

```typescript
declare function parallel(mapper: any, array: Array): Promise<Array>
```

_Tags: `{{Compilable}}`, `{{Mapping}}`_

_Aliases: `concurrent`_

_Description_

Given an async mapper and an array, invokes the mapper for each element in the
array concurrently. This is different from the behavior of the {{map}}
function which ensures the resolution of each element before executing the
mapper on the next element.

_Examples_

Using `map`:

```javascript
const input = [500, 100]

const test = map(pipe(
tap(delay(_)),
console.log,
))

test(input)
// 500
// 100
```

Using `parallel`:

```javascript
const input = [500, 100]

const test = parallel(pipe(
tap(delay(_)),
console.log,
))

test(input)
// 100
// 500
```

Note that while the `map` example prints the items in their original order,
the `parallel` function executes concurrently and thus the smaller delay
completes before the larger delay. Note that the output of each function is
identical as in the following example:

```javascript
const input = [500, 100]

const test = assertValid(equal(
map(tap(delay(_))),
parallel(tap(delay(_))),
))

test(input) // ok
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


## rightShift

```typescript
declare function rightShift(x: int, y: int): int
```

_Tags: `{{Bitwise}}`, `{{Compilable}}`_

_Aliases: `rshift`_

_Description_

Performs the unsigned right shift operation as with the `>>>` operator. NOTE:
the _signed_ right shift (the `>>` operator) is the {{shift}} function.

_Examples_

to do...
# compilable

## includes

```typescript
declare function includes(value: any, input: any): boolean
```

_Tags: `{{compilable}}`, `{{arrays}}`, `{{strings}}`_

_Aliases: `(none)`_

_Description_

If the input has its own `includes` method, return the result of
calling that function with the given input; otherwise, if the input strict
equals the value, return true; if the input or value are falsy, return false;
or returns true if each of the values's own properties is matched by one of
the input's own properties using strict equal logic.

_Examples_

Check if an array includes a value:

```javascript
includes('foo')(['foo', 'bar']) // true
```

Check if a string includes a substring:

```javascript
includes('foo')('biz foo bar') // true
```

Check other types of values:

```javascript
includes(42)(42) // true
includes('foo')(42) // false
includes({})({}) // true
includes({ foo: 42 })({ bar: baz }) // false
includes({ foo: 42 })({ foo: 42, bar: baz }) // true
```

