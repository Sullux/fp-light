import * as fp from './'
import { log } from './testUtils'

Object.assign(global, fp)

describe('map', () => {
  it('should reduce', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = reduce({
      reducer: ({ value, state }) => state + value,
      state: 0,
    })
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** reduce took', endTime - startTime, 'ms')
  })

  it('should map', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = map(({ i }) => ({ i2: i + 1 }))
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** map took', endTime - startTime, 'ms')
  })

  it('should group', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = groupBy(({ i }) => i % 3)
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** group took', endTime - startTime, 'ms')
  })

  it('should filter', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = filter(({ i }) => (i % 3) === 0)
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** filter took', endTime - startTime, 'ms')
  })

  it('should return boolean some', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = some(({ i }) => i > 998)
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** some took', endTime - startTime, 'ms')
  })

  it('should return boolean every', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = every(({ i }) => i > -1)
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** every took', endTime - startTime, 'ms')
  })

  it('should join', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = join({
      left: _,
      right: [2, 3],
      on: ({ left, right }) => (left.i % right) === 0,
      map: ({ left, right }) => `${left.i} / ${right}`,
    })
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** join took', endTime - startTime, 'ms')
  })

  it('should flatten', () => {
    const input = Array(500).fill().map((v, i) => ({ i }))
      .reduce(
        (state, value) => ([...state, [value, value]]),
        [],
      )
    const startTime = Date.now()
    const result = flat.$(input)
    const endTime = Date.now()
    expect(result).toEqual(input.flat())
    log('*** flatten took', endTime - startTime, 'ms')
  })
})
