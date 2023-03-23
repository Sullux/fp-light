# Built-In Language Elements

* [`dat`](#dat)
* [`seq`](#seq)
* [`range`](#range)
* [`from`](#from)
* [`with`](#with)
* [`without`](#without)
* [`fn`](#fn)
* [`impure`](#impure)
* [`arg`](#arg)
* [`ctx`](#ctx)
* [`pipe`](#pipe)
* [`spec`](#spec)
* [`invoke`](#invoke)

## `dat`

Declare a dat object.

```
; named
(dat foo 42)

; named with spaces
(dat "foo bar" 42)

; multiple values
(dat
  foo 42
  bar 'baz')

; nested dat
(dat
  foo 42
  bar (dat baz 'biz'))

; unnamed
42
```

## `seq`

Create a sequence of indexed values.

_Indexed values_

```
(seq 'foo' 'bar' 'baz')
```

```javascript
['foo', 'bar', 'baz']
```

_Indexed data objects_

```
(seq (dat x 'foo') (dat y 'bar'))
```

```javascript
[{ x: 'foo' }, { y: 'bar' }]
// or alternately, equivalent to:
{ x: 'foo', y: 'bar' }
```

## `range`

Create a progressive sequence of values.

_Computed sequence:_

```
(dat x (range 1 3))
```

```javascript
const x = [1, 2, 3]
```

## `from`

Get one or more values from a sequence or data object.

_Named_

```
(dat foo (dat x 'foo' y 'bar'))
(dat values (from foo x y))
```

```javascript
const foo = { x: 'foo', y: 'bar' }
const values = { x: foo.x, y: foo.y }
```

_Renamed_

```
(dat foo (dat x 'foo' y 'bar'))
(dat values (from foo (dat x a y b)))
```

```javascript
const foo = { x: 'foo', y: 'bar' }
const values = { a: foo.x, b: foo.y }
```

_Unnamed_

```
(dat foo (dat x 'foo' y 'bar'))
(dat values (from foo (seq x y)))
```

```javascript
const foo = { x: 'foo', y: 'bar' }
const values = [foo.x, foo.y]
```

## `with`

Spread a sequence or data object into the current scope.

```
(dat foo (dat x 'foo' y 'bar'))
(dat bar (dat
  (with foo)
  z 'baz'
))
```

```javascript
const foo = { x: 'foo', y: 'bar' }
const bar = { ...foo, z: 'baz' }
```

## `without`

Exclude a key from the current scope.

```
(dat foo (dat x 'foo' y 'bar'))
(dat bar (dat
  (with foo)
  (without x)
  z 'baz'
))
```

```javascript
// approximation
const foo = { x: 'foo', y: 'bar' }
const bar = { ...foo, x: undefined, z: 'baz' }
```

## `fn`

Create a function as a sequence of key/value expressions (as in a data object) but where the last expression is the return value from the function.

_Simple function_

```
(fn
  x 20
  y (add 1 x)
  (mul y 2)
)
```

```javascript
() => {
  const x = 20
  const y = x + 1
  return y * 2
}
```

## `impure`

Create an impure function out of an existing function. This will indicate to the compiler that the function may produce different outputs give the same inputs.

```
(fn
  nextCounterRaw (int `let i = 0; return () => i++;`)
  nextCounter (impure nextCounterRaw)
  (spec
    (equal (seq (nextCounterRaw) (nextCounterRaw)) (seq 0 0))
    (equal (seq (nextCounter) (nextCounter)) (seq 0 1))
  )
  nextCounter
)
```

## `arg`

A reference to the current function argument.

```
(fn
  (with (from arg x y))
  (add x y)
)
```

```javascript
(arg) => {
  const { x, y } = arg
  return x + y
}
```

## `ctx`

An explicit reference to the current context.

```
(fn
  (with (from ctx x y) (from (from ctx ctx) z))
  (add x y z)
)
```

There is no equivalent in Javascript because context is implicit. If we use a made up `context` object in Javascript as a stand-in, the above might look like:

```javascript
const context = {
  context: parentContext,
  x: 40,
  y: 2,
}

() => {
  const { x, y context: { z } } = context
  return x + y + z
}
```

## `pipe`

Create a function as a sequence of expressions where the first expression receives the argument, the result of the first expression is passed as the argument to the next expression, and so on. The result of the final expression is the return value of the pipe.

```
(dat incrementAndDouble (pipe
  (add 1)
  (mul 2)
))
(log (incrementAndDouble 20)) ; prints 42
```

```javascript
const incrementAndDouble = (v1) => {
  const v2 = v1 + 1
  const v3 = v2 * 2
  return v3
}
console.log(incrementAndDouble(20)) // prints 42
```

## `spec`

Create a specification. A specification is like an interface but can include complex criteria for both compile-time and runtime. A specification is a sequence where each element of the sequence can be a data object or an expression.

_A simple specification_

```
(dat Point (spec
  (dat
    name (String (dat maxLength 64 minLength 1))
    x Int
    y Int
  )
  (lt 1000 (add x y))
))
```

```javascript
// no real equivalent, but roughly:
const Point = ({ name, x, y }) => {
  assert(typeof name === 'string')
  assert(name.length <= 64)
  assert(name.length >= 1)
  assert(Number.isInteger(x))
  assert(Number.isInteger(y))
  assert((x + y) < 1000)
  return { name, x, y }
}
```

_A specification that extends another specification_

```
(dat ZPoint (spec
  (with Point)
  (dat z Int)
  (fn (lt 1000 (add x y z)))
))
```

```javascript
// no real equivalent, but roughly:
const ZPoint = ({ ...point, z }) => {
  const pointData = Point(point)
  const { x, y } = pointData
  assert((x + y + z) < 1000)
  return { ...pointData, z }
}
```

## `invoke`

Creates specification information for a function.

```
(dat PointHandler (spec
  (invoke Point Point)
))
```

```javascript
// no real equivalent, but roughly:
const PointHandler = (fn) =>
  (arg) => {
    const input = Point(arg)
    const output = fn(input)
    return Point(output)
  }
```

## `parse`

Parse text info a callable function.

```
(fn
  (from _ (seq name value))
  (parse ('(log 'name' '(fmt json value)')'))
)
```

```javascript
// roughly:
Function('name', 'value', 'console.log(name, value); return [name, value]')
```

## `define`

Define a compile-time macro.

_Create a `compose` language element that is the reverse of a pipe_
```
(dat compose (define
  (pipe (with reverse))
))

(dat incrementAndDouble (compose
  (mul 2)
  (add 1)
))
(log (incrementAndDouble 20)) ; logs 42
```

```javascript
const compose = (...expressions) =>
  pipe([...expressions].reverse())

const incrementAndDouble = compose(
  (v) => v * 2,
  (v) => v + 1,
)
console.log(incrementAndDouble(20)) // logs 42
```

## `compile`

Define a compile-time macro using native source code.

```
(compile '
  // context, compile, parse
  const { current } = context
  const { _, fn, Sequence, String, spec } = current
  current.join = compile(
    Sequence({ element: String }),
    _,
    (separator, ...values) => values.join(separator),
    String,
  )
')
```
