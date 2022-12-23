const {
  Undefined,
  Null,
  Interface,
  I,
  any,
} = require('./interface')

describe('core', () => {
  describe('interface', () => {
    it('should work', () => {
      expect(I).toBe(Interface)
    })

    it.only('should spread into an array', () => {
      expect([...I(String)][0]('foo')).toBe(true)
    })

    it.only('should spread into an object', () => {
      expect(I({ foo: 42, ...I(String) })({ foo: 42, bar: 'baz' })).toBe(true)
    })
  })
})
