const { curry } = require('./curry')
const { reduce } = require('./reduce')
const { mergeWith } = require('./merge')
const { isThennable } = require('./type')

const argument = x => x

const awaitBoth = (p1, p2) =>
  Promise.all([Promise.resolve(p1), Promise.resolve(p2)])

const resolveObject = (target, input) =>
  Object.entries(target)
    .reduce(
      (output, [key, value]) => {
        const result = resolve(value, input)
        return isThennable(result) || isThennable(output)
          ? awaitBoth(result, output)
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
      ? awaitBoth(result, output)
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
        ? Array.isArray(target) // target[Symbol.iterator]
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

const resolveMerge = fn =>
  arg =>
    resolve(mergeWith(arg), resolve([arg, fn]))

module.exports = {
  argument,
  resolve: curry(resolve),
  resolveMerge,
}
