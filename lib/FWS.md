# Functional Web Script

todo

# Basic Compiler

The context that is passed to custom compilers:

```javascript
const context = {
  utils: {
    advanced: () => {}, // todo
    withParser: () => {}, // todo
    withOutput: () => {}, // todo
    withUtil: () => {}, // todo
    push: () => {}, // todo
    pop: () => {}, // todo
    parseNext: () => {}, // todo
    bof: Symbol('bof'),
    eof: Symbol('eof'),
    whitespace: '\n\r\v\t\b\f \xa0',
  },
  input: [],
  parsers: [],
  stack: [],
  outputs: [],
}
```

The FWS code to incorporate a custom compiler:

```
#compiler foo.js
```

The JS code to implement the custom compiler:

```javascript
// foo.js

const importParser = () => {
  // todo
}

module.exports = {
  importParser, // for unit tests
  fws: [importParser], // for the FWS compiler
}
```

# Core Parsers

todo

* label
* comment
* pragma
* string
* number

# Core Operators

todo

## assignment

`foo: 'bar'`

## dot

`foo.bar`

## pipe

`[foo bar]`

## scope

`{ foo: 'bar' }`

## dereference

`{{foo}}`

## pass

`foo (bar: 42)` eqivalent of `[{ bar: 42 } foo]`

## spread

`...foo`

## ref

`foo: @file.bar`

`...@file`
