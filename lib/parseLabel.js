const parseLabel = (context) => {
  const { whitespace, operators, advanced } = context.utils
  const { position, text } = context.input
  const type = 'label'
  for (let i = position, l = text.length; i < l; i++) {
    if (whitespace.includes(text[i])) {
      if (i === position) return false
      return {
        ...advanced(context, i - position),
        stack: { type, value: text.substring(position, i) },
      }
    }
    for (const operator of operators) {
      if (text.substring(i, i + operator.length) === operator) {
        if (i === position) return false
        return {
          ...advanced(context, i - position),
          stack: { type, value: text.substring(position, i) },
        }
      }
    }
  }
  return { type, value: text.substring(position), length: text.length - position }
}

module.exports = { parseLabel }
