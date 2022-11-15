import { isAsync } from './async.js'
import { resolve } from './resolve.js'
import { compilable } from './compilable.js'
import { trace } from './trace.js'

export const not = compilable(function not(predicate) { return !predicate })
export { not as falsy }

const andAsync = async (args, result, calls) => {
  result = await result
  if (!result) {
    return result
  }
  for (const call of calls) {
    result = await call(...args)
    if (!result) {
      return result
    }
  }
  return result
}

export const and = trace(function and(...predicates) {
  const calls = predicates.map(resolve)
  let offset = 0
  let result
  return (...args) => {
    for (const call of calls) {
      offset += 1
      result = call(...args)
      if (isAsync(result)) {
        return andAsync(args, result, calls.slice(offset))
      }
      if (!result) {
        return result
      }
    }
    return result
  }
})

const orAsync = async (args, result, calls) => {
  result = await result
  if (result) {
    return result
  }
  for (const call of calls) {
    result = await call(...args)
    if (result) {
      return result
    }
  }
  return result
}

export const or = trace(function or(...predicates) {
  const calls = predicates.map(resolve)
  let offset = 0
  let result
  return (...args) => {
    for (const call of calls) {
      offset += 1
      result = call(...args)
      if (isAsync(result)) {
        return orAsync(args, result, calls.slice(offset))
      }
      if (result) {
        return result
      }
    }
    return result
  }
})

export const xor = compilable(function xor(predicate1, predicate2) {
  return (predicate1 && !predicate2) || (predicate2 && !predicate1)
})
