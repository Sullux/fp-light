import { fail } from 'assert'
import { inspect } from 'util'
import { isAsync } from './'

const { custom } = inspect

const isTracedError = Symbol('isTracedError')

const distinct = input => ([...(new Set(input))])

const overrideProxy = (value, overrides) =>
  new Proxy(value, {
    get: (target, prop) =>
      overrides[prop] || target[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      overrides[prop]
        ? Object.getOwnPropertyDescriptor(overrides, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (target, prop) =>
      (prop in overrides) || (prop in target),
    ownKeys: (target) =>
      distinct([...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)]),
  })

const functionName = (fn) => {
  if ('$call' in fn) {
    return inspect(fn)
  }
  const { name } = fn
  if (name) {
    return name
  }
  const firstLine = fn.toString().split('\n')[0]
  return firstLine.length > 12
    ? `${firstLine.substring(0, 12)}...`
    : firstLine
}

const stack = [{
  name: 'APP_START',
  thisArg: process.argv,
  args: process.env,
  time: Date.now(),
}]

const push = frame => {
  const stackFrame = {
    time: Date.now(),
    ...frame, // allow restoring the previous and time properties
  }
  stack.push(stackFrame)
  return stackFrame
}

const pop = () =>
  stack.pop()

const traceAsync = (result, frame) => {
  const overrides = {
    then: (onFulfilled, onRejected) =>
      result.then(
        onFulfilled && traceFromFrame(onFulfilled, frame),
        onRejected && traceFromFrame(onRejected, frame),
      ),
    catch: (onRejected) =>
      result.then(traceFromFrame(onRejected, frame)),
    finally: (onFinally) =>
      result.finally(traceFromFrame(onFinally, frame)),
  }
  return overrideProxy(result, overrides)
}

const errorFrame = err => ({
  time: Date.now(),
  name: err.code || '<ERR_MISSING_CODE>',
  args: [{
    message: err.message,
    ...(Reflect.ownKeys(err)
      .reduce(
        (result, key) => {
          result[key] = err[key]
          return result
        },
        {},
      )),
  }],
})

const callStack = (frame, err) => {
  const result = [frame]
  let nextFrame = frame
  while(nextFrame = nextFrame.previous) {
    result.push(nextFrame)
  }
  return [
    errorFrame(err),
    ...result.slice(0, result.length - 1)
      .map(({ previous, ...rest }) => ({ ...rest })),
  ]
}

const inspectCalls = (calls, depth, options) =>
  calls
    .map(({ name, file, line, column, thisArg, args, time }) =>
      inspect({
        ...(file ? { '@': `${file}:${line}:${column}` } : {}),
        time,
        name,
        ...(thisArg ? { this: thisArg } : {}),
        args,
      }, depth, options))
    .map(entry => entry.split('\n').map(line => `    ${line}`).join('\n'))
    .map((entry) => `    -----------\n${entry}`)
    .join('\n')

const irrelevantPartialMatches = [
  '(internal/',
  '/node_modules/',
  'internal/main',
  __filename,
  '(<anonymous>)',
]

const relevantLineFilter = line =>
  !irrelevantPartialMatches.some(str => line.includes(str))

const relevantStack = err =>
  err.stack
    .split('\n')
    .filter(relevantLineFilter)
    .join('\n')

const errorProxy = frame => {
  return err => {
    const traceStack = callStack(frame, err)
    const [stackHeader, ...stackLines] = relevantStack(err).split('\n')
    const stack = [
      stackHeader,
      ...traceStack.slice(1).map(({ fn, name, file, line, column }) =>
        `    from ${name} (${file}:${line}:${column})`),
      ...stackLines,
    ].join('\n')
    const overrides = {
      trace: traceStack,
      [custom]: (depth, options) =>
        `${stack}\n  == TRACE ==\n${inspectCalls(traceStack, depth, options)}`,
      stack,
      [isTracedError]: true,
    }
    throw overrideProxy(err, overrides)
  }
}

// const mozillaLineAndColumn = (text) => {
//   const matches = /(.*)@(.*):([0-9]+):([0-9]+)/.exec(text)
//   if (!matches) {
//     return null
//   }
//   const [fn, file, line, column] = matches.slice(1, 5)
//   return {
//     fn,
//     file,
//     line: Number(line),
//     column: Number(column),
//   }
// }

const nodeLineAndColumn = (text) => {
  const matches = /at ([a-zA-Z0-9_$<>.]+) \((.*):([0-9]+):([0-9]+)\)/.exec(text)
  if (!matches) {
    return null
  }
  const [file, line, column] = matches.slice(2, 5)
  return {
    file,
    line: Number(line),
    column: Number(column),
  }
}

const currentLineAndColumn = () => {
  const err = new Error('-')
  const line = (err.stack
    .split('\n')
    .slice(1)
    .filter(relevantLineFilter)[0] || '').trim()
  const result = nodeLineAndColumn(line)
  return result || {}
}

export const named = (fn, name) =>
  fn.name && !name
    ? fn
    : overrideProxy(fn, { name: (name || functionName(fn)) })

export const appendedName = (fn, name) =>
  fn.name
    ? overrideProxy(fn, { name: `${fn.name}<${name}>` })
    : named(fn, name)

const traceFromFrame = (fn, existingFrame) => {
  const name = fn.name
  const previous = stack[stack.length - 1]
  return new Proxy(fn, {
    apply: (target, thisArg, args) => {
      const frame = existingFrame
        ? push({ ...existingFrame, previous })
        : push({ name, ...currentLineAndColumn(), thisArg, args, previous })
      try {
        // todo: investigate whey this returns undefined
        // const result = target.apply(thisArg, args)
        const result = target(...args)
        pop()
        if (!isAsync(result)) {
          return result
        }
        return traceAsync(result.catch(errorProxy(frame)), frame)
      } catch (err) {
        pop()
        if (err[isTracedError]) {
          throw err
        }
        errorProxy(frame)(err)
      }
    },
  })
}

export const trace = (fn) => {
  if (typeof fn !== 'function') {
    fail(new TypeError(`\`trace\` argument 1: expected function but got ${typeof fn}`))
  }
  return traceFromFrame(named(fn))
}
