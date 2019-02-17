const iteratorFrom = any =>
  ((any !== null) && (typeof any === 'object') && !(any instanceof Date)
    ? any[Symbol.iterator]
      ? any[Symbol.iterator]()
      : Object.entries(any)[Symbol.iterator]()
    : (typeof any === 'function')
      ? any()
      : [any][Symbol.iterator]())

const concat = (...iterables) => ({
  * [Symbol.iterator]() {
    for (let i = 0, length = iterables.length; i < length; i++) {
      yield* iteratorFrom(iterables[i])
    }
  }
})

module.exports = { concat }
