const { isThennable } = require('./type')
const { resolve } = require('./resolve')

const filtered = Symbol('filtered')

const filter = test =>
  function* (iterable) {
    let previous
    const resolver = resolve(value => test(value) ? value : filtered)
    for (const v of iterable) { // eslint-disable-line no-restricted-syntax
      if (previous) {
        yield (previous = previous.then(() => resolver(v)))
        continue
      }
      if (isThennable(v)) {
        previous = v
        yield resolver(v)
        continue
      }
      if (test(v)) {
        yield v
      }
    }
  }

module.exports = {
  filter,
  filtered,
}
