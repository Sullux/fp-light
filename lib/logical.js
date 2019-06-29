const { resolve } = require('./resolve')

const not = fn =>
  arg => resolve(value => !value)(resolve(fn)(arg))

const and = fn =>
  arg => resolve(([value1, value2]) => !!(value1 && value2))(resolve(fn)(arg))

const or = fn =>
  arg => resolve(([value1, value2]) => !!(value1 || value2))(resolve(fn)(arg))

const xor = fn =>
  arg =>
    resolve
      (([value1, value2]) => !!((value1 && !value2) || (value2 && !value1)))
      (resolve(fn)(arg))

module.exports = {
  not,
  and,
  or,
  xor,
}
