const parsePrefix = (type, operator) => {
  const parsePrefixSingleChar = (context) => {
    const { utils, input } = context
    const { text, position } = input
    if (text[position] !== operator) {
      return false
    }
    const { stack: [next], input: nextInput } = utils.parseNext({
      ...utils.advanced(context, 1),
      stack: [],
    })
    return {
      input: nextInput,
      stack: { type, value: next, input },
    }
  }

  const parsePrefixMultichar = (context) => {
    const { utils, input } = context
    const { text, position } = input
    for (let y = 0, { length } = operator; y < length; y++) {
      if (text[position + y] !== operator[y]) return false
    }
    const { stack: [next], input: nextInput } = utils.parseNext({
      ...utils.advanced(context, operator.length),
      stack: [],
    })
    return {
      input: nextInput,
      stack: { type, value: next, input },
    }
  }

  return operator.length === 1
    ? parsePrefixSingleChar
    : parsePrefixMultichar
}

module.exports = { parsePrefix }
