const { strictEqual } = require('assert')

const {
  when,
  conditional,
  select,
  fallback,
} = require('./conditional')

describe('conditional', () => {
  describe('when', () => {
    it('should resolve to the truthy result', () =>
      strictEqual(when(x => x === 42)(x => x + 1)(42), 43))
    it('should resolve to the argument on falsy', () =>
      strictEqual(when(x => x === 1)(x => x + 1)(42), 42))
  })

  describe('conditional', () => {
    it('should resolve to the truthy result', () =>
      strictEqual(conditional(x => x === 42, x => x + 1)(42), 43))
    it('should resolve to the argument on falsy', () =>
      strictEqual(conditional(x => x === 1, x => x + 1)(42), 42))
    it('should resolve to the falsy result', () =>
      strictEqual(conditional(x => x === 1, x => x + 1, x => x - 1)(43), 42))
  })

  describe('select', () => {
    it('should resolve to the argument', () =>
      strictEqual(
        select([
          [x => x === 41, x => `${x} is the answer`],
        ])(42),
        42
      ))
    it('should resolve to the first result', () =>
      strictEqual(
        select([
          [x => x === 42, x => `${x} is the answer`],
        ])(42),
        '42 is the answer'
      ))
    it('should resolve to the second result', () =>
      strictEqual(
        select([
          [x => x === 41, x => `${x} is the answer`],
          [x => x === 42, x => `${x} is the answer`],
        ])(42),
        '42 is the answer'
      ))
  })

  describe('fallback', () => {
    it('should always return true', () =>
      strictEqual(fallback(false), true))
  })
})
