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
