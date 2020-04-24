import { fail } from 'assert'
import { inspect } from 'util'
import { isAsync } from './'

const { custom } = inspect

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
      [...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)],
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
    previous: stack[stack.length - 1],
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
        onFulfilled && trace(onFulfilled, frame),
        onRejected && trace(onRejected, frame),
      ),
    catch: (onRejected) =>
      result.then(trace(onRejected, frame)),
    finally: (onFinally) =>
      result.finally(trace(onFinally, frame)),
  }
  return overrideProxy(result, overrides)
}

const errorFrame = err => ({
  time: Date.now(),
  name: err.code,
  args: {
    message: err.message,
    ...(Reflect.ownKeys(err)
      .reduce(
        (result, key) => {
          result[key] = err[key]
          return result
        },
        {},
      )),
  }
})

const callStack = (frame, err) => {
  const result = [frame]
  let nextFrame
  while(nextFrame = frame.previous) {
    result.push(nextFrame)
  }
  const oldestToNewest = result.reverse()
    .map(({ previous, ...rest }) => ({ ...rest }))
  if (err) {
    oldestToNewest.push(errorFrame(err))
  }
  return oldestToNewest
}

const inspectCalls = (calls, depth, options) =>
  calls
    .map(({ name, fn, file, line, column, thisArg, args, time }) =>
      inspect({
        ...(file ? { '@': `${file}:${line}:${column}` } : {}),
        time,
        name,
        fn,
        ...(thisArg ? { this: thisArg } : {}),
        args,
      }, depth, options))
    .map(entry => entry.split('\n').map(line => `    ${line}`).join('\n'))
    .map((entry) => `    -----------\n${entry}`)
    .join('\n')

const relevantStack = err =>
  err.stack
    .split('\n')
    .filter(line => !line.includes(__dirname))
    .join('\n')

const errorProxy = frame => {
  return err => {
    const stack = relevantStack(err)
    const overrides = {
      trace: callStack(frame, err),
      [custom]: (depth, options) =>
        `${stack}\n  == TRACE ==\n${inspectCalls(trace, depth, options)}`,
      stack,
    }
    throw overrideProxy(err, overrides)
  }
}

const mozillaLineAndColumn = (text) => {
  const [fn, file, line, column] = /(.*)@(.*):([0-9]+):([0-9]+)/.exec(text)
    .slice(1, 5)
  return {
    fn,
    file,
    line: Number(line),
    column: Number(column),
  }
}

const nodeLineAndColumn = (text) => {
  const [fn, file, line, column] =
    /at ([a-zA-Z0-9_$]+) \((.*):([0-9]+):([0-9]+)\)/
      .exec(text)
      .slice(1, 5)
  return {
    fn,
    file,
    line: Number(line),
    column: Number(column),
  }
}

const currentLineAndColumn = () => {
  const err = new Error('-')
  const line = err.stack
    .split('\n')
    .slice(1)
    .filter(line => !line.includes(__dirname))
    .map(line => line.trim())[0]
  return line
    ? line.includes('@') ? mozillaLineAndColumn(line) : nodeLineAndColumn(line)
    : {}
}

export const trace = (fn, existingFrame) => {
  if (typeof fn !== 'function') {
    fail(new TypeError(`\`trace\` argument 1: expected function but got ${typeof fn}`))
  }
  const name = functionName(fn)
  return new Proxy(fn, {
    apply: (target, thisArg, args) => {
      const frame = existingFrame
        ? push(existingFrame)
        : push({ name, ...currentLineAndColumn(), thisArg, args })
      try {
        const result = target.apply(thisArg, args)
        pop()
        if (!isAsync(result)) {
          return result
        }
        return traceAsync(result.catch(errorProxy(frame)), frame)
      } catch (err) {
        pop()
        errorProxy(frame)(err)
      }
    },
  })
}
