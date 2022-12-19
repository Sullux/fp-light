const {
  Identity,
  innerFunction,
  identityPath,
} = require('./identity')
const { isSpread, spreadFunction, Spreadable } = require('./spreadable')

describe('core', () => {
  describe('identity', () => {
    it('should add an identity path', () => {
      const x = Identity().foo.bar
      expect(x[identityPath]).toEqual(['foo', 'bar'])
    })
    it('should give access to the inner function', () => {
      const inner = () => {}
      const x = Identity(inner).foo.bar
      expect(x[innerFunction]).toBe(inner)
    })
    it('should allow numbers and symbols', () => {
      const s = Symbol('test')
      const x = Identity().foo[42][s]
      expect(x[identityPath]).toEqual(['foo', 42, s])
    })
    it('should allow functions', () => {
      const fn = Identity(() => {})
      const x = Identity()
      const path = fn.foo[x][identityPath]
      expect(path).toEqual(['foo', x])
    })
    it('should be spreadable', () => {
      const fn = Identity()
      expect(fn instanceof Spreadable).toBe(true)
    })
    it('should spread in an array', () => {
      const fn = Identity(() => {})
      const a = [...fn]
      expect(isSpread(a[0])).toBe(true)
      expect(a[0][spreadFunction]).toBe(fn)
    })
    it('should spread in an object', () => {
      const inner = () => {}
      const fn = Identity(inner)
      const a = { ...fn }
      const [[key, value]] = Object.entries(a)
      expect(key).toBe(inner.spreadPropertyName)
      expect(isSpread(value)).toBe(true)
      expect(value[spreadFunction]).toBe(fn)
    })
  })
})
