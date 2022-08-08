const { stringLiteral } = require('./literals/stringLiteral')
const { labelLiteral } = require('./literals/labelLiteral')
const { commentLiteral } = require('./literals/commentLiteral')
const { jsTypes, compileTypes } = require('./types')

const defaultSource = {
  file: 'fws',
  line: 0,
  offset: 0,
  position: 0,
}

const createContext = (context) => ({
  ...context,
  advance: advance(context),
  addParser: addParser(context),
  addOperator: addOperator(context),
  addPragma: addPragma(context),
  push: push(context),
  pop: pop(context),
  pushScope: pushScope(context),
  popScope: popScope(context),
  addToScope: addToScope(context),
  createContext: (newContext) => createContext({ ...context, ...newContext }),
})

const advance = ({ source, ...context }) =>
  (length) => createContext({
    ...context,
    source: { ...source, position: source.position + length },
  })

const addParser = ({ parsers, ...context }) =>
  (parser) => createContext({
    ...context,
    parsers: { ...parsers, ...parser },
  })

const addOperator = ({ operators, ...context }) =>
  (operator) => createContext({
    ...context,
    operators: { ...operators, ...operator },
  })

const addPragma = ({ pragmas, ...context }) =>
  (pragma) => createContext({
    ...context,
    pragmas: { ...pragmas, ...pragma },
  })

const push = ({ stack, element: previous, ...context }) =>
  (element) => createContext({
    ...context,
    element,
    stack: [...stack, previous],
  })

const pop = ({ stack, ...context }) =>
  () => createContext({
    ...context,
    element: stack[stack.length - 1],
    stack: stack.slice(0, -1),
  })

const pushScope = (context) =>
  () => ({
    ...context,
    popScope: (exports) => ({
      ...context,
      exports, // TODO: hammer out the details of pushing scope
    }),
  })

const popScope = ({ scopes, ...context }) =>
  () => createContext({
    ...context,
    scope: scopes[scopes.length - 1],
    scopes: scopes.slice(0, -1),
  })

const addToScope = ({ scope, ...context }) =>
  (key, value) => createContext({
    ...context,
    scope: { ...scope, [key]: value },
  })

const defaultContext = createContext({
  source: defaultSource,
  whitespace: '\n\r\v\t\b\f ',
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
