[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-set

`npm i @sullux/fp-light-set`  
[source](https://github.com/Sullux/fp-light/blob/master/lib/set/set.js)  
[test](https://github.com/Sullux/fp-light/blob/master/lib/set/set.spec.js)

The `set` function returns a newly-composed object or array with the given deep property set to the given value.

* [set](#set)
* [setValue](#setvalue)
* [setObjectValue](#setobjectvalue)
* [setArrayValue](#setarrayvalue)

### set

`set(path, value, input)`

* `path`: string, number or array of strings/numbers. This is the key, index or path of keys/indexes to the property of the input object.
* `value`: the new value to set on the input object.
* `input`: the object or array on which the new value is being set.

The `set` function creates a deep copy of the input with the new value interpolated into the result at the offset denoted by the path. If parts of the path are missing, those parts are created. If a path part is a number, it is assumed to be an offset into an array; otherwise, it is assumed to be a property of an object.

The `set` function can be particularly useful in mapping operations as in the following example.

```javascript
const { map } = require('@sullux/fp-light-map')
const { set } = require('@sullux/fp-light-set')

const people = [
  { name: 'jane' },
  { name: 'jamal' },
  { name: 'zhang' },
]

const inactive = map(set('active', false))

inactive(people)
/*
[
  { name: 'jane', active: false },
  { name: 'jamal', active: false },
  { name: 'xing', active: false },
]
*/
```

### setValue

`setValue(input, key, value)`

* `input`: the object on which to set the value
* `key`: the input key or index at which to set the value
* `value`: the new value of the key or index

The `setValue` function creates a shallow copy of the input object/array with the value interpolated into the result at the given key.

```javascript
const { setValue } = require('@sullux/fp-light-set')

setValue({ foo: 7, bar: 'baz' }, 'foo', 42)
// { foo: 42, bar: 'baz' }

setValue([7, 8, 13], 1, 42)
// [7, 42, 13]
```

### setObjectValue

`setObjectValue(input, key, value)`

The `setObjectValue` function creates a shallow copy of the input object with the value interpolated into the result at the given key. This is the default behavior of `setValue` when the input is not an array.

### setArrayValue

`setArrayValue(input, key, value)`

The `setArrayValue` function creates a shallow copy of the input array with the value interpolated into the result at the given key. This is the default behavior of `setValue` when the input is an array.
