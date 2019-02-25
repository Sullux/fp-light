[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-range

`npm i @sullux/fp-light-range`
[source](https://github.com/Sullux/fp-light/blob/master/lib/range/range.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/range/range.spec.js)

Creates an iterable of integers spanning the given range. This can be a good way to functionally implement _next n items_ logic or _repeat n times_ logic.

* [range](#range)

### range

`range(start: Number, end: Number): Iterable<Number>`

Given a start less than end, iterates forward; otherwise, iterates backwards. All ranges are inclusive. The following tests illustrate the functionality.

```javascript
const { range } = require('./range')
const { deepStrictEqual } = require('assert')

describe('range', () => {
  it('should produce a low to high range', () => deepStrictEqual(
    [...range(1, 3)],
    [1, 2, 3]
  ))
  it('should produce a high to low range', () => deepStrictEqual(
    [...range(3, 1)],
    [3, 2, 1]
  ))
  it('should produce a single digit range', () => deepStrictEqual(
    [...range(1, 1)],
    [1]
  ))
})
```
...
