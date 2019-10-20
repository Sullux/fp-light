const { type } = require('./type')

const flatten = arrays =>
  arrays.reduce(
    (all, items) => ([...all, ...items]),
    [],
  )

const validator = Symbol('validator')

const isValidator = value =>
  value && value[validator]

// types

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
    const { factoryChain } = type(actual)
    return factoryChain.includes(expected)
      ? []
      : [{
        expected: expected.name,
        actual: nameFromFactoryChain(factoryChain),
      }]
  }

Object.defineProperty(validateType, 'exact', {
  enumerable: true,
  value: expected => {
    const expectedChain = type(expected).factoryChain
    return actual => {
      const actualChain = type(actual).factoryChain
      const isValid = expectedChain.reduce(
        (result, factory, i) => result && factory === actualChain[i],
        true,
      )
      return ((expectedChain.length === actualChain.length) && isValid)
        ? []
        : [{
          expected: nameFromFactoryChain(expectedChain),
          actual: nameFromFactoryChain(actualChain),
        }]
    }
  }
})

// complex values

const prefixProblem = prefix =>
  ({ expected, actual }) => ({
    expected: `\`${prefix}\`: ${expected}`,
    actual: `\`${prefix}\`: ${actual}`,
  })

const reverseProblem = ({ expected, actual }) => ({
  expected: actual,
  actual: expected,
})

const validateInterface = expected =>
  actual =>
    Object.entries(expected).reduce(
      (problems, [key, value]) => {
        const valueProblems = validate(value)(actual[key])
          .map(prefixProblem(key))
        return [...problems, ...valueProblems]
      },
      [],
    )

Object.defineProperty(validateInterface, 'exact', {
  enumerable: true,
  value: expected => {
    const expectedEntries = Object.entries(expected)
    return actual => {
      const actualEntries = Object.entries(actual)
      const expectedProblems = expectedEntries.reduce(
        (problems, [key, value]) => {
          const valueProblems = validate.exact(value)(actual[key])
            .map(prefixProblem(key))
          return [...problems, ...valueProblems]
        },
        [],
      )
      const actualProblems = actualEntries.reduce(
        (problems, [key, value]) => {
          const valueProblems = validate.exact(value)(expected[key])
            .map(prefixProblem(key))
          return [...problems, ...valueProblems]
        },
        [],
      ).map(reverseProblem)
      return [...expectedProblems, ...actualProblems]
    }
  }
})

const validateOrdered = expected =>
  actual =>
    flatten(expected.map((v, i) =>
      validate(v)(actual[i]).map(prefixProblem(i))))

Object.defineProperty(validateOrdered, 'exact', {
  enumerable: true,
  value: expected =>
    actual => {
      const expectedProblems = flatten(expected.map((v, i) =>
        validate.exact(v)(actual[i]).map(prefixProblem(i))))
      const actualProblems = flatten(actual.map((v, i) =>
        validate.exact(v)(expected[i]).map(prefixProblem(i))))
          .map(reverseProblem)
      return [...expectedProblems, ...actualProblems]
    }
})

// values

const validateEqual = expected =>
  actual =>
    (expected === actual || (isNaN(expected) && isNaN(actual)))
      ? []
      : [{ expected, actual }]

const validateDate = expected =>
  actual =>
    expected.getTime() === actual.getTime()
      ? []
      : [{ expected: expected.getTime(), actual: actual.getTime() }]

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

const invalidErrorMessage = (expected, actual) => ({
  expected: errorDescription(expected),
  actual: errorDescription(actual),
})

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
  isValidator(expected)
    ? expected[validator]
    : (expected && typeof expected === 'object')
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

Object.defineProperty(validateObject, 'exact', {
  enumerable: true,
  value: expected =>
    expected instanceof Date
      ? validateDate(expected)
      : expected instanceof Error
        ? validateError(expected)
        : validateInterface.exact(expected)
})

Object.defineProperty(validateValue, 'exact', {
  enumerable: true,
  value: expected =>
    (expected && typeof expected === 'object')
      ? validateObject.exact(expected)
      : validateEqual(expected)
})

Object.defineProperty(validate, 'exact', {
  enumerable: true,
  value: expected => {
    const validateExpectedType = validateType(type(expected).factory)
    const validateExpected = Array.isArray(expected)
      ? validateOrdered.exact(expected)
      : validateValue(expected)
    return actual => {
      const typeProblems = validateExpectedType(actual)
      if (typeProblems.length) {
        return typeProblems
      }
      return validateExpected(actual)
    }
  }
})

// custom validation

const validateWith = validation => ({
  [validator]: validation,
})

const validateWithAll = validations => ({
  [validator]: actual =>
    flatten(validations.map(actual)),
})

const validateWithAny = validations => ({
  [validator]: actual => {
    const results = validations.map()
    return results.some(({ length }) => !length)
      ? []
      : [{
        expected: flatten(results).map(({ expected }) => expected).join(','),
        actual,
      }]
  },
})

const valid = Object.freeze({
  all: validateWithAll,

  any: validateWithAny,

  interface: validateInterface,

  string: ({ minLength = 0, maxLength = 0, pattern } = {}) => validateWithAll([
    validateType(String),
    ...(minLength > 0 ? [() => {}] : []),
  ]),

  type: validateType,
})

module.exports = Object.freeze({
  implements: validateInterface,
  valid,
  validate,
  validateInterface,
  validateOrdered,
  validateType,
  validateWith,
  validator,
})
