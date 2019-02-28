const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const bindIfFunction = (obj, fn) =>
  (typeof fn === 'function'
    ? fn.bind(obj)
    : fn)

const arrayOf = arg =>
  Array.isArray(arg)
    ? arg
    : [arg]

const get = curry((pathParts, source) =>
  arrayOf(pathParts).reduce(
    (value, name) =>
      value === null || value === undefined
        ? undefined
        : bindIfFunction(value, value[name]),
    source
  ))

module.exports = {
  get,
}
