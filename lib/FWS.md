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
()    ; group
[]    ; pipe
{}    ; scope
\...\ ; dereference
\     ; pass
_     ; incoming scope ref

; group: a private scope that returns the last element
(foo + (bar - baz))
foo.(bar) ; as in js foo[bar]
(foo bar baz) ; returns baz

; pipe: like a scope except each element is passed to the next
[bar foo] ; as in js foo(bar)

; scope: a list of indexed and optionally named parameters
{ 42 foo bar baz: biz } ; as in js { 1: 42, foo, bar, baz: biz }
{ foo bar }: baz ; as in js destructuring: const { foo bar } = baz

; dereference: assign ordered and labeled values from the passed context
[\foo bar\ baz] ; as in js (foo, bar) => baz(foo, bar)
(\foo\ print\foo) ; as in js (foo) => print(foo)
(\foo: 2\ print\foo) ; as in js (ignore, foo) => print(foo)
(foo \\) ; as in js (...args) => { foo(); return args }

; print every element of a list
( \list\
  print: (`console.log(...context.args)` _)
  printAll: ? i > list.length : list ?? (print\list.(i) printAll\i:(i + 1))
  printAll\i:1
)
```

```javascript
pipe(
  {
    Bucket: BUCKET_NAME,
    Key: $`${_.name}@${_.version}`,
  },
  s3.getObject,
  _.Body,
  parse,
  { ..._, isDeprecated: true },
  {
    Bucket: BUCKET_NAME,
    Key: $`${_.name}@${_.version}`,
    Body: stringify,
  },
  s3.putObject,
)
```

```
(
  params: {
    Bucket: BUCKET_NAME
    Key: ${name'@'version}
  }
  existing: fromJson\ (s3.getObject\ (params + Body:toJson)).Body
  new: existing + isDeprecated:true
  s3.putObject\ (params + Body:toJson\new)
)
```

```javascript
const api = ({
  handlers,
}) => {
  const apiDataFunc = async (event) => {
    const handler = handlers[event.action]
    if (!handler) {
      throw new Error(`Action "${event.action}" not found`)
    }
    return handler(event)
  }

  return apiDataFunc
}
```

```
api: (\event\
  {action}: event
  handler: handlers.(action) !! ${'Action 'action' not found'}
  handler\event
)
```

```javascript
const withKeys = pipe(
  { baseKey, data: _.data },
  reduce(
    {
      state: [],
      reducer: [..._.state, { key, message: _.value }],
    },
    _.data,
  ),
)

const log = pipe(
  { ..._, id },
  { context: _.context, id: _.id, data: stringifiedMessages },
  withKeys,
  (messages) => {
    // allow flush
    lastLog = sendMessages(messages).catch((err) => {
      console.log(err)
      throw err
    })
    // synchronously return undefined from a log operation
    return undefined
  },
)
```

```
log: (
  ; todo
  _ ; return the original argument, not undefined!
)
```
