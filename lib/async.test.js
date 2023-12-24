import * as fp from './index.js'

Object.assign(global, fp)

describe({
  name: 'awaitArray',
  usage: 'Deep awaits every element in an array and returns a promise to a fully-resolved array. If no elements are async, return the original array.',
}, () => {
  describe({
    args: [{
      name: 'value',
      type: 'Array[...DeepSync]',
      description: 'an array of non-async elements and with no nested promises',
    }],
    returns: { type: 'Array', description: 'the original array' },
  }, () => {
    test('should return the input when all elements are sync', () => {
      const input = [42, { foo: 'bar' }]
      expect(awaitArray(input)).toBe(input)
    })
  })
  describe({
    args: [{
      name: 'value',
      type: 'Array[...DeepAsync]',
      description: 'An array that may contain promises or elements with nested promises.',
    }],
    returns: { type: '*Array', description: 'a promise to an array matching the original array but with all elements deep awaited' },
  }, () => {
    test('should return async output on async input', async () => {
      const input = [Promise.resolve(42), { foo: 42 }]
      const output = await awaitArray(input)
      const expected = [42, { foo: 42 }]
      expect(output).toEqual(expected)
    })

    test('should return async output on nested async input', async () => {
      const input = [42, { foo: Promise.resolve(42) }]
      const output = await awaitArray(input)
      const expected = [42, { foo: 42 }]
      expect(output).toEqual(expected)
    })
  })
})

describe({
  name: 'awaitObject',
  usage: 'Deep awaits every iterable value of an object and returns a full-resolved object. If no values are async, return the original object.',
}, () => {
  describe({
    args: [{
      name: 'value',
      type: 'Object[String, ...DeepSync]',
      description: 'an object of non-async values with no nested promises'
    }],
    returns: { type: 'Object', description: 'the original object' },
  }, () => {
    test('should return original object if nothing to await', () => {
      const input = { foo: 42, bar: [40, 2] }
      expect(awaitObject(input)).toBe(input)
    })
  })
  describe({
    args: [{
      name: 'value',
      type: 'Object[String, ...DeepAsync]',
      description: 'an object that may contain promises or values with nested promises'
    }],
    returns: { type: 'Object', description: 'a promise to an object matching the original object but with all values deep awaited' },
  }, () => {
    test('should return async output on async values', async () => {
      const input = { foo: 42, bar: Promise.resolve(42) }
      const output = await awaitObject(input)
      const expected = { foo: 42, bar: 42 }
      expect(output).toEqual(expected)
    })

    test('should return async output on nested async input', async () => {
      const input = { foo: 42, bar: [40, Promise.resolve(2)] }
      const output = await awaitObject(input)
      const expected = { foo: 42, bar: [40, 2] }
      expect(output).toEqual(expected)
    })
  })
})

describe('deepAwait', () => {
  test('should await async input', async () => {
    const input = Promise.resolve({ foo: 42, bar: [Promise.resolve(42)] })
    const output = { foo: 42, bar: [42] }
    expect(await deepAwait(input)).toEqual(output)
  })
})

describe('asPromise', () => {
  test('should return the original promise', () => {
    const input = Promise.resolve(42)
    expect(asPromise(input)).toBe(input)
  })
  test('should wrap and resolve a non-standard promise', async () => {
    const input = {
      then: (resolve, reject) => Promise.resolve(42).then(resolve, reject)
    }
    const promise = asPromise(input)
    expect(promise.constructor).toBe(Promise)
    expect(await promise).toBe(42)
  })
  test('should wrap and rejrect a non-standard promise', async () => {
    const error = new Error('reasons')
    const input = {
      then: (resolve, reject) => Promise.reject(error).then(resolve, reject)
    }
    const promise = asPromise(input)
    expect(promise.constructor).toBe(Promise)
    expect(await promise.catch(err => err)).toBe(error)
  })
})

describe('sync', () => {
  test('should sync an object', () => {
    const input = { foo: 42, bar: 'baz' }
    const syncInput = sync(input)
    expect(isSync(syncInput)).toBe(true)
  })

  test('should sync a frozen object', () => {
    const input = Object.freeze({ foo: 42, bar: 'baz' })
    const syncInput = sync(input)
    expect(isSync(syncInput)).toBe(true)
  })
})

describe('awaitDelay', () => {
  test('should return a promise', async () => {
    const start = Date.now()
    const promise = awaitDelay(10)
    const result = await promise.then(() => 42)
    expect(Date.now() - start).toBeGreaterThan(5)
    expect(result).toBe(42)
  })
})
