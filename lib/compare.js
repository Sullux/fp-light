import { isAsync } from './async.js'
import {
  compilable,
  resolve,
} from './resolve.js'

export const is = compilable(function is(value, compareValue) {
  return (value === compareValue) || (
    (typeof value === 'number') &&
    (typeof compareValue === 'number') &&
    Number.isNaN(value) &&
    Number.isNaN(compareValue)
  )
})

export {
  is as isExactly,
  is as same,
  is as strictEqual,
}

export const typeName = value =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor.name

export const compareTypes = compilable(function compareTypes(value, compareValue) {
  const valueName = typeName(value)
  const compareName = typeName(compareValue)
  if (compareName === valueName) {
    return 0
  }
  return valueName.localeCompare(compareName)
})

export function Undefined() { }

export function Null() { return null }

export const isExactType = compilable(function isType(type, value) {
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value && (value.constructor === type))
}, { skip: 1 })
// todo: isType and isExactType functions should not be first-pass resolvable
export {
  isExactType as sameType,
  isExactType as strictEqualType,
}

export const isType = compilable(function isType(type, value) {
  // todo: walk the heirarchy by hand instead?
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value instanceof type)
}, { skip: 1 })

export const isUndefined = compilable(function isUndefined(value) {
  return value === undefined
})

export const isNull = compilable(function isNull(value) {
  return value === null
})

export const isDefined = compilable(function isDefined(value) {
  return (value !== undefined) && (value !== null)
})

export { isDefined as exists }

export const isMissing = compilable(function isDefined(value) {
  return (value === undefined) || (value === null)
})

export { isMissing as notExists }

export const isTruthy = compilable(function isTruthy(value) {
  return !!value
})

export { isTruthy as truthy }

export const isFalsy = compilable(function isFalsy(value) {
  return !value
})

export const isArray = compilable(function isArray(value) {
  return Array.isArray(value)
})

export const isBoolean = compilable(function isBoolean(value) {
  return (typeof value === 'boolean')
})

export const isDate = compilable(function isDate(value) {
  return isType.$(Date, value)
})

export const isError = compilable(function isError(value) {
  return isType.$(Error, value)
})

export const isFunction = compilable(function isFunction(value) {
  // need to use instanceof to account for async functions
  return (value instanceof Function) || (typeof value === 'function')
})

export const isMap = compilable(function isMap(value) {
  return isType.$(Map, value)
})

export const isNumber = compilable(function isNumber(value) {
  return (typeof value === 'number' || isType.$(Number, value)) && !Number.isNaN(value)
})

export const isObject = compilable(function isObject(value) {
  return isExactType.$(Object, value)
})

export const isSet = compilable(function isSet(value) {
  return isType.$(Set, value)
})

export const isString = compilable(function isString(value) {
  return typeof value === 'string' || isType.$(String, value)
})

export const isSymbol = compilable(function isSymbol(value) {
  return typeof value === 'symbol'
})

export const isIterable = compilable(
  Symbol.asyncIterator
    ?
    function isIterable(value) {
      return !!(value && (value[Symbol.iterator] || value[Symbol.asyncIterator]))
    }
    :
    function isIterable(value) {
      return !!(value && value[Symbol.iterator])
    },
)

const comparisons = {
  Boolean: (value, compareValue) =>
    (value === compareValue)
      ? 0
      : (value ? 1 : -1),
  Number: (value, compareValue) =>
    isNaN(value)
      ? isNaN(compareValue) ? 0 : 1
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

export const compare = compilable(function compare(value, compareValue) {
  if (is.$(value, compareValue)) {
    return 0
  }
  const valueName = typeName(value)
  const compareName = typeName(compareValue)
  if (valueName !== compareName) {
    return valueName.localeCompare(compareName)
  }
  const comparison = (value && value[comparer]) ||
    comparisons[valueName] ||
    (
      (value instanceof Error || compareValue instanceof Error) &&
      comparisons.Error
    ) ||
    comparisons.Object
  return comparison(value, compareValue)
})

export const comparing = function comparing(resolver) {
  const fn = resolve(resolver)
  return function comparing(value, compareValue) {
    const v1 = fn(value)
    const v2 = fn(compareValue)
    if (isAsync(v1) || isAsync(v2)) {
      return Promise.all([v1, v2]).then(([rv1, rv2]) => compare.$(rv1, rv2))
    }
    return compare.$(v1, v2)
  }
}

export const equal = compilable(function equal(value, compareValue) {
  return compare.$(value, compareValue) === 0
})

export const equalTo = equal.$

export {
  equal as deepEqual,
  equal as eq,
}
