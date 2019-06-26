const { strictEqual } = require('assert')

const {
  not,
  and,
  or,
  xor,
} = require('./logical')

describe('logical', () => {
  describe('not', () => {
    it('should return false for truthy', () =>
      strictEqual(not(() => 'hello')(42), false))
    it('should return true for falsy', () =>
      strictEqual(not(() => 0)(42), true))
  })

  describe('and', () => {
    it('should return false on falsy/falsy', () =>
      strictEqual(and([() => 0, () => ''])(42), false))
    it('should return false on truthy/falsy', () =>
      strictEqual(and([x => x, () => ''])(42), false))
    it('should return false on falsy/truthy', () =>
      strictEqual(and([() => 0, x => x])(42), false))
    it('should return true on truthy/truthy', () =>
      strictEqual(and([x => x, () => 't'])(42), true))
  })

  describe('or', () => {
    it('should return false on falsy/falsy', () =>
      strictEqual(or([() => 0, () => ''])(42), false))
    it('should return true on truthy/falsy', () =>
      strictEqual(or([x => x, () => ''])(42), true))
    it('should return true on falsy/truthy', () =>
      strictEqual(or([() => 0, x => x])(42), true))
    it('should return true on truthy/truthy', () =>
      strictEqual(or([x => x, () => 't'])(42), true))
  })

  describe('xor', () => {
    it('should return false on falsy/falsy', () =>
      strictEqual(xor([() => 0, () => ''])(42), false))
    it('should return true on truthy/falsy', () =>
      strictEqual(xor([x => x, () => ''])(42), true))
    it('should return true on falsy/truthy', () =>
      strictEqual(xor([() => 0, x => x])(42), true))
    it('should return false on truthy/truthy', () =>
      strictEqual(xor([x => x, () => 't'])(42), false))
  })

})
