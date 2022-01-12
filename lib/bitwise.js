import { compilable } from './resolve.js'

export const bitand = compilable(function bitand(x, y) {
  return x & y
})

export { bitand as band }

export const bitnot = compilable(function bitnot(x) {
  return ~x
})

export { bitnot as bnot }

export const bitor = compilable(function bitor(x, y) {
  return x | y
})

export { bitor as bor }

export const bitxor = compilable(function bitxor(x, y) {
  return x ^ y
})

export { bitxor as bxor }

export const leftShift = compilable(function leftShift(x, y) {
  return x << y
})

export { leftShift as lshift }

export const rightShift = compilable(function rightShift(x, y) {
  return x >>> y
})

export { rightShift as rshift }

export const bitwise = Object.freeze({
  and: bitand,
  not: bitnot,
  or: bitor,
  xor: bitxor,
})

export { bitwise as bit }
