const { I } = require('./interface')
const { IList } = require('./list')
const { Scope, ScopeContext } = require('../core/scope')

const Expression = (fn, iIn, iOut, iContext, source) => {
  if (!iIn) { return fn() }
  const context = Scope.context.current
  return (...args) => {
    const arg = (iIn === IList) ? args : args[0]
  }
}
