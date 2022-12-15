const {
  Specification: S,
} = require('./specification')

describe('core', () => {
  describe('specification', () => {
    describe('Specification', () => {
      describe('Object', () => {
        describe('isImplemented', () => {
          it('should accept an object', () => {
            const options = []
            const { isImplemented } = S.Object(options)
            expect(isImplemented({})).toBe(true)
          })
          it('should accept an object with properties', () => {
            const options = [
              ['foo', String],
              ['bar', String],
            ]
            const { isImplemented } = S.Object(options)
            expect(isImplemented({ foo: 'x', bar: 'y' })).toBe(true)
            expect(isImplemented({ foo: 42, bar: 'y' })).toBe(false)
          })
          it('should accept an object with additional properties', () => {
            const options = [
              ['foo', String],
              ['bar', String],
            ]
            const { isImplemented } = S.Object(options)
            expect(isImplemented({ foo: 'x', bar: 'y', baz: 'z' })).toBe(true)
          })
          it('should accept a nested object', () => {
            const options = [
              ['foo', String],
              ['bar', Object, [
                ['baz', String],
              ]],
            ]
            const { isImplemented } = S.Object(options)
            expect(isImplemented({ foo: 'x', bar: { baz: 'biz' } })).toBe(true)
            expect(isImplemented({ foo: 'x', bar: { baz: 42 } })).toBe(false)
          })
          it('should accept a spread parameter', () => {
            const options = [
              ['foo', String],
              [[String], [String, { maxLength: 5 }]],
            ]
            const { isImplemented } = S.Object(options)
            expect(isImplemented({ foo: 'x', bar: 'y' })).toBe(true)
          })
          it('should reject properties that do not match spread', () => {
            const options = [
              ['foo', String],
              [[String], [String, { maxLength: 5 }]],
            ]
            const { isImplemented } = S.Object(options)
            expect(isImplemented({ foo: 'x', bar: 'yyyyyy' })).toBe(false)
          })
        })
        describe('isCompatible', () => {
          it('should affirm compatibility', () => {
            const options = [['foo', String]]
            const { isCompatible } = S.Object(options)
            expect(isCompatible(Object, options)).toBe(true)
          })
          it('should affirm compatibility with additional properties', () => {
            const options = [['foo', String]]
            const { isCompatible } = S.Object(options)
            expect(isCompatible(Object)).toBe(true)
          })
          it('should affirm compatibility with spread', () => {
            const options = [
              ['foo', String],
              ['bar', String, { maxLength: 5 }],
            ]
            const rightOptions = [
              ['foo', String],
              [[String], [String, { maxLength: 5 }]],
            ]
            const { isCompatible } = S.Object(options)
            expect(isCompatible(Object, rightOptions)).toBe(true)
          })
          it('should deny compatibility with unspreadable properties', () => {
            const options = [
              ['foo', String],
              ['bar', String, { maxLength: 6 }],
            ]
            const rightOptions = [
              ['foo', String],
              [[String], [String, { maxLength: 5 }]],
            ]
            const { isCompatible } = S.Object(options)
            expect(isCompatible(Object, rightOptions)).toBe(false)
          })
        })
        describe('delta', () => {
          it('should return an empty array', () => {
            const options = [
              ['foo', String],
              ['bar', Object, [
                ['baz', String],
              ]],
            ]
            const { delta } = S.Object(options)
            expect(delta({ foo: 'x', bar: { baz: 'biz' } })).toEqual([])
          })
          it('should return a missing property', () => {
            const options = [
              ['foo', String],
              ['bar', Object, [
                ['baz', String],
              ]],
            ]
            const { delta } = S.Object(options)
            expect(delta({ bar: { baz: 'biz' } }))
              .toEqual([Object, [['foo', String, undefined]]])
          })
          it('should return a missing sub-property', () => {
            const options = [
              ['foo', String],
              ['bar', Object, [
                ['baz', String],
              ]],
            ]
            const input = { foo: 'x', bar: {} }
            const expected = [
              Object,
              [
                [
                  'bar',
                  Object,
                  [
                    ['baz', String, undefined],
                  ],
                ],
              ],
            ]
            const { delta } = S.Object(options)
            expect(delta(input)).toEqual(expected)
          })
          it('should ignore spread properties', () => {
            const options = [
              ['foo', String],
              [[String], String],
              ['bar', Object, [
                ['baz', String],
              ]],
            ]
            const input = { foo: 'x', bar: {} }
            const expected = [
              Object,
              [
                [
                  'bar',
                  Object,
                  [
                    ['baz', String, undefined],
                  ],
                ],
              ],
            ]
            const { delta } = S.Object(options)
            expect(delta(input)).toEqual(expected)
          })
        })
      })
    })
  })
})
