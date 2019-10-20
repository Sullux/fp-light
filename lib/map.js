const { isThennable } = require('./type')
const { isChainable, chain } = require('./chain')

const mapped = mapper =>
  function* (iterable) {
    for (const v of iterable) {
      yield mapper(v)
    }
  }

const chainResult = ({ fn, value }) =>
  isThennable(value)
    ? value.then(value => fn({ value }), rejection => fn({ rejection }))
    : isChainable(value)
      ? value.thenNext(fn)
      : fn({ value })

const mapChain = ({ mapper, thenNext }) => ({
  thenNext: fn =>
    thenNext(({ value, done, rejection }) =>
      done || rejection
        ? { done, rejection }
        : chainResult({ fn, value: mapper(value) })),
})

const mapIterable = ({ mapper, iterable }) => {
  const result = []
  for (const v of iterable) {
    result.push(mapper(v))
  }
  return Object.freeze(result)
}

const map = mapper =>
  iterable =>
    isChainable(iterable)
      ? mapChain({ mapper, thenNext: iterable.thenNext })
      : mapIterable({ mapper, iterable })

module.exports = {
  map,
  mapped,
}
