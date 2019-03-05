[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-to-object

`npm i @sullux/fp-light-to-object`
[source](https://github.com/Sullux/fp-light/blob/master/lib/toObject/toObject.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/toObject/toObject.spec.js)

Produces an object from any input. If the input is iterable, the object is assembled from the given key/value pairs.

* [toObject](#toobject)

### toObject

`toObject(any)`

Produces an object from the given input value. If the input is iterable, `toObject` assumes that each entry is a two-element array of key and value.

```javascript
const { toObject } = require('@sullux/fp-light-to-object')

toObject() // { 'Undefined': undefined }

toObject(null) // { 'Null': null }

toObject([['foo', 'bar'], ['baz', 42]]) // { foo: 'bar', baz: 42 }

toObject({ foo: 42 }) // { foo: 42 }

toObject(new Date()) // { Date: 2019-03-01T14:56:53.812Z }

toObject(42) // { Number: 42 }

toObject('foo') // { String: 'foo' }

toObject(() => 42) // { Function: [Function] }
```
