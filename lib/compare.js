import { resolvable, curry, override } from './'

export const is = curry(resolvable(function is (value, compareValue) {
  return (value === compareValue) || (
    (typeof value === 'number') &&
    (typeof compareValue === 'number') &&
    Number.isNaN(value) &&
    Number.isNaN(compareValue)
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

export function Undefined () {}

export function Null () { return null }

export const isExactType = curry(resolvable(curry(function isType (type, value) {
  return (value === undefined && type === Undefined) ||
    (value === null && type === Null) ||
    (value.constructor === type)
})))

export {
  isExactType as sameType,
  isExactType as strictEqualType,
}

export const isType = curry(resolvable(curry(function isType (type, value) {
  return (value === undefined && type === Undefined) ||
    (value === null && type === Null) ||
    (value instanceof type)
})))

export const isUndefined = resolvable(function isUndefined(value) {
  return value === undefined
})

export const isNull = resolvable(function isNull(value) {
  return value === null
})

export const isDefined = resolvable(function isDefined(value) {
  return (value !== undefined) && (value !== null)
})

export { isDefined as exists }

export const isMissing = resolvable(function isDefined(value) {
  return (value === undefined) || (value === null)
})

export { isMissing as notExists }

export const isTruthy = resolvable(function isTruthy(value) {
  return !!value
})

export { isTruthy as truthy }

export const isFalsy = resolvable(function isFalsy(value) {
  return !value
})

export { isFalsy as falsy }

export const isArray = resolvable(function isArray(value) {
  return isType.$(Array, value)
})

export const isBoolean = resolvable(function isBoolean(value) {
  return isType.$(Boolean, value)
})

export const isDate = resolvable(function isDate(value) {
  return isType.$(Date, value)
})

export const isError = resolvable(function isError(value) {
  return isType.$(Error, value)
})

export const isFunction = resolvable(function isFunction(value) {
  return value instanceof Function
})

export const isMap = resolvable(function isMap(value) {
  return isType.$(Map, value)
})

export const isNumber = resolvable(function isNumber(value) {
  return isType.$(Number, value) && !Number.isNaN(value)
})

export const isObject = resolvable(function isObject(value) {
  return isExactType.$(Object, value)
})

export const isSet = resolvable(function isSet(value) {
  return isType.$(Set, value)
})

export const isString = resolvable(function isString(value) {
  return isType.$(String, value)
})

export const isSymbol = resolvable(function isSymbol(value) {
  return isType.$(Symbol, value)
})

const comparisons = {
  Number: (value, compareValue) =>
    isNaN(value)
      ? 1
      : isNaN(compareValue)
        ? -1
        : value - compareValue,
  Date: (value, compareValue) =>
    comparisons.Number(value.getTime(), compareValue.getTime()),
  Error: (value = {}, compareValue = {}) =>
    comparisons.Array(
      [typeName(value), value.code, value.message],
      [typeName(compareValue), compareValue.code, compareValue.message],
    ),
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
      (
        (value instanceof Error || compareValue instanceof Error) &&
        comparisons['Error']
      ) ||
      comparisons.Object
    return comparison(value, compareValue)
  }
))

export const equal = curry(resolvable(curry(function equal (value, compareValue) {
  return compare.$(value, compareValue) === 0
})))

export {
  equal as deepEqual,
  equal as eq,
}
