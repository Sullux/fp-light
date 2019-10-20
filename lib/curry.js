const required = Symbol('required')
const curried = Symbol('curried')

const curryObject = (fn, args) => {
  const { [required]: properties, ...rest } = Array.isArray(args)
    ? { [required]: args }
    : args
  const result = obj => {
    const state = { ...rest, ...obj }
    const remaining = properties.filter((property) =>
      !state.hasOwnProperty(property))
    return remaining.length
      ? curryObject(fn, { [required]: remaining, ...state })
      : fn(state)
  }
  const original = result[curried] = fn[curried] || fn
  Object.defineProperty(result, 'name', { value: original.name })
  return result
}

const curryArity = (fn, arity) => {
  const result = arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curryArity(fn.bind(null, ...args), arity - args.length))
    : curryArity(fn, fn.length)
  const original = result[curried] = fn[curried] || fn
  Object.defineProperty(result, 'name', { value: original.name })
  return result
}

const curry = (fn, arity) =>
  (typeof arity === 'object'
    ? curryObject(fn, arity)
    : curryArity(fn, arity))

const uncurry = fn =>
  (...args) =>
    args.reduce((nextFn, arg) => nextFn(arg), fn)

const unary = fn =>
  arg =>
    fn(arg)

const binary = fn =>
  (arg1, arg2) =>
    fn(arg1, arg2)

const ternary = fn =>
  (arg1, arg2, arg3) =>
    fn(arg1, arg2, arg3)

module.exports = {
  binary,
  curried,
  curry,
  curryObject,
  required,
  ternary,
  unary,
  uncurry,
}
