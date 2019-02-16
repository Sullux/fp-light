const bindIfFunction = (obj, fn) =>
  (typeof fn === 'function'
    ? fn.bind(obj)
    : fn)

const get = (...names) =>
  source =>
    names.reduce(
      (value, name) => bindIfFunction(value, value[name]),
      source
    )

module.exports = {
  get,
}
