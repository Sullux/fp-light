const {
  awaitAll,
  awaitAny,
  awaitChain,
  awaitDelay,
  resolves,
  rejects,
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

describe('awaitChain', () => {
  it('should chain all functions', () =>
    awaitChain([() => awaitDelay(5), () => Promise.resolve(42)])
      .then(result => strictEqual(result, 42)))
  it('should chain non-function values', () =>
    awaitChain([() => awaitDelay(5), 42])
      .then(result => strictEqual(result, 42)))
  it('should reject when any promise rejects', () => {
    const error = new Error('reasons')
    return awaitChain([Promise.resolve('foo'), Promise.reject(error)])
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

describe('resolves', () => {
  it('should create a function that returns a resolved promise', () =>
    resolves(42)()
      .then(result => strictEqual(result, 42)))
})

describe('rejects', () => {
  it('should create a function that returns a rejected promise', () => {
    const error = new Error('reasons')
    return rejects(error)()
      .then(value => ([undefined, value]), error => [error])
      .then(result => deepStrictEqual(result, [error]))
  })
})
