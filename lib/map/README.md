[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-map

`npm i @sullux/fp-light-map`
[source](https://github.com/Sullux/fp-light/blob/master/lib/map/map.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/map/map.spec.js)

Similar to the [built-in Javascript function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) `Array.prototype.map`, but accepts the iterable as the second argument.

* [map](#map)

### map

`map(mapper, iterable)`

Given a mapping function and an iterable, returns an iterable where each input item is mapped to an output item.

```javascript
const { map } = require('@sullux/fp-light-map')

const input = [1, 2, 3]
const output = map(x => x + 1, input)
console.log([...output])
// [2, 3, 4]
```

The behavior of `map` is different from `asyncMap` in a few ways. First, the `map` function will quietly await the resolution of the prior iteration before continuing while `asyncMap` will produce a standalone promise for each iteration. Second, while `map` will only produce a promise after receiving a promise as input, `asyncMap` will return a promise for all iterations.

```javascript
const { map } = require('@sullux/fp-light-map')
const { asyncMap } = require('@sullux/fp-light-async')

const a = 1
const b = 2
const c = 3

const mapExample = () => {
  const mapped = map(v => v + 1, [Promise.resolve(a), b, c])
  
  const longhand = Promise.resolve(a)
    .then(a => a + 1)
    .then(a => [a, b + 1])
    .then([a, b] => [a, b, c + 1])
}

const asyncMapExample = () => {
  const asyncMapped = asyncMap(v => v + 1, [a, b, c]])
  
  const longhand = [
    Promise.resolve(a + 1),
    Promise.resolve(b + 1),
    Promise.resolve(c + 1),
  ]
}

```
