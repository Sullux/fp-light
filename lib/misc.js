import { firstPassResolvable, resolvable } from './'

export const descriptor = firstPassResolvable(function descriptor (key, target) {
  return Reflect.getOwnPropertyDescriptor(target, key)
})

export {
  descriptor as getDescriptor,
  descriptor as getPropertyDescriptor,
  descriptor as getOwnPropertyDescriptor,
}

export const endsWith = firstPassResolvable(function endsWith (searchString, str) {
  return str.endsWith(searchString)
})

export const startsWith = firstPassResolvable(function startsWith (searchString, str) {
  return str.startsWith(searchString)
})

export const split = firstPassResolvable(function split (searchString, str) {
  return str.split(searchString)
})

export const entries = resolvable(function entries (object) {
  return Object.entries(object)
})

export const error = ([error]) => error
