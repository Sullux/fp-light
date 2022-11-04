const matchesPosition = (operator, text) =>
  (position) => {
    for (let y = 0, { length } = operator; y < length; y++) {
      if (text[position + y] !== operator[y]) return false
    }
    return true
  }

const matchesChar = (operator, text) =>
  (position) => text[position] === operator

const parseLabel = (context) => {
  const { utils, input } = context
  const { whitespace, operators, advanced } = utils
  const { position, text } = input
  const type = 'label'
  const operatorTests = operators.map((operator) =>
    operator.length === 1
      ? matchesChar(operator, text)
      : matchesPosition(operator, text))
  const matchesAnyOperator = (position) =>
    operatorTests.some((test) => test(position))
  for (let i = position, l = text.length; i < l; i++) {
    if (whitespace.includes(text[i]) || matchesAnyOperator(i)) {
      if (i === position) return false
      return {
        ...advanced(context, i - position),
        stack: { type, value: text.substring(position, i), input },
      }
    }
  }
  return {
    ...advanced(context, text.length - position),
    stack: { type, value: text.substring(position), input },
  }
}

module.exports = { parseLabel }
