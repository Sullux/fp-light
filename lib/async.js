/* eslint-disable no-restricted-syntax */
const { isThennable } = require('./type')

const syncMap = function* (mapper, iterable) {
  for (const v of iterable) {
    yield mapper(v)
  }
}

const promiseOf = value =>
  isThennable(value)
    ? value
    : Promise.resolve(value)

const awaitAll = promises =>
  Promise.all(syncMap(promiseOf, promises))

const awaitAny = promises =>
  Promise.race(promises)

const awaitDelay = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
  promiseOf,
  toAsync: promiseOf,
  awaitAll,
  awaitAny,
  awaitDelay,
}
