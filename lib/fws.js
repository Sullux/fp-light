const { stringLiteral } = require('./literals/stringLiteral')
const { labelLiteral } = require('./literals/labelLiteral')
const { commentLiteral } = require('./literals/commentLiteral')
const { jsTypes, compileTypes } = require('./types')

const createContext = (context) => ({
  ...context,
  advance: advance(context),
  push: push(context),
  pop: pop(context),
  createContext: (newContext) => createContext({ ...context, ...newContext }),
})

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
  }
}

const advance = (context) =>
  (length) => createContext({
    ...context,
    ...advanced(context, length),
  })

const push = (
  { stack, ...context },
  length = 0,
) =>
  (element) => {
    // todo: add parser/pragma/operator/etc.
    return createContext({
      ...context,
      stack: [element, ...stack],
      ...(length ? advanced(context, length) : {}),
    })
  }

const pop = ({ stack, ...context }) =>
  () => createContext({
    ...context,
    stack: stack.slice(1),
  })

const defaultContext = createContext({
  file: 'fws',
  line: 0,
  offset: 0,
  position: 0,
  whitespace: '\n\r\v\t\b\f \xa0',
  scope: {
    js: jsTypes,
    compile: compileTypes,
  },
  scopes: [],
  parsers: {
    string: stringLiteral("'", compileTypes.String),
    block: stringLiteral('`', compileTypes.Block),
    number: () => {},
    label: labelLiteral,
    comment: commentLiteral,
  },
  operators: {
    '@': { precedence: 10 },
    '#': require('./operators/pragma'),
    '.': { precedence: 30 },
    '...': { precedence: 40 },
    ':': { precedence: 50 },
    '{': { precedence: 1000 },
    '}': { precedence: 1000 },
    '[': { precedence: 1000 },
    ']': { precedence: 1000 },
    '(': { precedence: 1000 },
    ')': { precedence: 1000 },
  },
  pragmas: {
    def: {
      compile: () => {},
    },
  },
  stack: [],
})

const parseNext = (state, skip = 0) => {
  const { text, source, context } = state
  const trueSource = skip
    ? { ...source, position: source.position + skip }
    : source
  // todo
}

const parse = (text, source, context = defaultContext) => {
  const stack = []
}

const compile = () => {}

const run = () => {}

module.exports = {
  defaultContext,
  parse,
  parseNext,
  compile,
  run,
}
