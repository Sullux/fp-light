# fp-light 2

This is a functional programming library with a focus on point-free coding style and abstracting the complexity of asynchronous programming. This library  as no dependencies, so adding it to your project does not introduce a lot of bloat.

## Installation

```bash
npm i -P @sullux/fp-light
# or
yarn add @sullux/fp-light
```

## Assembling Javascript

There are two built-in objects: `ecma` and `fws`.

* ecma
  * Infinity
  * NaN
  * undefined
  * globalThis
  * eval()
  * isFinite()
  * isNaN()
  * parseFloat()
  * parseInt()
  * encodeURI()
  * encodeURIComponent()
  * decodeURI()
  * decodeURIComponent()
  * Object
  * Function
  * Boolean
  * Symbol
  * Error
  * AggregateError
  * EvalError
  * InternalError
  * RangeError
  * ReferenceError
  * SyntaxError
  * TypeError
  * URIError
  * Number
  * BigInt
  * Math
  * Date
  * String
  * RegExp
  * Array
  * Int8Array
  * Uint8Array
  * Uint8ClampedArray
  * Int16Array
  * Uint16Array
  * Int32Array
  * Uint32Array
  * Float32Array
  * Float64Array
  * BigInt64Array
  * BigUint64Array
  * Map
  * Set
  * WeakMap
  * WeakSet
  * ArrayBuffer
  * SharedArrayBuffer
  * Atomics
  * DataView
  * JSON
  * Promise
  * Generator
  * GeneratorFunction
  * AsyncFunction
  * AsyncGenerator
  * AsyncGeneratorFunction
  * Reflect
  * Proxy
  * Intl
  * Intl.Collator
  * Intl.DateTimeFormat
  * Intl.ListFormat
  * Intl.NumberFormat
  * Intl.PluralRules
  * Intl.RelativeTimeFormat
  * Intl.Locale
  * WebAssembly
  * WebAssembly.Module
  * WebAssembly.Instance
  * WebAssembly.Memory
  * WebAssembly.Table
  * WebAssembly.CompileError
  * WebAssembly.LinkError
  * WebAssembly.RuntimeError
  * setTimeout()
  * clearTimeout()
  * setInterval()
  * clearInterval()
  * environment (browser or node)
  * browser
  * node
  * globalThis
* fws (functional web script)
  * Type
  * Scope
  * block
  * operator
    * preUnary
    * postUnary
    * binary
  * keyword
    * preUnary
    * postUnary
    * binary
  * explicit
  * implicit
  * scope
  * inline
  * function
  * import
  * assert

```javascript
ecma
Scope: Type

@: operator.preUnary ((_) assert _.right)

String: Type

length: @String inline(_.length)
```

## Package Format

```yaml
name: ''
version: ''
description: ''
main: foo.fws
export:
  - bar
  - baz
execute:
  - main
```
