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

# Core Operators

```
; function call
\fn value1 value2\
[{value1 value2} fn]

; function declaration
\{arg1 arg2} statement1 statement2 returnValue\

; scope context
_ ; current scope
_.foo ; foo from current scope
_.1 ; the first argument passed to the current scope

; print every element of a list
print: (tap ({...args} `console.log(...context[args])`))
i: 0
printAll: ? i > list.length : list ?? [ \print list.(i)\ \printAll i + 1\ ]

()    ; group
[]    ; pipe
{}    ; scope
\ \   ; call/declare
```
