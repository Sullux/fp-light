const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const memoize = (fn, arity) => {
  const cache = {}
  const serialize = value =>
    (typeof value === 'function'
      ? value.toString()
      : JSON.stringify(value))
  return (...args) =>
    (key => (cache.hasOwnProperty(key)
      ? cache[key]
      : (cache[key] = fn(...args))))(serialize(args))
}

const flatten = values =>
  values.reduce((flattened, value) =>
    (Array.isArray(value)
      ? flattened.concat(flatten(value))
      : flattened.concat([value])), [])

const isThennable = value =>
  value && value.then && (typeof value.then === 'function')

const pipe = (...steps) => initialValue =>
  flatten(steps).reduce((value, step) => (step
    ? isThennable(value)
      ? value.then(step)
      : step(value)
    : value), initialValue)

module.exports = {
  curry,
  memoize,
  pipe,
}
