const { fail } = require('./fail')
const { parseString } = require('./parseString')
const { parseLabel } = require('./parseLabel')
const { parseList } = require('./parseList')
const { parsePrefix } = require('./parsePrefix')
const { parseStraddle } = require('./parseStraddle')

const advanced = (
  {
    position: startPosition,
    line: startLine,
    offset: startOffset,
    text,
  },
  length) => {
  let index = startPosition
  let lastIndex = index
  let line = startLine
  let offset = startOffset
  const position = startPosition + length
  while (true) {
    index = text.indexOf('\n', index) + 1
    if (!index || (index > position)) break
    lastIndex = index
    line += 1
  }
  offset = position - lastIndex
  return {
    position,
    line,
    offset,
    text,
  }
}

const mergeArrays = (destination, source) => Array.isArray(source)
  ? source
  : [...destination, source]

const isObject = value => value && (value.constructor === Object)

const mergeObjects = (destination, source) => isObject(source)
  ? Object.entries(source).reduce(
      (object, [key, value]) => ({ ...object, [key]: merge(object[key], value) }),
      destination,
    )
  : source

const merge = (destination, source) => isObject(destination)
  ? mergeObjects(destination, source)
  : Array.isArray(destination)
    ? mergeArrays(destination, source)
    : source

const parseNext = (context) => {
  const { parsers, input } = context
  const { position, text } = input
  if (position >= text.length) {
    return false
  }
  const { length } = parsers
  for (let i = 0; i < length; i++) {
    const parser = parsers[i]
    const result = parser(context)
    if (result) {
      const merged = merge(context, result)
      // console.log('NEXT:', merged.input.text.substring(merged.input.position, merged.input.position + 10))
      return merged
    }
  }
  // fail('unexpected input', input)
  return false
}

const parseWhitespace = (context) => {
  const { utils, input } = context
  const { whitespace, advanced } = utils
  const { position, text } = input
  const { length } = text
  if (!whitespace.includes(text[position])) {
    return false
  }
  for (let i = position + 1; i < length; i++) {
    if (!whitespace.includes(text[i])) {
      return parseNext({ ...context, ...advanced(context, i - position) })
    }
  }
  return { input: { ...input, position: text.length } }
}

const parseComment = (context) => {
  const { text, position } = context.input
  if (text[position] !== ';') {
    return false
  }
  const endOrEof = text.indexOf('\n', position)
  const end = endOrEof < 0 ? text.length : endOrEof
  return context.utils.advanced(context, end - position)
}

const numberChars = '0123456789.'
const numberStartChars = '0123456789'
const parseNumber = (context) => {
  const { text, position } = context.input
  if (!numberStartChars.includes(text[position])) {
    return false
  }
  const { length } = text
  let i = (position + 1)
  for (; i < length; i++) {
    if (!numberChars.includes(text[i])) break
  }
  const numberText = text.substring(position, i)
  const value = Number(numberText)
  return {
    ...context.utils.advanced(context, i - position),
    stack: {
      type: 'number',
      value,
    },
  }
}

const continueParsing = (context) => {
  let last = context
  while (true) {
    const result = parseNext(last)
    if (!result) return last
    last = result
  }
}

const defaultContext = {
  utils: {
    advanced: (context, length) => ({
      ...context,
      input: advanced(context.input, length),
    }),
    bof: Symbol('bof'),
    eof: Symbol('eof'),
    whitespace: '\n\r\v\t\b\f \xa0',
    operators: ['#('],
    parseNext,
    continueParsing,
  },
  parsers: [
    parseWhitespace,
    (context) => {
      const { input } = context
      const { text, position } = input
      if (text.substring(position, position + 2) !== '#(') {
        return false
      }
      return {
        ...context,
        utils: {
          ...context.utils,
          operators: [';', '.', '(', ')', '[', ']', '"'],
        },
        input: { ...input, position: position + 1 },
        parsers: [
          parseWhitespace,
          parseComment,
          parseNumber,
          parseString('"', 'string'),
          parsePrefix('spread', '...'),
          parseStraddle('dereference', '.'),
          parseLabel,
          parseList('(', ')', 'list'),
          parseList('[', ']', 'array'),
        ],
        stack: [],
        outputs: [],
      }
    },
  ],
  stack: [],
  outputs: [],
}

const parse = (inputText, context = defaultContext) => continueParsing({
  ...context,
  input: { text: inputText, position: 0, line: 1, offset: 0 },
})

const compile = (inputText, context) =>
  parse(inputText, context).outputs.map(({ text }) => text).join(';\n')

module.exports = {
  parse,
  compile,
}
