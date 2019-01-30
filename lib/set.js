const Iterable = require('./iterable')

const { take } = Iterable

let Set
let setFactory

const setSymbol = Symbol()

const isSet = instance => instance && !!instance[setSymbol]

setFactory = (any) => {
  // todo
}

Set = {
  [Symbol.hasInstance]: isSet,
  isSet,
  from: setFactory,
}

module.exports = Set
