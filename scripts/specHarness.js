import './expect.js'
import assert from 'node:assert/strict'

let testFile = ''

const tests = []

const topLevelContext = {
  details: {
    name: '',
    usage: '',
    args: [
      // { name, type, description }
    ],
    returns: { type: 'void', description: '' },
    features: [
      // 'Function', 'Symbol', 'compilable'
    ],
    notes: [
      // 'plain text',
      // { bash: 'foo' },
      // () => { /* javascript example */ },
    ],
  },
  beforeEach: [],
  afterEach: [],
  beforeAll: [],
  afterAll: [],
  settings: {
    timeout: 2000
  },
}

let context = topLevelContext

const assertString = (name, v) => {
  assert((typeof v) === 'string', `${name}: expected string, got "${name}"`)
  return v
}

const assertFunction = (name, v) => {
  assert((typeof v) === 'function', `${name}: expected function, got "${name}"`)
  return v
}

const distinct = (array) => ([...(new Set(...array))])

const mergeContexts = (c1, c2) => ({
  ...c1,
  ...c2,
  features: distinct([...(c1.features || []), ...(c2.features || [])]),
})

const describe = (details, impl, settings = {}) => {
  assertFunction('implementation', impl)
  const thisBlock = {
    ...context,
    settings: { ...context.settings, ...settings },
    details: ((typeof details) === 'string')
      ? mergeContexts(context.details, { name: details })
      : mergeContexts(context.details, details),
  }
  const previousContext = context
  context = thisBlock
  try {
    impl()
  } catch (err) {
    thisBlock.error = err
  }
  context = previousContext
}

describe.only = (description, impl, settings = {}) =>
  describe(description, impl, { ...settings, only: true })

const test = (description, impl, settings = {}) => {
  const err = new Error('foo')
  testFile = err.stack.split('\n')[2].substring(7)
  tests.push({
    description,
    type: 'test',
    impl,
    ...context,
    settings: { ...context.settings, ...settings },
    testFile,
  })
}

test.only = (description, impl, settings = {}) =>
  test(description, impl, { ...settings, only: true })

const beforeEach = (impl, settings = {}) => {
  context.beforeEach.push({
    name: 'beforeEach',
    type: 'setup',
    impl,
    settings: { ...context.settings, ...settings },
    testFile
  })
}

const afterEach = (impl, settings = {}) => {
  context.afterEach.push({
    name: 'afterEach',
    type: 'teardown',
    impl,
    settings: { ...context.settings, ...settings },
    testFile
  })
}

const beforeAll = (impl, settings = {}) => {
  context.beforeAll.push({
    name: 'beforeAll',
    type: 'setup',
    impl,
    settings: { ...context.settings, ...settings },
    testFile
  })
}

const afterAll = (impl, settings = {}) => {
  context.afterAll.push({
    name: 'afterAll',
    type: 'teardown',
    impl,
    settings: { ...context.settings, ...settings },
    testFile
  })
}

const it = test

Object.assign(globalThis, {
  describe,
  test,
  it,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll
})

export const getTests = () => tests
