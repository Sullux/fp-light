import { isAsync } from './async.js'
import { resolve,  } from './resolve.js'
import { toSpreadable } from './spreadable.js'
import { appendedName, trace } from './trace.js'
import { isMissing } from './compare.js'
import { defineError } from './error.js'

export const MissingPipeArgumentError = defineError(
  'MissingPipeArgumentError',
  'ERR_MISSING_PIPE_ARGUMENT',
  (arg, index) => ({ message: `Argument ${index + 1} of the pipe is ${arg}.` }),
)

const assertNotMissingAndResolve = (value, i) => {
  if (isMissing.$(value)) {
    throw MissingPipeArgumentError(value, i)
  }
  return resolve(value)
}

export const pipe = trace(function pipe(...steps) {
  const resolvableSteps = steps
    .map(assertNotMissingAndResolve)
    .map((fn, i) => appendedName(fn, `STEP_${i + 1}`))
    .map(trace)
  return toSpreadable(initialValue =>
    resolvableSteps.reduce(
      (value, step) =>
        isAsync(value)
          ? value.then(awaitedValue => step(awaitedValue))
          : step(value),
      initialValue,
    ))
})

export { pipe as I }

export const compose = trace(function compose(...steps) {
  const resolvableSteps = steps
    .reverse()
    .map(assertNotMissingAndResolve)
    .map((fn, i) => appendedName(fn, `STEP ${i + 1}`))
    .map(trace)
  return toSpreadable(initialValue =>
    resolvableSteps.reduce(
      (value, step) =>
        isAsync(value)
          ? value.then(awaitedValue => step(awaitedValue))
          : step(value),
      initialValue,
    ))
})

export { compose as f }
