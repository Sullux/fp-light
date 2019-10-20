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
