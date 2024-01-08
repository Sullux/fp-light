import { compilable, fallback } from './index.js'

export const mergeUsing = strategies => {
  const merge = (...values) =>
    strategies.reduce(
      (state, [predicate, mergeFn]) =>
        state.isMerged
          ? state
          : predicate(values)
            ? { isMerged: true, result: mergeFn({ values, merge }) }
            : state,
      { isMerged: false },
    ).result
  return compilable(merge)
}

const canMerge = value =>
  value &&
  typeof value === 'object' &&
  !(value instanceof Date) &&
  !(value[Symbol.iterator])

const mergePropsObject = ({ values, merge }) =>
  Object.freeze(
    Object.entries(
      values
        // produce a single array of all key/value pairs
        .reduce(
          (allEntries, value) => canMerge(value)
            ? allEntries.concat(Object.entries(value))
            : allEntries,
          [],
        )
        // produce an object of values grouped by key
        .reduce(
          (result, [key, value]) => ({
            ...result,
            [key]: [...(result[key] || []), value],
          }),
          {},
        ),
    )
      // merge the final result
      .reduce(
        (result, [key, values]) => ({
          ...result,
          [key]: merge(...values),
        }),
        {},
      ),
  )

const lastCanMerge = (values) =>
  canMerge(values[values.length - 1])

const takeLastValue = ({ values }) =>
  values[values.length - 1]

export const mergePropsStrategy = [
  [lastCanMerge, mergePropsObject],
  [fallback, takeLastValue],
]

export const merge = mergeUsing(mergePropsStrategy)
export { merge as mergeProps }

// 1st value overwrites 2nd value
export const mergeWith = v1 =>
  v2 =>
    merge(v2, v1)

// 2nd value overwrites 1st value
export const mergeInto = v1 =>
  v2 =>
    merge(v1, v2)
