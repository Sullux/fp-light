/* eslint-disable no-restricted-syntax */
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
  for (const v of iterable) {
    const index = i
    i += 1
    state = 
      state && state.then && (typeof state.then === 'function')
        ? state.then(s => reducer(s, v, index, iterable))
        : reducer(state, v, index, iterable)
  }
  return state
})

module.exports = {
  reduce,
}
