import { isAsync } from './async'
import { call } from './call'

export const conditional = (predicate, truecase, falsecase) => {
  const p = call(predicate)
  const t = call(truecase)
  const f = falsecase ? call(falsecase) : v => v
  return function conditional (...args) {
    const result = p(...args)
    if (isAsync(result)) {
      return result.then((r) => r
        ? t(...args)
        : f(...args))
    }
    return result
      ? t(...args)
      : f(...args)
  }
}

export {
  conditional as when,
  conditional as ternary,
}

const selectAsync = async (initialValue, initialTruecase, calls, args) => {
  if (await initialValue) {
    return initialTruecase(...args)
  }
  for (const [predicate, truecase] of calls) {
    const value = await predicate(...args)
    if (value) {
      return truecase(...args)
    }
  }
  return args[0]
}

export const select = (...conditionals) => {
  const calls = conditionals.map(([predicate, truecase]) => ([call(predicate), truecase]))
  return function select (...args) {
    let counter = 0
    for (const [predicate, truecase] of calls) {
      counter += 1
      const value = predicate(...args)
      if (isAsync(value)) {
        return selectAsync(value, truecase, calls.slice(counter), args)
      }
      if (value) {
        return truecase(...args)
      }
    }
    return args[0]
  }
}

export { select as selectCase }

export const fallback = () => true
