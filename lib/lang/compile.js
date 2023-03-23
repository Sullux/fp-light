/* eslint no-new-func: 0 */
/* eslint no-unreachable-loop: 0 */

const { Scope } = require('../core/scope')
const { ArraySegment } = require('../core/arraySegment')

const compilerSymbol = Symbol.for('fp.lang.compiler')
const compilersSymbol = Symbol.for('fp.lang.compilers')

class CompileError extends Error {
  constructor (message, compiler, input) {
    super(message)
    // todo
  }
}

const defaultRefs = {
  token: 'fp.fromContext',
  string: 'ecma.String',
  number: 'ecma.Number',
  boolean: 'ecma.Boolean',
}

const defaultCompiler = () =>
  (input) => {
    const { elements, offset, expressions } = input
    const { type, value } = elements[offset]
    const ref = defaultRefs[type]
    if (!ref) {
      throw new CompileError(
        `unrecognized element type "${type}"`,
        defaultCompiler,
        input,
      )
    }
    return {
      elements,
      offset: offset + 1,
      expressions: [
        ...expressions,
        {
          ref,
          args: [value],
          precedence: 0,
          elements: ArraySegment(elements, offset, 1),
        },
      ],
    }
  }

Scope.context.current[compilersSymbol] = [defaultCompiler]
Scope.context.current[compilerSymbol] = [defaultCompiler()]

const compiler = (factory) => {
  const compilers = Scope.context.current[compilersSymbol]
  compilers.push(factory)
  const currentCompiler = Scope.context.current[compilerSymbol]
  const compiler = factory(currentCompiler[0], compile)
  compiler.factory = factory
  currentCompiler[0] = (input) => {
    try {
      return compiler(input)
    } catch (err) {
      throw new CompileError(
        err.message,
        factory,
        input,
      )
    }
  }
  return currentCompiler[0]
}

const compile = (input) => {
  const compiler = Scope.context.current[compilerSymbol][0]
  const safeInput = input.expressions ? input : { ...input, expressions: [] }
  const compiled = compiler(safeInput)
  return compiled.offset >= compiled.elements.length
    ? compiled
    : compile(compiled)
}

module.exports = {
  compiler,
  compile,
}
