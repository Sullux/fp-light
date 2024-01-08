import * as fp from './index.js'

Object.assign(global, fp)

describe('Box', () => {
  it.only('should box', () => {
    const n = Box(40)
    expect(n + 2).toBe(42)
  })
})
