const {
  Specification: S,
  And,
} = require('./specification')

describe('core', () => {
  describe('specification', () => {
    describe('Specification', () => {
      describe('Array', () => {
        describe('isImplemented', () => {
          it('should accept when all are implemented', () => {
            const { isImplemented } = S.And([
              [String, { minLength: 3 }],
              [String, { maxLength: 4 }],
            ])
            expect(isImplemented('foo')).toBe(true)
          })
          it('should reject when some are not implemented', () => {
            const { isImplemented } = S.And([
              [String, { minLength: 3 }],
              [String, { maxLength: 4 }],
            ])
            expect(isImplemented('foobar')).toBe(false)
          })
        })
        describe('isCompatible', () => {
          it.only('should affirm when all are compatible', () => {
            const { isCompatible } = S.And([
              [Object, ['foo', String]],
              [Object, ['bar', String]],
            ])
            const options = [Object, ['foo', String]]
            expect(isCompatible(options)).toBe(true)
          })
        })
        describe('delta', () => {
          it('', () => {
            // todo
          })
        })
      })
    })
  })
})
