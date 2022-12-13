const {
  Specification: S,
} = require('./specification')

describe('core', () => {
  describe('specification', () => {
    describe('Specification', () => {
      describe('String', () => {
        describe('isImplemented', () => {
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
          it('should test a matches regex', () => {
            const options = {
              matches: /foo.*/,
            }
            const { isImplemented } = S.String(options)
            expect(isImplemented('foo')).toBe(true)
            expect(isImplemented('fooooo')).toBe(true)
            expect(isImplemented('foobar')).toBe(true)
            expect(isImplemented('xoo')).toBe(false)
            expect(isImplemented('fo')).toBe(false)
          })
          it('should test with a matches function', () => {
            const options = {
              matches: (v) => v.startsWith('foo'),
            }
            const { isImplemented } = S.String(options)
            expect(isImplemented('foo')).toBe(true)
            expect(isImplemented('fooooo')).toBe(true)
            expect(isImplemented('foobar')).toBe(true)
            expect(isImplemented('xoo')).toBe(false)
            expect(isImplemented('fobar')).toBe(false)
          })
        })
        describe('isCompatible', () => {
          it('should affirm compatibility within length restrictions', () => {
            const { isCompatible } = S.String({ minLength: 3, maxLength: 5 })
            expect(isCompatible(String)).toBe(true)
            expect(isCompatible(String, { minLength: 2 })).toBe(true)
            expect(isCompatible(String, { maxLength: 6 })).toBe(true)
          })
          it('should deny compatibility outside length restrictions', () => {
            const { isCompatible } = S.String({ minLength: 3, maxLength: 5 })
            expect(isCompatible(String, { minLength: 4 })).toBe(false)
            expect(isCompatible(String, { maxLength: 4 })).toBe(false)
          })
          it('should affirm compatibility with identical regex matches', () => {
            const { isCompatible } = S.String({ matches: /x/ })
            expect(isCompatible(String, { matches: /x/ })).toBe(true)
          })
          it('should deny compatibility with different regex matches', () => {
            const { isCompatible } = S.String({ matches: /x/ })
            expect(isCompatible(String, { matches: /y/ })).toBe(false)
          })
        })
        describe('delta', () => {
          it('should return an empty array', () => {
            expect(S.String().delta('foo')).toEqual([])
          })
          it('should return an array with a string specification', () => {
            expect(S.String().delta(42)).toEqual([String])
          })
        })
      })
    })
  })
})
