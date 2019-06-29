const { resolve } = require('./resolve')

const pipeUsing = resolver =>
  (...steps) =>
    initialValue =>
      steps.reduce((value, step) => resolver(step)(value), initialValue)

const pipe = pipeUsing(resolve)

const piping =
  (...steps) => pipe(...steps)()

const syncPipe = pipeUsing((step, value) => step(value))

const compose = (...steps) =>
  pipe(steps.reverse())

module.exports = {
  _: pipe,
  compose,
  pipe,
  piping,
  pipeUsing,
  syncPipe,
}
