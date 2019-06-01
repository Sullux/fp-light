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
