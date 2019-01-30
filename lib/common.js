const isThennable = value =>
  value && value.then && (typeof value.then === 'function')

const isDate = value =>
  value instanceof Date

const isFunction = value =>
  typeof value === 'function'

const isNumber = value =>
  typeof value === 'number'

const isType = type => value =>
  value instanceof type

const isError = isType(Error)

const isArray = value =>
  Array.isArray(value)

const isObject = value =>
  typeof value === 'object' && !isDate(value) && !isArray(value) && value !== null

const isBoolean = value =>
  typeof value === 'boolean'

const typeName = (value) => {
  const name = typeof value
  return name !== 'object'
    ? name
    : isDate(value)
      ? 'date'
      : isArray(value)
        ? 'array'
        : value === null
          ? 'null'
          : isError(value)
            ? 'error'
            : name
}

const isMissing = value =>
  value === undefined || value === null

const flatten = values =>
  values.reduce((flattened, value) =>
    (Array.isArray(value)
      ? flattened.concat(flatten(value))
      : flattened.concat([value])), [])

const promisify = impl => (...args) =>
  new Promise((resolve, reject) =>
    impl(...args, (err, result) => (err ? reject(err) : resolve(result))))

const delay = ms =>
  new Promise(resolve => setTimeout(ms, resolve))

module.exports = {
  isThennable,
  isDate,
  isFunction,
  isNumber,
  isObject,
  isType,
  isError,
  isArray,
  isBoolean,
  typeName,
  isMissing,
  flatten,
  promisify,
  delay,
}
