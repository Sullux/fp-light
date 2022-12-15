const {
  Specification: S,
  functionSignature,
} = require('./specification')

describe('core', () => {
  describe('specification', () => {
    describe('Specification', () => {
      describe('Function', () => {
        describe('isImplemented', () => {
          it('should match functions with no signature', () => {
            expect(S.Function().isImplemented()).toBe(true)
          })
          it('should match functions with a signature', () => {
            const signature = [
              Array,
              [
                [Array, [[Number], [Number]]],
                [Number],
              ],
            ]
            const fn = () => {}
            fn[functionSignature] = signature
            expect(S.Function().isImplemented(fn)).toBe(true)
          })
          it('should not match functions with the wrong signature', () => {
            const signature = [
              Array,
              [
                [Array, [[Number], [Number]]],
                [Number],
              ],
            ]
            const fn = () => {}
            fn[functionSignature] = signature
            const options = [
              Array,
              [
                [Array, [[Number], [Number]]],
                [String],
              ],
            ]
            expect(S.Function(options).isImplemented(fn)).toBe(false)
          })
        })
        describe('isCompatible', () => {
          it('should be compatible with no signatures', () => {
            expect(S.Function().isCompatible()).toBe(true)
          })
          it('should be compatible with identical signatures', () => {
            const signature = [
              Array,
              [
                [Array, [[Number], [Number]]],
                [Number],
              ],
            ]
            const { isCompatible } = S.Function(signature)
            expect(isCompatible(Function, [...signature])).toBe(true)
          })
        })
        describe('delta', () => {
          it('todo', () => {})
        })
      })
    })
  })
})
