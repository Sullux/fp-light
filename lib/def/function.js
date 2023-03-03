/* eslint no-new-func: 0 */

const { I } = require('./interface')

I({
  name: 'Function',
  properties: [], // todo
})

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
