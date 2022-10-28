const { fail } = require('./fail')

const parseList = (open, close, type) => {
  const parseClose = (context) => {
    const parseListClose = (c) => {
      const { input } = c
      const { text, position } = input
      if (text.indexOf(close, position) !== position) {
        return false
      }
      const result = {
        ...context.utils.advanced(context, (c.input.position + close.length) - context.input.position),
        stack: [...context.stack, { type, value: c.stack }],
      }
      return result
    }
    return parseListClose
  }

  const parseListOpen = (context) => {
    const { input } = context
    const { text, position } = input
    if (text.indexOf(open, position) !== position) {
      return false
    }
    const closeParser = parseClose(context)
    const c = {
      ...context,
      input: { ...input, position: position + open.length },
      parsers: [closeParser, ...context.parsers],
      stack: [],
    }
    return c
  }
  return parseListOpen
}

module.exports = { parseList }
