import * as fp from './index.js'

Object.assign(global, fp)

describe('pipe', () => {
  it('should pipe synchronous values', () => {
    const fn = pipe(
      _.x,
      add(_[0], _[1]),
    )
    const input = { x: [40, 2] }
    const output = fn(input)
    expect(output).toBe(42)
  })

  it('should pipe an async initial value', async () => {
    const fn = pipe(
      _.x,
      add(_[0], _[1]),
    )
    const input = Promise.resolve({ x: [40, 2] })
    const output = await fn(input)
    expect(output).toBe(42)
  })

  it('should pipe an async intermediate value', async () => {
    const fn = pipe(
      _.x,
      add(_[0], _[1]),
    )
    const input = { x: Promise.resolve([40, 2]) }
    const output = await fn(input)
    expect(output).toBe(42)
  })
})

describe('compose', () => {
  it('should compose synchronous values', () => {
    const fn = compose(add(_[0], _[1]), _.x)
    const input = { x: [40, 2] }
    const output = fn(input)
    expect(output).toBe(42)
  })
})
