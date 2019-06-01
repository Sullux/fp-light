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
