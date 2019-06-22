const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

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

module.exports = { binary, curry, ternary, unary, uncurry }
