import {
  arraySpreadFrom,
  compilable,
  defineError,
  equal,
  functionName,
  getSpreadable,
  isArray,
  isFunction,
  isNumber,
  isObject,
  isSymbol,
  override,
  rest,
  isSpreadableSymbol,
  trap,
} from './'

const keyIsValidItendifier = key =>
  /^[a-zA-Z$_][a-zA-Z0-9$_]*$/.test(key)

const extraProperty = (input, path) => ([
  [path, input, 'property', 'unsupported']
])

const removeFromArray = (array, value) =>
  array.filter(v => v!== value)

const appendPath = (path, key) =>
  isNumber.$(key)
    ? `${path}[${key}]`
  : isSymbol.$(key)
    ? `${path}[${key.toString()}]`
  : keyIsValidItendifier(key)
    ? `${path}.${key}`
  : `${path}['${key}']`

const validateObject = (validator, input, path) => {
  let inputKeys = Reflect.ownKeys(input)
  const validateExtraProperty = getSpreadable(validator) || extraProperty
  const problems = input
    ? Reflect.ownKeys(validator)
      .filter(key => (key !== Symbol.iterator) && (!isSpreadableSymbol(key)))
      .map(key => {
        inputKeys = removeFromArray(inputKeys, key)
        return validate.$(validator[key], input[key], appendPath(path, key))
      })
      .flat()
    : [[path, input, 'object', 'missing']]
  const extraProblems = inputKeys.map(key =>
      validate.$(validateExtraProperty, input[key], appendPath(path, key))).flat()
  return [
    ...problems,
    ...extraProblems,
  ]
}

const extraElement = (input, path) => ([
  [path, input, 'element', 'unsupported']
])

const validateArray = (validator, input, path) => {
  const last = validator[validator.length - 1]
  const spreadFn = arraySpreadFrom(last)
  const validateExtraElement = spreadFn || extraElement
  const checkedLength = spreadFn
    ? validator.length - 1
    : validator.length
  const availableLength = input.length
  let results = []
  for (let i = 0; ; i++) {
    const elementPath = appendPath(path, i)
    const element = input[i]
    if (i < checkedLength) {
      results = results.concat(validate.$(validator[i], element, elementPath))
      continue
    }
    if (i >= availableLength) {
      break
    }
    results = results.concat(validate.$(validateExtraElement, element, elementPath))
  }
  return results
}

const validateFunction = (validator, input, path) => {
  const fn = validator.$ || validator
  const [err, output] = trap(fn)(input, path)
  return err
    ? [[path, input, fn, err.message]]
  : isArray.$(output)
    ? output
  : output ? [] : [[path, input, fn, output]]
}

export const validate = compilable(function validate (validator, input, path = '') {
  return isFunction.$(validator)
    ? validateFunction(validator, input, path)
  : isObject.$(validator)
    ? validateObject(validator, input, path)
  : isArray.$(validator)
    ? validateArray(validator, input, path)
  : validateFunction(v => equal.$(v, validator), input, path)
}, { skip: 1 })

export const isValid = compilable(function isValid(validator, input) {
  return validate.$(validator, input).length === 0
}, { skip: 1 })

const validatorName = validator =>
  isFunction.$(validator)
    ? validator.name || functionName(validator)
    : validator.toString()

const problemToString = ([path, input, validator, output]) =>
  `${input}${path && ` at ${path}`}: ${validatorName(validator)} → ${output}`

const distinct = input => ([...(new Set(input))])

const problemsToOutput = (problems) => {
  // todo: build a pretty object/array instead of just listing things
  return distinct(problems.map(problemToString)).map(output => `  * ${output}`)
    .join('\n')
}

export const ValidationError = defineError(
  'ValidationError',
  'ERR_INVALID',
  (validator, input, problems) => ({
    message: `Invalid input. ${problemToString(problems[0])}`,
    validator,
    input,
    output: problemsToOutput(problems),
  })
)

export const assertValid = compilable(function assertValid(validator, input) {
  const problems = validate.$(validator, input)
  if (!problems.length) {
    return input
  }
  throw ValidationError(validator, input, problems)
}, { skip: 1 })

export const any = rest(function any () { return true })

export const anyOf = function anyOf (...validators) {
  return override({
    properties: {
      name: () => `anyOf(${validators.map(validatorName).join(', ')})`
    }
  })((input, path) => {
    let allProblems = []
    for (const validator of validators) {
      const problems = validate.$(validator, input, path)
      if (!problems.length) {
        return problems
      }
      allProblems = [...allProblems, ...problems]
    }
    return allProblems
  })
}
