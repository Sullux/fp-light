const { freeze } = require('./object')
const { pipe } = require('./pipe')

const tried = (functionThatCanThrow) => {
  try {
    return [undefined, functionThatCanThrow()]
  } catch (err) {
    return [err, undefined]
  }
}

const errorOrResult = pipe([
  tried,
  ([err, value]) => err || value
])

const withErrorEvent = onError => pipe([
  tried,
  ([err, value]) => (err
    ? onError(err)
    : value)
])

const resolve = pipe([
  tried,
  ([err, value]) => (err
    ? Promise.reject(err)
    : Promise.resolve(value))
])

const fallible = functionThatCanFail => value =>
  tried(() => functionThatCanFail(value))

module.exports = freeze({
  tried, errorOrResult, withErrorEvent, resolve, fallible,
})
