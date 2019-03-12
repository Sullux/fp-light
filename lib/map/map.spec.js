/* eslint-disable no-restricted-syntax */
/* eslint-disable no-return-assign */
const { map } = require('./map')
const { strictEqual, deepStrictEqual } = require('assert')

const awaitDelay = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

describe('map', () => {
  it('should transform all values', () => deepStrictEqual(
    [...map(x => x + 1, [1, 2, 3])],
    [2, 3, 4]
  ))
  it('should transform to chained promises', () => {
    let state
    const result = map(
      (delay, i) => awaitDelay(delay).then(() => state = i),
      [10, 5, 1]
    )
    return Promise.all(result)
      .then((values) => {
        deepStrictEqual(values, [0, 1, 2])
        strictEqual(state, 2) // proves promise chaining
      })
  })
})
