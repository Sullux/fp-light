import { getContext } from './testHarness.js'

const indent = '  '

/* IMPORTS */

const sortByPrefix = ({ sortBy }) => sortBy
  ? `${sortBy}/`
  : ''

const named = (context) => ({
  ...context,
  tests: context.tests.map((test) => ({
    ...test,
    sortBy: context.sortBy
  })),
  beforeEach: context.beforeEach.map((beforeEach) => ({
    ...beforeEach,
    sortBy: context.sortBy
  })),
  afterEach: context.afterEach.map((afterEach) => ({
    ...afterEach,
    sortBy: context.sortBy
  })),
  beforeAll: context.beforeAll.map((beforeAll) => ({
    ...beforeAll,
    sortBy: context.sortBy
  })),
  afterAll: context.afterAll.map((afterAll) => ({
    ...afterAll,
    sortBy: context.sortBy
  })),
  describes: context.describes.map((describe) => named({
    ...describe,
    sortBy: `${sortByPrefix(context)}${describe.description}`
  }))
})

const relevantTestFields = (type) =>
  ({
    settings,
    impl,
    testFile,
    description,
    sortBy
  }) => ({
    settings,
    impl,
    testFile,
    description,
    sortBy,
    type
  })

const normalized = (parentBeforeEach = [], parentAfterEach = []) =>
  ({ beforeEach, afterEach, ...rest }) => ({
    ...rest,
    beforeEach: [
      ...parentBeforeEach,
      ...beforeEach.map(relevantTestFields('beforeEach'))
    ],
    afterEach: [
      ...parentAfterEach,
      ...afterEach.map(relevantTestFields('afterEach'))
    ]
  })

const testsProp = Symbol('tests')
const setupProp = Symbol('setup')
const teardownProp = Symbol('teardown')

const flattened = ({
  tests,
  describes,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll
}) => ([
  ...beforeAll.map(relevantTestFields('beforeAll')),
  ...tests.map(relevantTestFields('test')),
  ...describes.map(normalized(beforeEach, afterEach)).map(flattened),
  ...afterAll.map(relevantTestFields('afterAll'))
].flat())

const execute = async (context, report) => {
  const hasOnlyBlocks = context.hasOnlyBlocks
  const tests = flattened(normalized()(named(context)))
    .sort(({ sortBy: a }, { sortBy: b }) => a.localeCompare(b))
  return await tests
    .map(({ sortBy, description, ...rest }) => ({
      ...rest,
      groups: sortBy.split('/'),
      description,
      sortBy
    }))
    .filter(({ settings: { only } }) => !hasOnlyBlocks || only)
    .reduce(
      async (
        state,
        {
          settings,
          testFile,
          description,
          groups,
          type,
          impl
        }
      ) => {
        const finalResults = await state
        let result
        let error
        const start = Date.now()
        try {
          await impl()
          result = true
        } catch (err) {
          error = err
        }
        const end = Date.now()
        result = {
          type,
          groups,
          testFile,
          description,
          error,
          result,
          start,
          end
        }
        report(result)
        const defaultStates = {
          [testsProp]: [],
          [setupProp]: [],
          [teardownProp]: []
        }
        const group = groups.reduce(
          (resultState, name) =>
            resultState[name] || (resultState[name] = { ...defaultStates }),
          finalResults
        )
        if (type === 'test') {
          group[testsProp].push(result)
          return finalResults
        }
        if (type.startsWith('before')) {
          group[setupProp].push(result)
          return finalResults
        }
        group[teardownProp].push(result)
        return finalResults
      },
      Promise.resolve({})
    )
}

const prefixedError = (prefix, error) => error.stack
  .split('\n')
  .map((line) => `${prefix} ${line}`)
  .join('\n')

const errors = []

const simpleReporter = () => {
  let previous = []
  return (
    {
      type,
      groups,
      testFile,
      description,
      error,
      result,
      start,
      end
    }
  ) => {
    if (!(error || result)) {
      return
    }
    if (error) {
      errors.push(error)
    }
    const duration = `(${(end - start) / 1000} seconds)`
    const prefix = indent.repeat(groups.length)
    groups.forEach((group, i) =>
      (previous[i] !== group) && console.log(`${indent.repeat(i)}${group}`))
    previous = groups
    if (type.startsWith('before')) {
      return error && console.log(prefix, 'Setup', duration, error.message)
    }
    if (type.startsWith('after')) {
      return error && console.log(prefix, 'Teardown', duration, error.message)
    }
    if (error) {
      console.log(prefix, 'X', description, duration)
      return console.log(prefixedError(prefix, error))
    }
    console.log(prefix, '✓', description, duration)
  }
}

execute(getContext(), simpleReporter())
if (errors.length) {
  process.exitCode = 1
}
