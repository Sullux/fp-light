const { curry } = require('./curry')

const fallback = () => true

const mergeUsing = strategies => {
  const merge = values =>
    strategies.reduce(
      (state, [predicate, mergeFn]) =>
        state.isMerged
          ? state
          : predicate(values)
            ? { isMerged: true, result: mergeFn({ values, merge }) }
            : state,
      { isMerged: false },
    ).result
  return merge
}

const isObject = value =>
  value
    && typeof value === 'object'
    && !(value instanceof Date)
    && !(value[Symbol.iterator])

const mergePropsObject = ({ values, merge }) =>
  Object.freeze(
    Object.entries(
      values
        // produce a single array of all key/value pairs
        .reduce(
          (allEntries, value) => isObject(value)
            ? allEntries.concat(Object.entries(value))
            : allEntries,
          []
        )
        // produce an object of values grouped by key
        .reduce(
          (result, [key, value]) => ({
            ...result,
            [key]: [...(result[key] || []), value],
          }),
          {}
        )
    )
      // merge the final result
      .reduce(
        (result, [key, values]) => ({
          ...result,
          [key]: merge(values),
        }),
        {}
      )
  )

const lastIsObject = (values) =>
  isObject(values[values.length - 1])

const takeLastValue = ({ values }) =>
  values[values.length - 1]

const mergePropsStrategy = [
  [lastIsObject, mergePropsObject],
  [fallback, takeLastValue],
]

const mergeProps = mergeUsing(mergePropsStrategy)

const mergeWith = curry((v1, v2) =>
  mergeProps([v1, v2]))

module.exports = {
  merge: mergeProps,
  mergeProps,
  mergePropsStrategy,
  mergeUsing,
  mergeWith,
}
