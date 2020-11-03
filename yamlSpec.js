const { load, Schema, Type } = require('js-yaml')
const { inspect } = require('util')

const log = (...args) => console.log(...args.map(a => inspect(a, { colors: true, depth: 7 })))

const toRawJs = input =>
  isArray.$(input)
    ? `[${input.map(toRawJs)}]`
  : isNumber.$(input)
    ? input.toString
  : isString.$(input) || isFunction.$(input)
    ? input
  : `{ ${toObject.$(toArray.$(input).map(([key, value]) => `${toJs(key)}: ${toRawJs(value)}`).join(','))} }`

const toJs = input =>
  isString.$(input)
    ? `'${input && input.replace(/'/g, '\'')}'`
  : toRawJs(input)

const pretty = value =>
  inspect(value, { colors: true, depth: 7 })

const getName = value =>
  isArray.$(value)
    ? `[${value.map(getName)}]`
  : isNumber.$(value)
    ? pretty(value)
  : isString.$(value)
    ? pretty(`${value && value.replace(/'/g, '\\\'')}`)
  : isFunction.$(value)
    ? value.name || value.toString()
  : pretty(value)

const mockImplementation = ({ input = [...any], output, throws } = {}) => {
  return named((...args) => {
    assertValid.$(input, args)
    if (throws) {
      throw throws
    }
    return output
  }, `(${input.map(getName).join(', ')}) => ${getName(output)}`)
}

const mock = (implementationDescription) => {
  const impl = isFunction.$(implementationDescription)
    ? implementationDescription
    : mockImplementation(implementationDescription)
  const mocked = named(
    (...args) => {
      mocked.calls.push(args)
      return impl(...args)
    },
    impl.name,
  )
  mocked.calls = []
  return mocked
}

global.mock = mock

const softResolve = (target) => {
  if (isFunction.$(target)) {
    return target
  }
  if (isArray.$(target)) {
    return arg => target.map((value) => softResolve(value)(arg))
  }
  if (isObject.$(target)) {
    return arg => Object.entries(target)
      .map(([key, value]) => ([key, softResolve(value)(arg)]))
      .reduce(
        (obj, [key, value]) => ({ ...obj, [key]: value }),
        {},
      )
  }
  return () => target
}

const SpecType = new Type('!spec', {
  kind: 'mapping',
  resolve: (data) =>
    assertValid.$(
      {
        name: anyOf(isString, isMissing),
        setup: anyOf(isObject, isMissing),
        'fn': isFunction,
        tests: [any, ...any],
      },
      data,
    ) || true,
  construct: async ({ name: specName, setup = {}, fn, tests }) => {
    const results = (await Promise.all(tests.map(async ({ name: testName, input = [], output, assertions = [] }) => {
      const initialContext = {}
      const [setupErr, setupContext] = await (trap(softResolve(setup))(initialContext))
      const [sutErr, sut] = await (trap(softResolve(fn))(setupContext))
      const [inputErr, args] = await (trap(softResolve(input))(setupContext))
      const resultBase = {
        specName: specName || fn.name,
        setup: Object.entries(setup).reduce((obj, [key, value]) => ({ ...obj, [key]: value.name }), {}),
        testName: testName || `(${args.map(getName).join(', ')}) => ${getName(output)}`,
        input,
        output,
        fn,
      }
      if (setupErr) {
        return {
          ...resultBase,
          failures: [{
            type: 'setup',
            error: setupErr,
          }],
        }
      }
      if (sutErr) {
        return {
          ...resultBase,
          failures: [{
            type: 'initialize function',
            error: sutErr,
          }],
        }
      }
      if (inputErr) {
        return {
          ...resultBase,
          failures: [{
            type: 'initialize input parameters',
            error: inputErr,
          }]
        }
      }
      const initialResult = trap(sut)(...args)
      const expectedOutput = isFunction.$(output) ? trap(output)(setupContext) : [null, output]
      const isAsyncResult = isAsync(initialResult)
      const isAsyncOutput = isAsync(expectedOutput)
      const failures = []
      const processResult = async ([execErr, result], [outputErr, output]) => {
        if (execErr) {
          failures.push({
            failureType: 'execute function',
            error: execErr,
          })
        }
        if (outputErr) {
          failures.push({
            failureType: 'invalid output',
            error: outputErr,
          })
        }
        if (isAsyncResult !== isAsyncOutput) {
          failures.push({
            failureType: 'async mismatch',
            error: `expected ${isAsyncOutput ? 'async' : 'sync'}; got ${isAsyncOutput ? 'sync' : 'async'}`
          })
        }
        const [validateErr] = await (trap(assertValid.$)(output, result))
        if (validateErr) {
          failures.push({
            failureType: 'invalid result',
            error: validateErr,
          })
        }
        const functionOrLiteral = fn =>
          isFunction.$(fn) ? fn : () => fn
        for (const { actual, expected } of assertions) {
          const [actualErr, actualValue] = await (trap(functionOrLiteral(actual))(setupContext))
          if (actualErr) {
            failures.push({
              failureType: 'initialize "actual" assertion',
              error: actualErr,
            })
          }
          const [expectedErr, expectedValue] = await (trap(functionOrLiteral(expected))(setupContext))
          if (expectedErr) {
            failures.push({
              failureType: 'initialize "expected" assertion',
              error: expectedErr,
            })
          }
          const [assertErr] = await (trap(assertValid.$)(expectedValue, actualValue))
          if (assertErr) {
            failures.push({
              failureType: 'invalid assertion',
              error: assertErr,
            })
          }
        }
        if (failures.length) {
          return {
            ...resultBase,
            failures,
          }
        }
        return {
          ...resultBase,
          ok: true,
        }
      }
      return processResult(await initialResult, await expectedOutput)
    }))).flat()
    return results
  },
})

const JsType = new Type('!js', {
  kind: 'scalar',
  resolve: () => true,
  construct: (data) => {
    const source = toRawJs(data)
    return named(function js (context = {}) {
      const contextKeys = Reflect.ownKeys(context)
      const contextValues = contextKeys.map(key => context[key])
      return named(new Function(...contextKeys, `return ${source}`), data)(...contextValues)
    }, data.trim())
  },
})

// const testYaml1 = `
// !spec
// name: lookup
// setup:
//   query: !js |
//     mock({ input: [{ key: 42 }], output: toAsync({ result: 'baz' }) })
//   log: !js mock()
// fn: !js lookup({query, log})
// tests:
//   - input: [42]
//     output: !js toAsync('baz')
//     assertions:
//       - actual: !js log.calls
//         expected: [[querying for, 42], [got result, baz]]
// `

// global.lookup = ({ query, log }) =>
//   key => {
//     log('querying for', key)
//     const result = query({ key }).then(_.result)
//     return result.then(r => log('got result', r) || r)
//   }

const loadYamlSpec = (yaml) => {
  if (!global.pipe) {
    Object.assign(global, require('./dist'))
  }
  const schema = Schema.create([JsType, SpecType])
  return load(yaml, { schema })
    // .then(() => console.log('\n--- fin ---\n'))
}

// loadYamlSpec(testYaml1)

module.exports = {
  loadYamlSpec,
}
