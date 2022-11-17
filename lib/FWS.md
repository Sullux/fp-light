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
()    ; call/function/resolution
[]    ; list
{}    ; scope
\     ; pass back
|     ; pipe forward
_     ; incoming scope ref

; call: a private scope that passes elements to the first element (a function)
(print foo bar) ; as in js print(foo, bar)

; function: a private scope that accepts a scope and returns the final element
([] print) ; as in js print()
([foo] (+ foo 1)) ; as in js (foo) => foo + 1
([foo _.bar] (+ foo bar)) ; no equivalent in js
({ foo bar } (+ foo bar)) ; no equivalent in js

; resolution: forces a function to resolve to a value
foo.(bar) ; as in js foo[bar]
(+ a (rng)) ; as in js a + rng()

; scope: a list of indexed and optionally named parameters
{ 42 foo bar baz: biz } ; as in js { 1: 42, foo, bar, baz: biz }
{ foo bar }: baz ; as in js destructuring: const { foo bar } = baz

; list: assign ordered and labeled values from the passed context
([foo bar] baz) ; as in js (foo, bar) => baz(foo, bar)
([foo x:bar] print) ; as in js (foo, { x: bar }) => print(foo, bar)
([..2] print) ; as in js (x, y) => print(x, y)
[x y]: foo ; as in js const [x, y] = foo

; print every element of a list

printList: ([list i]
  (?
    (> i list.length) list
    (printList (`console.log(..._) || _` list.(i)) (+ i 1))
  )
)
printList: ([list] (printList list 1))

; alternately

printList: (_ (map `console.log(..._)` _) _)
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
(_
  params: {
    Bucket: BUCKET_NAME
    Key: ($ name'@'version)
  }
  existing: (fromJson (s3.getObject (+ params Body:toJson)).Body)
  new: (+ existing isDeprecated:true)
  (s3.putObject (+ params Body:(toJson new)))
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
api: ([event]
  {action}: event
  handler: (!! handlers.(action) ($ 'Action 'action' not found'))
  (handler event)
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

const log = tap(pipe(
  { ..._, id },
  { context: _.context, id: _.id, data: stringifiedMessages },
  withKeys,
  (messages) => {
    // allow flush
    lastLog = sendMessages(messages).catch((err) => {
      console.log('failed to send messages:', err.message)
      throw err
    })
    // return synchronously from a log operation
    return undefined
  },
))
```

```
log: (_
  messages:withKeys\({..._ id}|{_.context _.id data:stringifiedMessages})
  result:(!!
    sendMessages
    ({message} (console.log 'failed to send messages:' message) (! _))
  )
  (mutate lastLog &result) ; the & causes this to pass a promise to the result
_)
```
