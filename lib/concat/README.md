[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-concat

`npm i @sullux/fp-light-concat`
[source](https://github.com/Sullux/fp-light/blob/master/lib/concat/concat.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/concat/concat.spec.js)

Concatenates values into a single iterable.

* [concat](#concat)

### concat

`concat(...iterables: Array<mixed>): { @@iterator(): Iterator<mixed> }`

This function does a shallow concatenation of iterables, objects and values and returns the concatenated iterable. The unit test for the concat function demonstrates how it handles various types of inputs:

```javascript
const { deepStrictEqual } = require('assert')

const { concat } = require('./concat')

const date = new Date()

describe('concat', () => {
  it('should concatenate iterables', () => deepStrictEqual(
    [...concat(
      [1, 2],
      null,
      undefined,
      { foo: 42 },
      function* () { yield 'bar' },
      date,
      concat(true, false, [3, 4]),
    )],
    [1, 2, null, undefined, ['foo', 42], 'bar', date, true, false, 3, 4]
  ))
})
```
