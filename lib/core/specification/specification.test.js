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
          expect(isSpecification(S(Error))).toBe(true)
        })
      })
    })
  })
})
