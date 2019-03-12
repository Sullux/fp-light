/* eslint-disable no-restricted-syntax */
const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const isThennable = value =>
  value && value.then && (typeof value.then === 'function')
  
const promiseOf = value =>
  isThennable(value)
    ? value
    : Promise.resolve(value)

const asyncMap = curry(function* (mapper, iterable) {
  let i = 0
  for (const v of iterable) {
    const index = i
    i += 1
    yield isThennable(v)
      ? v.then(resolved => mapper(resolved, index, iterable))
      : promiseOf(mapper(v, index, iterable))
  }
})

const awaitAll = promises =>
  Promise.all(promises)

const awaitAny = promises =>
  Promise.race(promises)

const functionFor = fn =>
  typeof fn === 'function'
    ? fn
    : () => fn

const awaitChain = functions => 
  functions.reduce
    ? functions.reduce(
      (awaiting, next) => awaiting.then(functionFor(next)),
      Promise.resolve()
    )
    : [...functions].reduce(
      (awaiting, next) => awaiting.then(functionFor(next)),
      Promise.resolve()
    )

const awaitDelay = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

const resolves = value =>
  () => Promise.resolve(value)

const rejects = error =>
  () => Promise.reject(error)

module.exports = {
  asyncMap,
  awaitAll,
  awaitAny,
  awaitChain,
  awaitDelay,
  resolves,
  rejects,
}
