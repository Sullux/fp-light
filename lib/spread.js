import { override } from './'

export const spread = function spread (fn) {
  return override({
    apply: (args = []) => fn(...args),
  })(fn)
}

export const gather = function gather (fn) {
  return override({
    apply: (...args) => fn(args),
  })(fn)
}
