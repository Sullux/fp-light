const isThennable = value =>
  value && value.then && (typeof value.then === 'function')

const trapAsync = promise =>
  promise.then(result => ([undefined, result]), err => ([err]))

const trap = (critical) => {
  if (isThennable(critical)) {
    return trapAsync(critical)
  }
  return (...args) => {
    try {
      const result = critical(...args)
      return isThennable(result)
        ? trapAsync(result)
        : [undefined, result]
    } catch (err) {
      return [err]
    }
  }
}

module.exports = {
  trap,
}
