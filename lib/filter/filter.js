const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const filter = curry((test, iterable) => ({
  * [Symbol.iterator]() {
    const i = iterable[Symbol.iterator]()
    while (i) {
      const { value, done } = i.next()
      if (done) {
        return
      }
      if (test(value)) {
        yield value
      }
    }
  }
}))

module.exports = {
  filter,
}
