import { Def } from './def.js'

const { _, c } = Def

describe('Def', () => {
  it('should define a lambda', () => {
    const fn = Def([c.get, _, 'foo'])
    const input = { foo: 42 }
    const output = fn(input)
    expect(output).toBe(42)
  })

  // import: compile time
  // require: runtime
  // assert: compile and/or runtime check
  // assume: compile time only
  // as: compile and/or runtime cast
  it('should define an anonymous function', () => {
    const fn = Def([
      {
        x: [c.assert, c[0], c.Number],
      },
      [
        c.when, [c.gt, [c.length, c], 2],
        [c.add, c.x, [c.recurse, [c.spread, [c.slice, c, 1]]]],
        [c.add, c.x, [c.assert, c[1], c.Number]],
      ],
    ])
    const output = fn(40, 2)
    expect(output).toBe(42)
  })
})

// x|0 // signed int32
// x>>>0 // unsigned int32
// Math.fround(x) // float32
