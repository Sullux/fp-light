const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const skip = curry(function* (count, iterable) {
  let i = 1
  for (const v of iterable) { // eslint-disable-line no-restricted-syntax
    if (i > count) {
      yield v
    }
    i += 1
  }
})

module.exports = {
  skip,
}
