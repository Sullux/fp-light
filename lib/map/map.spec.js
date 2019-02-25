const { map } = require('./map')
const { deepStrictEqual } = require('assert')

describe('map', () => {
  it('should map an iterable', () =>
    deepStrictEqual([...map(x => x + 1, [1, 2, 3])], [2, 3, 4]))
})
