import * as fp from './index.js'

Object.assign(global, fp)

describe('types', () => {
  it('should add types to the Type function', () => {
    expect(Type('js.String')).toBe(Type.js.String)
  })

  it('should match a type', () => {
    expect(Type('js.String').is('foo')).toBe(true)
  })

  it('should coerce a matching type', () => {
    const string = 'foo'
    const coerced = Type('js.String').from(string)
    expect(coerced).toBe(string)
  })
})
