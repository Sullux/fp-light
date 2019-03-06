const awaitAll = promises =>
  Promise.all(promises)

const awaitAny = promises =>
  Promise.race(promises)

const functionFor = fn =>
  typeof fn === 'function'
    ? fn
    : () => fn

const awaitChain = functions =>
  functions.reduce(
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
  awaitAll,
  awaitAny,
  awaitChain,
  awaitDelay,
  resolves,
  rejects,
}
