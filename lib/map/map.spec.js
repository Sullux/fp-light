const { map } = require('./map')
const { deepStrictEqual } = require('assert')

describe('map', () => {
  it('should transform all values', () => deepStrictEqual(
    [...map(x => x + 1, [1, 2, 3])],
    [2, 3, 4]
  ))
})
