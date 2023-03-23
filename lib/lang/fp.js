/* eslint no-return-assign: 0 */
const { parse, parser, ParseError } = require('./parse')
const { compile, compiler, CompileError } = require('./compile')
const { assemble, assembler, AssembleError } = require('./assemble')
const { link, linker, LinkError } = require('./link')
const { stringParser } = require('./stringParser')
const { Scope, ScopeContext } = require('../core/scope')

const scope = Scope.context
const whitespace = '\n\r\v\t\b\f \xa0'
const defaultOperators = '()\'"`#'

const stringBreaksSymbol = Symbol.for('fp.lang.stringBreaks')

const stringBreaks = () =>
  scope.current[stringBreaksSymbol][0]

const setStringBreaks = (strings) =>
  scope.current[stringBreaksSymbol] = strings

const addStringBreaks = (...strings) =>
  scope.current[stringBreaksSymbol] = [
    ...scope.current[stringBreaksSymbol],
    ...strings,
  ]

setStringBreaks(...whitespace, ...defaultOperators)

const operatorsSymbol = Symbol.for('fp.lang.operators')
const maxOperatorLength = 16

const addOperator = (operator) => {
  scope.current[operatorsSymbol].push(operator)
  addStringBreaks(operator)
}

const setOperators = (...operators) =>
  scope.current[operatorsSymbol] = ScopeContext(operators)

setOperators(...defaultOperators)

const nextStringBreak = (text, offset) =>
  stringBreaks().reduce(
    (breakOffset, stringBreak) => {
      const thisOffset = text.indexOf(stringBreak, offset)
      return (thisOffset < breakOffset) ? thisOffset : breakOffset
    },
    text.length,
  )

const whitespaceParser = (nextParser) =>
  (input) =>
    whitespace.includes(input.text[input.offset])
      ? { ...input, offset: input.offset + 1 }
      : nextParser(input)

const operatorsParser = (nextParser) =>
  (input) => {
    const { text, offset, elements } = input
    const compare = text.substring(offset, maxOperatorLength)
    for (const operator of scope.current[operatorsSymbol]) {
      if (compare.startsWith(operator)) {
        const element = {
          type: 'operator',
          value: operator,
          length: operator.length,
        }
        return parse({
          ...input,
          elements: [...elements, element],
        })
      }
    }
    return nextParser(input)
  }

const tokenParser = (nextParser) =>
  (input) => {
    const { text, offset, elements } = input
    const breakOffset = nextStringBreak(text, offset)
    if ((breakOffset !== offset)) {
      return nextParser(input)
    }
    const value = text.substring(offset, breakOffset)
    const number = Number(value)
    const element = Math.isNaN(number)
      ? {
          type: 'token',
          value,
          input,
          length: value.length,
        }
      : {
          type: 'number',
          value: number,
          input,
          length: value.length,
        }
    return parse({
      ...input,
      offset: breakOffset,
      elements: [...elements, element],
    })
  }

parser(tokenParser)
parser(operatorsParser)
parser(stringParser('"', 'token'))
parser(stringParser("'", 'string'))
parser(stringParser('`', 'native'))
parser(whitespaceParser)

compiler()

assembler()

linker()

const toFunction = () => {}

const toEcma = () => {}

const toModule = () => {}

const region = () => {}

const prefix = () => {}

const infix = () => {}

const postfix = () => {}

module.exports = {
  parse,
  compile,
  assemble,
  link,
  parser,
  compiler,
  assembler,
  linker,
  ParseError,
  CompileError,
  AssembleError,
  LinkError,
  toFunction,
  toEcma,
  toModule,
  region,
  prefix,
  infix,
  postfix,
}
