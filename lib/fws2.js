
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

const parseNext = (context) => {
  // todo
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
    operators: ['#', ';'],
  },
  parsers: [], // todo: #compiler
  stack: [],
  outputs: [],
}

const parse = (inputText, context = defaultContext) => parseNext({
  ...context,
  input: { text: inputText, position: 0, line: 1, offset: 0 },
})

const compile = (inputText, context) =>
  parse(inputText, context).outputs.map(({ text }) => text).join(';\n')

module.exports = {
  parse,
  compile,
}
