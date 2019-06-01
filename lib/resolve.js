const { curry } = require('../curry/curry')
const { awaitAll } = require('../async/async')
const { reduce } = require('../reduce/reduce')

const argument = x => x

const isThennable = value =>
  value && value.then && (typeof value.then === 'function')

const resolveObject = (target, input) =>
  Object.entries(target)
    .reduce(
      (output, [key, value]) => {
        const result = resolve(value, input)
        return isThennable(result) || isThennable(output)
          ? awaitAll([result, output])
            .then(([result, output]) => ({ ...output, [key]: result }))
          : { ...output, [key]: result }
      },
      {},
    )

const resolveIterable = (target, input) => 
  reduce(
    (output, value) => {
      const result = resolve(value, input)
      return isThennable(output) || isThennable(result)
      ? awaitAll([result, output])
        .then(([result, output]) => ([...output, result]))
      : [...output, result]
    },
    [],
    target,
  )

const resolveSync = (target, input) =>
  !target
    ? target
    : typeof target === 'function'
      ? target(input)
      : typeof target === 'object'
        ? target[Symbol.iterator]
          ? resolveIterable(target, input)
          : target instanceof Date
            ? target
            : resolveObject(target, input)
        : target

const resolve = (target, input) =>
  isThennable(target)
    ? target.then(value => resolve(value, input))
    : isThennable(input)
      ? input.then(value => resolve(target, value))
      : resolveSync(target, input)

module.exports = { 
  argument,
  resolve: curry(resolve),
}
