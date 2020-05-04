import { inspect } from 'util'
import { compilable, includes, override } from './'

export const isError = compilable(function isError(value) {
  return value instanceof Error
})

const isErrorOfType = (type) =>
  compilable(function isErrorOf (error) {
    return (error instanceof Error) && (error instanceof type)
  })

const isErrorIncluding = (type) =>
  compilable(function isErrorOf (error) {
    return includes.$(type, error)
  })

export const isErrorOf = (type) =>
  (typeof type === 'function')
    ? isErrorOfType(type)
    : isErrorIncluding(type)

export const defineError = (
  name,
  code,
  factory = message => ({ message }),
) => {
  const escapedCode = inspect(code || name.toUpperCase())
  const errorFunction = new Function('factory', `
    function ${name} (...args) {
      const self = new.target
        ? this
        : Object.setPrototypeOf({}, ${name}.prototype)
      Object.assign(self, factory(...args))
      self.code = ${escapedCode}
      const stackLines = new Error(self.message).stack.split('\\n')
      self.stack = [stackLines[0], ...stackLines.slice(2)].join('\\n')
      return Object.freeze(self)
    }
    return ${name}
  `)(factory)
  errorFunction.prototype = Object.create(Error.prototype)
  return override({
    properties: {
      code,
      is: isErrorOfType(errorFunction),
      throw: (...args) => { throw errorFunction(...args) },
      reject: (...args) => Promise.reject(errorFunction(...args)),
    },
  })(errorFunction)
}

export const failWith = error =>
  compilable((...args) => {
    throw new error(...args)
  })
