/* eslint no-new-func: 0 */

const { Interface: I } = require('./interface')

class ExplicitConversionArgumentsError extends Error {
  constructor (convert) {
    super(ExplicitConversionArgumentsError.message)
    this.invalidConvert = convert
  }
}
ExplicitConversionArgumentsError.message =
  'an explicit conversions must be a Convert'

Interface(
  'Convert',
  {
    input: IInterface,
    output: IInterface,
    converter: I,
  },
)
const allConverts = new WeakMap()
const isConvert = (i) => allConverts.get(i)

Interface.Convert = (input, output, converter) => {
  // todo: validate
  const convert = Object.freeze({ input, output, converter })
  allConverts.set(convert, true)
  return convert
}
Object.defineProperty(Interface.Convert, Symbol.hasInstance, {
  value: isConvert,
})

Interface.explicit = (convert) => {
  if (!isConvert(convert)) {
    throw new ExplicitConversionArgumentsError(convert)
  }
  const safeConvert = toConvertFunction(convert)
}

I(
  'Function',
  {}, // todo
)

const { Value } = require('./value')
const { isString } = require('../core/helpers')
const { isExactType } = require('../core/types')

const toSafeFunctionName = (value) =>
  value.replace(/(^[^a-zA-Z$_]|[^a-zA-Z0-9$_])/gm, '_')

const passthrough = (v) => v

const signature = (params) => { /* todo */ }

const Fn = (...statements) => {
  if (!statements.length) { return passthrough }
  if (statements.length === 1) {
    const statement = statements[0]
    if (isString(statement)) {
      const trimmed = statement.trim()
      if (!trimmed) { return passthrough }
      const name = toSafeFunctionName(trimmed)
      return Function(`const ${name} = (v) => v`)()
    }
  }
  const { stack } = new Error()
  const stackPrefix = stack.split('\n')[2]
  if (Array.isArray(statements[0])) {
    // todo
  }
}

/*
// JS
const example = Fn(
  { foo: _[0], bar: _[1], baz: _[2].baz, biz: _[2].biz},
  { sum1: add(_.foo, _.bar), sum2: add(_.baz, _.biz) },
  sub(_.sum1, _.sum2),
)
example(1, 2, [3, 4])

// FWS
example: ([foo bar [baz biz]]
  sum1: (add foo bar)
  sum2: (add baz biz)
  (sub sum1 sum2)
)
(example foo bar [baz biz])
*/

module.exports = {
  ExplicitConversionArgumentsError,
  Fn,
}
