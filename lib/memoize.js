const { is } = Object

const defaultMemoizeArgsEqual = (leftArgs, rightArgs) =>
  leftArgs.length === rightArgs.length &&
    leftArgs.reduce(
      (areEqual, arg, i) => areEqual && is(arg, rightArgs[i]),
      true
    )

const memoize = (fn, equal = defaultMemoizeArgsEqual) => {
  const argsCache = []
  const resultsCache = []
  const newValue = (args) => {
    const result = fn(...args)
    argsCache.push(args)
    resultsCache.push(result)
    return result
  }
  return (...args) => {
    const index = argsCache.findIndex(leftArgs => equal(leftArgs, args))
    return index < 0
      ? newValue(args)
      : resultsCache[index]
  }
}

module.exports = { memoize, defaultMemoizeArgsEqual }
