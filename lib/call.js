import { compose, override, spread } from './'

export const call = function call (fn, ...args) {
  const composed = compose(spread(fn), args)
  return override({
    properties: { '$': fn },
    apply: (target, thisArg, input) => composed(input[0]),
  })(fn)
}
