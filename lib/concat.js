import { callable } from './call'
import { curry } from './curry'

export const concat = curry(callable(
  function concat (baseValue, value, ...values) {
    return baseValue.concat(value, ...values)
  }
))
