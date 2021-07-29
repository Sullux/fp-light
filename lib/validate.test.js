import * as fp from './'
import { log } from './testUtils'

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
})
