import { compilable } from '.'

export const concat = compilable(
  function concat (baseValue, value, ...values) {
    if (baseValue === undefined) {
      return undefined
    }
    if (value === undefined) {
      return baseValue
    }
    return baseValue.concat(value, ...values)
  }
)
