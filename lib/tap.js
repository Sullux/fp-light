import { isAsync, override } from './index.js'

export const tap = (fn) => {
  const tapped = (arg) => {
    const result = fn(arg)
    return isAsync(result)
      ? result.then(() => arg)
      : arg
  }
  tapped.$ = fn
  return tapped
}

export {
  tap as aside,
  tap as dispatch,
}
