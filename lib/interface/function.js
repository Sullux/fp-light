const { isFunction } = require('../core/helpers')
const { Scope } = require('../core/scope')

module.exports = (I) => {
  const { Any } = Scope.current.context

  const apply = (fn, context, i) => {
    const compare = I.get(fn)
    const args = context.args.apply(compare.args)
    const returns = context.returns.apply(compare.returns)
    const throws = context.throws.apply(compare.throws)
    return args === returns === throws === undefined
      ? undefined
      : i
  }

  const IFunction = I({
    name: 'Function',
    apply,
  })

  const defaultFunction = IFunction.extend({
    args: Scope.current.context.Array,
    returns: Any,
    throws: [Any],
  })

  const IFunctionSpec = I.defineSpecification({
    name: 'Function',
    infer: (v) => isFunction(v) && (I.get(v) || defaultFunction),
  })

  return { IFunction, IFunctionSpec }
}
