/* eslint-disable no-restricted-syntax */
const { tap } = require('./tap')
const { strictEqual } = require('assert')

describe('tap', () => {
  it('should call the wrapped function', () => {
    let mutable
    tap(v => { mutable = v })(42)
    strictEqual(mutable, 42)
  })
  it('should return the input value', () =>
    strictEqual(tap(() => 7)(42), 42))
})
