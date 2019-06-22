/* eslint-disable no-restricted-syntax */
/* eslint-disable no-return-assign */
const {
  awaitAll,
  awaitAny,
  awaitDelay,
} = require('./async')

const { deepStrictEqual, strictEqual, ok } = require('assert')

describe('awaitAll', () => {
  it('should resolve when all promises have resolved', () =>
    awaitAll([Promise.resolve('foo'), Promise.resolve(42)])
      .then(result => deepStrictEqual(result, ['foo', 42])))
  it('should reject when any promise rejects', () => {
    const error = new Error('reasons')
    return awaitAll([Promise.resolve('foo'), Promise.reject(error)])
      .then(value => ([undefined, value]), error => [error])
      .then(result => deepStrictEqual(result, [error]))
  })
  it('should resolve non-promises', () =>
    awaitAll([Promise.resolve('foo'), 42])
      .then(result => deepStrictEqual(result, ['foo', 42])))
})

describe('awaitAny', () => {
  it('should resolve when the first promise resolves', () =>
    awaitAny([awaitDelay(5).then(() => 'foo'), Promise.resolve(42)])
      .then(result => strictEqual(result, 42)))
  it('should reject when the first promise rejects', () => {
    const error = new Error('reasons')
    return awaitAny([awaitDelay(5), Promise.reject(error)])
      .then(value => ([undefined, value]), error => [error])
      .then(result => deepStrictEqual(result, [error]))
  })
})

describe('awaitDelay', () => {
  it('should delay the given milliseconds', () => {
    const start = Date.now()
    return awaitDelay(5)
      .then(() => ok((Date.now() - start) > 4))
  })
})
