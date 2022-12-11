const {
  Specification: S,
  specificationType,
  isSpecification,
  objectSpread,
} = require('./specification')

describe('core', () => {
  describe('specification', () => {
    describe('Specification', () => {
      describe('String', () => {
        it('should accept an implemented string', () => {
          expect(S.String().isImplemented('foo')).toBe(true)
        })
        it('should reject a non-string', () => {
          expect(S.String().isImplemented(42)).toBe(false)
        })
        it('should accept a string with size parameters', () => {
          const options = {
            minLength: 2,
            maxLength: 4,
          }
          expect(S.String(options).isImplemented('foo')).toBe(true)
        })
        it('should reject a string with size parameters', () => {
          const options = {
            minLength: 2,
            maxLength: 4,
          }
          expect(S.String(options).isImplemented('f')).toBe(false)
          expect(S.String(options).isImplemented('fobar')).toBe(false)
        })
        it('should glob with a matches string', () => {
          const options = {
            matches: 'f?o*',
          }
          const { isImplemented } = S.String(options)
          expect(isImplemented('foo')).toBe(true)
          expect(isImplemented('fxo')).toBe(true)
          expect(isImplemented('foobar')).toBe(true)
          expect(isImplemented('xoo')).toBe(false)
          expect(isImplemented('fo')).toBe(false)
        })
      })
    })
  })
})
