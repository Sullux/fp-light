const stringParser = (quote, type = 'string') => {
  const parseString = (nextParser) =>
    (input) => {
      const warnings = []
      const { position, text } = input
      if (text[position] !== quote) {
        return nextParser(input)
      }
      const quoteLength = quote.length
      const start = position + quoteLength
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
        if (c === quote) {
          parts.push(text.substring(lastStart, i))
          const value = parts.join('')
          const element = {
            ...input,
            offset: input.offset + (i - position) + quoteLength,
            elements: [
              ...input.elements,
              ...warnings,
              {
                type,
                value,
                input,
                length: value.length + (quoteLength * 2),
              },
            ],
          }
          return nextParser({
            ...input,
            elements: [...input.elements, element],
          })
        }
        if (c === '\\') {
          parts.push(text.substring(lastStart, i))
          const next = text[i + 1]
          if (next === 'u') {
            // todo
            warnings.push({
              type: 'warning',
              value: 'Unicode Basic Multilingual Plane chars not supported',
              input: { ...input, offset: i },
            })
            parts.push('\\')
            continue
            // Unicode Basic Multilingual Plane or entirety of Unicode
          }
          if (next === 'x') {
            // todo
            warnings.push({
              type: 'warning',
              value: 'Basic Latin and Latin-1 Supplement Block chars not supported',
              input: { ...input, offset: i },
            })
            parts.push('\\')
            continue
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
      warnings.push({
        type: 'warning',
        value: 'unexpected end of input',
        input: { ...input, offset: input.text.length },
      })
      const value = parts.join('')
      return {
        ...input,
        offset: input.text.length,
        elements: [
          ...input.elements,
          ...warnings,
          {
            type,
            value,
            input,
            length: value.length + quoteLength,
          },
        ],
      }
    }
  return parseString
}

module.exports = { stringParser }
