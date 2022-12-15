const {
  Specification: S,
  specificationType,
  isSpecification,
} = require('./specification')

describe('core', () => {
  describe('specification', () => {
    describe('Specification', () => {
      describe('isSpecification', () => {
        it('should identify a specification', () => {
          expect(isSpecification(S(() => {}))).toBe(true)
        })

        it('should add a specification type', () => {
          const type = () => {}
          const spec = S(type)
          expect(spec[specificationType]).toBe(type)
        })
      })
    })
  })
})
