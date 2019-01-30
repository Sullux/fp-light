const {
  compareBooleans
} = require('./compare')
const assert = require('assert')

describe('compare', () => {
  describe('compareBooleans', () => {
    it('should compare false < true', () =>
      assert(compareBooleans(false, true) < 0))
    it('should compare true > false', () =>
      assert(compareBooleans(true, false) > 0))
    it('should compare false ~ false', () =>
      assert.strictEqual(compareBooleans(false, false), 0))
    it('should compare true ~ true', () =>
      assert.strictEqual(compareBooleans(true, true), 0))
  })
})
