import * as fp from './index.js'

Object.assign(global, fp)

describe('async', () => {
  describe('awaitArray', () => {
    test('should return sync output on sync input including an object', () => {
      const input = [42, { foo: 42 }]
      const output = [42, { foo: 42 }]
      expect(awaitArray(input)).toEqual(output)
    })

    test('should return the input when all elements are sync', () => {
      const input = [42, { foo: 42 }]
      expect(awaitArray(input)).toBe(input)
    })

    test('should return async output on async input', async () => {
      const input = [Promise.resolve(42), { foo: 42 }]
      const output = [42, { foo: 42 }]
      expect(await awaitArray(input)).toEqual(output)
    })

    test('should return async output on nested async input', async () => {
      const input = [42, { foo: Promise.resolve(42) }]
      const output = [42, { foo: 42 }]
      expect(await awaitArray(input)).toEqual(output)
    })
  })

  describe('awaitObject', () => {
    test('should return sync output on sync input', () => {
      const input = { foo: 42, bar: 42 }
      const output = { foo: 42, bar: 42 }
      expect(awaitObject(input)).toEqual(output)
    })

    test('should return async output on async input', async () => {
      const input = { foo: 42, bar: Promise.resolve(42) }
      const output = { foo: 42, bar: 42 }
      expect(await awaitObject(input)).toEqual(output)
    })

    test('should return original object if nothing to await', () => {
      const input = { foo: 42, bar: 42 }
      expect(awaitObject(input)).toBe(input)
    })
  })

  describe('deepAwait', () => {
    test('should await async input', async () => {
      const input = Promise.resolve({ foo: 42, bar: [Promise.resolve(42)] })
      const output = { foo: 42, bar: [42] }
      expect(await deepAwait(input)).toEqual(output)
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
      const promise = awaitDelay(100)
      const result = await promise.then(() => 42)
      expect(Date.now() - start).toBeGreaterThan(90)
      expect(result).toBe(42)
    })
  })
})
