const { strictEqual } = require('assert')

const { always } = require('./always')

const value = {}
const alwaysValue = always(value)

describe('always', () => {
  it('should return the given value', () =>
    strictEqual(alwaysValue(), value))
  it('should ignore arguments', () =>
    strictEqual(alwaysValue('foo'), value))
})
