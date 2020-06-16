import { isAsync, override } from './'

export const tap = fn =>
  override({
    properties: { '$': fn },
    apply: (target, thisArg, [arg]) => {
      const result = fn(arg)
      return isAsync(result)
        ? result.then(() => arg)
        : arg
    }
  })(fn)

export {
  tap as aside,
  tap as dispatch,
}
