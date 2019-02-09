const isThennable = value =>
  value && value.then && (typeof value.then === 'function')

const pipe = (...steps) => initialValue =>
  steps.reduce((value, step) => (step
    ? isThennable(value)
      ? value.then(step)
      : step(value)
    : value), initialValue)

module.exports = { pipe }
