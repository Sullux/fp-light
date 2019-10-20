const { strictEqual, ok } = require('assert')

const {
  hash,
  hashFrom,
  hashAny,
  hashToString,
  hashToDouble,
  hashToInt,
} = require('./hash')

describe('hash', () => {
  describe('hash', () => {
    it('should hash', () => {
      const hashed = hash(8, Buffer.from('things'))
      strictEqual(hashed.length, 8)
      ok(hashed instanceof Buffer)
    })
  })
  describe('hashFrom', () => {
    it('should hash from an existing hash', () => {
      const seed = hash(8, Buffer.from('things'))
      const hashed = hashFrom(seed, Buffer.from('more things'))
      strictEqual(hashed.length, 8)
      ok(hashed instanceof Buffer)
    })
  })
  describe('hashAny', () => {
    it('should hash a buffer', () => {
      const hashed = hashAny(8, Buffer.from('things'))
      strictEqual(hashed.length, 8)
      ok(hashed instanceof Buffer)
    })
    it('should hash a string', () => {
      const hashed = hashAny(8, 'things')
      strictEqual(hashed.length, 8)
      ok(hashed instanceof Buffer)
    })
    it('should hash an object', () => {
      const hashed = hashAny(8, { foo: 'bar' })
      strictEqual(hashed.length, 8)
      ok(hashed instanceof Buffer)
    })
    it('should hash undefined', () => {
      const hashed = hashAny(8)
      strictEqual(hashed.length, 8)
      ok(hashed instanceof Buffer)
    })
  })
  describe('hashToString', () => {
    it('should hash an object to string', () => {
      const hashed = hashToString(8, { foo: 'bar' })
      strictEqual(hashed.length, 8)
      strictEqual(typeof hashed, 'string')
    })
    it('should hash to an odd-length string', () => {
      const hashed = hashToString(7, { foo: 'bar' })
      strictEqual(hashed.length, 7)
    })
  })
  describe('hashToDouble', () => {
    it('should hash an object to a double', () => {
      const hashed = hashToDouble({ foo: 'bar' })
      strictEqual(typeof hashed, 'number')
      ok(!Number.isInteger(hashed))
    })
  })
  describe('hashToInt', () => {
    it('should hash an object to an integer', () => {
      const hashed = hashToInt({ foo: 'bar' })
      ok(Number.isInteger(hashed))
    })
  })
})
