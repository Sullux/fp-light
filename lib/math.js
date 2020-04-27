import { resolvable, curry } from './'

export const add = curry(resolvable(function add (x, y) { return x + y }))

export const increment = resolvable(function increment (value) {
  return value + 1
})

export { increment as inc }

export const subtract = curry(resolvable(function subtract (x, y) { return x - y }))

export { subtract as sub }

export const decrement = resolvable(function decrement (value) {
  return value - 1
})

export { decrement as dec }

export const multiply = curry(resolvable(function multiply (x, y) { return x * y }))

export { multiply as mul }

export const divide = curry(resolvable(function divide (x, y) { return x / y }))

export { divide as div }

export const exponent = curry(resolvable(function exponent (exponent, base) {
  return Math.pow(base, exponent)
}))

export {
  exponent as exp,
  exponent as pow,
}
