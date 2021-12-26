import { isAsync, override } from './index.js'

export const toStream = () => { }

export const streamToArray = () => { }

export const stream = (...streamables) => {
  if (!streamables.length) {
    throw new Error('The `stream` function must be called with at least one argument.')
  }
  [toStream, ...streamables].reduce((prev, current) =>
    prev
      ? prev.stream(current)
      : current)
  return chain
    ? function stream(input) {
      return streamToArray(toStream(input).stream(chain))
    }
    : function stream(input) {
      return streamToArray(toStream(input))
    }
}

export const streamable = handler =>
  override({
    apply: stream(handler),
    properties: {
      stream: function streamTo(output) {
        return streamable(function streaming(data) {
          handler(data, output)
        })
      },
    },
  }, handler)

export const map = mapper => {
  let state
  return streamable(function mapStream({ value, done }, next) {
    if (done) {
      return next({ done })
    }
    if (isAsync(state)) {
      return state.then(() => {
        const result = mapper(value)
        return isAsync(result)
          ? result.then(finalResult => next({ state: result, value: result }))
          : next({ state, value: result })
      })
    }
    if (isAsync(value)) {
      //
    }
  })
}
