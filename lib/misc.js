import { resolvable, curry, is } from './'

export const descriptor = curry(resolvable(function descriptor (key, target) {
  return Reflect.getOwnPropertyDescriptor(target, key)
}))

export {
  descriptor as getDescriptor,
  descriptor as getPropertyDescriptor,
  descriptor as getOwnPropertyDescriptor,
}

export const endsWith = curry(resolvable(function endsWith (searchString, str) {
  return typeof str === 'string'
    ? str.endsWith(searchString)
    : Array.isArray(str)
      ? str.length && is.$(str[str.length - 1], searchString)
      : false
}))

export const entries = resolvable(function entries (object) {
  return Object.entries(object)
})

export const error = ([error]) => error
