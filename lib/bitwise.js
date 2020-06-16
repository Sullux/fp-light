import { compilable } from './'

export const bitand = compilable(function bitand (value1, value2) {
  return value1 & value2
})

export { bitand as band }

export const bitnot = compilable(function bitnot (value) {
  return ~value
})

export { bitnot as bnot }

export const bitor = compilable(function bitor (value1, value2) {
  return value1 | value2
})

export { bitor as bor }

export const bitxor = compilable(function bitxor (value1, value2) {
  return value1 ^ value2
})

export { bitxor as bxor }
