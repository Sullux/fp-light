import { compilable } from './'

export const concat = compilable(
  function concat (baseValue, value, ...values) {
    return baseValue.concat(value, ...values)
  }
)
