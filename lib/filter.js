const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const filter = curry(function* (test, iterable) {
  for (const v of iterable) { // eslint-disable-line no-restricted-syntax
    if (test(v)) {
      yield v
    }
  }
})

module.exports = {
  filter,
}
