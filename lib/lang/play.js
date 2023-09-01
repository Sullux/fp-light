const defaultStringBreaks = '"\'`'
const catchAll = Symbol('catchAll')

const defaultContext = {
  parent: null,
  source: '',
  parseStart: 0,
  parseNext: 0,
  startLine: 1,
  startOffset: 0,
  line: 1,
  offset: 0,
  parsed: [],
  maps: [],
  parseKeys: {},
  compiled: null,
  compileStack: {},
  warnings: [],
}

const maybeToken = ({
  source,
  parseStart,
  parseNext,
  startLine,
  startOffset,
  line,
  offset,
  parsed,
  maps,
}) => {
  if (parseStart === parseNext) {
    return {}
  }
  const map = {
    start: {
      char: parseStart,
      line: startLine,
      offset: startOffset,
    },
    end: {
      char: parseNext,
      line,
      offset,
    },
  }
  return {
    parsed: [...parsed, source.substring(parseStart, parseNext)],
    maps: [...maps, map],
  }
}

const startSequence = (context) => ({
  ...context,
  parent: context,
  parsed: [],
  compiled: null,
  parseKeys: {
    ...context.parseKeys,
    ')': endSequence,
  },
})

const endSequence = ({
  parent,
  parseNext,
  line,
  offset,
  parsed,
  maps,
}) => compile({
  ...parent,
  parseStart: parseNext,
  parseNext,
  startLine: line,
  startOffset: offset,
  line,
  offset,
  parsed: [...parent.parsed, parsed],
  maps: [...parent.maps, maps],
})

const whitespace = (context) => {
  const { parseNext, offset } = context
  const n = parseNext + 1
  const o = offset + 1
  return {
    ...maybeToken(context),
    parseStart: n,
    parseNext: n,
    startOffset: o,
    offset: o,
  }
}
const newLine = ({ line }) => {
  const newLine = line + 1
  return {
    startLine: newLine,
    startOffset: 0,
    line: newLine,
    offset: 0,
  }
}
const cr = (context) => ({
  ...whitespace(context),
  ...((context.source[context.parseNext + 1] === '/n')
    ? {}
    : newLine(context)),
})
const lf = (context) => ({
  ...whitespace(context),
  ...newLine(context),
})
defaultContext.parseKeys['('] = startSequence
defaultContext.parseKeys['\r'] = cr
defaultContext.parseKeys['\n'] = lf
for (const c of [...'\v\t\b\f \xa0']) {
  defaultContext.parseKeys[c] = whitespace
}

const parse = (initialContext) => {
  let context = initialContext
  while (context.parseNext < context.source.length) {
    const parseFunction =
      context.parseKeys[context.source[context.parseNext]] ||
        context.parseKeys[catchAll]
    context = {
      ...context,
      ...parseFunction(context),
    }
  }
}

const argsMatch = (args1, args2) => {
  // todo
}

const findInCompileStack = (context, name) =>
  context &&
    (context.compileStack[name] || findInCompileStack(context.parent, name))

const compile = (context) => {
  const { parsed, maps } = context
  const { start } = maps[0]
  const { end } = maps[maps.length - 1]
  const elements = parsed.map((arg) =>
    (typeof arg === 'string')
      ? { ref: findInCompileStack(context, arg) }
      : arg)
  elements.forEach((element) =>
    element?.ref?.refcount && (element.ref.refcount++))
  const [name, ...args] = elements
  const compiler = findInCompileStack(context.compileStack, name, args)
  if (!compiler) {
    const warning = {
      message: `token '${name} is not found in the current context`,
      location: maps[0],
    }
    return {
      ...context,
      warnings: [...context.warnings, warning],
      compiled: {
        start,
        end: maps[0].end,
        isDeterministic: false,
        refcount: 0,
        impl: [
          'ecma.statement.throw',
          ['ecma.construct', 'Error', warning.message],
        ],
      },
    }
  }
  compiler.refcount++
  return compiler(context, args)
}

const make = (source, sourceName) => {
  const context = {
    ...defaultContext,
    source,
    sourceName,
  }
  const result = parse(context)
  return result.compiled
}

const exec = (source, sourceName) => {
  //
}

module.exports = { make, exec }
