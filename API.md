[Home](https://github.com/Sullux/fp-light/blob/master/README.md) | **Full API**
| [Tutorial](https://github.com/Sullux/fp-light/blob/master/TUTORIAL.md)
| [Project Setup Guide](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE.md) ([CJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-CJS.md) / [MJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-MJS.md))

# API

NOTE: we are in the process of overhauling the API docs. This overhaul is almost finished; in the meantime, please refer to the [tutorial](https://github.com/Sullux/fp-light/blob/master/TUTORIAL.md) to help get you started.

* [...](#---)
  * [$](#-)
  * [_](#-)
  * [__esModule](#--esmodule)
  * [_base](#-base)
  * [_this](#-this)

* [A](#a)
  * [Any](#any)
  * [add](#add)
  * [always](#always)
  * [and](#and)
  * [any](#any)
  * [anyOf](#anyof)
  * [appendedName](#appendedname)
  * [argument](#argument)
  * [arity](#arity)
  * [arraySpreadFrom](#arrayspreadfrom)
  * [asPromise](#aspromise)
  * [aside](#aside)
  * [assertValid](#assertvalid)
  * [awaitAll](#awaitall)
  * [awaitAny](#awaitany)
  * [awaitArray](#awaitarray)
  * [awaitDelay](#awaitdelay)
  * [awaitObject](#awaitobject)

* [B](#b)
  * [band](#band)
  * [baseArgument](#baseargument)
  * [baseIdentity](#baseidentity)
  * [binary](#binary)
  * [bit](#bit)
  * [bitand](#bitand)
  * [bitnot](#bitnot)
  * [bitor](#bitor)
  * [bitwise](#bitwise)
  * [bitxor](#bitxor)
  * [bnot](#bnot)
  * [bor](#bor)
  * [bxor](#bxor)

* [C](#c)
  * [call](#call)
  * [charAt](#charat)
  * [charCodeAt](#charcodeat)
  * [charPointAt](#charpointat)
  * [compare](#compare)
  * [compareTypes](#comparetypes)
  * [comparer](#comparer)
  * [comparing](#comparing)
  * [compilable](#compilable)
  * [compose](#compose)
  * [concat](#concat)
  * [concurrent](#concurrent)
  * [conditional](#conditional)
  * [constant](#constant)
  * [construct](#construct)
  * [constructed](#constructed)
  * [constructor](#constructor)
  * [curry](#curry)

* [D](#d)
  * [deepAwait](#deepawait)
  * [deepEqual](#deepequal)
  * [default](#default)
  * [defaultHashToStringOutputChars](#defaulthashtostringoutputchars)
  * [defineError](#defineerror)
  * [delay](#delay)
  * [dispatch](#dispatch)
  * [div](#div)
  * [divide](#divide)
  * [dotAll](#dotall)

* [E](#e)
  * [endsWith](#endswith)
  * [eq](#eq)
  * [equal](#equal)
  * [equalTo](#equalto)
  * [every](#every)
  * [exists](#exists)
  * [exp](#exp)
  * [exponent](#exponent)

* [F](#f)
  * [f](#f)
  * [fail](#fail)
  * [failWith](#failwith)
  * [fallback](#fallback)
  * [falsy](#falsy)
  * [filter](#filter)
  * [flat](#flat)
  * [fromBase](#frombase)
  * [fromCharCode](#fromcharcode)
  * [fromCodePoint](#fromcodepoint)
  * [functionName](#functionname)

* [G](#g)
  * [gather](#gather)
  * [get](#get)
  * [getArraySpread](#getarrayspread)
  * [getObjectSpread](#getobjectspread)
  * [getSpreadable](#getspreadable)
  * [globalMatch](#globalmatch)
  * [greater](#greater)
  * [greaterThan](#greaterthan)
  * [groupBy](#groupby)
  * [gt](#gt)

* [H](#h)
  * [hash](#hash)
  * [hashAny](#hashany)
  * [hashFrom](#hashfrom)
  * [hashToDouble](#hashtodouble)
  * [hashToInt](#hashtoint)
  * [hashToString](#hashtostring)

* [I](#i)
  * [I](#i)
  * [InvalidTrapTargetError](#invalidtraptargeterror)
  * [identity](#identity)
  * [ignoreCase](#ignorecase)
  * [includes](#includes)
  * [indexOf](#indexof)
  * [is](#is)
  * [isArray](#isarray)
  * [isAsync](#isasync)
  * [isBoolean](#isboolean)
  * [isCompiled](#iscompiled)
  * [isDate](#isdate)
  * [isDefined](#isdefined)
  * [isError](#iserror)
  * [isErrorOf](#iserrorof)
  * [isExactType](#isexacttype)
  * [isExactly](#isexactly)
  * [isExtendedFrom](#isextendedfrom)
  * [isFalsy](#isfalsy)
  * [isFunction](#isfunction)
  * [isIdentity](#isidentity)
  * [isInteger](#isinteger)
  * [isIterable](#isiterable)
  * [isMap](#ismap)
  * [isMissing](#ismissing)
  * [isNull](#isnull)
  * [isNumber](#isnumber)
  * [isObject](#isobject)
  * [isPromise](#ispromise)
  * [isRegex](#isregex)
  * [isResolve](#isresolve)
  * [isSet](#isset)
  * [isSpreadable](#isspreadable)
  * [isSpreadableSymbol](#isspreadablesymbol)
  * [isString](#isstring)
  * [isSymbol](#issymbol)
  * [isSync](#issync)
  * [isThennable](#isthennable)
  * [isTruthy](#istruthy)
  * [isType](#istype)
  * [isUndefined](#isundefined)
  * [isValid](#isvalid)

* [J](#j)
  * [join](#join)
  * [just](#just)

* [L](#l)
  * [lastIndexOf](#lastindexof)
  * [left](#left)
  * [leftShift](#leftshift)
  * [less](#less)
  * [lessThan](#lessthan)
  * [literal](#literal)
  * [lshift](#lshift)
  * [lt](#lt)

* [M](#m)
  * [MissingPipeArgumentError](#missingpipeargumenterror)
  * [map](#map)
  * [mod](#mod)
  * [modulo](#modulo)
  * [mul](#mul)
  * [multiline](#multiline)
  * [multiply](#multiply)

* [N](#n)
  * [Null](#null)
  * [named](#named)
  * [nary](#nary)
  * [not](#not)
  * [notExists](#notexists)
  * [nullary](#nullary)

* [O](#o)
  * [or](#or)
  * [override](#override)

* [P](#p)
  * [Primitive](#primitive)
  * [padEnd](#padend)
  * [padStart](#padstart)
  * [parallel](#parallel)
  * [parse](#parse)
  * [pipe](#pipe)
  * [pow](#pow)
  * [product](#product)
  * [propertyValue](#propertyvalue)
  * [proxy](#proxy)

* [R](#r)
  * [race](#race)
  * [reduce](#reduce)
  * [regex](#regex)
  * [reject](#reject)
  * [rem](#rem)
  * [remainder](#remainder)
  * [required](#required)
  * [resolve](#resolve)
  * [rest](#rest)
  * [reverse](#reverse)
  * [right](#right)
  * [rightShift](#rightshift)
  * [round](#round)
  * [rshift](#rshift)

* [S](#s)
  * [same](#same)
  * [sameType](#sametype)
  * [scalar](#scalar)
  * [select](#select)
  * [selectCase](#selectcase)
  * [shallowResolve](#shallowresolve)
  * [shift](#shift)
  * [some](#some)
  * [sort](#sort)
  * [spread](#spread)
  * [spreadableSymbol](#spreadablesymbol)
  * [sqr](#sqr)
  * [sqrt](#sqrt)
  * [square](#square)
  * [squareRoot](#squareroot)
  * [startsWith](#startswith)
  * [sticky](#sticky)
  * [strictEqual](#strictequal)
  * [strictEqualType](#strictequaltype)
  * [stringify](#stringify)
  * [sub](#sub)
  * [subtract](#subtract)
  * [sync](#sync)
  * [syncSymbol](#syncsymbol)

* [T](#t)
  * [tag](#tag)
  * [tap](#tap)
  * [template](#template)
  * [ternary](#ternary)
  * [thisArgument](#thisargument)
  * [thisIdentity](#thisidentity)
  * [toArray](#toarray)
  * [toAsync](#toasync)
  * [toIdentity](#toidentity)
  * [toObject](#toobject)
  * [toPrimitiveFunction](#toprimitivefunction)
  * [toPromise](#topromise)
  * [toRegex](#toregex)
  * [toSpreadable](#tospreadable)
  * [toThennable](#tothennable)
  * [trace](#trace)
  * [trap](#trap)
  * [trapAsync](#trapasync)
  * [truthy](#truthy)
  * [typeName](#typename)
  * [typeOf](#typeof)

* [U](#u)
  * [Undefined](#undefined)
  * [unary](#unary)
  * [uncurry](#uncurry)
  * [unicode](#unicode)

* [V](#v)
  * [ValidationError](#validationerror)
  * [validate](#validate)

* [W](#w)
  * [when](#when)
  * [without](#without)

* [X](#x)
  * [xor](#xor)


## ...

### $

_features_

**`$()`**

* args
* returns

```javascript
// example
```

### _

_features_

**`_()`**

* args
* returns

```javascript
// example
```

### __esModule

_features_

**`__esModule()`**

* args
* returns

```javascript
// example
```

### _base

_features_

**`_base()`**

* args
* returns

```javascript
// example
```

### _this

_features_

**`_this()`**

* args
* returns

```javascript
// example
```

## A

### Any

_features_

**`Any()`**

* args
* returns

```javascript
// example
```

### add

_features_

**`add()`**

* args
* returns

```javascript
// example
```

### always

_features_

**`always()`**

* args
* returns

```javascript
// example
```

### and

_features_

**`and()`**

* args
* returns

```javascript
// example
```

### any

_features_

**`any()`**

* args
* returns

```javascript
// example
```

### anyOf

_features_

**`anyOf()`**

* args
* returns

```javascript
// example
```

### appendedName

_features_

**`appendedName()`**

* args
* returns

```javascript
// example
```

### argument

_features_

**`argument()`**

* args
* returns

```javascript
// example
```

### arity

_features_

**`arity()`**

* args
* returns

```javascript
// example
```

### arraySpreadFrom

_features_

**`arraySpreadFrom()`**

* args
* returns

```javascript
// example
```

### asPromise

_features_

**`asPromise()`**

* args
* returns

```javascript
// example
```

### aside

_features_

**`aside()`**

* args
* returns

```javascript
// example
```

### assertValid

_features_

**`assertValid()`**

* args
* returns

```javascript
// example
```

### awaitAll

_features_

**`awaitAll()`**

* args
* returns

```javascript
// example
```

### awaitAny

_features_

**`awaitAny()`**

* args
* returns

```javascript
// example
```

### awaitArray

_features_

**`awaitArray()`**

* args
* returns

```javascript
// example
```

### awaitDelay

_features_

**`awaitDelay()`**

* args
* returns

```javascript
// example
```

### awaitObject

_features_

**`awaitObject()`**

* args
* returns

```javascript
// example
```

## B

### band

_features_

**`band()`**

* args
* returns

```javascript
// example
```

### baseArgument

_features_

**`baseArgument()`**

* args
* returns

```javascript
// example
```

### baseIdentity

_features_

**`baseIdentity()`**

* args
* returns

```javascript
// example
```

### binary

_features_

**`binary()`**

* args
* returns

```javascript
// example
```

### bit

_features_

**`bit()`**

* args
* returns

```javascript
// example
```

### bitand

_features_

**`bitand()`**

* args
* returns

```javascript
// example
```

### bitnot

_features_

**`bitnot()`**

* args
* returns

```javascript
// example
```

### bitor

_features_

**`bitor()`**

* args
* returns

```javascript
// example
```

### bitwise

_features_

**`bitwise()`**

* args
* returns

```javascript
// example
```

### bitxor

_features_

**`bitxor()`**

* args
* returns

```javascript
// example
```

### bnot

_features_

**`bnot()`**

* args
* returns

```javascript
// example
```

### bor

_features_

**`bor()`**

* args
* returns

```javascript
// example
```

### bxor

_features_

**`bxor()`**

* args
* returns

```javascript
// example
```

## C

### call

_features_

**`call()`**

* args
* returns

```javascript
// example
```

### charAt

_features_

**`charAt()`**

* args
* returns

```javascript
// example
```

### charCodeAt

_features_

**`charCodeAt()`**

* args
* returns

```javascript
// example
```

### charPointAt

_features_

**`charPointAt()`**

* args
* returns

```javascript
// example
```

### compare

_features_

**`compare()`**

* args
* returns

```javascript
// example
```

### compareTypes

_features_

**`compareTypes()`**

* args
* returns

```javascript
// example
```

### comparer

_features_

**`comparer()`**

* args
* returns

```javascript
// example
```

### comparing

_features_

**`comparing()`**

* args
* returns

```javascript
// example
```

### compilable

_features_

**`compilable()`**

* args
* returns

```javascript
// example
```

### compose

_features_

**`compose()`**

* args
* returns

```javascript
// example
```

### concat

_features_

**`concat()`**

* args
* returns

```javascript
// example
```

### concurrent

_features_

**`concurrent()`**

* args
* returns

```javascript
// example
```

### conditional

_features_

**`conditional()`**

* args
* returns

```javascript
// example
```

### constant

_features_

**`constant()`**

* args
* returns

```javascript
// example
```

### construct

_features_

**`construct()`**

* args
* returns

```javascript
// example
```

### constructed

_features_

**`constructed()`**

* args
* returns

```javascript
// example
```

### constructor

_features_

**`constructor()`**

* args
* returns

```javascript
// example
```

### curry

_features_

**`curry()`**

* args
* returns

```javascript
// example
```

## D

### deepAwait

_features_

**`deepAwait()`**

* args
* returns

```javascript
// example
```

### deepEqual

_features_

**`deepEqual()`**

* args
* returns

```javascript
// example
```

### default

_features_

**`default()`**

* args
* returns

```javascript
// example
```

### defaultHashToStringOutputChars

_features_

**`defaultHashToStringOutputChars()`**

* args
* returns

```javascript
// example
```

### defineError

_features_

**`defineError()`**

* args
* returns

```javascript
// example
```

### delay

_features_

**`delay()`**

* args
* returns

```javascript
// example
```

### dispatch

_features_

**`dispatch()`**

* args
* returns

```javascript
// example
```

### div

_features_

**`div()`**

* args
* returns

```javascript
// example
```

### divide

_features_

**`divide()`**

* args
* returns

```javascript
// example
```

### dotAll

_features_

**`dotAll()`**

* args
* returns

```javascript
// example
```

## E

### endsWith

_features_

**`endsWith()`**

* args
* returns

```javascript
// example
```

### eq

_features_

**`eq()`**

* args
* returns

```javascript
// example
```

### equal

_features_

**`equal()`**

* args
* returns

```javascript
// example
```

### equalTo

_features_

**`equalTo()`**

* args
* returns

```javascript
// example
```

### every

_features_

**`every()`**

* args
* returns

```javascript
// example
```

### exists

_features_

**`exists()`**

* args
* returns

```javascript
// example
```

### exp

_features_

**`exp()`**

* args
* returns

```javascript
// example
```

### exponent

_features_

**`exponent()`**

* args
* returns

```javascript
// example
```

## F

### f

_features_

**`f()`**

* args
* returns

```javascript
// example
```

### fail

_features_

**`fail()`**

* args
* returns

```javascript
// example
```

### failWith

_features_

**`failWith()`**

* args
* returns

```javascript
// example
```

### fallback

_features_

**`fallback()`**

* args
* returns

```javascript
// example
```

### falsy

_features_

**`falsy()`**

* args
* returns

```javascript
// example
```

### filter

_features_

**`filter()`**

* args
* returns

```javascript
// example
```

### flat

_features_

**`flat()`**

* args
* returns

```javascript
// example
```

### fromBase

_features_

**`fromBase()`**

* args
* returns

```javascript
// example
```

### fromCharCode

_features_

**`fromCharCode()`**

* args
* returns

```javascript
// example
```

### fromCodePoint

_features_

**`fromCodePoint()`**

* args
* returns

```javascript
// example
```

### functionName

_features_

**`functionName()`**

* args
* returns

```javascript
// example
```

## G

### gather

_features_

**`gather()`**

* args
* returns

```javascript
// example
```

### get

_features_

**`get()`**

* args
* returns

```javascript
// example
```

### getArraySpread

_features_

**`getArraySpread()`**

* args
* returns

```javascript
// example
```

### getObjectSpread

_features_

**`getObjectSpread()`**

* args
* returns

```javascript
// example
```

### getSpreadable

_features_

**`getSpreadable()`**

* args
* returns

```javascript
// example
```

### globalMatch

_features_

**`globalMatch()`**

* args
* returns

```javascript
// example
```

### greater

_features_

**`greater()`**

* args
* returns

```javascript
// example
```

### greaterThan

_features_

**`greaterThan()`**

* args
* returns

```javascript
// example
```

### groupBy

_features_

**`groupBy()`**

* args
* returns

```javascript
// example
```

### gt

_features_

**`gt()`**

* args
* returns

```javascript
// example
```

## H

### hash

_features_

**`hash()`**

* args
* returns

```javascript
// example
```

### hashAny

_features_

**`hashAny()`**

* args
* returns

```javascript
// example
```

### hashFrom

_features_

**`hashFrom()`**

* args
* returns

```javascript
// example
```

### hashToDouble

_features_

**`hashToDouble()`**

* args
* returns

```javascript
// example
```

### hashToInt

_features_

**`hashToInt()`**

* args
* returns

```javascript
// example
```

### hashToString

_features_

**`hashToString()`**

* args
* returns

```javascript
// example
```

## I

### I

_features_

**`I()`**

* args
* returns

```javascript
// example
```

### InvalidTrapTargetError

_features_

**`InvalidTrapTargetError()`**

* args
* returns

```javascript
// example
```

### identity

_features_

**`identity()`**

* args
* returns

```javascript
// example
```

### ignoreCase

_features_

**`ignoreCase()`**

* args
* returns

```javascript
// example
```

### includes

_features_

**`includes()`**

* args
* returns

```javascript
// example
```

### indexOf

_features_

**`indexOf()`**

* args
* returns

```javascript
// example
```

### is

_features_

**`is()`**

* args
* returns

```javascript
// example
```

### isArray

_features_

**`isArray()`**

* args
* returns

```javascript
// example
```

### isAsync

_features_

**`isAsync()`**

* args
* returns

```javascript
// example
```

### isBoolean

_features_

**`isBoolean()`**

* args
* returns

```javascript
// example
```

### isCompiled

_features_

**`isCompiled()`**

* args
* returns

```javascript
// example
```

### isDate

_features_

**`isDate()`**

* args
* returns

```javascript
// example
```

### isDefined

_features_

**`isDefined()`**

* args
* returns

```javascript
// example
```

### isError

_features_

**`isError()`**

* args
* returns

```javascript
// example
```

### isErrorOf

_features_

**`isErrorOf()`**

* args
* returns

```javascript
// example
```

### isExactType

_features_

**`isExactType()`**

* args
* returns

```javascript
// example
```

### isExactly

_features_

**`isExactly()`**

* args
* returns

```javascript
// example
```

### isExtendedFrom

_features_

**`isExtendedFrom()`**

* args
* returns

```javascript
// example
```

### isFalsy

_features_

**`isFalsy()`**

* args
* returns

```javascript
// example
```

### isFunction

_features_

**`isFunction()`**

* args
* returns

```javascript
// example
```

### isIdentity

_features_

**`isIdentity()`**

* args
* returns

```javascript
// example
```

### isInteger

_features_

**`isInteger()`**

* args
* returns

```javascript
// example
```

### isIterable

_features_

**`isIterable()`**

* args
* returns

```javascript
// example
```

### isMap

_features_

**`isMap()`**

* args
* returns

```javascript
// example
```

### isMissing

_features_

**`isMissing()`**

* args
* returns

```javascript
// example
```

### isNull

_features_

**`isNull()`**

* args
* returns

```javascript
// example
```

### isNumber

_features_

**`isNumber()`**

* args
* returns

```javascript
// example
```

### isObject

_features_

**`isObject()`**

* args
* returns

```javascript
// example
```

### isPromise

_features_

**`isPromise()`**

* args
* returns

```javascript
// example
```

### isRegex

_features_

**`isRegex()`**

* args
* returns

```javascript
// example
```

### isResolve

_features_

**`isResolve()`**

* args
* returns

```javascript
// example
```

### isSet

_features_

**`isSet()`**

* args
* returns

```javascript
// example
```

### isSpreadable

_features_

**`isSpreadable()`**

* args
* returns

```javascript
// example
```

### isSpreadableSymbol

_features_

**`isSpreadableSymbol()`**

* args
* returns

```javascript
// example
```

### isString

_features_

**`isString()`**

* args
* returns

```javascript
// example
```

### isSymbol

_features_

**`isSymbol()`**

* args
* returns

```javascript
// example
```

### isSync

_features_

**`isSync()`**

* args
* returns

```javascript
// example
```

### isThennable

_features_

**`isThennable()`**

* args
* returns

```javascript
// example
```

### isTruthy

_features_

**`isTruthy()`**

* args
* returns

```javascript
// example
```

### isType

_features_

**`isType()`**

* args
* returns

```javascript
// example
```

### isUndefined

_features_

**`isUndefined()`**

* args
* returns

```javascript
// example
```

### isValid

_features_

**`isValid()`**

* args
* returns

```javascript
// example
```

## J

### join

_features_

**`join()`**

* args
* returns

```javascript
// example
```

### just

_features_

**`just()`**

* args
* returns

```javascript
// example
```

## L

### lastIndexOf

_features_

**`lastIndexOf()`**

* args
* returns

```javascript
// example
```

### left

_features_

**`left()`**

* args
* returns

```javascript
// example
```

### leftShift

_features_

**`leftShift()`**

* args
* returns

```javascript
// example
```

### less

_features_

**`less()`**

* args
* returns

```javascript
// example
```

### lessThan

_features_

**`lessThan()`**

* args
* returns

```javascript
// example
```

### literal

_features_

**`literal()`**

* args
* returns

```javascript
// example
```

### lshift

_features_

**`lshift()`**

* args
* returns

```javascript
// example
```

### lt

_features_

**`lt()`**

* args
* returns

```javascript
// example
```

## M

### MissingPipeArgumentError

_features_

**`MissingPipeArgumentError()`**

* args
* returns

```javascript
// example
```

### map

_features_

**`map()`**

* args
* returns

```javascript
// example
```

### mod

_features_

**`mod()`**

* args
* returns

```javascript
// example
```

### modulo

_features_

**`modulo()`**

* args
* returns

```javascript
// example
```

### mul

_features_

**`mul()`**

* args
* returns

```javascript
// example
```

### multiline

_features_

**`multiline()`**

* args
* returns

```javascript
// example
```

### multiply

_features_

**`multiply()`**

* args
* returns

```javascript
// example
```

## N

### Null

_features_

**`Null()`**

* args
* returns

```javascript
// example
```

### named

_features_

**`named()`**

* args
* returns

```javascript
// example
```

### nary

_features_

**`nary()`**

* args
* returns

```javascript
// example
```

### not

_features_

**`not()`**

* args
* returns

```javascript
// example
```

### notExists

_features_

**`notExists()`**

* args
* returns

```javascript
// example
```

### nullary

_features_

**`nullary()`**

* args
* returns

```javascript
// example
```

## O

### or

_features_

**`or()`**

* args
* returns

```javascript
// example
```

### override

_features_

**`override()`**

* args
* returns

```javascript
// example
```

## P

### Primitive

_features_

**`Primitive()`**

* args
* returns

```javascript
// example
```

### padEnd

_features_

**`padEnd()`**

* args
* returns

```javascript
// example
```

### padStart

_features_

**`padStart()`**

* args
* returns

```javascript
// example
```

### parallel

_features_

**`parallel()`**

* args
* returns

```javascript
// example
```

### parse

_features_

**`parse()`**

* args
* returns

```javascript
// example
```

### pipe

_features_

**`pipe()`**

* args
* returns

```javascript
// example
```

### pow

_features_

**`pow()`**

* args
* returns

```javascript
// example
```

### product

_features_

**`product()`**

* args
* returns

```javascript
// example
```

### propertyValue

_features_

**`propertyValue()`**

* args
* returns

```javascript
// example
```

### proxy

_features_

**`proxy()`**

* args
* returns

```javascript
// example
```

## R

### race

_features_

**`race()`**

* args
* returns

```javascript
// example
```

### reduce

_features_

**`reduce()`**

* args
* returns

```javascript
// example
```

### regex

_features_

**`regex()`**

* args
* returns

```javascript
// example
```

### reject

_features_

**`reject()`**

* args
* returns

```javascript
// example
```

### rem

_features_

**`rem()`**

* args
* returns

```javascript
// example
```

### remainder

_features_

**`remainder()`**

* args
* returns

```javascript
// example
```

### required

_features_

**`required()`**

* args
* returns

```javascript
// example
```

### resolve

_features_

**`resolve()`**

* args
* returns

```javascript
// example
```

### rest

_features_

**`rest()`**

* args
* returns

```javascript
// example
```

### reverse

_features_

**`reverse()`**

* args
* returns

```javascript
// example
```

### right

_features_

**`right()`**

* args
* returns

```javascript
// example
```

### rightShift

_features_

**`rightShift()`**

* args
* returns

```javascript
// example
```

### round

_features_

**`round()`**

* args
* returns

```javascript
// example
```

### rshift

_features_

**`rshift()`**

* args
* returns

```javascript
// example
```

## S

### same

_features_

**`same()`**

* args
* returns

```javascript
// example
```

### sameType

_features_

**`sameType()`**

* args
* returns

```javascript
// example
```

### scalar

_features_

**`scalar()`**

* args
* returns

```javascript
// example
```

### select

_features_

**`select()`**

* args
* returns

```javascript
// example
```

### selectCase

_features_

**`selectCase()`**

* args
* returns

```javascript
// example
```

### shallowResolve

_features_

**`shallowResolve()`**

* args
* returns

```javascript
// example
```

### shift

_features_

**`shift()`**

* args
* returns

```javascript
// example
```

### some

_features_

**`some()`**

* args
* returns

```javascript
// example
```

### sort

_features_

**`sort()`**

* args
* returns

```javascript
// example
```

### spread

_features_

**`spread()`**

* args
* returns

```javascript
// example
```

### spreadableSymbol

_features_

**`spreadableSymbol()`**

* args
* returns

```javascript
// example
```

### sqr

_features_

**`sqr()`**

* args
* returns

```javascript
// example
```

### sqrt

_features_

**`sqrt()`**

* args
* returns

```javascript
// example
```

### square

_features_

**`square()`**

* args
* returns

```javascript
// example
```

### squareRoot

_features_

**`squareRoot()`**

* args
* returns

```javascript
// example
```

### startsWith

_features_

**`startsWith()`**

* args
* returns

```javascript
// example
```

### sticky

_features_

**`sticky()`**

* args
* returns

```javascript
// example
```

### strictEqual

_features_

**`strictEqual()`**

* args
* returns

```javascript
// example
```

### strictEqualType

_features_

**`strictEqualType()`**

* args
* returns

```javascript
// example
```

### stringify

_features_

**`stringify()`**

* args
* returns

```javascript
// example
```

### sub

_features_

**`sub()`**

* args
* returns

```javascript
// example
```

### subtract

_features_

**`subtract()`**

* args
* returns

```javascript
// example
```

### sync

_features_

**`sync()`**

* args
* returns

```javascript
// example
```

### syncSymbol

_features_

**`syncSymbol()`**

* args
* returns

```javascript
// example
```

## T

### tag

_features_

**`tag()`**

* args
* returns

```javascript
// example
```

### tap

_features_

**`tap()`**

* args
* returns

```javascript
// example
```

### template

_features_

**`template()`**

* args
* returns

```javascript
// example
```

### ternary

_features_

**`ternary()`**

* args
* returns

```javascript
// example
```

### thisArgument

_features_

**`thisArgument()`**

* args
* returns

```javascript
// example
```

### thisIdentity

_features_

**`thisIdentity()`**

* args
* returns

```javascript
// example
```

### toArray

_features_

**`toArray()`**

* args
* returns

```javascript
// example
```

### toAsync

_features_

**`toAsync()`**

* args
* returns

```javascript
// example
```

### toIdentity

_features_

**`toIdentity()`**

* args
* returns

```javascript
// example
```

### toObject

_features_

**`toObject()`**

* args
* returns

```javascript
// example
```

### toPrimitiveFunction

_features_

**`toPrimitiveFunction()`**

* args
* returns

```javascript
// example
```

### toPromise

_features_

**`toPromise()`**

* args
* returns

```javascript
// example
```

### toRegex

_features_

**`toRegex()`**

* args
* returns

```javascript
// example
```

### toSpreadable

_features_

**`toSpreadable()`**

* args
* returns

```javascript
// example
```

### toThennable

_features_

**`toThennable()`**

* args
* returns

```javascript
// example
```

### trace

_features_

**`trace()`**

* args
* returns

```javascript
// example
```

### trap

_features_

**`trap()`**

* args
* returns

```javascript
// example
```

### trapAsync

_features_

**`trapAsync()`**

* args
* returns

```javascript
// example
```

### truthy

_features_

**`truthy()`**

* args
* returns

```javascript
// example
```

### typeName

_features_

**`typeName()`**

* args
* returns

```javascript
// example
```

### typeOf

_features_

**`typeOf()`**

* args
* returns

```javascript
// example
```

## U

### Undefined

_features_

**`Undefined()`**

* args
* returns

```javascript
// example
```

### unary

_features_

**`unary()`**

* args
* returns

```javascript
// example
```

### uncurry

_features_

**`uncurry()`**

* args
* returns

```javascript
// example
```

### unicode

_features_

**`unicode()`**

* args
* returns

```javascript
// example
```

## V

### ValidationError

_features_

**`ValidationError()`**

* args
* returns

```javascript
// example
```

### validate

_features_

**`validate()`**

* args
* returns

```javascript
// example
```

## W

### when

_features_

**`when()`**

* args
* returns

```javascript
// example
```

### without

_features_

**`without()`**

* args
* returns

```javascript
// example
```

## X

### xor

_features_

**`xor()`**

* args
* returns

```javascript
// example
```
