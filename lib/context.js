import { DeepSync, isSync } from './async.js'

let stack = {
  values: [],
  debug: [],
}

const defaultStackTraceLimit = 10

const trace = () => {
  const limit = Error.stackTraceLimit || defaultStackTraceLimit
  return [...stack.debug].reverse().slice(0, limit).join('\n')
}

const push = (value, debug) => stack = {
  values: [...stack.values, value],
  debug: [...stack.debug, debug],
}

const pop = () => stack = {
  values: stack.values.slice(0, -1),
  debug: stack.debug.slice(0, -1),
}

const awaitContext = (value, resolve, reject) => {
  const asyncValue = DeepSync(value)
  if (isSync(asyncValue)) { return resolve ? resolve(value) : value }
  const stackRef = stack
  return asyncValue.then(
    resolve && ((syncValue) => {
      const savedStack = stack
      stack = stackRef
      try {
        const result = resolve(syncValue)
        stack = savedStack
        return result
      } catch(error) {
        stack = savedStack
        throw error
      }
    }),
    reject && ((error) => {
      const savedStack = stack
      stack = stackRef
      try {
        const result = reject(error)
        stack = savedStack
        return result
      } catch(error) {
        stack = savedStack
        throw error
      }
    }))
}

// todo: find a better way to get the correct line
const currentCall = () => (new Error('DEBUG')).stack
  .split('\n')
  .find((line) => !line.includes('/fp-light/index.js'))

const enterContext = (value, continuation) => {
  const syncValue = DeepSync(value)
  if (isAsync(syncValue)) {
    return context.await(
      syncValue,
      (value) => enterContext(value, continuation),
    )
  }
  push(value, currentCall())
  try {
    const result = continuation()
    pop()
    return result
  } catch(error) {
    pop()
    if (error && ((typeof error) === 'object')) {
      try {
        error.fpStack = trace()
      } catch(e) {}
    }
    throw error
  }
}

const value = (index = 0) => stack.values[(stack.values.length - index) - 1]

const get = (name, startIndex = 0) => {
  const { values } = stack
  for(let i = (values.length - 1) - startIndex; i > -1; i--) {
    const value = values[i]
    if (value && ((typeof value) === 'object')) {
      if (name in value) { return value[name] }
    }
  }
}

export const context = Object.freeze({
  await: awaitContext,
  enter: enterContext,
  trace,
  defaultStackTraceLimit,
  value,
  get,
})
