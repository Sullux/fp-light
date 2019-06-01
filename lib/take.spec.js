const { take } = require('./take')
const { deepStrictEqual } = require('assert')

describe('take', () => {
  it('should take all values when given length', () => deepStrictEqual(
    [...take(3, [1, 2, 3])],
    [1, 2, 3]
  ))
  it('should take all values when given greater than length',
    () => deepStrictEqual(
      [...take(4, [1, 2, 3])],
      [1, 2, 3]
    ))
  it('should take some values when given less than length',
    () => deepStrictEqual(
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
