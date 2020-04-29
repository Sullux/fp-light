import { curry, resolvable } from './'

export const concat = resolvable(curry(
  function concat (baseValue, value, ...values) {
    return baseValue.concat(value, ...values)
  }
))
