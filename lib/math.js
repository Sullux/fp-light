import { callable } from './call'
import { curry } from './curry'

export const add = curry(callable(function add (x, y) { return x + y }))

export const decrement = callable(function decrement (value) {
  return value - 1
})

export { decrement as dec }
