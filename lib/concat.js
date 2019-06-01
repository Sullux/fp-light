const iteratorFrom = any =>
  ((any !== null) && (typeof any === 'object') && !(any instanceof Date)
    ? any[Symbol.iterator]
      ? any[Symbol.iterator]()
      : Object.entries(any)[Symbol.iterator]()
    : (typeof any === 'function')
      ? any()
      : [any][Symbol.iterator]())

const concat = function* (...iterables) {
  for (const v of iterables) { // eslint-disable-line no-restricted-syntax
    yield * iteratorFrom(v)
  }
}

module.exports = { concat }
