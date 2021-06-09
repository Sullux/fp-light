import {
  compilable,
  isAsync,
  resolve,
} from './'

/* #AUTODOC#
module: API
name: is
aliases: [isExactly, same, strictEqual]
tags: [Comparison]
description: |
  Determines strict equality. Same as `===` except returns true if both values
  are `NaN`. This does not perform deep equality.
examples: |
  ```javascript
  is.$(Number('foo'), Number('bar')) // true
  is.$(42, 42) // true
  is.$({}, {}) // false
  const x = {}
  const y = x
  is.$(x, y) // true
  ```
*/
export const is = compilable(function is (value, compareValue) {
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

/* #AUTODOC#
module: API
name: typeName
tags: [Foundational]
description: |
  Returns the name of the type as a string. For `null` and `undefined` returns
  `'Null'` and `'Undefined'` respectively.
*/
export const typeName = value =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor.name

/* #AUTODOC#
module: API
name: compareTypes
tags: [Comparison]
description: |
  Compares types returning `< 0`, `0` or `> 0`. The type name is used for the
  comparison.
*/
export const compareTypes = compilable(function compareTypes (value, compareValue) {
  const valueName = typeName(value)
  const compareName = typeName(compareValue)
  if (compareName === valueName) {
    return 0
  }
  return valueName.localeCompare(compareName)
})

/* #AUTODOC#
module: API
name: Undefined
tags: [Convenience Functions, Types]
description: |
  A stand-in constructor for the value `undefined`.
*/
export function Undefined () {}

/* #AUTODOC#
module: API
name: Undefined
tags: [Convenience Functions, Types]
description: |
  A stand-in constructor for the value `null`.
*/
export function Null () { return null }

/* #AUTODOC#
module: API
name: isExactType
aliases: [sameType, strictEqualType]
tags: [Comparison]
description: |
  Given a type (constructor function) and a value, returns true if the value's
  constructor is the given type.
examples: |
  ```javascript
  isExactType.$(Number, 3) // true
  isExactType.$(String, 'foo') // true
  isExactType.$(Object, { x: 42 }) // true
  isExactType.$(Object, new Map()) // false
  ```
*/
export const isExactType = compilable(function isType (type, value) {
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value && (value.constructor === type))
}, { skip: 1 })
// todo: isType and isExactType functions should not be first-pass resolvable
export {
  isExactType as sameType,
  isExactType as strictEqualType,
}

/* #AUTODOC#
module: API
name: isType
tags: [Comparison]
description: |
  Given a type (constructor function) and a value, returns true if the value's
  constructor is the given type or if the value is an instance of the type.
*/
export const isType = compilable(function isType (type, value) {
  // todo: walk the heirarchy by hand instead?
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value instanceof type)
}, { skip: 1 })

/* #AUTODOC#
module: API
name: isUndefined
tags: [Comparison]
description: |
  Returns true if the value is `undefined`.
*/
export const isUndefined = compilable(function isUndefined(value) {
  return value === undefined
})

/* #AUTODOC#
module: API
name: isNull
tags: [Comparison]
description: |
  Returns true if the value is `null`.
*/
export const isNull = compilable(function isNull(value) {
  return value === null
})

/* #AUTODOC#
module: API
name: isDefined
aliases: [exists]
tags: [Comparison]
description: |
  Returns true if the value is neither `undefined` nor `null`.
*/
export const isDefined = compilable(function isDefined(value) {
  return (value !== undefined) && (value !== null)
})

export { isDefined as exists }

/* #AUTODOC#
module: API
name: isMissing
aliases: [notExists]
tags: [Comparison]
description: |
  Returns true if the value is `undefined` or `null`.
*/
export const isMissing = compilable(function isDefined(value) {
  return (value === undefined) || (value === null)
})

export { isMissing as notExists }

/* #AUTODOC#
module: API
name: isTruthy
aliases: [truthy]
tags: [Comparison]
description: |
  Returns true if the value is not `undefined`, `null`, `0`, `NaN`, `''` or
  `false`.
*/
export const isTruthy = compilable(function isTruthy(value) {
  return !!value
})

export { isTruthy as truthy }

/* #AUTODOC#
module: API
name: isFalsy
tags: [Comparison]
description: |
  Returns true if the value is `undefined`, `null`, `0`, `NaN`, `''` or `false`.
*/
export const isFalsy = compilable(function isFalsy(value) {
  return !value
})

/* #AUTODOC#
module: API
name: isArray
tags: [Comparison]
description: |
  Returns true if the value is an array.
*/
export const isArray = compilable(function isArray(value) {
  return Array.isArray(value)
})

