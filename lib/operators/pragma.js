const { fail } = require('../fail')
const { type: getType } = require('../type')

const { is: isLabel } = getType('Label')
const type = getType('Pragma')

const parse = (state) => {
  const parseNext = state.parseNext
  const label = parseNext(state)
  if (!isLabel(label.type)) {
    fail('expected label', state.source)
  }
  const argument = parseNext(state, label.length)
  const pragma = state.pragmas[label.value]
  return {
    value: { label: label.value, pragma, argument },
    length: label.length + argument.length,
    type,
  }
}

module.exports = {
  precedence: 20,
  parse,
}
