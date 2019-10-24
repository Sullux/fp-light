const { inspect, isDeepStrictEqual } = require('util')

const isThennable = value =>
  value && value.then && (typeof value.then === 'function')

function Undefined () { return undefined }
function Null () { return null }

const undefinedInstance = new Undefined()
const nullInstance = new Null()

const safeObject = object =>
  (object === undefined
    ? undefinedInstance
    : object === null
      ? nullInstance
      : object)

const prototypeChainIterable = function* (prototype) {
  if (!prototype) {
    return
  }
  yield prototype
  yield* prototypeChainIterable(Object.getPrototypeOf(prototype))
}

const prototypeChain = object =>
  [...prototypeChainIterable(Object.getPrototypeOf(safeObject(object)))]

const factoryOf = object =>
  safeObject(object).constructor

const factoryChainWithoutObject = factoryChain =>
  factoryChain.length > 1
    ? factoryChain.slice(0, factoryChain.length - 1)
    : factoryChain

const nameFromFactoryChain = factoryChain =>
  factoryChainWithoutObject(factoryChain)
    .reverse()
    .map(({ name }) => name)
    .join('→')

const validateType = expected =>
  actual => {
    const factoryChain = prototypeChain(actual).map(factoryOf)
    return factoryChain.includes(expected)
      ? []
      : [{
        expected: expected.name,
        actual: nameFromFactoryChain(factoryChain),
      }]
  }

const validateExactType = expected =>
  actual =>
    factoryOf(actual) === expected
      ? []
      : [{
        expected: expected.name,
        actual: factoryOf(actual).name
      }]

const defaultValidators = [
  String,
  Boolean,
  Date,
  RegExp,
  Object,
  Array,
  Map,
  Set,
  Null,
  Undefined,
  Number,
  Promise,
  Error,
].reduce(
  (validators, type) => ({
    ...validators,
    [type.name]: validateExactType(type),
    [`~${type.name}`]: validateType(type),
  }),
  {},
)

const validatorForObject = (validators, type) => {
  // todo
}

const validatorForArray = (validators, type) => {
  // todo
}

const validatorForString = (validators, type) => {
  // todo
}

const typesToValidators = lib => {
  const libTypes = Object.keys(lib)
    .filter(fn =>
      (typeof lib[fn] === 'function') && (fn[0].toUpperCase() === fn[0]))
    .reduce(
      (validators, type) => ({
        ...validators,
        [type]: validateExactType(lib[type]),
        [`~${type}`]: validateType(lib[type]),
      }),
      defaultValidators,
    )
  return types =>
    Object.entries(types)
      .reduce(
        (validators, type) => ({
          ...validators,
          [type]: Array.isArray(type)
            ? validatorForArray(validators, type)
            : type.constructor === Object
              ? validatorForObject(validators, type)
              : validatorForString(validators, type)
        }),
        libTypes
      )
}

const pretty = value =>
  inspect(value, { colors: true, depth: 16 })

const areErrorsEqual = (e1, e2) =>
  (e1.code && (e1.code === e2.code)) ||
    e1.message === e2.message

const errorFromObject = ({ message, ...rest }) => {
  const error = new Error(message)
  Object.entries(rest)
    .map(([key, value]) =>
      Object.defineProperty(error, key, { enumerable: true, value }))
  return error
}

const testSpec = async ({ fn, context, test }) => {

  const references = {
    '$resolve': value => Promise.resolve(value),
    '$reject': value => Promise.reject(errorFromObject(value)),
    '$Error': errorFromObject,
    '$Map': value => new Map(value),
    '$Set': value => new Set(value),
    '$Date': value => new Date(value),
  }

  const resolveValue = (value) => {
    if (Array.isArray(value)) {
      return value.map(resolveValue)
    }
    if (value && value.constructor === Object) {
      const entries = Object.entries(value)
      const [key, ref] = entries[0] || ['']
      if (key.startsWith('$')) {
        return key === '$'
          ? resolveValue(context[ref])
          : references[key](resolveValue(ref))
      }
    }
    return value
  }

  const resolve = (key) => {
    if (!(key in context)) {
      throw new Error(`Could not find ${pretty(key)} in context: ${pretty(context)}`)
    }
    return resolveValue(context[key])
  }

  const resolveArgument = (argument) => {
    if (argument === 'true') {
      return true
    }
    if (argument === 'false') {
      return false
    }
    if (argument === 'NaN') {
      return NaN
    }
    const number = Number(argument)
    if (!isNaN(number)) {
      return number
    }
    return resolve(argument)
  }

  const call = async (impl, text) => {
    const index = text.indexOf('=>')
    const args = text.substring(0, index)
      .split(',')
      .map(arg => arg.trim())
      .map(arg => arg ? resolveArgument(arg) : undefined)
    const resultText = text.substring(index + 2).trim()
    let actual
    try {
      actual = impl(...args)
    } catch(err) {
      actual = { '!': { code: err.code, message: err.message } }
    }
    if (resultText && resultText.includes('=>')) {
      return call(actual, resultText)
    }
    const expected = resultText
      ? resultText.startsWith('!')
        ? { '!': resolve(resultText.substring(1)) }
        : resolveArgument(resultText)
      : undefined
    const awaitedValue = async value => {
      try {
        return await value
      } catch(err) {
        return  { '!': { code: err.code, message: err.message } }
      }
    }
    const testEquality = async (v1, v2) =>
      v1 === v2 ||
        (isThennable(v1)
          ? isThennable(v2) && testEquality(await awaitedValue(v1), await awaitedValue(v2))
          : v1 && v1['!']
            ? areErrorsEqual(v1['!'], v2['!'])
            : isDeepStrictEqual(v1, v2))
    const areEqual = await testEquality(actual, expected)
    return areEqual || `EXPECTED ${pretty(expected)} GOT ${pretty(actual)}`
  }

  return [test, await call(fn, test)]
}

module.exports = {
  typesToValidators,
  testSpec,
}
