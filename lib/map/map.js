/* eslint-disable no-restricted-syntax */
const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const map = curry(function* (mapper, iterable) {
  let i = 0
  let previous
  for (const v of iterable) {
    const index = i
    i += 1
    if (previous) {
      yield (previous = previous.then(() => mapper(v, index, iterable)))
      continue
    }
    const mapped = mapper(v, index, iterable)
    yield mapped && mapped.then && (typeof mapped.then === 'function')
      ? (previous = mapped)
      : mapped
  }
})

module.exports = {
  map,
}
