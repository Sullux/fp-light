const lineInfo = ({ i, code }) => {
  let o = -1
  let line = 1
  let lastNewline = -1
  for (;;) {
    o = code.indexOf('\n', o + 1)
    if (o < 0 || o > i) {
      break
    }
    lastNewline = o
    line++
  }
  return {
    line,
    offset: i - lastNewline,
  }
}

const stackName = ({ stack }) => {
  const last = stack.length - 1
  const pad = '  '.repeat(last)
  const current = `${pad}${stack[last].substring(0, 40)}`
  return current
}

const printableName = (name, { stack }) => {
  const pad = '  '.repeat(stack.length)
  const printable = `${pad}${name}`
  return printable
}

export function Syntax (name, compiler) {
  const identifier = Symbol(name)
  const is = ({ identifier: test }) => test === identifier
  const parse = (code, options = {}) => {
    const syntax = {
      identifier,
      name,
      is,
    }
    const context = {
      i: 0,
      options,
      code,
      stack: [name],
    }
    const result = compiler.parse(context)
    if (!result) {
      const { line, offset } = lineInfo(context)
      const message =
        `${name} failed to parse at ${line}:${offset}`
      const error = new Error(message)
      error.context = {
        ...context,
        line,
        offset,
      }
      throw error
    }
    const { value } = result
    return { ...syntax, value }
  }
  const compileFromSource = (code, options) =>
    parse(code, options).value.compile({})
  const invokeFromSource = (code, options) =>
    parse(code, options).value.invoke({})
  return {
    name,
    identifier,
    parse,
    compileFromSource,
    invokeFromSource,
    is,
  }
}

// compile with any one of the given compilers
export function Any (...compilers) {
  const identifier = Symbol('Any')
  const name = `Any [${compilers.map(({ name }) => name).join(', ')}]`
  const is = ({ identifier: test }) => test === identifier
  const element = {
    identifier,
    name,
    is,
  }
  return {
    ...element,
    parse: (context) => {
      for (const compiler of compilers) {
        const result = compiler.parse(context)
        if (result) return result
      }
      throw new Error(`Expected ${name}`)
    },
  }
}

// compile with each of the given compilers in any order
export function Every (...compilers) {
  const name = `Every [${compilers.map(({ name }) => name).join(', ')}]`
  let remaining = [...compilers]
  const parse = (context) => {
    let nextContext = context
    const values = []
    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i]
      const result = next.parse(nextContext)
      if (result) {
        remaining = [...remaining.slice(0, i), ...remaining.slice(i + 1)]
        i = -1
        nextContext = result.context
        const { value } = result
        if (value) {
          values.push(value)
        }
      }
    }
    if (remaining.length) {
      throw new Error(`Expected ${name}`)
    }
    return { context: nextContext, value: values }
  }
  return Element({ name, flat: true }, parse)
}

// compile with each of the given compilers in their defined order
export function Each (...compilers) {
  const name = `Each [${compilers.map(({ name }) => name).join(', ')}]`
  const parse = (context) => {
    context.stack.push(name)
    const value = []
    let nextContext = context
    for (let i = 0, l = compilers.length; i < l; i++) {
      const result = compilers[i].parse(nextContext)
      if (!result) {
        context.stack.pop()
        return result
      }
      nextContext = result.context
      value.push(result.value)
    }
    context.stack.pop()
    return { value, context: nextContext }
  }
  return Element({ name, flat: true }, parse)
}

// compile with min-to-max instances of the given compiler
export function Some (compiler, min = 0, max = 0) {
  const countText = max < 1
    ? `${min}-∞`
    : min === max ? `x${min}` : `${min}-${max}`
  const name = `Some of ${compiler.name} (${countText})`
  const parse = (context) => {
    context.stack.push(name)
    let count = 0
    const assertMin = () => {
      if (count < min) {
        throw new Error(`expected at least ${min} instances of ${compiler.name}`)
      }
    }
    const assertMax = () => {
      if ((max > 0) && (count > max)) {
        throw new Error(`expected at most ${max} instances of ${compiler.name}`)
      }
    }
    const elements = []
    let lastContext = context
    let result = compiler.parse(context)
    while (result) {
      count += 1
      assertMax()
      const { value } = result
      if (value) elements.push(value)
      lastContext = result.context
      result = compiler.parse(lastContext)
    }
    assertMin()
    context.stack.pop()
    return {
      context: lastContext,
      value: elements,
    }
  }
  return Element({ name, flat: true }, parse)
}
Some.known = {}

export function Maybe (compiler) {
  return Some(compiler, 0, 1)
}

export function Element (options, parse) {
  const optionObj = typeof options === 'string' ? { name: options } : options
  const { name, flat } = optionObj
  const identifier = Symbol(name)
  const is = ({ identifier: test }) => test === identifier
  return {
    identifier,
    ...optionObj,
    is,
    parse: (context) => {
      const result = parse(context)
      if (!result) {
        return result
      }
      const start = context.i
      const length = result.context.i - start
      const flatValue = Array.isArray(result.value)
        ? result.value.flat(999)
        : result.value
      const value = flat
        ? flatValue
        : {
            start,
            length,
            identifier,
            name,
            is,
            flatValue,
          }
      return {
        context: result.context,
        value,
      }
    },
  }
}
Element.char = (char) => Element(
  char,
  (context) => {
    const { code, i } = context
    return (code[i] === char) &&
      { context: { ...context, i: i + 1 }, value: char }
  },
)
const whitespaceChars = ' \0\b\f\n\r\t\v'
Element.whitespace = Element(
  'whitespace',
  (context) => {
    let { code, i } = context
    if (!whitespaceChars.includes(code[i])) {
      return null
    }
    const start = i
    i += 1
    for (let l = code.length; i < l; i++) {
      if (!whitespaceChars.includes(code[i])) {
        break
      }
    }
    return {
      context: { ...context, i },
      value: code.substring(start, i),
    }
  },
)

export function Expression (name, element, invoke, compile) {
  const identifier = Symbol(name)
  const is = ({ identifier: test }) => test === identifier
  return {
    identifier,
    name,
    is,
    parse: (context) => {
      const result = element.parse(context)
      if (!result || !result.value) {
        return result
      }
      const { value } = result
      return {
        context: result.context,
        value: {
          identifier,
          name,
          is,
          invoke: (invokeContext) => invoke(invokeContext, value),
          compile: (compileContext = {}) => compile(compileContext, value),
          value,
        },
      }
    },
  }
}
