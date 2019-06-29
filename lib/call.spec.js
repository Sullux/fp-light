const { strictEqual } = require('assert')

const { call, call$ } = require('./call')

describe('call', () => {
  it('should call a function', () =>
    strictEqual(call(() => 42), 42))
  it('should call a function with an argument', () =>
    strictEqual(call([x => 40 + x, 2]), 42))
  it('should call a function with n arguments', () =>
    strictEqual(call([(x, y) => 37 + x + y, 2, 3]), 42))
})

describe('call$', () => {
  it('should call a resolved function', () =>
    strictEqual(call$('value')({ value: () => 42 }), 42))
  it('should call a resolved function with an argument', () =>
    strictEqual(call$(['foo', 2])({ foo: x => 40 + x }), 42))
  it('should call a resolved function with n arguments', () =>
    strictEqual(
      call$(['foo', 2, 'bar'])({ foo: (x, y) => 37 + x + y, bar:3 }),
      42,
    )
  )
})
