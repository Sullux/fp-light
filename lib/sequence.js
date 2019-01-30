const Iterable = require('./iterable')

const { take } = Iterable

let Sequence
let sequenceFactory

const sequenceSymbol = Symbol()

const isSequence = instance => instance && !!instance[sequenceSymbol]

sequenceFactory = (any) => {
  const data = Iterable.from(any).toArray()
  const properties = () => ({
    [sequenceSymbol]: true,
    append: (value) => {
      data.push(value)
      return Object.assign(
        properties(),
        take(data.length, data),
      )
    }
  })
  return Object.assign(
    properties(),
    take(data.length, data),
  )
}

Sequence = {
  [Symbol.hasInstance]: isSequence,
  isSequence,
  from: sequenceFactory,
}

module.exports = Sequence
