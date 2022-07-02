const { stringLiteral } = require('./stringLiteral')
const { compileTypes: { Label: type } } = require('../types')

const quotedLiteral = stringLiteral('"', type)
const whitespace = '\n\r\v\t\b\f '

const labelLiteral = (text, source, context) => {
  const quoted = quotedLiteral(text, source)
  if (quoted) {
    return quoted
  }
  const { position } = source
  if (whitespace.includes(text[position])) {
    return false
  }
  const { operators } = context
  const operatorStrings = Object.keys(operators)
  for (let i = position + 1, l = text.length; i < l; i++) {
    if (whitespace.includes(text[i])) {
      return { type, value: text.substring(position, i), length: i - position }
    }
    for (const operator of operatorStrings) {
      if (text.substring(i, i + operator.length) === operator) {
        return { type, value: text.substring(position, i), length: i - position }
      }
    }
  }
  return { type, value: text.substring(position), length: text.length - position }
}

module.exports = { labelLiteral }
