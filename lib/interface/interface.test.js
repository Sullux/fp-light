const {
  InvalidInterfaceSpecificationError,
  Interface,
  I,
} = require('./interface')
const { Scope } = require('../core/scope')

describe('core', () => {
  describe('interface', () => {
    it('should alias I', () => {
      expect(I).toBe(Interface)
    })

    it('should define an interface in scope', () => {
      Scope.current.enter()
      const i = I({ name: 'Foo' })
      expect(Scope.current.context.Foo).toBe(i)
      expect(i instanceof I).toBe(true)
      Scope.current.leave()
      expect(Scope.current.context.Foo).toBe(undefined)
      expect(i instanceof I).toBe(false)
    })

    describe('specifications', () => {
      beforeEach(() => Scope.current.enter())
      afterEach(() => Scope.current.leave())

      it('should infer from a specification', () => {
        I({ name: 'Number' })
        const INumber = Scope.current.context.Number
        I.defineSpecification({
          name: 'Number',
          infer: (v) => (typeof v === 'number') && INumber,
          construct: (t, context = {}) =>
            (t === Number) && I({ context, extending: INumber }),
        })
        expect(I.infer(42)).toBe(INumber)
      })

      it('should construct from a specification', () => {
        I({ name: 'Number' })
        const INumber = Scope.current.context.Number
        I.defineSpecification({
          name: 'Number',
          infer: (v) => (typeof v === 'number') && INumber,
          construct: (t, context = {}) =>
            (t === Number) && I({ context, extending: INumber }),
        })
        const positiveContext = { minValue: 0 }
        const PositiveNumber = I.from(Number, positiveContext)
        expect(PositiveNumber.extending).toBe(INumber)
        expect(PositiveNumber.extends(INumber)).toBe(true)
      })
    })
  })
})
