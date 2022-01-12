import { isIterable } from './compare.js'
import { override } from './proxy.js'

export const spread = function spread(fn) {
  return override({
    apply: (target, thisArg, args) => {
      const array = args[0] || []
      if (!isIterable.$(array)) {
        throw new TypeError(`Expected an iterable to spread to function ${fn.name}(); got ${array} instead.`)
      }
      return target(...array)
    },
  }, fn)
}

export const gather = function gather(fn) {
  return override({
    apply: (target, thisArg, args) => target(args),
  })(fn)
}
