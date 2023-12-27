import { writeFile } from 'node:fs/promises'
import { getTests } from './specHarness.js'
import { buildApi } from './buildApi.js'

const indent = '  '

/* IMPORTS */

const byName = ({ details: {name: n1} }, { details: {name: n2} }) =>
  (n1 || '').localeCompare((n2 || ''))

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

const aliasTests = ({ details: { name } }) => {
  const currentExport = fp[name]
  const aliases = Object.keys(fp).filter((key) =>
    ((key !== name) && fp[key] === currentExport) )
  return aliases.map((alias) => ({
    type: 'alias',
    details: { name: alias, alias: name },
    beforeEach: [],
    afterEach: [],
  }))
}

const testWithAliases = (tests) =>
  tests.map((test) => {
    const aliases = aliasTests(test)
    return aliases.length
      ? [
        {...test, aliases: aliases.map(({ details: { name } }) => name) },
        aliases,
      ]
      : test
  }).flat(999)

const testsToRun = (allTests) => {
  const onlyTests = allTests.filter(({ settings: { only } }) => only)
  const unsortedTests = onlyTests.length ? onlyTests : testWithAliases(allTests)
  const sortedTests = [...unsortedTests].sort(byName)
  return sortedTests.map((test) => ([...test.beforeEach, test, ...test.afterEach]))
    .flat()
}

const runTest = async (test) => {
  if (test.details.alias) { return { test } }
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
  if (!impl) { return '' }
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
  aliases,
}) => ({
  description,
  type,
  details,
  settings,
  testFile,
  impl: loggableImplementation(impl),
  aliases,
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

const c = {
  end: '\x1b[0m',
  bold: '\x1b[1m',
  underline: '\x1b[4m',
  dim: '\x1b[2m',
  fgRed: '\x1b[31m',
  bgWhite: '\x1b[47m',
}

const indentLines = (description) => description.split('\n')
  .map((line, i) => (i === 0) ? line : `      ${line}`)
  .join('\n')

const prettifyError = ({ error: { name, message }, testFile, description }) => console.log({ message }) ||
  `    ${c.dim}${testFile}${c.end}
    ${c.underline}${description}${c.end}
    ${c.bold}${c.fgRed}${c.bgWhite}${name}${c.end} ${indentLines(message)}`

const logResults = async (results) => {
  const isTest = ({ type }) => type === 'test'
  const tests = results.filter(isTest)
  const testCount = tests.length
  const errors = results.filter(({ error }) => error)
  if (errors.length) {
    await writeFile('./.testlog.json', JSON.stringify(results, null, 2))
    console.log('  --- ERRORS ---\n')
    const errorsText = errors.map(prettifyError).join('\n\n  ---\n\n')
    console.log(errorsText)
    console.log('\n  --- END ERRORS ---\n')
    const passingCount = tests.filter(({ error }) => !error).length
    console.log('  ✓', passingCount, 'TESTS PASSING')
    console.log('  X', testCount - passingCount, 'TESTS FAILING')
    process.exitCode = 1
    return
  }
  await writeFile('./.testlog.json', JSON.stringify(results, null, 2))
  console.log('  ✓ ALL', testCount, 'TESTS PASSING\n')
  return results
}

const msToS = (v) => (Math.round(v / 10)) / 100

const execute = async (tests) => {
  console.log('\nFOUND', tests.length, 'TESTS')
  const [beforeAll, afterAll] = beforesAndAfters(tests)
  const beforeResults = await runTests(beforeAll)
  if (beforeResults.some(({ error }) => error)) {
    return logResults(beforeResults)
  }
  const includedTests = testsToRun(tests)
  const testCount = includedTests.filter(({ type }) => type === 'test').length
  console.log('RUNNING', testCount, 'TESTS\n')
  let start = Date.now()
  const results = await runTests([...includedTests, ...afterAll])
  const loggedResults = await logResults([...beforeResults, ...results])
  console.log('  Done in', msToS(Date.now() - start), 's\n')
  if (tests.length === testCount) {
    start = Date.now()
    console.log('WRITING API DOCS')
    await writeFile('./API.md', buildApi(results))
    console.log('  Done in', Date.now() - start, 'ms')
  } else {
    console.log('PARTIAL TEST RUN -- SKIPPING API DOCS BUILD')
  }
  console.log('-'.repeat(process.stdout.columns))
}

execute(getTests())
