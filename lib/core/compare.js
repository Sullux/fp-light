import { isAsync } from './async.js'

export const is = function is (value, compareValue) {
  return (value === compareValue) || (
    (typeof value === 'number') &&
    (typeof compareValue === 'number') &&
    Number.isNaN(value) &&
    Number.isNaN(compareValue)
  )
}

export {
  is as isExactly,
  is as same,
  is as strictEqual,
}

export const constructor = function constructor (value) {
  return (value === undefined)
    ? Undefined
    : (value === null)
        ? Null
        : value.constructor
}

export { constructor as typeOf }

export const typeName = (value) =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor.name

export const compareTypes = function compareTypes (value, compareValue) {
  const valueName = typeName(value)
  const compareName = typeName(compareValue)
  if (compareName === valueName) {
    return 0
  }
  return valueName.localeCompare(compareName)
}

export function Undefined () {
  if (new.target) {
    throw new Error('Undefined cannot be instantiated with new.')
  }
}
Object.defineProperty(Undefined, Symbol.hasInstance, {
  value: (v) => v === undefined,
})

export function Null () {
  if (new.target) {
    throw new Error('Null cannot be instantiated with new.')
  }
  return null
}
Object.defineProperty(Null, Symbol.hasInstance, {
  value: (v) => v === null,
})

const primitiveTypes = [
  'number',
  'bigint',
  'boolean',
  'undefined',
  'symbol',
]

export const Primitive = function Primitive () { return Primitive }
Object.defineProperty(Primitive, Symbol.hasInstance, {
  value: (v) => isString(v) || (v === null) || primitiveTypes.includes(typeof v),
})

export const Any = function Any () { return Any }
Object.defineProperty(Any, Symbol.hasInstance, {
  value: () => true,
})

const isExtendedFromPrimitive = (Type) =>
  isExtendedFrom(Type, String) ||
  isExtendedFrom(Type, Number) ||
  isExtendedFrom(Type, BigInt) ||
  isExtendedFrom(Type, Boolean) ||
  isExtendedFrom(Type, Undefined) ||
  isExtendedFrom(Type, Symbol) ||
  isExtendedFrom(Type, Null)

export const isExtendedFrom =
  function isExtendedFrom (Type, ParentType) {
    return (Type === ParentType) ||
      (ParentType === Any) ||
      ((ParentType === Primitive) && isExtendedFromPrimitive(Type)) ||
      (Type?.prototype instanceof ParentType)
  }

export const isExactType = function isType (type, value) {
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value && (value.constructor === type))
}
// todo: isType and isExactType functions should not be first-pass resolvable
export {
  isExactType as sameType,
  isExactType as strictEqualType,
}

export const isType = function isType (type, value) {
  // todo: walk the heirarchy by hand instead?
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value instanceof type)
}

export const isUndefined = function isUndefined (value) {
  return value === undefined
}

export const isNull = function isNull (value) {
  return value === null
}

export const isDefined = function isDefined (value) {
  return (value !== undefined) && (value !== null)
}

export { isDefined as exists }

export const isMissing = function isDefined (value) {
  return (value === undefined) || (value === null)
}

export { isMissing as notExists }

export const isTruthy = function isTruthy (value) {
  return !!value
}

export { isTruthy as truthy }

export const isFalsy = function isFalsy (value) {
  return !value
}

export const isArray = function isArray (value) {
  return Array.isArray(value)
}

export const isBoolean = function isBoolean (value) {
  return (typeof value === 'boolean')
}

export const isDate = function isDate (value) {
  return isType(Date, value)
}

export const isError = function isError (value) {
  return isType(Error, value)
}

export const isFunction = function isFunction (value) {
  // need to use instanceof to account for async functions
  return (value instanceof Function) || (typeof value === 'function')
}

export const isMap = function isMap (value) {
  return isType(Map, value)
}

export const isNumber = function isNumber (value) {
  return (typeof value === 'number' || isType(Number, value)) && !Number.isNaN(value)
}

export const isObject = function isObject (value) {
  return isExactType(Object, value)
}

export const isSet = function isSet (value) {
  return isType(Set, value)
}

export const isString = function isString (value) {
  return typeof value === 'string' || isType(String, value)
}

export const isSymbol = function isSymbol (value) {
  return typeof value === 'symbol'
}

export const isIterable =
  Symbol.asyncIterator
    ? function isIterable (value) {
        return !!(value && (value[Symbol.iterator] || value[Symbol.asyncIterator]))
      }
    : function isIterable (value) {
      return !!(value && value[Symbol.iterator])
    }

const comparisons = {
  Boolean: (value, compareValue) =>
    (value === compareValue)
      ? 0
      : (value ? 1 : -1),
  Number: (value, compareValue) =>
    isNaN(value)
      ? isNaN(compareValue) ? 0 : 1
      : value - compareValue,
  Date: (value, compareValue) =>
    comparisons.Number(value.getTime(), compareValue.getTime()),
  Error: (value = {}, compareValue = {}) =>
    comparisons.Array(
      [value.name, value.code, value.message],
      [compareValue.name, compareValue.code, compareValue.message],
    ),
  String: (value, compareValue) =>
    value.localeCompare(compareValue),
  RegExp: (value, compareValue) =>
    value.toString().localeCompare(compareValue.toString()),
  Array: (value, compareValue) => {
    for (let i = 0, count = value.length; i < count; i++) {
      const result = compare(value[i], compareValue[i])
      if (result !== 0) {
        return result
      }
    }
    return value.length - compareValue.length
  },
  Set: (value, compareValue) => {
    const v1 = [...value].sort(compare)
    const v2 = [...compareValue].sort(compare)
    return comparisons.Array(v1, v2)
  },
  Object: (value, compareValue) => {
    if (value[Symbol.iterator] && compareValue[Symbol.iterator]) {
      return comparisons.Set(value, compareValue)
    }
    const keys = Reflect.ownKeys(value)
    for (const key of keys) {
      const result = compare(value[key], compareValue[key])
      if (result !== 0) {
        return result
      }
    }
    return keys.length - Reflect.ownKeys(compareValue).length
  },
  Map: (value, compareValue) => {
    const compareKeyValue = ([k1], [k2]) => compare(k1, k2)
    const v1 = [...value].sort(compareKeyValue)
    const v2 = [...compareValue].sort(compareKeyValue)
    return comparisons.Array(v1, v2)
  },
  Function: (value, compareValue) =>
    comparisons.String(value.toString(), compareValue.toString()),
}

export const comparer = Symbol('comparer')

export const compare = function compare (value, compareValue) {
  if (is(value, compareValue)) {
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
}

export const comparing = function comparing (resolver) {
  const fn = resolve(resolver)
  return function comparing (value, compareValue) {
    const v1 = fn(value)
    const v2 = fn(compareValue)
    // todo: remove async checks when fully defined
    if (isAsync(v1) || isAsync(v2)) {
      return Promise.all([v1, v2]).then(([rv1, rv2]) => compare(rv1, rv2))
    }
    return compare(v1, v2)
  }
}

export const equal = function equal (value, compareValue) {
  return compare(value, compareValue) === 0
}

export {
  equal as deepEqual,
  equal as eq,
  equal as equalTo,
}
