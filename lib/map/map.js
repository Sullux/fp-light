const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const map = curry(function* (mapper, iterable) {
  for (const v of iterable) { // eslint-disable-line no-restricted-syntax
    yield mapper(v)
  }
})

module.exports = {
  map,
}
