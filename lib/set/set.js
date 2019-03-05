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

const setValue = (input, key, value) =>
  Array.isArray(input)
    ? setArrayValue(input, key, value)
    : setObjectValue(input, key, value)

const setValues = ([key, ...keys], value, input) =>
  setValue(
    inputFor(input, key),
    key,
    keys.length
      ? setValues(keys, value, input && input[key])
      : value
  )

const set = (path, value, input) =>
  setValues(Array.isArray(path) ? path : [path], value, input)

module.exports = {
  set: curry(set),
  setValue: curry(setValue),
  setObjectValue: curry(setObjectValue),
  setArrayValue: curry(setArrayValue),
}
