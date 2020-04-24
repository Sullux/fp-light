import { resolvable, curry, override } from './'

export const is = curry(resolvable(function is (value, compareValue) {
  return (value === compareValue) || (
    (typeof value === 'number') &&
    (typeof compareValue === 'number') &&
    isNaN(value) &&
    isNaN(compareValue)
  )
}))

export {
  is as isExactly,
  is as same,
  is as strictEqual,
}

const typesByPrecedence = [
  'Undefined',
  'Null',
  'Number',
  'Date',
  'String',
  'RegExp',
  'Array',
  'Set',
  'Object',
  'Map',
  'Function',
]

const typeName = value =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor.name

const typeIndex = name => {
  const index = typesByPrecedence.indexOf(name)
  return index < 0
    ? typesByPrecedence.length
    : index
}

export const compareTypes = curry(resolvable(
  function compareTypes (value, compareValue) {
    const valueName = typeName(value)
    const valueType = typeIndex(valueName)
    const compareName = typeName(compareValue)
    if (compareName === valueName) {
      return 0
    }
    const compareType = typeIndex(valueName)
    const result = valueType - compareType
    return !result
      ? valueName.localeCompare(compareName)
      : result
  }
))

const comparisons = {
  Number: (value, compareValue) =>
    isNaN(value)
      ? 1
      : isNaN(compareValue)
        ? -1
        : value - compareValue,
  Date: (value, compareValue) =>
    comparisons.Number(value.getTime(), compareValue.getTime()),
  String: (value, compareValue) =>
    value.localeCompare(compareValue),
  RegExp: (value, compareValue) =>
    value.toString().localeCompare(compareValue.toString()),
  Array: (value, compareValue) => {
    for (let i = 0, count = value.length; i < count; i++) {
      const result = compare.$(value[i], compareValue[i])
      if (result !== 0) {
        return result
      }
    }
    return value.length - compareValue.length
  },
  Set: (value, compareValue) => {
    const v1 = [...value].sort(compare.$)
    const v2 = [...compareValue].sort(compare.$)
    return comparisons.Array(v1, v2)
  },
  Object: (value, compareValue) => {
    if (value[Symbol.iterator] && compareValue[Symbol.iterator]) {
      return comparisons.Set(value, compareValue)
    }
    const keys = Reflect.ownKeys(value)
    for (const key of keys) {
      const result = compare.$(value[key], compareValue[key])
      if (result !== 0) {
        return result
      }
    }
    return keys.length - Reflect.ownKeys(compareValue).length
  },
  Map: (value, compareValue) => {
    const compareKeyValue = ([k1], [k2]) => compare.$(k1, k2)
    const v1 = [...value].sort(compareKeyValue)
    const v2 = [...compareValue].sort(compareKeyValue)
    return comparisons.Array(v1, v2)
  },
  Function: (value, compareValue) =>
    comparisons.String(value.toString(), compareValue.toString()),
}

export const comparer = Symbol('comparer')

export const comparable = (comparison, value) => {
  const applyComparisonTo = override({ properties: { [comparer]: comparison } })
  return value ? applyComparisonTo(value) : applyComparisonTo
}

export { comparable as toComparable }

export const compare = curry(resolvable(
  function compare (value, compareValue) {
    if (is.$(value, compareValue)) {
      return 0
    }
    const valueName = typeName(value)
    const compareName = typeName(compareValue)
    if (valueName !== compareName) {
      return typeIndex(valueName) - typeIndex(compareName)
    }
    const comparison = (value && value[comparer]) ||
      comparisons[valueName] ||
      comparisons.Object
    return comparison(value, compareValue)
  }
))

export const equal = curry(resolvable(function equal (value, compareValue) {
  return compare.$(value, compareValue) === 0
}))

export {
  equal as deepEqual,
  equal as eq,
}

export const exists = resolvable(function exists (value) {
  return !(value === undefined || value === null)
})
