import { deepAwait, defineError, isAsync, isFunction, override, trace } from './'

export const InvalidValidatorError = defineError(
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

  }
  const traced = trace(critical)
  return override({
    apply: (target, thisArg, args) => {
      try {
        const result = deepAwait(traced(...args))
        return isAsync(result)
          ? trapAsync(result)
          : [undefined, result]
      } catch (err) {
        return [err]
      }
    }
  })(critical)
}
