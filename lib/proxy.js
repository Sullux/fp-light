import { curry } from './'

export const proxy = curry(function proxy (definition, target) {
  return new Proxy(target, definition)
})

export const override = ({ properties = {}, apply, prototype }) =>
  proxy({
    get: (target, prop) =>
      prop in properties ? properties[prop] : target[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      prop in properties
        ? Object.getOwnPropertyDescriptor(properties, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (target, prop) =>
      (prop in properties) || (prop in target),
    ownKeys: (target) =>
      [...Reflect.ownKeys(target), ...Reflect.ownKeys(properties)],
    ...(apply ? { apply } : {}),
    ...(prototype ? { getPrototypeOf: () => prototype } : {} ),
  })
