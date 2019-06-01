const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const range = curry(function* (start, end) {
  let i = start
  if (start > end) {
    while (i >= end) {
      yield i
      i -= 1
    }
    return
  }
  while (i <= end) {
    yield i
    i += 1
  }
})

module.exports = {
  range,
}
