const { inspect } = require('util')

const isThennable = value =>
  value && value.then && (typeof value.then === 'function')

const flatReducer = (all = [], parts) => ([...all, ...parts])

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

// Unfortunately, we can't use the one from util because it requires
//  constructors to have reference equality. Since the system under test is
//  built in a sandbox, it's Object is a completely different function from our
//  Object.
const isDeepStrictEqual = (v1, v2) =>
  inspect(v1, { colors: true, depth: 64 }) ===
    inspect(v2, { colors: true, depth: 64 })

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

const testSpec = async ({ fn, context, test, lib }) => {
  const mock = (patterns, key) => {
    const compiled = patterns
      .map(pattern => pattern.split('=>').map(v => v.trim()))
      .map(([input, output]) => ([
        input.split(',').map(resolveKey),
        resolveKey(output),
      ]))
    return (...input) => {
      const index = compiled.findIndex(([expectedInput]) =>
        isDeepStrictEqual(input, expectedInput))
      if (index < 0) {
        const expected = compiled.map(([expectedInput]) => expectedInput.map(JSON.stringify).join(','))
          .join(')|(')
        const error = new Error(
          `Mock ${key} expected to be called with (${expected}) but was called with (${input}).`)
        error.code = 'ERR_BAD_MOCK_CALL'
        throw error
      }
      return (compiled[index][1])
    }
  }

  const references = {
    '$async': value => Promise.resolve(value),
    '$reject': value => Promise.reject(errorFromObject(value)),
    '$Error': errorFromObject,
    '$Map': value => new Map(value),
    '$Set': value => new Set(value),
    '$Date': value => new Date(value),
    '$afterDelay': ([delay, value]) =>
      new Promise((resolve) => setTimeout(resolve, delay))
        .then(() => value),
    '$mock': mock,
    '$lib': value => lib[value],
  }

  const resolveValue = (value, originalKey) => {
    if (isThennable(value)) {
      return value.then(v => resolveValue(v, originalKey))
    }
    if (Array.isArray(value)) {
      return value.map(v => resolveValue(v, originalKey))
    }
    if (value && value.constructor === Object) {
      const entries = Object.entries(value)
      const [key, ref] = entries[0] || ['']
      if (key.startsWith('$')) {
        return key === '$'
          ? resolveKey(ref) //resolveValue(context[ref])
          : references[key](resolveArgument(ref), originalKey)
      }
      return entries.map(([key, ref]) => ([key, resolveArgument(ref)]))
        .reduce(
          (obj, [key, ref]) => ({ ...obj, [key]: ref }),
          {}
        )
    }
    return value
  }

  const resolveArgument = (argument, key) => {
    if (argument === 'undefined') {
      return undefined
    }
    if (argument === 'null') {
      return null
    }
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
    return resolveValue(argument, key)
  }

  const resolveKey = (key) => {
    if (key === 'undefined') {
      return undefined
    }
    if (key === 'null') {
      return null
    }
    if (key === 'true') {
      return true
    }
    if (key === 'false') {
      return false
    }
    if (key === 'NaN') {
      return NaN
    }
    const number = Number(key)
    if (!isNaN(number)) {
      return number
    }
    if (key.includes('.')) {
      return lib.get(key)(context)
    }
    if (!(key in context)) {
      throw new Error(`Could not find ${pretty(key)} in context: ${pretty(context)}`)
    }
    return resolveArgument(context[key], key)
  }

  const call = async (impl, text) => {
    if (typeof impl !== 'function') {
      console.log('!!!', text, impl, test)
      throw new Error('NOT A FUNCTION')
    }
    const index = text.indexOf('=>')
    const unexpandedArgs = text.substring(0, index)
      .split(',')
      .map(arg => arg.trim())
    const args = unexpandedArgs
      .map(arg =>
        (arg && arg.startsWith('...'))
          ? resolveKey(arg.substring(3))
          : arg ? [resolveKey(arg)] : [undefined])
      .reduce(flatReducer)
    const resultText = text.substring(index + 2).trim()
    let actual
    try {
      actual = impl(...args)
    } catch(err) {
      if (resultText && resultText.includes('=>')) {
        return `EXPECTED ${resultText} THREW ${err.message}`
      }
      actual = { '!': { code: err.code, message: err.message } }
    }
    if (resultText && resultText.includes('=>')) {
      return call(actual, resultText)
    }
    const expected = resultText
      ? resultText.startsWith('!')
        ? { '!': resolveKey(resultText.substring(1)) }
        : resolveKey(resultText)
      : undefined
    const awaitedValue = async value => {
      try {
        return await value
      } catch(err) {
        return  { '!': { code: err.code, message: err.message } }
      }
    }
    const testEquality = async (v1, v2) =>
      v1 === v2 || (v1 && v2 &&
        (isThennable(v1)
          ? isThennable(v2) && testEquality(await awaitedValue(v1), await awaitedValue(v2))
          : v1['!'] && v2['!']
            ? areErrorsEqual(v1['!'], v2['!'])
            : isDeepStrictEqual(v1, v2)))
    const areEqual = await testEquality(actual, expected)
    return areEqual || `EXPECTED ${pretty(expected)} GOT ${pretty(actual)}`
  }

  return [test, await call(fn, test)]
}

module.exports = {
  typesToValidators,
  testSpec,
}
