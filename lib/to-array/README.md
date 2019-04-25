[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-to-array

`npm i @sullux/fp-light-to-array`  
[source](https://github.com/Sullux/fp-light/blob/master/lib/to-array/to-array.js)  
[test](https://github.com/Sullux/fp-light/blob/master/lib/to-array/to-array.spec.js)  

Produces an array from any input.

* [toArray](#toarray)

### toArray

`toArray(any)`

If the input is already an array, the original input is returned. If the input is iterable, it is spread into a new array. The values `null`, `undefined` and `''` (empty string) produce an empty array. A `Date`, `function` or `number` value is returned in a single-element array, while objects return an array of entries (as from `Object.entries`).

```javascript
const { toArray } = require('@sullux/fp-light-to-array')

toArray() // []

toArray(null) // []

toArray('') // []

toArray('foo') // ['f', 'o', 'o']

toArray(42) // [42]

toArray(new Date()) // [Date: 2019-03-01T14:56:53.812Z]

toArray(() => 42) // { Function: [Function] }

toArray({ foo: 42, bar: 'baz' }) // [['foo', 42], ['bar', 'baz']]
```
