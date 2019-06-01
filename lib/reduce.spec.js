const { reduce } = require('./reduce')
const { strictEqual, deepStrictEqual } = require('assert')

describe('reduce', () => {
  it('should reduce to a single value', () => strictEqual(
    reduce((x, y) => y + x, 0, [1, 2, 3]),
    6
  ))
  it('should pass all arguments to the reducer', () => {
    const initialState = 42
    const sourceIterable = ['foo']
    reduce(
      (result, value, index, iterable) => deepStrictEqual(
        [result, value, index, iterable],
        [initialState, 'foo', 0, sourceIterable]
      ),
      initialState,
      sourceIterable,
    )
  })
})
