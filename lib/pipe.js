const { resolve } = require('./resolve')

const pipeUsing = resolver =>
  (...steps) =>
    initialValue =>
      steps.reduce((value, step) => resolver(step, value), initialValue)

const pipe = pipeUsing(resolve)

const piping =
  (...steps) => pipe(...steps)()

const syncPipe = pipeUsing((step, value) => step(value))

module.exports = {
  _: pipe,
  pipe,
  piping,
  pipeUsing,
  syncPipe,
}
