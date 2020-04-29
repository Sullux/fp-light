import { curry, resolvable } from './'

export const bitand = resolvable(curry(function bitand (value1, value2) {
  return value1 & value2
}))

export { bitand as band }

export const bitnot = resolvable(function bitnot (value) {
  return ~value
})

export { bitnot as bnot }

export const bitor = resolvable(curry(function bitor (value1, value2) {
  return value1 | value2
}))

export { bitor as bor }

export const bitxor = resolvable(curry(function bitxor (value1, value2) {
  return value1 ^ value2
}))

export { bitxor as bxor }
