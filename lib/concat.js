import { resolvable } from './call'
import { curry } from './curry'

export const concat = curry(resolvable(
  function concat (baseValue, value, ...values) {
    return baseValue.concat(value, ...values)
  }
))
