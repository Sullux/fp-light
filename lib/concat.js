import { curry, resolvable } from './'

export const concat = curry(resolvable(
  function concat (baseValue, value, ...values) {
    return baseValue.concat(value, ...values)
  }
))
