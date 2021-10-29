//import * as fp from './'
import * as fp from '../dist'

Object.assign(global, fp)

describe('parallel', () => {
  it('should execute the mapper in parallel', async () => {
    const input = [500, 100]
    const order = []
    const fn = pipe(
      parallel(tap(pipe(
        delay(_, _),
        v => order.push(v),
      ))),
      output => ({ order, output }),
    )
    const output = await fn(input)
    const expected = { order: [100, 500], output: [500, 100]}
    expect(output).toEqual(expected)
  })
})
