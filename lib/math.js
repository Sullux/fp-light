import { compilable } from './'

export const add = compilable(function add (x, y) { return x + y })

export const subtract = compilable(function subtract (x, y) { return x - y })

export { subtract as sub }

export const multiply = compilable(function multiply (x, y) { return x * y })

export { multiply as mul }

export const divide = compilable(function divide (x, y) { return x / y })

export { divide as div }

export const remainder = compilable(function remainder (x, y) { return x % y })

export { remainder as rem }

export const modulo = compilable(function remainder (x, y) {
  return ((x % y ) + y ) % y
})

export { modulo as mod }

export const exponent = compilable(function exponent (exponent, base) {
  return Math.pow(base, exponent)
})

export {
  exponent as exp,
  exponent as pow,
}

export const square = compilable(function square (base) {
  return base * base
})

export { square as sqr }

export const squareRoot = compilable(function squareRoot (base) {
  return Math.sqrt(base)
})

export { squareRoot as sqrt }

export const greater = compilable(function greater (x, y) { return x > y })

export {
  greater as greaterThan,
  greater as gt,
}

export const less = compilable(function less (x, y) { return x < y })

export {
  less as lessThan,
  less as lt,
}

export const isInteger = compilable(function isInteger (x) {
  return Number.isSafeInteger(x)
})

export const shift = compilable(function shift (x, y) {
  return x >> y
})
