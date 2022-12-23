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
              [[Number], [Number]],
              [Number],
            ]
            const fn = () => {}
            fn[functionSignature] = signature
            expect(S.Function().isImplemented(fn)).toBe(true)
          })
          it('should not match functions with the wrong signature', () => {
            const signature = [
              [[Number], [Number]],
              [Number],
            ]
            const fn = () => {}
            fn[functionSignature] = signature
            const options = [
              [[Number], [Number]],
              [String],
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
              [[Number], [Number]],
              [Number],
            ]
            const { isCompatible } = S.Function(signature)
            expect(isCompatible(Function, [...signature])).toBe(true)
          })
          it('should be incompatible with mismatched signatures', () => {
            const signature = [
              [[Number], [Number]],
              [Number],
            ]
            const incompatibleSignature = [
              [[Number], [Number]],
              [String],
            ]
            const { isCompatible } = S.Function(signature)
            expect(isCompatible(Function, incompatibleSignature)).toBe(false)
          })
        })
        describe('delta', () => {
          it('should return an empty array', () => {
            expect(S.Function().delta()).toEqual([])
          })
          it('should return an empty array for identical signatures', () => {
            const signature = [
              [[Number], [Number]],
              [Number],
            ]
            const { delta } = S.Function(signature)
            const fn = () => {}
            fn[functionSignature] = [...signature]
            expect(delta(fn)).toEqual([])
          })
          it('should return a mismatched signature', () => {
            const options = [
              [[Number], [Number]],
              [String],
            ]
            const { delta } = S.Function(options)
            const fn = () => {}
            const signature = [
              [[Number], [Number]],
              [Number],
            ]
            fn[functionSignature] = signature
            expect(delta(fn)).toEqual(options)
          })
        })
      })
    })
  })
})
