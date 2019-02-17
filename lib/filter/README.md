[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-filter

`npm i @sullux/fp-light-filter`
[source](https://github.com/Sullux/fp-light/blob/master/lib/filter/filter.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/filter/filter.spec.js)

The filter function works similarly to the built in `Array.prototype.filter` function except that the iterable is the most significant (last) argument.

* [filter](#filter)

### filter

`filter(test: Function, iterator: Iterator<mixed>): Iterator<mixed>`

The advantage to using iterable functions like `filter` over the built-in array functions is that the array functions create an intermediate representation where the iterable functions evaluate lazily. This leads to a lower memory footprint and faster processing in many scenarios.

This example uses the filter and map iterable functions.

```javascript
const { filter } = require('@sullux/fp-light-filter')
const { get } = require('@sullux/fp-light-get')
const { pipe } = require('@sullux/fp-light-pipe')
const { trap } = require('@sullux/fp-light-trap')
const { readFile, readdir } = require('fs')
const { promisify } = require('util')

const readAllObjects = pipe(
  promisify(readdir),
  map(get('toString')),
  map(trap(promisify(readFile))),
  filter(get(1)),
  map(get(1, 'toString')),
  map(JSON.parse),
  Promise.all,
)

module.exports = { readAllObjects }
```
