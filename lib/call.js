import { compilable } from './resolve.js'

export const call = compilable(function call(fn, ...args) {
  return fn(...args)
})

export const constructed = compilable(function constructed(obj) {
  const proxiedFunctions = {}
  const getProxiedFunction = (name, target, value) => {
    const existing = proxiedFunctions[name]
    if (existing) {
      return existing
    }
    const proxied = new Proxy(
      value,
      { apply: (t, ta, args) => target[name](...args) },
    )
    proxiedFunctions[name] = proxied
    return proxied
  }
  // todo: add a property mapper that accounts for prototypal inheritance?
  return new Proxy(
    obj,
    {
      get: (target, property) => {
        const value = target[property]
        return (typeof value) === 'function'
          ? getProxiedFunction(property, target, value)
          : value
      }
    },
  )
})

export const construct = compilable(function construct(fn, ...args) {
  return constructed.$(new fn(...args))
})
