const { Spreadable } = require('../spreadable')

function And () {
  return And
}
Spreadable(And)

const factory = (Specification) => {
  const andDefinition = (options = []) => ({
    isCompatible: (t, o = []) =>
      options.every((option) => console.log('???', option, [t, o]) || Specification.isCompatible(option, [t, o])),
    isImplemented: (v) =>
      options.every((option) => Specification.isImplemented(option, v)),
    delta: (v) => {
      const deltas = options.map((option) => Specification.delta(option, v))
        .filter(({ length }) => length)
      return deltas.length === 0
        ? []
        : deltas.length > 1
          ? [And, deltas]
          : deltas[0]
    },
  })

  return andDefinition
}

module.exports = { factory, And }
