const { resolve } = require('./resolve')

const call = fn =>
  Array.isArray(fn)
    ? fn[0](...fn.slice(1))
    : fn()

const call$ = fn =>
  arg =>
    resolve(call)(resolve(fn)(arg))

module.exports = {
  call,
  call$,
}
