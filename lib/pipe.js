import { isAsync } from './core/async.js'
import { resolve, toSpreadable } from './resolve.js'
import { appendedName, trace } from './trace.js'
import { isMissing } from './core/compare.js'
import { defineError } from './error.js'
import { context } from './core/context.js'

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

const pipeStepTemplate = function STEP___I__ (arg) {
  return context.enter(arg, () => steps[__I__](arg))
}.toString()

export const pipe = function pipe (...steps) {
  const [calls, functionBodies, resolvedSteps] = steps
    .reduce(
      ([calls, functionBodies, resolvedSteps], fn, i) => ([
        `STEP_${i}(${calls})`,
        `${functionBodies}\n${pipeStepTemplate.replace(/__I__/g, String(i))}`,
        [...resolvedSteps, assertNotMissingAndResolve(fn)],
      ]),
      ['input', '', []],
    )
  return toSpreadable(new Function(
    'context',
    'steps',
    `${functionBodies}\nreturn function pipe (input) { return ${calls} }`,
  )(context, resolvedSteps))
}

export const compose = function compose (...steps) {
  return pipe(...steps.reverse())
}
