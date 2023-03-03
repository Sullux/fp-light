const { I } = require('./interface')
const { Scope, ScopeContext } = require('../core/scope')

const IValue = I.define({
  name: 'Value',
  properties: [],
})

I.implicit()

const Value = (key, value, source) => ({ key, value, source })
Value.push = (key, value, source) => {
  const result = Value(key, value, source)
  const stack = Scope.context.current[key] ||
    (Scope.context.current[key] = ScopeContext([]))
  stack.push(result)
  return result
}
Value.get = (key, matching) => {
  const stack = Scope.context.current[key]
  if (!stack) {
    return { key, value: undefined }
  }
  // eslint-disable-next-line no-unreachable-loop
  if (!matching) { for (const v of stack) { return v } }
  for (const v of stack) {
    if (matching(v)) { return v }
  }
  return { key, value: undefined }
}

module.exports = { Value }
