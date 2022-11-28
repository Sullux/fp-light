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
[]    ; scope
{}    ; inline
\     ; pass back
|     ; pipe forward
_     ; implicit argument ref
.     ; dereference
:     ; assign
..    ; range
...   ; spread
' '   ; text
" "   ; label
` `   ; assembly
@     ; module ref
```

## ( )

### call

FWS:

```
(foo)

(foo bar baz)

(foo (bar baz))

(foo ...bar)
```

JS:

```javascript
foo()

foo(bar, baz)

foo(bar(baz))

foo(...bar)
```

### function

FWS:

```
([] random: (rng) (* random 100))

([foo ...bar] log(foo) (+ ...bar))

([foo (bar baz)] (* (+ foo bar) baz))
```

JS:

```javascript
() => {
  const random = rng()
  return random * 100
}

(foo, ...bar) => {
  log(foo)
  return bar.reduce((s, v) => s + v, 0)
}

// closest approximation
({ 0:foo bar baz }) => (foo + bar) * baz
```

### resolution

FWS:

```
foo.(bar)

(+ foo (bar))
```

JS:

```javascript
foo[bar]

foo + (await bar) // or foo + bar()
```

## [ ]

### scope

A scope contains entries, and each entry has a 1-based index and optionally a label. In ECMA, scopes and entries might be represented along the lines of:

```javascript
const entry = (index, label, value) => ({ index, label, value })
const scope = (...entries) => entries

// [foo:42 'bar']
scope(entry(1, 'foo', 42), entry(2, null, 'bar'))
```

Scopes are created with square brackets. Each entry in a scope is automatically assigned an index based on its position, and may or may not be labeled. Using the above `entry` and `scope` ecma functions:

FWS

```
[foo:42 bar:'baz']

['bar' 'baz' 'biz']

[bar baz 42]
```

JS

```javascript
// entry(index, label, value)
scope(
  entry(1, 'foo', 42),
  entry(2, 'bar', 'baz'),
)

scope(
  entry(1, null, 'bar'),
  entry(2, null, 'baz'),
  entry(3, null, 'biz'),
)

scope(
  entry(1, null, bar),
  entry(2, null, baz),
  entry(3, null, 42),
)
```

### Dot Rules

Because entries are both indexed and labeled, entries can be referred to by either their label or their index. Since all labels are strings and all indexes are integers, there are some simple rules regarding dot notation on a scope:

* `scope.foo` get the entry labeled "foo"
* `x:foo scope.(x)` get the entry labeled "foo"
* `scope.42` get the entry at index 42
* `x:42 scope.(x)` get the entry at index 42
* `scope.0` get the last entry in the scope
* `(index scope.0)` get the index of the last entry in the scope
* `(count scope)` same as `(index scope.0)`
* `scope.(-1)` get the second to last entry in the scope

### Dereferening

Having entries both indexed and labeled could make for some complications when dereferencing. As such, the rules are:

* `[foo]: x` brings the entry from scope x at index 1 into current scope with label `foo`; same as `foo: x.foo`
* `[.foo]: x` brings the entry from scope x with label `foo` into the current scope with label `foo`
* `[..foo bar]: x` brings the entries from scope x with labels `foo` and `bar` into the current scope with labels `foo` and `bar`
* `[foo bar:baz]: x` brings the entry from scope x at index 1 into current scope with label `foo` and the entry from scope x with label `bar` into current scope with label `baz`
* `[foo..bar baz]` brings the entry from scope x at index 1 into current scope with label `foo` and the entries from scope x with labels `bar` and `baz` into current scope with labels `bar` and `baz`

Because there is no analog to these kinds of entries in ECMA, there are no fws/js code samples for this feature.

## { }

### Inline

Like a function call except only implicit argument operators can be used.

FWS:

```
inversePoint: {
  x: (- _.x)
  y: (- _.y)
  [x y]
}
```

JS:

```javascript
const inversePoint = (_) => {
  const x = -_.x
  const y = -_.y
  return { x, y }
}
```

## \

### Pass Back

Passes the following experession back to the preceding function. The single backslash `\` will pass a single value back as the only entry in the scope while a double backslash `\\` will pass an entire scope back; thus, `x \ y` is equivalent to `x \\ [y]`.

FWS:

```
log \ format \ x
```

JS:

```javascript
log(format(x))
```

## |

### Pipe Forward

Pipes the preceding expression forward to the following function. The single pipe `|` will pipe a single value forward as the only entry in the scope while a double pipe `||` will pipe an entire scope forward; thus, `x | y` is equivalent to `[x] || y`.

FWS:

```
x | format | log

factorial: ([count]
  [1 0] || ([[next sum]]
    (?
      (= next count) (+ next sum)
      (_ (+ next 1) (+ sum next))
    )
  )
)
```

JS:

```javascript
log(format(x))

const factorial = (count) => {
  const nextSum = (next, sum) =>
    next === count
      ? next + sum
      : nextSum(next + 1, sum + next)
  return nextSum(1, 0)
}
```

## _

### Implicit Argument Reference

Refers to the first argument passed to the current function. The implicit arguments (plural) reference is the double underscore `__`; thus, `__.1` is equivalent to `_`.

FWS:

```
inc: (+ _ 1)

sum: (+ ...__)
```

JS:

```javascript
const inc = (_) => _ + 1

