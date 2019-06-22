const { resolve } = require('./resolve')

const pipeWith = resolver =>
  (...steps) =>
    initialValue =>
      steps.reduce((value, step) => resolver(step, value), initialValue)

const pipe = pipeWith(resolve)

const syncPipe = pipeWith((step, value) => step(value))

module.exports = { pipe, pipeWith, syncPipe }
