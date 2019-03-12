const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - args.length))
    : curry(fn, fn.length))

const setArrayValue = (input, key, value) =>
  input.length === key
    ? [...input, value]
    : input.length < key
      ? [...input, ...Array(key).fill(), value]
      : [...input.slice(0, key), value, ...input.slice(key + 1)]

const removeKey = (input, key) =>
  Object.entries(input)
    .filter(([inputKey]) => inputKey !== key)
    .reduce((result, [key, value]) => ({ ...result, [key]: value }), {})

const setObjectValue = (input, key, value) =>
  value === undefined
    ? removeKey(input, key)
    : { ...input, [key]: value }

const inputFor = (input, key) =>
  input || (typeof key === 'number' ? [] : {})

const isThennable = value =>
  value && value.then && (typeof value.then === 'function')

const awaitArgs = fn =>
  (...args) => 
    args.some(isThennable)
      ? Promise
        .all(args.map(arg => isThennable(arg) ? arg : Promise.resolve(arg)))
        .then(args => fn(...args))
      : fn(...args)

const setValue = awaitArgs((input, key, value) =>
  Array.isArray(input)
    ? setArrayValue(input, key, value)
    : setObjectValue(input, key, value))

const setValues = awaitArgs(([key, ...keys], value, input) =>
  setValue(
    inputFor(input, key),
    key,
    keys.length
      ? setValues(keys, value, input && input[key])
      : value
  ))

const normalizedPath = path =>
  Array.isArray(path)
    ? path
    : [path]

const set = awaitArgs((path, value, input) =>
  setValues(normalizedPath(path), value, input))

const setOn = (input, path, value) =>
  set(path, value, input)

module.exports = {
  set: curry(set),
  setOn: curry(setOn),
  setValue: curry(setValue),
  setObjectValue: curry(setObjectValue),
  setArrayValue: curry(setArrayValue),
}
