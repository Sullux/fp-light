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

const setMapValue = (input, key, value) =>
  new Map([...input, [key, value]])

const inputFor = (input, key) =>
  input || (typeof key === 'number' ? [] : {})

const setValue = (input, key, value) =>
  Array.isArray(input)
    ? setArrayValue(input, key, value)
    : input instanceof Map
      ? setMapValue(input, key, value)
      : setObjectValue(input, key, value)

const setValues = ([key, ...keys], value, input) =>
  setValue(
    inputFor(input, key),
    key,
    keys.length
      ? setValues(keys, value, input && input[key])
      : value
  )

const pathPart = (part) => {
  const number = parseInt(part, 10)
  return isNaN(number) ? part : number
}

const pathFrom = path =>
  Array.isArray(path)
    ? path
    : Number.isInteger(path)
      ? [path]
      : path.split('.').map(pathPart)

const set = value => {
  const values = Array.isArray(value)
    ? [[pathFrom(value[0]), value[1]]]
    : Object.entries(value).map(([key, value]) => ([pathFrom(key), value]))
  return input =>
    values.reduce(
      (target, [path, value]) => setValues(path, value, target),
      input,
    )
}

const setOn = input =>
  value =>
    set(value)(input)

module.exports = {
  set,
  setOn,
}
