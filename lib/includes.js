import { compilable } from './compilable.js'
import { is } from './compare.js'

const includesProperties = (value, input) => {
  if (is.$(value, input)) {
    return true
  }
  if (!value || !input) {
    return false
  }
  return Reflect.ownKeys(value)
    .every(key => is.$(value[key], input[key]))
}

export const includes = compilable(function includes(value, input) {
  return input && input.includes
    ? input.includes(value)
    : includesProperties(value, input)
})
