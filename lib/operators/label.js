const { fail } = require('../fail')
const {
  compileTypes: {
    Label,
    Scope,
    Sequence,
    Entry,
  },
} = require('../types')

const validLabelTypes = [
  Label,
  Scope,
  Sequence,
]

const parse = (state) => {
  const label = state.stack.pop
  const { type: labelType } = label
  if (!validLabelTypes.includes(labelType)) {
    fail('expected label, scope or sequence', state.source)
  }
  const value = state.parseNext(state, label.length)
  return {
    value: { label, value },
    length: value.length,
    type: Entry,
  }
}

module.exports = {
  precedence: 20,
  parse,
}
