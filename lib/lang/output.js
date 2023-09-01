const outputValue = ({ name, value }, level, indent, maxWidth, maxAcross) => {

}

const outputList = (values, level, indent, maxWidth, maxAcross) => {
  const parts = values.map((value) => outputValue(value, level, indent, maxWidth, maxAcross))
  const spaces = ' '.repeat(indent * level)
  const newline = `${spaces}\n`
  const hasTooManyValues = values.length > maxAcross
  if (hasTooManyValues || values.some((value) => value.includes('\n'))) {
    return `${spaces}${parts.join(newline)}\n`
  }
  const singleLine = `${spaces}${parts.join(' ')}`
  return singleLine.length > maxWidth
    ? `${spaces}${parts.join(newline)}\n`
    : newline
}

const formatOutputs = () => {} // todo

const output = (context) => {
  const {
    values,
    map,
    format: { indent = 6, maxWidth = 80, maxAcross = 3 } = {},
  } = context
  const startingLevel =
    Math.ceil(map[values[0].map].position.character / indent)
  const outputs = values.map((v) =>
    outputValue(v, startingLevel, indent, maxWidth, maxAcross))
  return formatOutputs(outputs)
}

module.exports = { output }
