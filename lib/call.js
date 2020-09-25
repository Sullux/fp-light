import { compilable } from './'

export const call = compilable(function call (fn, ...args) {
  return fn(...args)
})
