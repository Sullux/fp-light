[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-skip

`npm i @sullux/fp-light-skip`
[source](https://github.com/Sullux/fp-light/blob/master/lib/skip/skip.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/skip/skip.spec.js)

Creates an iterable that starts at the _start_ item and ends at the _end_ item (inclusive) of the given iterable.

* [skip](#skip)

### skip

`slice<T>(start: number, end: number, iterable: Iterable<T>): Iterable<T>`

If `start` is less than 1, begins at the first item; otherwise, begins at the one-based start item. If end is greater than the number of items in the iterable, returns through the last item; otherwise, returns through the end item (inclusive).

NOTE: since `slice` is a count-based operation, all offsets are 1-based.

```javascript
const { slice } = require('./slice')
const { deepStrictEqual } = require('assert')

describe('slice', () => {
  it('should return empty when end = begin', () => deepStrictEqual(
    [...slice(2, 2, [1, 2, 3])],
    []
  ))
  it('should return empty when end > begin', () => deepStrictEqual(
    [...slice(3, 2, [1, 2, 3])],
    []
  ))
  it('should return first element when start < 1', () => deepStrictEqual(
    [...slice(-1, 3, [1, 2, 3])],
    [1, 2]
  ))
  it('should return last element when end > length', () => deepStrictEqual(
    [...slice(2, 5, [1, 2, 3])],
    [2, 3]
  ))
  it('should return a slice', () => deepStrictEqual(
    [...slice(2, 4, [1, 2, 3, 4])],
    [2, 3]
  ))
})
```
