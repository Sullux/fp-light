[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-type

`npm i @sullux/fp-light-type`
[source](https://github.com/Sullux/fp-light/blob/master/lib/type/type.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/type/type.spec.js)

The `type` function supplements the scattered and inconsistent type-related functionality in Javascript. This includes supplying proper factory functions for `undefined` and `null`, the only values in Javascript that are missing a native factory. This also includes a utility to define new types in a consistent way.

* [allProperties](#allproperties)
* [bindAll](#bindall)
* [define](#define)
* [factoryOf](#factoryof)
* [Null](#null)
* [type](#type)
* [typeEquals](#typeequals)
* [Undefined](#undefined)

### allProperties

`allProperties(object: any): { [name: string | Symbol]: Descriptor }`

Enumerates the properties of the given object and every prototype in the prototype chain of the given object, returning a map of property names/symbols to descriptors. See the [Node.js reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) for `Object.defineProperty` for details about the descriptors.

Note that the result includes non-enumerable properties. The following example shows the REPL output of the function.

```javascript
allProperties(Error('reasons'))
/*
{ stack:
   { value: 'Error: reasons\n    at repl:1:15\n    at ContextifyScript.Script.runInThisContext (vm.js:50:33)\n    at REPLServer.defaultEval (repl.js:240:29)\n    at bound (domain.js:301:14)\n    at REPLServer.runBound [as eval] (domain.js:314:12)\n    at REPLServer.onLine (repl.js:468:10)\n    at emitOne (events.js:121:20)\n    at REPLServer.emit (events.js:211:7)\n    at REPLServer.Interface._onLine (readline.js:280:10)\n    at REPLServer.Interface._line (readline.js:629:8)',
     writable: true,
     enumerable: false,
     configurable: true },
  message:
   { value: '',
     writable: true,
     enumerable: false,
     configurable: true },
  constructor:
   { value: [Function: Object],
     writable: true,
     enumerable: false,
     configurable: true },
  name:
   { value: 'Error',
     writable: true,
     enumerable: false,
     configurable: true },
  toString:
   { value: [Function: toString],
     writable: true,
     enumerable: false,
     configurable: true },
  __defineGetter__:
   { value: [Function: __defineGetter__],
     writable: true,
     enumerable: false,
     configurable: true },
  __defineSetter__:
   { value: [Function: __defineSetter__],
     writable: true,
     enumerable: false,
     configurable: true },
  hasOwnProperty:
   { value: [Function: hasOwnProperty],
     writable: true,
     enumerable: false,
     configurable: true },
  __lookupGetter__:
   { value: [Function: __lookupGetter__],
     writable: true,
     enumerable: false,
     configurable: true },
  __lookupSetter__:
   { value: [Function: __lookupSetter__],
     writable: true,
     enumerable: false,
     configurable: true },
  isPrototypeOf:
   { value: [Function: isPrototypeOf],
     writable: true,
     enumerable: false,
     configurable: true },
  propertyIsEnumerable:
   { value: [Function: propertyIsEnumerable],
     writable: true,
     enumerable: false,
     configurable: true },
  valueOf:
   { value: [Function: valueOf],
     writable: true,
     enumerable: false,
     configurable: true },
  __proto__:
   { get: [Function: get __proto__],
     set: [Function: set __proto__],
     enumerable: false,
     configurable: true },
  toLocaleString:
   { value: [Function: toLocaleString],
     writable: true,
     enumerable: false,
     configurable: true } }
*/
```

### bindAll

`bindAll<T>(object: T): T`

Iterates all properties on the given object and the object's prototype chain and binds all functions to the given object. This solves a wide range of bugs that occur when an instance function is called out of context. The following test demonstrates the solution.

```javascript
const { strictEqual, throws } = require('assert')

const { bindAll } = require('@sullux/fp-light-type')

class Foo {
  constructor() {
    this.x = 42
  }
  xString() {
    return this.x.toString()
  }
}

describe('bindAll', () => {
  it('should throw without binding', () => {
    const unbound = new Foo()
    throws(unbound.xString)
  })
  it('should work properly with binding', () => {
    const bound = bindAll(new Foo())
    strictEqual(bound.xString(), '42')
  })
})
```

### define

to do

### factoryOf

`factoryOf(value: any): Function`

Given a value, returns the factory of the value.

Example:

```javascript
const { strictEqual } = require('assert')
const { factoryOf } = require('@sullux/fp-light-type')

strictEqual(factoryOf(true), Boolean)
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

### type

`type(value: any): { `
`  jstype: string, `
`  name: string, `
`  factory: Function, `
`  inheritance: Array<string> `
`}`

Returns a map of information about the type of the given value.

* `jstype`: the native type as reported by `typeof value`.
* `name`: the name of the factory function for this type.
* `factory`: the factory function for this type.
* `inheritance`: an array of all factory functions within the prototype chain from the factory of the given value through the final factory `Object`.

Example:

```javascript
const { type } = require('@sullux/fp-light-type')

console.log(type(true))
/*
{ jstype: 'boolean',
  name: 'Boolean',
  factory: [Function: Boolean],
  inheritance: [ [Function: Boolean], [Function: Object] ] }
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
