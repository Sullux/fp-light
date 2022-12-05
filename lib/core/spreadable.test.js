const {
  Spread,
  isSpread,
  spreadFunction,
  callSpread,
  Spreadable,
} = require('./spreadable')

describe('spreadable', () => {
  it('should spread in an array', () => {
    const fn = () => 42
    const [e1, e2, e3] = ['foo', ...fn, 'bar']
    expect(e1).toBe('foo')
    expect(e2[spreadFunction]).toBe(fn)
    expect(e3).toBe('bar')
  })

  it('should spread in an object', () => {
    const fn = () => 42
    const obj = { foo: 'bar', ...fn.object }
    const keys = Object.keys(obj)
    expect(keys).toEqual([
      'foo',
      expect.stringContaining('@@functionToObject'),
    ])
    const [, spreadProp] = keys
    const spreadValue = obj[spreadProp]
    expect(spreadValue[spreadFunction]).toBe(fn)
  })

  describe('Spread', () => {
    it('should have the call properties', () => {
      const fn = () => 42
      const spread = Spread(fn)
      expect(spread.call).toBe(fn)
    })

    it('should have the [spreadFunction] property', () => {
      const fn = () => 42
      const spread = Spread(fn)
      expect(spread[spreadFunction]).toBe(fn)
    })

    it('should implement a custom toString', () => {
      const fn = () => 42
      const spread = Spread(fn)
      expect(spread.toString()).toBe('Spread([Function fn])')
    })
  })

  describe('isSpread', () => {
    it('should return true for a Spread object', () => {
      const fn = () => 42
      const spread = Spread(fn)
      expect(isSpread(spread)).toBe(true)
    })

    it('should return true for a Spread-like object', () => {
      const fn = () => 42
      const spread = { [spreadFunction]: fn }
      expect(isSpread(spread)).toBe(true)
    })

    it('should return false for a non Spread object', () => {
      const fn = () => 42
      const spread = { call: fn }
      expect(isSpread(spread)).toBe(false)
    })
  })

  describe('callSpread', () => {
    it('should call the spread function on a Spread object', () => {
      const fn = (a, b) => a + b
      const spread = Spread(fn)
      expect(callSpread(spread, 40, 2)).toBe(42)
    })

    it('should call the spread function on a Spread-like object', () => {
      const fn = (a, b) => a + b
      const spread = { [spreadFunction]: fn }
      expect(callSpread(spread, 40, 2)).toBe(42)
    })
  })

  describe('Spreadable', () => {
    it('should make the function directly spreadable into an object', () => {
      const fn = Spreadable(() => 42)
      const obj = { foo: 'bar', ...fn.object }
      const [, spreadKey] = Object.keys(obj)
      const spread = obj[spreadKey]
      expect(spread[spreadFunction]).toBe(fn)
    })
  })
})