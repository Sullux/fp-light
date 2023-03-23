/* eslint no-new-func: 0 */
/* eslint no-unreachable-loop: 0 */

const { Scope } = require('../core/scope')

const scope = Scope.context

const parserSymbol = Symbol.for('fp.lang.parser')
const parsersSymbol = Symbol.for('fp.lang.parsers')

class ParseError extends Error {
  constructor (message, parser, input) {
    super(`parser '${parser.name}' failed at ${input.file}/${input.offset}: ${message}`)
    this.parser = parser
    this.input = input
    const pre = input.text.substring(input.offset - 12, input.offset)
    const post = input.text.substring(input.offset, input.offset + 12)
    this.vicinity = `${pre}❌${post}`
    return this
  }
}

const defaultParser = () => () => null

const context = scope.current
context[parsersSymbol] = [defaultParser]
context[parserSymbol] = [defaultParser()]

const parser = (factory) => {
  const parsers = scope.current[parsersSymbol]
  parsers.push(factory)
  const currentParser = scope.current[parserSymbol]
  const parser = factory(currentParser[0], parse)
  parser.factory = factory
  currentParser[0] = (input) => {
    try {
      return parser(input)
    } catch (err) {
      throw new ParseError(
        err.message,
        factory,
        input,
      )
    }
  }
  return currentParser[0]
}

const linesFromText = (text) => {
  const lines = []
  const r = '\r'
  const n = '\n'
  let start = 0
  for (let i = 0, l = text.length; i < l; i++) {
    const c = text[i]
    const breakLength = (c === n)
      ? 1
      : (c === r)
          ? (text[i + 1] === n) ? 2 : 1
          : 0
    if (!breakLength) { continue }
    lines.push({ start, end: i, line: lines.length })
    start = i + breakLength
  }
  lines.push({ start, end: text.length, line: lines.length })
  return lines
}

const formatted = (text, elements, uri) => {
  const lines = linesFromText(text)
  let l = 0
  let line = lines[l]
  return elements.map((element) => {
    const { input: { offset }, length } = element
    while (offset > line.start) {
      line = lines[++l]
    }
    const position = {
      line: l,
      character: offset - line.start,
    }
    const endOffset = offset + length
    while (endOffset > line.end) {
      line = lines[++l]
    }
    const endPosition = {
      line: l,
      character: endOffset - line.start,
    }
    const { input, ...elementProperties } = element
    return {
      ...elementProperties,
      uri,
      offset,
      length,
      position,
      endPosition,
    }
  })
}

// { file, offset, text }
const parse = (input, elements = []) => {
  const parser = scope.current[parserSymbol][0]
  let result
  try {
    result = parser(input)
  } catch (err) {
    if (err instanceof ParseError) { throw err }
    throw new ParseError(
      err.message,
      parser.factory,
      input,
    )
  }
  if (Array.isArray(result)) {
    return result
  }
  const resultElements = formatted(result.elements)
  return [
    {
      type: 'BOF',
      uri: `file://${input.file}`,
      text: input.text,
    },
    ...resultElements,
    { type: 'EOF' },
  ]
}

module.exports = {
  parser,
  parse,
}
