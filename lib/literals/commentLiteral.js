const fail = (message, source) => {
  const error = new Error(message)
  error.source = source
  throw error
}

const commentLiteral = (text, source) => {
  const { position } = source
  if ((text[position]) !== ';') {
    return false
  }
  if ((text[position + 1]) === '=') {
    // multiline
    const start = position + 2
    const end = text.indexOf('=;', start) - 2
    if (end < 0) {
      fail('unexpected end of input', source)
    }
    return end < 0
      ? fail('unexpected end of input', source)
      : { comment: text.substring(start, end + 2), length: end - position + 5 }
  }
  // single line
  const start = position + 1
  const end = text.indexOf('\n', start)
  return { comment: text.substring(start, end), length: end - position + 1 }
}

module.exports = { commentLiteral }
