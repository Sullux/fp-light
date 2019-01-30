const { pipe } = require('./pipe')
const { isArray, isObject } = require('./common')

const freezeArray = freeze => (array) => {
  Object.freeze(array)
  array.forEach(freeze)
}

const freezeObject = freeze => (obj) => {
  Object.freeze(obj)
  Object.keys(obj).map(key => freeze(obj[key]))
  return obj
}

const freeze = any =>
  (any
    ? isArray(any)
      ? freezeArray(freeze)(any)
      : isObject(any)
        ? freezeObject(freeze)(any)
        : any
    : any)

const object = (...args) =>
  args
    .filter(arg => arg && (typeof arg === 'object'))
    .reduce((obj, current) => {
      Object.keys(current)
        .forEach(pipe(
          key =>
            ({ key, value: current[key], existing: obj[key] }),
          ({ key, value, existing }) =>
            (!value || typeof value !== 'object'
              ? obj[key] = value
              : Array.isArray(value)
                ? obj[key] = Array.isArray(existing)
                  ? existing.concat(value)
                  : value
                : obj[key] = object(existing, value))
        ))
      return freezeObject(freeze)(obj)
    }, {})

module.exports = {
  object,
  freeze,
}
