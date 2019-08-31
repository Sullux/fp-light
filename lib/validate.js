const { type } = require('./type')

// types

const factoryChainWithoutObject = factoryChain =>
  factoryChain.length > 1
    ? factoryChain.slice(0, factoryChain.length - 1)
    : factoryChain

const invalidTypeMessage = ({ expected, factoryChain }) => {
  const actual = factoryChainWithoutObject(factoryChain)
    .map(({ name }) => name)
    .join('←')
  return `expected type ${expected.name}; got ${actual}`
}

const validateType = expected =>
  actual => {
    const { factoryChain } = type(actual)
    return factoryChain.includes(expected)
      ? []
      : [invalidTypeMessage({ expected, factoryChain })]
  }

const validateExactType = expected =>
  actual => {
    const { factory, factoryChain } = type(actual)
    return factory === expected
      ? []
      : [invalidTypeMessage({ expected, factoryChain })]
  }

// complex values

const validateInterface = expected =>
  actual =>
    Object.entries(expected).reduce(
      (problems, [key, value]) => {
        const valueProblems = validate(value)(actual[key])
          .map(problem => `\`${key}\`: ${problem}`)
        return [...problems, ...valueProblems]
      },
      [],
    )

const flatten = arrays =>
  arrays.reduce(
    (all, items) => ([...all, ...items]),
    [],
  )

const validateOrdered = ordered =>
  actual =>
    flatten(ordered.map((v, i) =>
      validate(v)(actual[i]).map(problem => `\`${i}\`: ${problem}`)))

// values

const validateEqual = expected =>
  actual =>
    (expected === actual || (isNaN(expected) && isNaN(actual)))
      ? []
      : [`expected ${expected}; got ${actual}`]

const validateDate = expected =>
  actual =>
    expected.getTime() === actual.getTime()
      ? []
      : [`expected Date(${expected.getTime()}); got Date(${actual.getTime()})`]

// error

const errorTypeName = error =>
  factoryChainWithoutObject(type(error).factoryChain)
    .map(({ name }) => name)
    .join('←')

const errorDescription = error =>
  error.code
    ? `${errorTypeName(error)} ${error.code}: ${error.message}`
    : `${errorTypeName(error)}: ${error.message}`

const validateRestOfError = ({ message, code, stack, ...expected }) =>
  ({ message, code, stack, ...actual }) =>
    validateInterface(expected)(actual)

const errorsAreEquivalent = expected =>
  actual =>
    expected.code || actual.code
      ? expected.code === actual.code
      : expected.message === actual.message

const invalidErrorMessage = (expected, actual) =>
  `expected ${errorDescription(expected)}; got ${errorDescription(actual)}`

const validateError = expected => {
  const equivalentToExpected = errorsAreEquivalent(expected)
  return actual =>
    equivalentToExpected(actual)
      ? [...validateRestOfError(expected)(actual)]
      : [
        invalidErrorMessage(expected, actual),
        ...validateRestOfError(expected)(actual),
      ]
}

// general validation

const validateObject = expected =>
  expected instanceof Date
    ? validateDate(expected)
    : expected instanceof Error
      ? validateError(expected)
      : validateInterface(expected)

const validateValue = expected =>
  (expected && typeof expected === 'object')
    ? validateObject(expected)
    : validateEqual(expected)

const validate = expected => {
  const validateExpectedType = validateType(type(expected).factory)
  const validateExpected = Array.isArray(expected)
    ? validateOrdered(expected)
    : validateValue(expected)
  return actual => {
    const typeProblems = validateExpectedType(actual)
    if (typeProblems.length) {
      return typeProblems
    }
    return validateExpected(actual)
  }
}

module.exports = {
  validate,
  validateExactType,
  validateInterface,
  validateOrdered,
  validateType,
}
