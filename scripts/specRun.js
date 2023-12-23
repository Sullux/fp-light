import { writeFile } from 'node:fs/promises'
import { getTests } from './specHarness.js'
import { buildApi } from './buildApi.js'

const indent = '  '

/* IMPORTS */

const byName = ({name: n1}, {name: n2}) => (n1 || '').localeCompare((n2 || ''))

const beforesAndAfters = (allTests) => {
  const [beforeAllSet, afterAllSet] = allTests.reduce(
    ([beforeSet, afterSet], { beforeAll, afterAll }) => ([
      beforeAll.reduce((set, f) => set.add(f), beforeSet),
      afterAll.reduce((set, f) => set.add(f), afterSet),
    ]),
    [new Set(), new Set()],
  )
  return [[...beforeAllSet], [...afterAllSet]]
}

const testsToRun = (allTests) => {
  const onlyTests = allTests.filter(({ settings: { only } }) => only)
  const unsortedTests = onlyTests.length ? onlyTests : allTests
  const sortedTests = [...unsortedTests].sort(byName)
  return sortedTests.map((test) => ([...test.beforeEach, test, ...test.afterEach]))
    .flat()
}

const runTest = async (test) => {
  const start = Date.now()
  try {
    await test.impl()
    const end = Date.now()
    const result = {
      duration: end - start,
    }
    return { test, result } // todo: settings, etc.
  } catch(error) {
    const end = Date.now()
    const result = {
      duration: end - start,
    }
    return { test, error, result }
  }
}

const runTests = (tests) => tests.reduce(
  async (previousResults, test) => ([
    ...await previousResults,
    toLoggableObject(await runTest(test)),
  ]),
  Promise.resolve([]),
)

const firstNonSpace = (line) => {
  for(let i = 0, l = line.length; i < l; i++) {
    if (line[i] !== ' ') { return i}
  }
  return line.length
}

const firstValidLine = (lines) => {
  for (let i = 1, l = lines.length; i < l; i++) {
    if (lines[i].trim().length > 0) {
      return i
    }
  }
  return lines.length
}

const loggableImplementation = (impl) => {
  const lines = impl.toString().trim().split('\n')
  const validLine = lines[firstValidLine(lines)]
  if (!validLine) { return impl }
  const indent = firstNonSpace(validLine) - 2
  return [
    lines[0],
    ...lines.slice(1).map((line) => line.substring(indent)),
  ].join('\n')
}

const toLoggableTest = ({
  description,
  type,
  details,
  settings,
  testFile,
  impl,
}) => ({
  description,
  type,
  details,
  settings,
  testFile,
  impl: loggableImplementation(impl),
})

const toLoggableError = ({ name, message, stack }) => ({
  name,
  message,
  stack: stack.split('\n').slice(1).map((l) => l.trim()).join('\n'),
})

const toLoggableObject = ({ test, error, result }) => ({
  ...toLoggableTest(test),
  ...(error ? { error: toLoggableError(error) } : {}),
  ...result,
})

const logResults = async (results) => {
  const isTest = ({ type }) => type === 'test'
  const tests = results.filter(isTest)
  const testCount = tests.length
  const errors = results.filter(({ error }) => error)
  if (errors.length) {
    await writeFile('./.testlog.json', JSON.stringify(results, null, 2))
    errors.map((e) => console.log(e)) // todo: prettify
    const passingCount = tests.filter(({ error }) => !error).length
    console.log('  ✓', passingCount, 'TESTS PASSING')
    console.log('  X', testCount - passingCount, 'TESTS FAILING')
    process.exitCode = 1
    return
  }
  await writeFile('./.testlog.json', JSON.stringify(results, null, 2))
  console.log('  ✓ ALL', testCount, 'TESTS PASSING\n')
  console.log('WRITING API DOCS')
  await writeFile('./API.md', buildApi(results))
}

const execute = async (tests) => {
  console.log('\nFOUND', tests.length, 'TESTS')
  const [beforeAll, afterAll] = beforesAndAfters(tests)
  const beforeResults = await runTests(beforeAll)
  if (beforeResults.some(({ error }) => error)) {
    return logResults(beforeResults)
  }
  const includedTests = testsToRun(tests)
  console.log('RUNNING', includedTests.length, 'TESTS\n')
  const results = await runTests([...includedTests, ...afterAll])
  await logResults([...beforeResults, ...results])
  console.log('-'.repeat(process.stdout.columns))
}

execute(getTests())
