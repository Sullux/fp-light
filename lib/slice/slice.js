const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const slice = curry(function* (begin, end, iterable) {
  let i = 1
  for (const v of iterable) { // eslint-disable-line no-restricted-syntax
    i += 1
    if (i > end) {
      return
    }
    if (i > begin) {
      yield v
    }
  }
})

module.exports = {
  slice,
}
