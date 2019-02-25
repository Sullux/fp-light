const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const reduce = curry((reducer, initialState, iterable) => {
  let i = 0
  let state = initialState
  for (const v of iterable) { // eslint-disable-line no-restricted-syntax
    state = reducer(state, v, i, iterable)
    i += 1
  }
  return state
})

module.exports = {
  reduce,
}
