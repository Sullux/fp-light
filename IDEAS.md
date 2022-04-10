```javascript
import { AssertionError } from 'assert'

const js = {
  Number: define('js.Number')
  String: define('js.String')
}

const fail = define('fail',
  undefined,
  { message: js.String }
  ({ message, actual, expected, operator, stackStartFn }) => {
    throw new AssertionError({
      message: message || `Assertion failed: ${actual} ${operator} ${expected}`,
      actual,
      expected,
      operator,
      stackStartFn: stackStartFn || fail,
    })
  },
)

method(js.Number, 'assertSafeInteger', Number, Any,
  (n) => Number.isSafeInteger(n)
    ? undefined
    : fail({ operator: `Number.isSafeInteger(${n})` }),
)

const assertSafeInteger = define(
  'assertSafeInteger',
  js.Number,
  '',
  AssertionError,
) (n) => Number.isSafeInteger(n)
  ? undefined
  : fail({
    actual: false,
    expected: true,
    operator: `Number.isSafeInteger(${n})`,
  })

const Int32 = define('Int32')
const Int16 = define('Int16')
const Int8 = define('Int8')
const UInt32 = define('UInt32')
const UInt16 = define('UInt16')
const UInt8 = define('UInt8')
const Int = define('Int')
alias(Int, 'Int64', 'Integer')
implicit(Int, Int32, Int16, Int8, UInt32, UInt16, UInt8)
explicit(Int, js.Number, 'assertSafeInteger(@1) || @1')

define(
  'Int',
  {
    alias: ['Int64', 'Integer'],
    implicit: ['Int32, ', 'Int16, ', 'Int8, ', 'UInt32, ', 'UInt16, ', 'UInt8, ']
    explicit: [
      { from: js.Number, to: (n) => assert(Number.isSafeInteger(n)) || n }
      {
        from: js.String,
        to: (n) => {
          const int = Number.parseInt(n)
          assert(Number.isSafeInteger(int))
          return int
        }
      }
    ],
  }
)
define(
  'Int8',
  { implicit: [Int] }
)
define(
  Operator('+'),
  {
    input: [
      [Int, Int],
      [Int, Int8],
      [Int, Int16],
      [Int, Int32],
    ],
    output: Int,
    fn: (n1, n2) => n1 + n2,
  },
  {
    input: [
      [Int, Float],
      [Float, Int],
      [Int, Int16],
      [Int, Int32],
    ],
    impl: [Int],
    fn: (n1, n2) => n1 + n2,
  },
  (n1, n2) => n1 + n2,
)
define(
  Operator('|>'),
  (Input1 => Output1 fn1, Input2 => Output2 fn2) => (Input1),
)
```

## Syntax

```javascript
const Whitespace = Element(
  (c, i, element) => ' \0\b\f\n\r\t\v'.includes(c) &&
    (Whitespace.is(element)
      ? element.append(c)
      : Whitespace(c)),
)

const Paren = {
  Open: Element((c) => c === '(')),
  Close: Element((c) => c === '(')),
}

const OpenParen = Element((c)) // todo

const Number = Expression(
  'Number',
  [Element('char', ['0']), ],
  (elements) => {
    // todo: compile
  }
)

const String = Expression(
  'String',
  [
    Element(
      'escape',
      ['\\0', '\\b', '\\f', '\\n', '\\r', '\\t', '\\v', "\\'", '\\"', '\\\\'],
    ),
    Element(
      'unicodeBasic',
      [], // todo: \uXXXX
    ),
    Element(
      'unicodeFull',
      [], // todo: \u{XXXXXX}
    ),
    Element(
      'unicodeLatin',
      [], // todo: \xXX
    ),
    Element('fragment'),
  ],
  (elements) => {
    // todo: compile
  }
)

const TemplateLiteral = Expression(
  'TemplateLiteral',
  [],
  (expressions) => {
    // todo: compile
  }
)

const Fjs = Syntax(
  Expression.any([
    Expression('call', Identifier, '(', [Any], ')'),
    Expression('const', Identifier, ':', Any),
  ]),
  (expressions) => {
    // todo: compile
  },
)
```