const sum = (...__) => __.reduce((s, v) => s + v, 0)
```

The underscore also refers to the current function such that the current function can be called recursively with `(_ args)`. It also means that the outer (parent) function could be called recursively with `(_._ args)`.

## .

### Derefernce

The dereference operator accesses a property of a value.

FWS:

```
x.foo

x.(foo)

x.1

x."foo bar"
```

JS:

```javascript
x.foo

x[foo]

x.1

x['foo bar']
```

## :

### Assign

Assigns the value to the given label throughout the current scope.

FWS:

```
myScope: [foo:42 "bar baz":'biz']

bar: {
  (print foo)
  foo: 42
}
```

JS:

```javascript
const myScope = Object.freeze({
  foo: 42,
  'bar baz': 'biz',
})

const bar = (({ foo }) => {
  print(foo)
  return foo
})({ foo: 42 })
```

## ..

### Range

Creats a numeric or character range through and including the given numbers or characters.

FWS:

```
[1..3]

['a'..'c']

'a'..'c'

(+ 1..3)
```

JS:

```javascript
[1, 2, 3]

['a', 'b', 'c']

'abc'

sum(1, 2, 3) // approximation
```

## ...

### Spread

Spreads the given expression into the current scope. This operator mostly behaves as the Javascript sperad operator, but there is one additional piece of functionality: the ability to spread a scope into current context. This is a useful technique for dependency injection. If a module requires, say, the ability to read a file from disk, the module may use a reference to an undeclared `fileFromDisk` function. That means the module cannot be executed as written; however, the module _can_ be included in another module that _does_ declare the `fileFromDisk` function. In that way runtime dependencies can be separated from test-time dependencies.

FWS:

```
foo: (+ ...bar)

foo: [bar ...baz]

...@foo
```

JS:

```javascript
const foo = sum(...bar)

const foo = { bar, ...baz }

eval(readFileSync('foo.js')) // approximation
```

Spreading a scope into the current context might be useful in this format:

```
// index.fws
fileFromDisk: @fs.fileFromDisk
cache: ...@cache

// cache.fws
fromCache: {(|| (fileFromDisk _) missing)}

// cache.test.fws
"should return file from disk": {
  data: 'datadatadatadata'
  fileFromDisk: {(assert (= _ 'foo.dat')) data}
  [fromCache]: ...@cache
  (assert (= (fromCache 'foo.dat') data))
}
```

## ' '

### Text

FWS:

```
foo: 'bar'

str: ($ 'foo is 'foo'.')
```

JS:

```javascript
const foo = 'bar'

const str = `foo is ${foo}.`
```

## " "

### Label

Labels that conform to element naming rules do not need quotes, but technically any quoted string can be used as a label. That means function names can technically contain spaces or special characters if properly quoted.

FWS:

```
"foo bar": ([foo bar] (* (+ foo foo) (+bar bar)))
answer: ("foo bar" 1 10.5)
```

JS:

```javascript
// no real equivalent
const fns = { ['foo bar]': (foo, bar) => (foo + foo) * (bar + bar) }
const answer = fns['foo bar'](1, 10.5)
```

## \` \`

### Assembly

An assembly block is a native-language function to be invoked in the compiled module. Assembly blocks are inferred to be asynchronous and dynamically-typed (of type `ecma.Promise`). Additional logic and hints can be used to narrow the treatment of an assembly block by the compiler.

FWS:

```
(`(x) => x + 1 * 2` 20)

(assume (ecma.Number) (`(x) => x + 1 * 2` 20))
```

JS:

```
Promise.resolve(((x) => (x + 1) * 2)(20))

;((x) => (x + 1) * 2)(20)
```

In addition to inline assembly, an ecma context can be used to provide a more modular experience. The ecma context is mutable at compile time and provides to following methods:

* `add`: adds the given assembly to the top level of the context (useful for `require` statements or constants)
* `call`: calls the given assembly within the context

FWS:

```
fsContext: (+
  (ecma.context)
  `const { readFile } = require('fs/promises')`
)
asyncBuffer: {(as (ecma.Promise.of node.Buffer node.SystemError) _)}
fileFromDisk: ([path]
  ecma.String.assert\path
  asyncBuffer\(fsContext.call `readFile(path)` path)
)
```

This example first creates a new Javascript context with `(ecma.context)`. It then adds an assignment to the context to import the `readFile` function from the Node filesystem module. Finally, it calls an ecma snippet within the context while trapping errors.

## @

### Module Reference

This references another module in the project by name. A project is defined by the existance of a `.package.fws` file. Module references are resolved as follows:

* `name`
  * looks in the package file for `modules: name: path/to/package`
  * looks for `name.fws` at the package root
  * looks for `name/index.fws` from the package root
  * scans up to the next higher level package root and repeats
* `./name`
  * looks for `name.fws` in the directory of the current file
  * looks for `name/index.fws` from the directory of the current file

Once resolved, the module is parsed and compiled if necessary. Modules are only parsed and compiled once, so subsequent references to the same file will use the already-compiled version.

FWS:

```
[foo bar]: @foobar

(@foobar.foo 42)
```

JS:

```javascript
const { foo, bar } = require('foobar') // approximation

require('foobar').foo(42)
```

# Examples

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
{
  params: [
    Bucket: BUCKET_NAME
    Key: ($ name'@'version)
  ]
  existing: (fromJson (s3.getObject (+ params Body:toJson)).Body)
  new: (+ existing isDeprecated:true)
  (s3.putObject (+ params Body:(toJson new)))
}
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
