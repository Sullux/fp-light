[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-skip

`npm i @sullux/fp-light-skip`
[source](https://github.com/Sullux/fp-light/blob/master/lib/skip/skip.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/skip/skip.spec.js)

Creates an iterable that skips the first _n_ items of the given iterable.

* [skip](#skip)

### skip

`skip<T>(count: number, iterable: Iterable<T>): Iterable<T>`

If `count` is less than 1, yields all items; otherwise, skips `count` items. If count is greater than the number of items in the iterable, returns an empty iterable.

```javascript
const { skip } = require('./skip')
const { deepStrictEqual } = require('assert')

describe('skip', () => {
  it('should skip zero', () => deepStrictEqual(
    [...skip(0, [1, 2, 3])],
    [1, 2, 3]
  ))
  it('should skip zero with negative skip', () => deepStrictEqual(
    [...skip(-1, [1, 2, 3])],
    [1, 2, 3]
  ))
  it('should skip n values', () => deepStrictEqual(
    [...skip(1, [1, 2, 3])],
    [2, 3]
  ))
  it('should return empty skipping length', () => deepStrictEqual(
    [...skip(3, [1, 2, 3])],
    []
  ))
  it('should return empty skipping greater than length', () => deepStrictEqual(
    [...skip(4, [1, 2, 3])],
    []
  ))
})
```
