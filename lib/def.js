const { promisify } = require('util')
const { equal } = require('./compare')
const { curry } = require('./curry')
const { memoize } = require('./memoize')
const { trap } = require('./trap')
const { isThennable } = require('./type')

const { FPL_TEST } = process.env
const testRegex = regex =>
  value =>
    !value.includes('node_modules') && regex.test(value)
const shouldTest = FPL_TEST
  ? FPL_TEST === '*' ? () => true : testRegex(new RegExp(FPL_TEST))
  : () => false

const callContext = Symbol('callContext')
global[callContext] = []

const defaults = {
  untraced: false,
  async: false,
  trapped: false,
  memoized: false,
  promisified: false,
  args: [],
}

const defaultName = fn =>
  fn.name || fn.toString().split('\n')[0].trim() || '(anonymous)'

const sourceFromStack = () => {
  const trace = {}
  Error.captureStackTrace(trace)
  const { stack } = trace
  const line = stack.split('\n')[2]
  const offset = line.lastIndexOf('(')
  return offset < 0
    ? '(unknown)'
    : line.substring(offset + 1, line.length - 1)
}

const globalStack = Symbol('globalStack')

const tracedError = ({ error, frame }) => {
  const { stackTraceLimit } = Error
  const stack = []
  let previous = frame
  while ((stack.length <= stackTraceLimit) && previous) {
    stack.push(previous)
    previous = previous.from
  }
  Object.defineProperty(error, 'trace', { value: Object.freeze(stack) })
}

const defaultFrame = Object.freeze({
  args: process.argv.slice(2),
  name: '<<appstart>>',
  source: process.argv[1],
})

const trace = ({ fn, name, source }) =>
  (...args) => {
    const frame = Object.freeze({
      args,
      name,
      source,
      from: global[globalStack] || defaultFrame,
    })
    global[globalStack] = frame
    try {
      const result = fn(...args)
      global[globalStack] = frame.from
      return isThennable(result)
        ? result.catch((error) => Promise.reject(tracedError({ error, frame })))
        : result
    } catch(error) {
      global[globalStack] = frame.from
      throw tracedError({ error, frame })
    }
  }

const SIGNATURE_INPUT_ERROR = 'ERR_SIGNATURE_INPUT'
const SIGNATURE_OUTPUT_ERROR = 'ERR_SIGNATURE_OUTPUT'

const sign = ({
  fn,
  name,
  signature: { input = () => {}, output = () => {} },
}) =>
  (...args) => {
    const inputProblems = input(args) || []
    if (inputProblems.length) {
      const message =
        `${name} was called with invalid arguments:\n  ${inputProblems.join('\n  ')}`
      const inputError = new Error(message)
      inputError.code = SIGNATURE_INPUT_ERROR
      inputError.problems = inputProblems
      throw inputError
    }
    const result = fn(...args)
    const outputProblems = output(result) || []
    if (outputProblems.length) {
      const message =
        `${name} returned an invalid result:\n  ${outputProblems.join('\n  ')}`
      const outputError = new Error(message)
      outputError.code = SIGNATURE_OUTPUT_ERROR
      outputError.problems = outputProblems
      throw outputError
    }
    return result
  }

const test = spec =>
  fn => {
    const { source, name } = fn
    const trapped = trap(fn)
    const specs = Array.isArray(spec)
      ? spec
      : [spec]
    return {
      group: source || '(unknown)',
      function: name || '(anonymous)',
      tests: specs
        .map(({ input, output }) => ({
          input,
          output,
          actual: trapped(input),
        }))
        .map(result => ({ ...result, ok: equal(result.output, result.actual)})),
    }
  }

const def = (definition) => {
  const {
    fn,
    traced,
    async,
    trapped,
    memoized,
    promisified,
    args,
    signed,
    spec,
  } = { ...defaults, ...definition }
  const name = definition.name || defaultName(fn)
  const source = definition.source || sourceFromStack()
  const withProperties = anon =>
    Object.defineProperties(
      anon,
      {
        isTraced: { value: !!traced },
        isAsync: { value: !!async },
        isTrapped: { value: !!trapped },
        isMemoized: { value: !!memoized },
        isPromisified: { value: !!promisified },
        args: { value: args },
        signed: { value: signed },
        spec: { value: spec },
        name: { value: name },
        source: { value: source },
      }
    )
  const final = withProperties([
    promisified && promisify,
    traced && (fn => trace({ fn, name, source })),
    async && (fn => (...args) => Promise.resolve(fn(...args))),
    trapped && trap,
    signed && sign({ fn, name, signature: signed }),
    memoized && memoize,
    args && (fn => curry(fn, args)),
  ].reduce(
    (defined, strategy) => strategy
      ? strategy(defined)
      : defined,
    fn,
  ))
  return spec && shouldTest(`${source}:${name}`)
    ? test(spec)(final) || final
    : final
}

module.exports = Object.freeze({
  def,
  sign,
  SIGNATURE_INPUT_ERROR,
  SIGNATURE_OUTPUT_ERROR,
  trace,
})
