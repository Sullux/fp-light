import * as fp from './'

Object.assign(global, fp)

describe('async', () => {
  describe('awaitArray', () => {
    test('should return sync output on sync input including an object', () => {
      const input = [42, { foo: 42 }]
      const output = [42, { foo: 42 }]
      expect(awaitArray(input)).toEqual(output)
    })
  })

  describe('awaitObject', () => {
    test('should return sync output on sync input', () => {
      const input = { foo: 42, bar: 42 }
      const output = { foo: 42, bar: 42 }
      expect(awaitObject(input)).toEqual(output)
    })
  })

  describe('deepAwait', () => {
    test('should await async input', async () => {
      const input = Promise.resolve({ foo: 42, bar: [Promise.resolve(42)] })
      const output = { foo: 42, bar: [42] }
      expect(await deepAwait(input)).toEqual(output)
    })
  })
})
