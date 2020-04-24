# fp-light

This is a collection of lightweight javascript utility functions made with functional programming in mind. Each function is a [pure function](https://en.wikipedia.org/wiki/Pure_function) unless explicitly stated otherwise. To install the whole library:

## Installation

```bash
npm i -P @sullux/fp-light
# or
yarn add @sullux/fp-light
```

## API

_math_
multiply (mul)
divide (div)
exponent (exp)
modulo (mod, remainder, rem)
increment (inc)
decrement (dec)
greater (gt)
greaterOrEqual (gte)
less (lt)
lessOrEqual (lte)
positive (pos, plus)
negative (neg)
bitand (band)
bitor (bor)
bitxor (bxor)
bitnot (bnot)
leftShift (lshift)
rightShift (rshift)
rightShiftZero (rshift0)

_string_
substring
padStart
padEnd
startsWith
endsWith
charCodeAt
codePointAt
fromCharCode
fromCodePoint
includes
trim
trimStart
trimEnd
repeat
replace
match
matchAll
test (testMatch, matches)

add
and
apply
argument (identity, _)
arity (nary)
awaitAll
awaitAny
awaitDelay
binary
bind
call
callable (toCallable)
chain
chainable (toChainable)
compare
compareTypes
compareWith
compose (f)
concat
conditional (ternary, when)
constant ($, always, just, scalar)
construct
curry
def (define)
defineError
descriptor (getDescriptor, getPropertyDescriptor)
entries
equal (eq, deepEqual)
error
every
exists
fallback
falsy
filter
find
findIndex
findLast
findLastIndex
flat (flatten)
flatMap
fromHex
fromJson (parse)
fromYaml (fromYml)
gather
get (pick, prop, property)
getOwn (getOwnProp, getOwnProperty)
group
groupBy
has (isIn, hasProp, hasProperty)
hash
hashToString
indexOf
is (isExactly, same, strictEqual)
isBoolean (isBool)
isAny (isOne, isSome)
isArray
isAsync (isPromise, isThennable)
isCallable
isDate
isError
isErrorOf
isExactly
isFalsy (falsy)
isInt (isInteger)
isIterable
isMap
isMissing (isUndefined)
isNull
isNumber (isDouble)
isObject (isDefined)
isPlainObject (isPojo)
isRegExp (isRegex)
isSet
isSpreadable
isString
isTruthy (truthy)
isType (isTypeOf)
isUndefined
isValue
isValid
join
key
keys
last
lastIndexOf
lazable (toLazable)
lazy
makeSpreadable
map
maybe
memoize
memoizeIf
merge (mergeProps, mergeProperties)
mergeConcat
mergeInto (assign)
mergeUnique
mergeWith
not
nullary
offsetFromEnd
or
over (mapOver)
ownDescriptor (getOwnDescriptor, getOwnPropertyDescriptor)
ownEntries
ownKeys
ownValues
pipe (I)
pop
prototype (getPrototype, getPrototypeOf)
proxy (bindAll)
push
range
reduce
reject
required
reverse
rest
select
set
setPrototype (setPrototypeOf)
shift (dequeue)
slice
skip
some
sort
sortBy
split
spread
spreadable
subtract (sub)
take
tap (aside, sideEffect)
ternary
toArray
toAsync (toPromise, resolve, toThennable)
toBuffer
toDate
toFixed (toDecimal)
toFloat (parseFloat)
toHex
toInt (toInteger, parseInt)
toJson (stringify)
toLocaleString (toLocale, format)
toMap
toObject
toPrecision
toSet
toSpreadable
toString
trace
trap
truthy (toBoolean)
type
types
unary
uncurry
unshift (enqueue)
validate
value
values
with (set, defineProperty)
without (deleteProperty)
xor

## Philosophy

_to do..._

## Contributing

_to do..._
