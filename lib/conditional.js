const { curry } = require('./curry')
const { pipe } = require('./pipe')
const { reduce } = require('./reduce')
const { argument, resolve } = require('./resolve')

const when = (predicate, fn) =>
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
          { input },
        )(input),
      { input: argument },
    )(predicates),
    ({ input, isComplete, output }) => isComplete ? output : input
  )

const fallback = () => true

module.exports = {
  conditional,
  select,
  when: curry(when),
  fallback,
}
