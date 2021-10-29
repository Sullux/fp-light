import { compilable } from '.'

export const descriptor = compilable(function descriptor (key, target) {
  return Reflect.getOwnPropertyDescriptor(target, key)
})

export {
  descriptor as getDescriptor,
  descriptor as getPropertyDescriptor,
  descriptor as getOwnPropertyDescriptor,
}

export const endsWith = compilable(function endsWith (searchString, str) {
  return str.endsWith(searchString)
})

export const startsWith = compilable(function startsWith (searchString, str) {
  return str.startsWith(searchString)
})

export const split = compilable(function split (searchString, str) {
  return str.split(searchString)
})

export const entries = compilable(function entries (object) {
  return Object.entries(object)
})

export const error = ([error]) => error
