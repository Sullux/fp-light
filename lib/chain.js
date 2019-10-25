import { isAsync } from './async'
import { toArray } from './to-array'

const chainableFromIterable = iterable => {
  const { next } = iterable[Symbol.iterator]()
  let previous
  return {
    thenNext: (callback) => {
      const resolveNext = ({ value, done }) =>
        isAsync(value)
          ? value.then(result => callback({ value: result, done })) && true
          : callback({ value, done }) && false
      const result = previous
        ? previous.then(() => resolveNext(next()))
        : resolveNext(next())
      previous = result
        ? result
        : previous
    },
  }
}

const isChainable = ({ thenNext } = {}) =>
  thenNext && (typeof thenNext === 'function')

const isIterable = value =>
  value && value[Symbol.iterator]

const toChainable = value =>
  isChainable(value)
    ? value
    : chainableFromIterable(isIterable(value) ? value : toArray(value))

const iterableFromChainable = chainable =>
  new Promise((resolve, reject) => {
    const result = []
    const handleNext = ({ value, done, rejection }) =>
      rejection
        ? reject(rejection)
        : done
          ? resolve(result)
          : result.push(value) && chainable.thenNext(handleNext)
    chainable.thenNext(handleNext)
  })

const chain = (...steps) =>
  input =>
    iterableFromChainable(
      steps.reduce((result, next) => result.thenNext(next), toChainable(input))
    )

module.exports = {
  chain,
  isChainable,
  toChainable,
  iterableFromChainable,
}
