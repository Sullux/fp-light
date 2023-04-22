/* eslint no-new-func: 0 */
/* eslint no-unreachable-loop: 0 */

const defaultWhitespace = '\n\r\v\t\b\f \xa0'
const defaultStringBreaks = '"\'`'
const defaultBreakingCharacters = '~!@#%^&*()-=+[]\\{}|,./<>?:'

const parseWithMap = (context) => {
  let {
    text,
    offset = 0,
    line = 1,
    character = 0,
    whitespace = defaultWhitespace,
    stringBreaks = defaultStringBreaks,
    breakingCharacters = defaultBreakingCharacters,
  } = context
  const { length = text.length } = context
  // skip leading whitespace
  for (; offset < length; offset++, character++) {
    const c = text[offset]
    if (!whitespace.includes(c)) { break }
    if ((c === '\n') || ((c === '\r') && (text[offset + 1] !== '\n'))) {
      line++
      character = 0
    }
  }
  let position = { line, character, offset }
  const tokens = []
  const map = []
  let tokenStart
  let isBreak = false
  let inComment = false
  for (; offset < length; offset++, character++) {
    const c = text[offset]
    // check for comment
    if (inComment) {
      if ((c === '\n') || ((c === '\r') && (text[offset + 1] !== '\n'))) {
        line++
        character = 0
        tokens.push(text.substring(tokenStart.offset, offset - 1), '\n')
        map.push(tokenStart, { line, character, offset })
        tokenStart = false
        inComment = false
      }
      continue
    }
    if (c === ';') {
      if (tokenStart) {
        tokens.push(text.substring(tokenStart.offset, offset))
        map.push(tokenStart)
        tokenStart = false
        isBreak = false
      }
      tokens.push(';')
      map.push({ line, character, offset })
      tokenStart = { line, character: character + 1, offset: offset + 1 }
      inComment = true
      continue
    }
    // check for whitespace
    if (whitespace.includes(c)) {
      if (tokenStart) {
        tokens.push(text.substring(tokenStart.offset, offset))
        map.push(tokenStart)
        tokenStart = false
        isBreak = false
      }
      if ((c === '\n') || ((c === '\r') && (text[offset + 1] !== '\n'))) {
        line++
        character = 0
      }
      continue
    } // end whitespace
    // check for string
    if (stringBreaks.includes(c)) {
      if (tokenStart) {
        tokens.push(text.substring(tokenStart.offset, offset))
        map.push(tokenStart)
        tokenStart = false
        isBreak = false
      }
      const quote = c
      position = { line, character, offset }
      offset++
      character++
      const stringPosition = { line, character, offset }
      tokens.push(quote)
      map.push(position)
      const startOfString = offset
      for (; offset < length; offset++, character++) {
        const c = text[offset]
        if (c === '\\') {
          offset++
          character++
          continue
        }
        if (c === quote) {
          tokens.push(
            String(text.substring(startOfString, offset)),
            quote,
          )
          map.push(
            stringPosition,
            { line, character, offset },
          )
          break
        }
        if ((c === '\n') || ((c === '\r') && (text[offset + 1] !== '\n'))) {
          line++
          character = 0
        }
      }
      if (offset === length) {
        tokens.push(
          String(text.substring(startOfString, offset)),
        )
        map.push(
          stringPosition,
        )
      }
      continue
    } // end string
    // check for a breaking character
    if (breakingCharacters.includes(c)) {
      if (isBreak) continue
      if (tokenStart) {
        tokens.push(text.substring(tokenStart.offset, offset))
        map.push(tokenStart)
        tokenStart = false
      }
      tokenStart = { line, character, offset }
      isBreak = true
      continue
    } // end breaking character
    // check for start of token
    if (!tokenStart) {
      tokenStart = { line, character, offset }
      isBreak = false
      continue
    }
    // check for end of breaking sequence
    if (isBreak) {
      tokens.push(text.substring(tokenStart.offset, offset))
      map.push(tokenStart)
      tokenStart = { line, character, offset }
      isBreak = false
    }
  }
  if (tokenStart) {
    tokens.push(text.substring(tokenStart.offset, offset))
    map.push(tokenStart)
    tokenStart = false
  }
  return { ...context, tokens, map }
}

const parseWithoutMap = (context) => {
  let {
    text,
    offset = 0,
    whitespace = defaultWhitespace,
    stringBreaks = defaultStringBreaks,
    breakingCharacters = defaultBreakingCharacters,
  } = context
  const { length = text.length } = context
  // skip leading whitespace
  for (; offset < length; offset++) {
    const c = text[offset]
    if (!whitespace.includes(c)) { break }
  }
  const tokens = []
  let isInToken = false
  let tokenStart
  for (; offset < length; offset++) {
    const c = text[offset]
    // check for whitespace
    if (whitespace.includes(c)) {
      if (isInToken) {
        tokens.push(text.substring(tokenStart, offset))
        isInToken = false
      }
      continue
    } // end whitespace
    // check for string
    if (stringBreaks.includes(c)) {
      if (isInToken) {
        tokens.push(text.substring(tokenStart, offset))
        isInToken = false
      }
      const quote = c
      offset++
      tokens.push(quote)
      const startOfString = offset
      for (; offset < length; offset++) {
        const c = text[offset]
        if (c === '\\') {
          offset++
          continue
        }
        if (c === quote) {
          tokens.push(
            String(text.substring(startOfString, offset)),
            quote,
          )
          break
        }
      }
      if (offset === length) {
        tokens.push(
          String(text.substring(startOfString, offset)),
        )
      }
      continue
    } // end string
    // check for a breaking character
    if (breakingCharacters.includes(c)) {
      if (isInToken) {
        tokens.push(text.substring(tokenStart, offset))
        isInToken = false
      }
      tokens.push(c)
      continue
    } // end breaking character
    // check for start of token
    if (!isInToken) {
      isInToken = true
      tokenStart = offset
    }
  }
  if (isInToken) {
    tokens.push(text.substring(tokenStart, offset))
  }
  return { ...context, tokens }
}

const parse = (context) =>
  context.withMap
    ? parseWithMap(context)
    : parseWithoutMap(context)

module.exports = { parse }
