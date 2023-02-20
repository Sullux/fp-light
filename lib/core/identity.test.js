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
    it('should apply array offsets', () => {
      expect(Identity()[1](['foo', 'bar'])).toBe('bar')
    })
    it('should apply property names', () => {
      expect(Identity().x({ x: 'foo' })).toBe('foo')
    })
    it('should apply chains of property names and array offsets', () => {
      expect(Identity().x[1]({ x: ['foo', 'bar'] })).toBe('bar')
    })
    it('should dereference into an array', () => {
      const [r1, r2] = Identity.spread(Identity(), 2)
      const a = [42, 43]
      expect(r1(a)).toBe(42)
      expect(r2(a)).toBe(43)
    })
    it('should dereference into an object', () => {
      const { foo, bar } = Identity.spread(Identity(), 'foo', 'bar')
      const a = { foo: 42, bar: 'baz' }
      expect(foo(a)).toBe(42)
      expect(bar(a)).toBe('baz')
    })
  })
})
