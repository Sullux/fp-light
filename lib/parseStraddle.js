const parseStraddle = (type, operator) => {
  const parseStraddleSingleChar = (context) => {
    const { utils, stack, input } = context
    const { text, position } = input
    if (text[position] !== operator) {
      return false
    }
    const { stack: [next], input: nextInput } = utils.parseNext({
      ...utils.advanced(context, 1),
      stack: [],
    })
    const element = { type, value: [stack[stack.length - 1], next], input }
    return {
      input: nextInput,
      stack: [...stack.slice(0, -1), element],
    }
  }

  const parseStraddleMultichar = (context) => {
    const { utils, stack, input } = context
    const { text, position } = input
    for (let y = 0, { length } = operator; y < length; y++) {
      if (text[position + y] !== operator[y]) return false
    }
    const { stack: [next], input: nextInput } = utils.parseNext({
      ...utils.advanced(context, operator.length),
      stack: [],
    })
    const element = { type, value: [stack[stack.length - 1], next], input }
    return {
      input: nextInput,
      stack: [...stack.slice(0, -1), element],
    }
  }

  return operator.length === 1
    ? parseStraddleSingleChar
    : parseStraddleMultichar
}

module.exports = { parseStraddle }
