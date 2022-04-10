import { equal, deepStrictEqual, AssertionError } from 'assert'

const fail = ({ message, actual, expected, operator }) => {
  throw new AssertionError({
    message: message || `Assertion failed: ${actual} ${operator} ${expected}`,
    actual,
    expected,
    operator,
    stackStartFn: expect,
  })
}

export const expect = (v1) => ({
  toBe: (v2) => equal(v1, v2),
  toEqual: (v2) => v1 === v2 || deepStrictEqual(v1, v2),
  toBeGreaterThan: (v2) => v1 > v2 || fail({
    actual: v1,
    expected: v2,
    operator: '>',
  }),
  toBeTrue: () => equal(v1, true),
  toThrow: (error) => {
    let result
    try {
      result = v1()
      // console.log('??? RESULT', result)
    } catch (err) {
      // console.log('??? ERROR', err)
      return (error instanceof Error)
        ? equal(err.name, error.name)
        : equal(err.message, error)
    }
    fail({
      actual: result,
      expected: (error instanceof Error) ? error.name : error,
    })
  },
})

global.expect = expect
