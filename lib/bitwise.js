import { callable } from './call'

export const bitand = callable(function bitand (value1, value2) {
  return value1 & value2
})

export { bitand as band }

export const bitnot = callable(function bitnot (value) {
  return ~value
})

export { bitnot as bnot }

export const bitor = callable(function bitor (value1, value2) {
  return value1 | value2
})

export { bitor as bor }

export const bitxor = callable(function bitxor (value1, value2) {
  return value1 ^ value2
})

export { bitxor as bxor }
