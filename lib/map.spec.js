/* eslint-disable no-restricted-syntax */
/* eslint-disable no-return-assign */
const { map, mapTo, parallelMap } = require('./map')
const { deepStrictEqual } = require('assert')

const awaitDelay = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

describe('map', () => {
  it('should transform all values', () => deepStrictEqual(
    [...map(x => x + 1, [1, 2, 3])],
    [2, 3, 4]
  ))
  it('should transform to chained promises', () => {
    let state = 0
    const result = map(
      (delay) => awaitDelay(delay).then(() => state += 1),
      [10, 5, 1]
    )
    return Promise.all(result)
      .then((values) => deepStrictEqual(values, [1, 2, 3]))
  })
})

describe('mapTo', () => {
  it('should transform using all mappers', () => deepStrictEqual(
    [...mapTo(
      [
        x => x - 1,
        x => x,
        x => x + 1,
      ],
      3
    )],
    [2, 3, 4]
  ))
})

describe('parallelMap', () => {
  it('should transform and promise-wrap all values', () =>
    Promise.all(parallelMap(x => x + 1, [1, Promise.resolve(2), 3]))
      .then(result => deepStrictEqual(result, [2, 3, 4])))
  it('should transform to unchained promises', () => {
    let state = 0
    const result = parallelMap(
      (delay) => awaitDelay(delay).then(() => state += 1),
      [10, 5, 1]
    )
    return Promise.all(result)
      .then((values) => deepStrictEqual(values, [3, 2, 1]))
  })
})
