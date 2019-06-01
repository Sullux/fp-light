const { resolve, argument } = require('./resolve')
const { strictEqual, deepStrictEqual } = require('assert')

describe('resolve', () => {
  it('should return a non-function', () =>
    strictEqual(resolve(42, 'foo'), 42))
  it('should resolve to a function', () =>
    strictEqual(resolve(x => x, 42), 42))
  it('should resolve a thenable to a function', () =>
    resolve(x => x + 1, Promise.resolve(41))
      .then(answer => strictEqual(answer, 42)))
  it('should resolve to functions in an array', () =>
    deepStrictEqual(
      resolve([x => x, x => x + 1], 41),
      [41, 42],
    ))
  it('should resolve to async functions in an array', () =>
    resolve([x => Promise.resolve(x), x => x + 1], 41)
      .then(result => deepStrictEqual(result, [41, 42])))
  it('should resolve to functions in an object', () =>
    deepStrictEqual(
      resolve({ foo: x => x, bar: x => x + 1}, 41),
      { foo: 41, bar: 42 },
    ))
  it('should resolve to async functions in an object', () =>
    resolve({ foo: x => Promise.resolve(x), bar: x => x + 1 }, 41)
      .then(result => deepStrictEqual(result, { foo: 41, bar: 42 })))
  it('should deep resolve in objects and arrays', () =>
    resolve(
      { foo: Promise.resolve([x => x + 1]), bar: x => x - 1 }, 
      Promise.resolve(42)
    )
      .then(result => deepStrictEqual(result, { foo: [43], bar: 41 })))
  it('should deeply resolve objects, arrays and literal promises', () =>
    resolve(
    {
      foo: Promise.resolve('bar'),
      baz: Promise.resolve(x => Promise.resolve(x + 1)),
    },
    Promise.resolve(42)
  )
    .then(result => deepStrictEqual(result, { foo: 'bar', baz: 43 })))
})

describe('argument', () => {
  it('should return the input argument', () =>
    strictEqual(argument(42), 42))
})
