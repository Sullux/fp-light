import { Def } from './def.js'

const { _, asm, c, Meta } = Def

describe('Def', () => {
  it.only('should define a function', () => {
    const context = Def(
      { foo: 40 },
      [c.add, c.foo, 2],
    )
    console.log('???', context)
  })

  describe('dec', () => {
    it.only('should declare a named value', () => {
      const context = Def.dec('foo', c[0])
      expect(context).toEqual({
        decs: {},
        refs: [],
        errs: [],
        expr: [
          asm.dec,
          'foo',
          [asm.lbl, Meta.args, 0],
        ],
      })
    })

    it.only('should error when name is not a string', () => {
      const context = Def.dec(42, c[0])
      expect(context).toEqual({
        decs: {},
        refs: [],
        errs: [
          [
            ['unexpected name', 42],
          ],
        ],
        expr: [],
      })
    })
  })

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
    const fn = Def.fn([
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
// ~~0 // signed int32
// x>>>0 // unsigned int32
// Math.fround(x) // float32
