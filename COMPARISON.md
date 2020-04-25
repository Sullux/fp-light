# Comparison

## compare

_Aliases: `(none)`_

_Description_

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

_Examples_

to do...
## comparer

_Aliases: `(none)`_

_Description_

A symbol to use to define a custom comparer function for an object.

_Examples_

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

## compareTypes

_Aliases: `(none)`_

_Description_

Compares types returning `< 0`, `0` or `> 0`. The type name is used for the
comparison.

_Examples_

to do...
## equal

_Aliases: `deepEqual`, `eq`_

_Description_

Using the same rules as the `compare` function, compares two values and
returns true if the two values are comparable. This function is suitable for
deep equality.

_Examples_

to do...
## is

_Aliases: `isExactly`, `same`, `strictEqual`_

_Description_

Determines strict equality. Same as `===` except returns true if both values
are `NaN`. This does not perform deep equality.

_Examples_

```javascript
is.$(Number('foo'), Number('bar')) // true
is.$(42, 42) // true
is.$({}, {}) // false
const x = {}
const y = x
is.$(x, y) // true
```

## isArray

_Aliases: `(none)`_

_Description_

Returns true if the value is an array.

_Examples_

to do...
## isBoolean

_Aliases: `(none)`_

_Description_

Returns true if the value is a boolean.

_Examples_

to do...
## isDate

_Aliases: `(none)`_

_Description_

Returns true if the value is a date.

_Examples_

to do...
## isDefined

_Aliases: `exists`_

_Description_

Returns true if the value is neither `undefined` nor `null`.

_Examples_

to do...
## isError

_Aliases: `(none)`_

_Description_

Returns true if the value is an error.

_Examples_

to do...
## isExactType

_Aliases: `sameType`, `strictEqualType`_

_Description_

Given a type (constructor function) and a value, returns true if the value's
constructor is the given type.

_Examples_

```javascript
isExactType.$(Number, 3) // true
isExactType.$(String, 'foo') // true
isExactType.$(Object, { x: 42 }) // true
isExactType.$(Object, new Map()) // false
```

## isFalsy

_Aliases: `falsy`_

_Description_

Returns true if the value is `undefined`, `null`, `0`, `NaN`, `''` or `false`.

_Examples_

to do...
## isFunction

_Aliases: `(none)`_

_Description_

Returns true if the value is a function.

_Examples_

to do...
## isMap

_Aliases: `(none)`_

_Description_

Returns true if the value is a map.

_Examples_

to do...
## isMissing

_Aliases: `notExists`_

_Description_

Returns true if the value is `undefined` or `null`.

_Examples_

to do...
## isNull

_Aliases: `(none)`_

_Description_

Returns true if the value is `null`.

_Examples_

to do...
## isNumber

_Aliases: `(none)`_

_Description_

Returns true if the value is a number. Note that this returns false for the
value `NaN`.

_Examples_

to do...
## isObject

_Aliases: `(none)`_

_Description_

Returns true if the value is a plain object.

_Examples_

to do...
## isSet

_Aliases: `(none)`_

_Description_

Returns true if the value is a set.

_Examples_

to do...
## isString

_Aliases: `(none)`_

_Description_

Returns true if the value is a string.

_Examples_

to do...
## isSymbol

_Aliases: `(none)`_

_Description_

Returns true if the value is a symbol.

_Examples_

to do...
## isTruthy

_Aliases: `truthy`_

_Description_

Returns true if the value is not `undefined`, `null`, `0`, `NaN`, `''` or
`false`.

_Examples_

to do...
## isType

_Aliases: `(none)`_

_Description_

Given a type (constructor function) and a value, returns true if the value's
constructor is the given type or if the value is an instance of the type.

_Examples_

```javascript
isExactType.$(Number, 3) // true
isExactType.$(String, 'foo') // true
isExactType.$(Object, { x: 42 }) // true
isExactType.$(Object, new Map()) // true
```

## isUndefined

_Aliases: `(none)`_

_Description_

Returns true if the value is `undefined`.

_Examples_

to do...