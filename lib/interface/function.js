const { Scope } = require('../core/scope')

module.exports = (I) => {
  const { Spread, Any } = Scope.current.context

  const apply = (fn, context, i) => {
    // todo
  }

  const IFunction = I({
    name: 'Function',
    apply,
  })

  return { IFunction }
}
