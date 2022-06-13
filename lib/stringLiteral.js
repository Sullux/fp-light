const fail = (message, source) => {
  const error = new Error(message)
  error.source = source
  throw error
}

const stringLiteral = (text, { position }) => {
  if (text[position] !== "'") {
    return false
  }
  const start = position + 1
  const escapes = {
    '\n': '', // for line continuation
    0: '\0',
    n: '\n',
    r: '\r',
    v: '\v',
    t: '\t',
    b: '\b',
    f: '\f',
  }
  const parts = []
  let lastStart = start
  for (let i = start, l = text.length; i < l; i++) {
    const c = text[i]
    if (c === "'") {
      parts.push(text.substring(lastStart, i))
      return { value: parts.join(''), length: i - position }
    }
    if (c === '\\') {
      parts.push(text.substring(lastStart, i))
      const next = text[i + 1]
      if (next === 'u') {
        // todo
        fail('not implemented', { position })
        // Unicode Basic Multilingual Plane or entirety of Unicode
      }
      if (next === 'x') {
        // todo
        fail('not implemented', { position })
        // Basic Latin and Latin-1 Supplement blocks
      }
      const escape = escapes[next]
      i += 1
      lastStart = i + 1
      if (!escape) {
        parts.push(next)
        continue
      }
      parts.push(escape)
    }
  }
  fail('unexpected end of input', { position })
  // { value, length }
}

module.exports = { stringLiteral }
