[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-skip

`npm i @sullux/fp-light-skip`
[source](https://github.com/Sullux/fp-light/blob/master/lib/skip/skip.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/skip/skip.spec.js)

Creates an iterable that takes the first _n_ items of the given iterable.

* [skip](#skip)

### skip

`take<T>(count: number, iterable: Iterable<T>): Iterable<T>`

If `count` is less than 1, yields no items; otherwise, yields `count` items. If count is greater than the number of items in the iterable, yields all items.

```javascript
const { take } = require('./take')
const { deepStrictEqual } = require('assert')

describe('take', () => {
  it('should take all values when given length', () => deepStrictEqual(
    [...take(3, [1, 2, 3])],
    [1, 2, 3]
  ))
  it('should take all values when given greater than length', () => deepStrictEqual(
    [...take(4, [1, 2, 3])],
    [1, 2, 3]
  ))
  it('should take some values when given less than length', () => deepStrictEqual(
    [...take(2, [1, 2, 3])],
    [1, 2]
  ))
  it('should return empty when given zero', () => deepStrictEqual(
    [...take(0, [1, 2, 3])],
    []
  ))
  it('should return empty when given less than zero', () => deepStrictEqual(
    [...take(-1, [1, 2, 3])],
    []
  ))
})
```
