# Compilation

* [`parser`](#parser)
* [`compiler`](#compiler)
* [`assembler`](#assembler)
* [`linker`](#linker)
* [`parse`](#parse)
* [`compile`](#compile)
* [`assemble`](#assemble)
* [`link`](#link)

## `parser`

Pushes a new parser into the current context.

* _args_
  * `input`
    * `file`
    * `offset`
    * `text`
* _returns_
  * `length`
  * `type`
  * `value`

```javascript
parser((nextParser) =>
  (input) => input.text[offset] === '!'
    ? { ...input, length: 1, type: 'token', value: '!' }
    : nextParser(input))
```

## `compiler`

Pushes a new compiler into the current context.

* _args_
  * `input`
    * `elements`
    * `offset`
    * `expressions`
* _returns_
  * `elements`
  * `offset`
  * `expressions`
    * `elements`
    * `ref`
    * `args`
    * `precedence`

```javascript
compiler((nextCompiler, compile) =>
  (input) => {
    const { type, value } = elements[offset]
    if ((type !== 'token') || (value !== '!') || (input.length < 2)) {
      return nextCompiler(input)
    }
    const nextArg = compile(input, 1) // advance 1
    return {
      ...input,
      length: nextArg.length + 1,
      ref: 'ecma.operators.falsy',
      args: [nextArg],
    }
  })
```

## `assembler`

Pushes a new assembler into the current context.

* _args_
  * `input`
    * `elements`
    * `expressions`
    * `context`
* _returns_
  * `elements`
  * `offset`
  * `length`
  * `ref`
  * `args`
  * `input`
  * `output`
  * `context`

```javascript
assembler((assemble) =>
  (input) => {
    if (input.ref !== 'ecma.operators.falsy') {
      return assemble(input)
    }
    const { ref, args } = assemble(input.args[0])
    return ref.startsWith('ecma.')
      ? assemble({ ...input, ref: 'ecma.Boolean', args: [!args[0]] })
      : assemble(input)
  })
```

## `linker`

Pushes a new linker into the current context.

* _args_
  * `precedence`
  * `input`
    * `elements`
    * `offset`
    * `length`
    * `ref`
    * `args`
    * `input`
    * `output`
    * `context`
* _returns_
  * `invoke`
  * `toEcma`

## `parse`

Invokes the parser with the given text.

## `compile`

Invokes the compiler with the given element.

## `assemble`

Invokes the assembler with the given function.

## `link`

Invokes the linker with the given function.

# Internals

## Parsed Element Types

* token: a label, keyword or symbol
* string: plain text data
* number: numeric data
* boolean: a true/false value

## Ref Values in the Assembler

### Native Types

* ecma.Primitive
* ecma.Array
* ecma.ArrayBuffer
* ecma.BigInt
* ecma.BigInt64Array
* ecma.BigUint64Array
* ecma.Boolean
* ecma.Buffer
* ecma.DataView
* ecma.Date
* ecma.Error
* ecma.EvalError
* ecma.FinalizationRegistry
* ecma.Float32Array
* ecma.Float64Array
* ecma.Function
* ecma.Int16Array
* ecma.Int32Array
* ecma.Int8Array
* ecma.Map
* ecma.Null
* ecma.Number
* ecma.Object
* ecma.Promise
* ecma.Proxy
* ecma.RangeError
* ecma.ReferenceError
* ecma.RegExp
* ecma.Set
* ecma.SharedArrayBuffer
* ecma.String
* ecma.Symbol
* ecma.SyntaxError
* ecma.TextDecoder
* ecma.TextEncoder
* ecma.TypeError
* ecma.URIError
* ecma.URL
* ecma.URLSearchParams
* ecma.Uint16Array
* ecma.Uint32Array
* ecma.Uint8Array
* ecma.Uint8ClampedArray
* ecma.Undefined
* ecma.WeakMap
* ecma.WeakRef
* ecma.WeakSet

### Native Operators

* ecma.operators.falsy
* ecma.operators.truthy
* ecma.operators.rest
* ecma.operators.math.add
* ecma.operators.math.sub
* ecma.operators.math.mul
* ecma.operators.math.div
* ecma.operators.math.mod
* ecma.operators.math.exp
* ecma.operators.math.neg
* ecma.operators.bitwise.and
* ecma.operators.bitwise.or
* ecma.operators.bitwise.not
* ecma.operators.logic.and
* ecma.operators.logic.or
* ecma.operators.logic.gt
* ecma.operators.logic.lt
* ecma.operators.logic.gte
* ecma.operators.logic.lte
* ecma.operators.logic.eq

### FP Assembler Functions

* fp.enter
* fp.leave
* fp.push
* fp.set
* fp.call
* fp.get
* fp.pop

## Example

### Ecma

```javascript
const incrementAndDouble = (v) => (v + 1) * 2

module.exports = incrementAndDouble(20)
```

### FP

```
incrementAndDouble (fn (mul 2 (add 1)))

(incrementAndDouble 20)
```

### Parsed

```javascript
[
  { type: 'BOF', uri: 'file://./foo.fws', text: '...' },
  { type: 'token', value: 'incrementAndDouble' },
  { type: 'operator', value: '(' },
  { type: 'token', value: 'fn' },
  { type: 'token', value: 'mul' },
  { type: 'operator', value: '(' },
  { type: 'number', value: 2 },
  { type: 'token', value: 'add' },
  { type: 'operator', value: '(' },
  { type: 'number', value: 1 },
  { type: 'operator', value: ')' },
  { type: 'operator', value: ')' },
  { type: 'operator', value: ')' },
  { type: 'operator', value: '(' },
  { type: 'token', value: 'incrementAndDouble' },
  { type: 'number', value: 20 },
  { type: 'operator', value: ')' },
  { type: 'EOF' },
]
// each element also has uri, offset, lenght, position, endPosition
```

### Compiled

```javascript
[
  'incrementAndDouble',
  ['fn', ['mul', ['ecma.Number', 2], ['add', ['ecma.Number', 1]]]],
  ['incrementAndDouble', ['ecma.Number', 20]]
]
```

### Assembled

```javascript
{
  incrementAndDouble: {
    fn: [fromContext, 'fn'],
    mul: [fromContext, 'mul'],
    add: [fromContext, 'add'],
    [output]: [
      'fn',
      ['mul', ['ecma.Number', 2], ['add', ['ecma.Number', 1]]],
    ],
  },
  [output]: ['incrementAndDouble', ['ecma.Number', 20]],
}
```

### Linked

```javascript
// index.js
import core from 'core'
import math from 'math'
import foo as fooFactory from './foo.js'
export const foo = fooFactory({ core, math })
// foo.js
export default (({ core, math }) => {
  const { fn } = core
  const { mul, add } = math
  const incrementAndDouble = fn(mul(2, add(1)))
})({ core, math })
context.module('./foo', (async (context) => {
  const { fn } = await context.import('core')
  const { mul, add } = await context.import('math')
  const incrementAndDouble = fn(mul(2, add(1)))
  return incrementAndDouble(20)
})(context))
```
