//import * as fp from './'
import * as fp from '../dist'

Object.assign(global, fp)

describe('validate', () => {
  it('should validate an object', () => {
    const fn = validate({
      foo: 'bar',
      baz: isString,
    })
    const input = sync({
      foo: 'bar',
      baz: 'biz',
    })
    expect(fn(input)).toEqual([])
  })

  it('should validate an array', () => {
    const fn = validate([any, ...any])
    const input = [42]
    const output = fn(input)
    expect(output).toEqual([])
  })

  it('should validate a complex object', () => {
    const fn = validate({
      name: anyOf(isString, isMissing),
      setup: anyOf(isObject, isMissing),
      tests: [any, ...any],
    })
    const input = {
      name: 'toAsync',
      tests: [{ input: [42] }],
    }
    fn(input)
    const output = fn(input)
    expect(output).toEqual([])
  })
})
