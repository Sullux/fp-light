[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-type

`npm i @sullux/fp-light-type`
[source](https://github.com/Sullux/fp-light/blob/master/lib/type/type.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/type/type.spec.js)

The `type` function supplements the scattered and inconsistent type functionality in Javascript. This module also supplies proper factory functions for `undefined` and `null`, the only values in Javascript that are missing a native factory.

* [type](#type)
* [typeEquals](#typeequals)
* [factoryOf](#factoryof)
* [Undefined](#undefined)
* [Null](#null)

### type

`type(value: any): { `
`  jstype: string, `
`  name: string, `
`  factory: Function, `
`  inheritence: Array<string> `
`}`

Returns a map of information about the type of the given value.

* `jstype`: the native type as reported by `typeof value`.
* `name`: the name of the factory function for this type.
* `factory`: the factory function for this type.
* `inheritence`: an array of all factory functions within the prototype chain from the factory of the given value through the final factory `Object`.

Example:

```javascript
const { type } = require('@sullux/fp-light-type')

console.log(type(true))
/*
{ jstype: 'boolean',
  name: 'Boolean',
  factory: [Function: Boolean],
  inheritence: [ [Function: Boolean], [Function: Object] ] }
*/
```

### typeEquals

`typeEquals(first: any, second: any): boolean`

Given two values, returns true if the values share the same factory function.

Example:

```javascript
const { ok } = require('assert')
const { typeEquals } = require('@sullux/fp-light-type')

ok(typeEquals(false, true))
ok(typeEquals(null, null))
ok(!typeEquals(null, undefined))
```

### factoryOf

`factoryOf(value: any): Function`

Given a value, returns the factory of the value.

Example:

```javascript
const { strictEqual } = require('assert')
const { factoryOf } = require('@sullux/fp-light-type')

strictEqual(factoryOf(true), Boolean)
```

### Undefined

`Undefined(): undefined`

Provided as the missing factory/constructor for `undefined`.

Example:

```javascript
const { strictEqual } = require('assert')
const { Undefined, factoryOf } = require('@sullux/fp-light-type')

strictEqual(Undefined(), undefined)
strictEqual(factoryOf(undefined), Undefined)
```

### Null

`Null(): null`

Provided as the missing factory/constructor for `null`.

Example:

```javascript
const { strictEqual } = require('assert')
const { Null, factoryOf } = require('@sullux/fp-light-type')

strictEqual(Null(), null)
strictEqual(factoryOf(null), Null)
```
