import { resolvable, curry } from './'

export const add = curry(resolvable(function add (x, y) { return x + y }))

export const decrement = resolvable(function decrement (value) {
  return value - 1
})

export { decrement as dec }

export const divide = curry(resolvable(function divide (x, y) { return x / y }))

export { divide as div }

export const exponent = curry(resolvable(function exponent (exponent, base) {
  return Math.pow(base, exponent)
}))

export {
  exponent as exp,
  exponent as pow,
}
