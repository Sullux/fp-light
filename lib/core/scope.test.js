const { Scope, ScopeContext, parentScope } = require('./scope')

describe('core', () => {
  describe('scope', () => {
    it('should return the top-level scope', () => {
      expect(Scope.current).toBe(Scope.current.leave())
    })
    it('should get properties from globalThis', () => {
      expect(Scope.current.context.String).toBe(String)
    })
    it('should set properties on the global scope', () => {
      Scope.current.context.foo = 42
      expect(Scope.current.context.foo).toBe(42)
    })
    it('should disallow overwriting properties', () => {
      const { context } = Scope.current.enter()
      context.foo = 42
      expect(() => { context.foo = 42 })
        .toThrow('property "foo" is already defined')
      expect(() => Reflect.defineProperty(context, 'foo', { value: 41 }))
        .toThrow('property "foo" is already defined')
    })
    it('should get inherited properties', () => {
      const { context } = Scope.current.enter()
      context.foo = 42
      const childContext = Scope.current.enter().context
      expect(childContext.foo).toBe(42)
      expect(Object.keys(context).includes('foo')).toBe(true)
      expect(Object.keys(childContext).includes('foo')).toBe(false)
    })
    it('should maintain the current scope', () => {
      const parent = Scope.current.enter()
      const child = Scope.current.enter()
      expect(child).not.toBe(parent)
      expect(Scope.current).toBe(child)
      expect(Scope.current.leave()).toBe(parent)
      expect(Scope.current).toBe(parent)
    })
    it('should give access to the parent scope', () => {
      const { context } = Scope.current.enter()
      context.foo = 42
      const { context: childContext } = Scope.current.enter()
      childContext.foo = 'bar'
      expect(childContext.foo).toBe('bar')
      expect(childContext[parentScope].foo).toBe(42)
    })
    it('should support child scope contexts', () => {
      const { context } = Scope.current.enter()
      context.foo = ScopeContext()
      context.foo.bar = 42
      expect(context.foo.bar).toBe(42)
      const { context: childContext } = Scope.current.enter()
      expect(childContext.foo.bar).toBe(42)
      childContext.foo.bar = 84
      expect(childContext.foo.bar).toBe(84)
      expect(context.foo.bar).toBe(42)
      expect(() => { childContext.foo.bar = 42 })
        .toThrow('property "bar" is already defined')
    })
    it('should list keys and values', () => {
      const c = ScopeContext()
      c.foo = 'bar'
      expect(Object.keys(c)).toEqual(['foo'])
      expect(Object.values(c)).toEqual(['bar'])
    })
    it('should support arrays', () => {
      const c = ScopeContext(['foo'])
      expect(() => { c[0] = 'foo' })
        .toThrow('setting array properties is not supported')
      c.push('bar')
      expect([...c]).toEqual(['bar', 'foo'])
    })
    it('should support maps', () => {
      // todo
    })
  })
})
