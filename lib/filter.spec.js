const { filter } = require('./filter')
const { deepStrictEqual } = require('assert')

describe('filter', () => {
  it('should filter values', () => deepStrictEqual(
    [...filter(x => x % 2 === 0, [1, 2, 3, 4])],
    [2, 4]
  ))
})
