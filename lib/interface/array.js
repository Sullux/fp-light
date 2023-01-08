const { Scope } = require('../core/scope')

module.exports = (I) => {
  const { Spread, Any } = Scope.current.context

  const IArray = I({
    name: 'Array',
    isImplemented: (v, context) => {
      // todo
    },
  })

  const infer = (a) => a.length
    ? I.from(Array, { elements: [...a.map(I.infer), Spread.extend(Any)] })
    : IArray

  return I.defineSpecification({
    name: 'Array',
    infer: (v) => Array.isArray(v) && infer(v),
    construct: (t, c) => (t === Array) && IArray.extend(c),
  })
}
