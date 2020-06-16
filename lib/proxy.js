import { curry } from './'

export const proxy = curry(function proxy (definition, target) {
  return new Proxy(target, definition)
})

const distinct = input => ([...(new Set(input))])

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
      distinct([...Reflect.ownKeys(target), ...Reflect.ownKeys(properties)]),
    ...(apply ? { apply } : {}),
    ...(prototype ? { getPrototypeOf: () => prototype } : {} ),
  })
