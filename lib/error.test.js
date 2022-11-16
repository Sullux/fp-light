import * as fp from './index.js'

Object.assign(global, fp)

describe('error', () => {
  it('should throw', () => {
    const MyError = defineError(
      'MyError',
      'ERR_MY',
      (number) => ({ message: `failed with ${number}` }),
    )
    const fn = pipe(
      x => x + 1,
      failWith(MyError, _),
    )
    let err
    try { fn(41) } catch(e) { err = e }
    expect(err.message).toBe('failed with 42')
    expect(err.name).toBe('MyError')
    expect(err.code).toBe('ERR_MY')
    expect(isErrorOf(MyError).$(err)).toBe(true)
  })
})
