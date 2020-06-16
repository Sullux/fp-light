import { curry } from './curry'

export const apply = function apply (target) {
  return new Proxy(target, {
    apply: (target, thisArg, argumentsList) =>
      target.apply(thisArg, ((argumentsList && argumentsList[0]) || [])),
  })
}

export const bind = curry(function bind (thisArg, target) {
  return new Proxy(target, {
    apply: (target, ignore, argumentList) =>
      target.apply(thisArg, argumentList),
  })
})

export const constructor = (target) =>
  function construct (...args) {
    return new target(...args)
  }

export { constructor as factory }
