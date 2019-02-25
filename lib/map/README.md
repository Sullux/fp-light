[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-map

`npm i @sullux/fp-light-map`
[source](https://github.com/Sullux/fp-light/blob/master/lib/map/map.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/map/map.spec.js)

Similar to the [built-in Javascript function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) `Array.prototype.map`, but accepts the iterable as the second argument.

* [map](#map)

### map

`map<T, U>(mapper: (T) => U, iterable: Iterable<T>): Iterable<U>`

Given a mapping function and an iterable, returns an iterable where each input item is mapped to an output item.

```javascript
const { map } = require('@sullux/fp-light-map')

const input = [1, 2, 3]
const output = map(x => x + 1, input)
console.log([...output])
// [2, 3, 4]
```
