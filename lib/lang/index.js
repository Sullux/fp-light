/* eslint no-new-func: 0 */

const { Scope, ScopeContext } = require('../core/scope')

const invokeSymbol = Symbol.for('fp.lang.invoke')
const sourceSymbol = Symbol.for('fp.lang.source')

const parse = (input) => {
  // todo
}

const compile = ([fn, ...args]) => {
  const { context } = Scope
  const { current } = context
  const { input, output, ecma } = current[fn](args)
  const { file, offset, text, length } = context.current[sourceSymbol]
  const src = JSON.stringify({
    src: source.file,
    os: source.offset,
    txt: source.text.substring(),
  })
  const indent = '  '.repeat(source.indent || 0)
  const padding = `\n${indent}`
  return {
    input,
    output,
    ecma: ecma.split('\n').join(padding),
  }
  // return { input, output, ecma }
}

const resolve = ({ input, output, ecma }) => {
  // return ecma
}

const compileToEcma = ([fn, ...args]) => {
  // todo
}

// expression: input, output, ecma, invoke, resolve
Scope.context.current.fn = (expressions) => {
  const { context } = Scope
  context.current.enter()
  const functions = expressions.map(compile).map(resolve)
  context.current.leave()
  const dataExpressions = functions.slice(0, -1)
  const resultExpression = functions[functions.length - 1]
  //
  const source = context.current[sourceSymbol]
  const src = JSON.stringify({ src: source.file, os: source.offset })
  const indent = '  '.repeat(source.indent || 0)
  const padding = `\n${indent}`
  const ecma = [
    `${indent}/*${src}*/`,
    ...dataExpressions,
    `return ${resultExpression}`,
  ].join(padding)
  const invoke = Function(...expressionArgs, ecma)
  return {
    args,
    [invokeSymbol]: invoke,
    ecma,
  }
}

module.exports = {
  parse,
  compile,
  compileToEcma,
}
