const flatten = values =>
  values.reduce((flattened, value) =>
    (Array.isArray(value)
      ? flattened.concat(flatten(value))
      : flattened.concat([value])), [])

const isThennable = value =>
  value && value.then && (typeof value.then === 'function')

const composeFunctions = (...steps) => initialValue =>
  flatten(steps).reverse().reduce((value, step) => (step
    ? isThennable(value)
      ? value.then(step)
      : step(value)
    : value), initialValue)

const allEntries = objects =>
  objects.reduce(
    (entries, object) => [...entries, ...Object.entries(object)],
    []
  )

const isObject = value =>
  value
    && typeof value === 'object'
    && !(value instanceof Date)
    && !(value[Symbol.iterator])

let composeObjects

const addKeyValue = (result, key, existingValue, newValue) =>
  (isObject(existingValue) && isObject(newValue)
    ? { ...result, [key]: composeObjects(existingValue, newValue) }
    : { ...result, [key]: newValue })

const groupByKey = entries =>
  entries.reduce(
    (result, [key, value]) => addKeyValue(result, key, result[key], value),
    {}
  )

composeObjects = (...objects) =>
  Object.freeze(groupByKey(allEntries(objects)))

const compose = (...args) =>
  (typeof args[0] === 'function'
    ? composeFunctions(...args)
    : composeObjects(...args))

module.exports = Object.freeze({
  compose,
  composeFunctions,
  composeObjects,
})
