const { pipe } = require('./pipe')
const { strictEqual } = require('assert')

describe('pipe', () => {
  it('should produce a function', () =>
    strictEqual(typeof pipe(() => 'foo'), 'function'))
  it('should pipe values', () =>
    strictEqual(pipe(i => i + 1, i => i * 2)(3), 8))
  it('should pipe values through thennables', () =>
    pipe(i => Promise.resolve(i + 1), i => i * 2)(3)
      .then(answer => strictEqual(answer, 8)))
})
