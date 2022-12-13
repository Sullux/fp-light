const {
  Specification: S,
} = require('./specification')

describe('core', () => {
  describe('specification', () => {
    describe('Specification', () => {
      describe('Array', () => {
        describe('isImplemented', () => {
          it('should accept an array', () => {
            const options = []
            const { isImplemented } = S.Array(options)
            expect(isImplemented([])).toBe(true)
          })
          it('should accept an array with elements', () => {
            const options = [
              [String],
              [String],
            ]
            const { isImplemented } = S.Array(options)
            expect(isImplemented(['x', 'y'])).toBe(true)
            expect(isImplemented([42, 'y'])).toBe(false)
          })
          it('should accept an array with additional elements', () => {
            const options = [
              [String],
              [String],
            ]
            const { isImplemented } = S.Array(options)
            expect(isImplemented(['x', 'y', 'z'])).toBe(true)
          })
          it('should accept a nested array', () => {
            const options = [
              [String],
              [Array, [
                String,
                String,
              ]],
            ]
            const { isImplemented } = S.Array(options)
            expect(isImplemented(['x', ['y', 'z']])).toBe(true)
            expect(isImplemented(['x', 'y', ['z']])).toBe(false)
          })
          it('should accept a spread parameter', () => {
            const options = [
              [...String],
              [Array, [
                String,
                String,
              ]],
            ]
            const { isImplemented } = S.Array(options)
            expect(isImplemented(['x1', 'x2', ['y', 'z']])).toBe(true)
            expect(isImplemented([['y', 'z']])).toBe(true)
            expect(isImplemented([42, ['y', 'z']])).toBe(false)
          })
        })
        describe('isCompatible', () => {
          it('should affirm compatibility', () => {
            const options = [[String]]
            const { isCompatible } = S.Array(options)
            expect(isCompatible(Array, options)).toBe(true)
          })
          it('should affirm compatibility with additional elements', () => {
            const options = [[String]]
            const { isCompatible } = S.Array(options)
            expect(isCompatible(Array)).toBe(true)
          })
          it('should affirm compatibility with right spread', () => {
            const options = [[String], [String]]
            const { isCompatible } = S.Array(options)
            expect(isCompatible(Array, [[...String]])).toBe(true)
          })
          it('should affirm compatibility with left spread', () => {
            const options = [[...String], [Number]]
            const { isCompatible } = S.Array(options)
            expect(isCompatible(Array, [[String], [Number]])).toBe(true)
          })
          it('should affirm compatibility with compatible spreads', () => {
            const options = [[Number], [...String], [Number]]
            const { isCompatible } = S.Array(options)
            const compareOptions = [[Number], [...String], [...Number]]
            expect(isCompatible(Array, compareOptions)).toBe(true)
          })
          it('should deny compatibility with right spread', () => {
            const options = [[Number], [String]]
            const { isCompatible } = S.Array(options)
            expect(isCompatible(Array, [[...String], [Number]])).toBe(false)
          })
          it('should deny compatibility with left spread', () => {
            const options = [[...String], [Number]]
            const { isCompatible } = S.Array(options)
            expect(isCompatible(Array, [[Number], [Number]])).toBe(false)
          })
        })
        describe('delta', () => {
          it('should return an empty array', () => {
            const options = [[String]]
            const { delta } = S.Array(options)
            expect(delta(['foo'])).toEqual([])
          })
          it('should return the remaining array', () => {
            const options = [
              [String],
              [Number],
            ]
            const { delta } = S.Array(options)
            expect(delta(['foo'])).toEqual([Array, [[Number, undefined]]])
          })
          it('should return the remaining array after a spread', () => {
            const options = [
              [...String],
              [Number],
            ]
            const { delta } = S.Array(options)
            expect(delta(['foo'])).toEqual([Array, [[Number, undefined]]])
          })
          it('should return the remaining nested array', () => {
            const options = [
              [String],
              [Array, [
                [String],
                [Number],
              ]],
            ]
            const { delta } = S.Array(options)
            const expected = [Array, [[Array, [[Number, undefined]]]]]
            expect(delta(['foo', ['bar']])).toEqual(expected)
          })
        })
      })
    })
  })
})
