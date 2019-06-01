const { strictEqual, deepStrictEqual, ok } = require('assert')

const { compose, composeFunctions, composeObjects } = require('./compose')

const notOk = value => ok(!value)

describe('compose', () => {
  describe('compose', () => {
    it('should compose functions', () => strictEqual(
      compose(x => x * 2, x => x + 2)(3),
      10
    ))
    it('should compose objects', () => deepStrictEqual(
      compose({ foo: 42, bar: false }, { bar: true, baz: 42 }),
      { foo: 42, bar: true, baz: 42 }
    ))
  })
  describe('composeFunctions', () => {
    it('should compose synchronously', () => strictEqual(
      composeFunctions(x => x * 2, x => x + 2)(3),
      10
    ))
    it('should compose asynchronously', () =>
      composeFunctions(x => x * 2, x => Promise.resolve(x + 2))(3)
        .then(result => strictEqual(result, 10)))
  })
  describe('composeObjects', () => {
    it('should compose objects', () => deepStrictEqual(
      composeObjects({ foo: 42, bar: false }, { bar: true, baz: 42 }),
      { foo: 42, bar: true, baz: 42 }
    ))
    it('should freeze composed objects', () => {
      const composed = composeObjects({ foo: 42 })
      composed.x = 'fail'
      notOk(composed.x)
      composed.foo = 43
      strictEqual(composed.foo, 42)
    })
    it('should compose nested objects', () => {
      const composed = composeObjects(
        { outer: { foo: 42, bar: false } },
        { outer: { bar: true, baz: 42 } }
      )
      deepStrictEqual(composed, { outer: { foo: 42, bar: true, baz: 42 } })
    })
    it('should not treat dates as objects', () => {
      const date = new Date()
      const composed = composeObjects(
        { foo: {}, bar: date },
        { foo: date, bar: {} }
      )
      deepStrictEqual(composed, { foo: date, bar: {} })
    })
    it('should not treat iterables as objects', () => {
      const iterable = [42]
      const composed = composeObjects(
        { foo: {}, bar: iterable },
        { foo: iterable, bar: {} }
      )
      deepStrictEqual(composed, { foo: iterable, bar: {} })
    })
  })
})
