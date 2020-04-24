export const tap = fn =>
  arg => {
    const result = fn(arg)
    return (result && result.then && (typeof result.then === 'function'))
      ? result.then(() => arg)
      : arg
  }

export {
  tap as aside,
  tap as dispatch,
}
