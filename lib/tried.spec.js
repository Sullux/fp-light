const { tried } = require('./tried')
const assert = require('assert')

const { deepStrictEqual: deepEqual } = assert

describe('tried', () => {
  describe('tried', () => {
    it('should return the value when no error', () =>
      deepEqual(tried(() => 3), [undefined, 3]))
    it('should return the error when thrown', () => {
      const err = new Error('error')
      deepEqual(tried(() => { throw err }), [err, undefined])
    })
  })
})
