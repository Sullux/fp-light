import { trace } from './trace.js'
import { isFunction } from './core/compare.js'
import { defineError } from './error.js'
import { isAsync } from './core/async.js'

export const InvalidTrapTargetError = defineError(
  'InvalidTrapTargetError',
  'ERR_INVALID_TRAP_TARGET',
  (critical) => ({
    message: `Argument 1 "critical" must be a function. Got ${critical}.`,
  }),
)

export const trapAsync = promise =>
  promise.then(result => ([undefined, result]), err => ([err]))

export const trap = (critical) => {
  if (isAsync(critical)) {
    return trapAsync(critical)
  }
  if (!isFunction.$(critical)) {
    InvalidTrapTargetError.throw(critical)
  }
  const traced = trace(critical)
  const trapped = (...args) => {
    try {
      const result = traced(...args)
      return isAsync(result)
        ? trapAsync(result)
        : [undefined, result]
    } catch (err) {
      return [err]
    }
  }
  trapped.$ = critical
  return trapped
}
