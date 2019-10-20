const { pipe } = require('./pipe')
const { reduce } = require('./reduce')
const { argument, resolve } = require('./resolve')

const when = predicate =>
  fn =>
    arg =>
      predicate(arg)
        ? fn(arg)
        : arg

const conditional = (predicate, truthy, falsy = argument) => pipe(
  [argument, predicate],
  ([arg, result]) => result
    ? resolve(truthy)(arg)
    : resolve(falsy)(arg)
)

const select = predicates =>
  pipe(
    argument => reduce(
      ({ input, isComplete, output }, [predicate, trueCase]) => isComplete
        ? { isComplete, output }
        : conditional(
          predicate,
          { isComplete: true, output: trueCase },
          { input: () => argument },
        )(input),
      { input: argument },
    )(predicates),
    ({ input, isComplete, output }) => isComplete ? output : input,
  )

const fallback = () => true

const maybe = value =>
  value === undefined || value === null
    ? [false]
    : [true, value]

const exists = value =>
  (value !== undefined) && (value !== null)

const isDefined = value =>
  value !== undefined

const truthy = value =>
  !!value

const falsy = value =>
  !value

module.exports = {
  conditional,
  select,
  when,
  fallback,
  maybe,
  exists,
  truthy,
  falsy,
  isDefined,
}
