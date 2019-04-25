[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-to-map

`npm i @sullux/fp-light-to-map`
[source](https://github.com/Sullux/fp-light/blob/master/lib/toMap/toMap.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/toMap/toMap.spec.js)

Produces an map from any input. If the input is iterable, the map is assembled from the given key/value pairs.

* [toMap](#tomap)

### toMap

`toMap(any)`

Produces an map from the given input value. If the input is iterable, `toMap` assumes that each entry is a two-element array of key and value.

```javascript
const { toMap } = require('@sullux/fp-light-to-map')

toMap() // []

toMap(null) // []

toMap([['foo', 'bar'], ['baz', 42]]) // [['foo', 'bar'], ['baz' 42]]

toMap({ foo: 42 }) // [['foo', 42]]

toMap(new Date()) // [['Date', '2019-03-01T14:56:53.812Z']]

toMap(42) // [['Number': 42]]

toMap('foo') // [['String': 'foo']]

toMap(() => 42) // [['Function': () => 42]]
```
