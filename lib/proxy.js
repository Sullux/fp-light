import { curry } from './curry.js'

export const proxy = curry(function proxy (definition, target) {
  return new Proxy(target, definition)
})

const distinct = input => ([...(new Set(input))])

const merged = (target, properties) => {
  const merged = {}
  Object.entries(Object.getOwnPropertyDescriptors(target))
    .filter(([key]) => !properties[key])
    .forEach(([key, value]) => Object.defineProperty(merged, key, value))
  Object.entries(Object.getOwnPropertyDescriptors(properties))
    .forEach(([key, value]) => Object.defineProperty(merged, key, value))
  if (Object.isFrozen(target)) {
    return Object.freeze(merged)
  }
  if (!Object.isExtensible(target)) {
    return Object.preventExtensions(merged)
  }
  return Object.seal(merged)
}

export const override = curry(({ properties = {}, apply, prototype }, target) => {
  // todo: come up with a way more elegant solution to this problem
  if (Object.isSealed(target)) {
    return merged(target, properties)
  }
  const valueOrBoundFunction = (value, prop) =>
    (typeof value === 'function') && (prop !== 'constructor')
      ? value.bind(apply || target)
      : value
  const overriddenKeys = Reflect.ownKeys(properties)
  const definition = {
    get: (t, prop) => overriddenKeys.includes(prop)
      ? valueOrBoundFunction(properties[prop], prop)
      : valueOrBoundFunction(target[prop], prop),
    getOwnPropertyDescriptor: (t, prop) =>
      overriddenKeys.includes(prop)
        ? Object.getOwnPropertyDescriptor(properties, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (t, prop) => overriddenKeys.includes(prop) || (prop in target),
    ownKeys: (t) => distinct([
      ...Reflect.ownKeys(target),
      ...overriddenKeys,
    ]),
    ...(apply ? { apply } : {}),
    ...(prototype ? { getPrototypeOf: () => prototype } : {}),
  }
  return new Proxy(target, definition)
})
