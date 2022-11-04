const { fail } = require('./fail')

const scope = {
  break: 'break;',
}

const compileFunction = (args, statements) => {}

const compileCall = (name, args) => {}

const compileList = ([fn, ...args]) =>
  fn.type === 'array'
    ? compileFunction(fn.value, args)
    : fn.type === 'label'
      ? compileCall(fn.value, args)
      : fn.type === 'spread'
        ? compileCall('...', args)
        : fn.type === 'dereference'
          ? compileCall('dereference', args)
          : `(${[fn, ...args].map(compile)})`

const compileArray = (values) => {}

const compile = ({ type, value }) =>
  type === 'list'
    ? compileList(value)
    : type === 'label'
      ? value
      : type === 'array'
        ? compileArray(value)
        : fail(`type "${type}" is not recognized`)

const ecma = (stack) => {
  const elements = Array(stack.length - 1)
  for (let i = 1, { length } = stack; i < length; i++) {
    elements[i - 1] = compile(stack[i])
  }
  return elements // todo
}

const compileEcma = (context) => {
  const [directive] = context.stack
  if (!directive) return false
  const { type, value } = directive
  if ((type !== 'label') || (value !== 'ecma')) return false
  return ecma(context.stack)
}

module.exports = { compileEcma }