/* #AUTODOC#
module: API
name: isBoolean
tags: [Comparison]
description: |
  Returns true if the value is a boolean.
*/
export const isBoolean = compilable(function isBoolean(value) {
  return (typeof value === 'boolean')
})

/* #AUTODOC#
module: API
name: isDate
tags: [Comparison]
description: |
  Returns true if the value is a date.
*/
export const isDate = compilable(function isDate(value) {
  return isType.$(Date, value)
})

/* #AUTODOC#
module: API
name: isError
tags: [Comparison]
description: |
  Returns true if the value is an error.
*/
export const isError = compilable(function isError(value) {
  return isType.$(Error, value)
})

/* #AUTODOC#
module: API
name: isFunction
tags: [Comparison]
description: |
  Returns true if the value is a function.
*/
export const isFunction = compilable(function isFunction(value) {
  // need to use instanceof to account for async functions
  return (value instanceof Function) || (typeof value === 'function')
})

/* #AUTODOC#
module: API
name: isMap
tags: [Comparison]
description: |
  Returns true if the value is a map.
*/
export const isMap = compilable(function isMap(value) {
  return isType.$(Map, value)
})

/* #AUTODOC#
module: API
name: isNumber
tags: [Comparison]
description: |
  Returns true if the value is a number. Note that this returns false for the
  value `NaN`.
*/
export const isNumber = compilable(function isNumber(value) {
  return (typeof value === 'number' || isType.$(Number, value)) && !Number.isNaN(value)
})

/* #AUTODOC#
module: API
name: isObject
tags: [Comparison]
description: |
  Returns true if the value is a plain object.
*/
export const isObject = compilable(function isObject(value) {
  return isExactType.$(Object, value)
})

/* #AUTODOC#
module: API
name: isSet
tags: [Comparison]
description: |
  Returns true if the value is a set.
*/
export const isSet = compilable(function isSet(value) {
  return isType.$(Set, value)
})

/* #AUTODOC#
module: API
name: isString
tags: [Comparison]
description: |
  Returns true if the value is a string.
*/
export const isString = compilable(function isString(value) {
  return typeof value === 'string' || isType.$(String, value)
})

/* #AUTODOC#
module: API
name: isSymbol
tags: [Comparison]
description: |
  Returns true if the value is a symbol.
*/
export const isSymbol = compilable(function isSymbol(value) {
  return typeof value === 'symbol'
})

/* #AUTODOC#
module: API
name: isIterable
tags: [Comparison]
description: |
  Returns true if the value is an iterable.
*/
export const isIterable = compilable(
  Symbol.asyncIterator
    ?
      function isIterable(value) {
        return !!(value && (value[Symbol.iterator] || value[Symbol.asyncIterator]))
      }
    :
      function isIterable(value) {
        return !!(value && value[Symbol.iterator])
      }
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

/* #AUTODOC#
module: API
name: comparer
tags: [Comparison]
description: |
  A symbol to use to define a custom comparer function for an object.
examples: |
  ```javascript
  const compareColors = ({r: r1, g: g1, b: b1}, {r: r2, g: g2, b: b2}) =>
    (r1 - r2) || (g1 - g2) || (b1 - b2)

  Color.prototype[comparer] = compareColors

  const colors = [
    new Color(50, 40, 60),
    new Color(40, 50, 60),
    new Color(60, 50, 40),
  ]

  console.log(colors.sort(compare))
  // [
  //   { r: 40, g: 50, b: 60 },
  //   { r: 50, g: 40, b: 60 },
  //   { r: 60, g: 50, b: 40 }
  // ]
  ```
*/
export const comparer = Symbol('comparer')

/* #AUTODOC#
module: API
name: compare
tags: [Comparison]
description: |
  Compares two values returning `< 0` if the first value is less than the
  second, `0` if the values are equal, and `> 0` if the first value is greater
  than the second. When types do not match, comparison is done on type name.
  For numbers, `NaN` is always greater than real numbers.

  For errors, the type, code and message are compared while other properties
  such as the stack trace are ignored. This allows errors to be equal if they
  are identical except for stack trace or custom properties.

  For functions, the function text is compared.

  Arrays and objects are deep compared. Nested values are compared using all of
  the above rules.
*/
export const compare = compilable(function compare (value, compareValue) {
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

export const comparing = function comparing (resolver) {
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

/* #AUTODOC#
module: API
name: equal
aliases: [deepEqual, eq]
tags: [Comparison]
description: |
  Using the same rules as the `compare` function, compares two values and
  returns true if the two values are comparable. This function is suitable for
  deep equality.
*/
export const equal = compilable(function equal (value, compareValue) {
  return compare.$(value, compareValue) === 0
})

export const equalTo = equal.$

export {
  equal as deepEqual,
  equal as eq,
}
