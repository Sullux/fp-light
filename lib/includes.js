import { resolvable, curry, is } from './'

const includesProperties = (value, input) => {
  if (is.$(value, input)) {
    return true
  }
  if (!value || !input) {
    return false
  }
  return Reflect.ownKeys(value).every(key => includes.$(value[key], input[key]))
}

export const includes = resolvable(curry(function includes(value, input) {
  return input && input.includes
    ? input.includes(value)
    : includesProperties(value, input)
}))
