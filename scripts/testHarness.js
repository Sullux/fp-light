import './expect.js'

let testFile = ''

const topLevelContext = {
  tests: [],
  describes: [],
  beforeEach: [],
  afterEach: [],
  beforeAll: [],
  afterAll: [],
  settings: {
    timeout: 2000
  },
  testFile,
  hasOnlyBlocks: false,
}

let context = topLevelContext

const describe = (description, impl, settings = {}) => {
  const err = new Error('foo')
  testFile = err.stack.split('\n')[2].substring(7)
  const thisBlock = {
    description,
    tests: [],
    describes: [],
    beforeEach: [],
    afterEach: [],
    beforeAll: [],
    afterAll: [],
    settings: { ...context.settings, ...settings },
    testFile
  }
  context.describes.push(thisBlock)
  const previousContext = context
  context = thisBlock
  try {
    impl()
  } catch (err) {
    thisBlock.error = err
  }
  if (thisBlock.hasOnlyBlocks || thisBlock.only) {
    previousContext.hasOnlyBlocks = true
    const withOnly = (block) =>
      block.settings = { ...block.settings, only: true }
    thisBlock.beforeAll = thisBlock.beforeAll.map(withOnly)
    thisBlock.beforeEach = thisBlock.beforeEach.map(withOnly)
    thisBlock.afterEach = thisBlock.afterEach.map(withOnly)
    thisBlock.afterAll = thisBlock.afterAll.map(withOnly)
  }
  context = previousContext
}

describe.only = (description, impl, settings = {}) => {
  topLevelContext.hasOnlyBlocks = context.hasOnlyBlocks = true
  return describe(description, impl, { ...settings, only: true })
}

const test = (description, impl, settings = {}) => {
  context.tests.push({
    description,
    impl,
    settings: { ...context.settings, ...settings },
    testFile
  })
}

test.only = (description, impl, settings = {}) => {
  topLevelContext.hasOnlyBlocks = context.hasOnlyBlocks = true
  return test(description, impl, { ...settings, only: true })
}

const beforeEach = (impl, settings = {}) => {
  context.beforeEach.push({
    impl,
    settings: { ...context.settings, ...settings },
    testFile
  })
}

const afterEach = (impl, settings = {}) => {
  context.afterEach.push({
    impl,
    settings: { ...context.settings, ...settings },
    testFile
  })
}

const beforeAll = (impl, settings = {}) => {
  context.beforeAll.push({
    impl,
    settings: { ...context.settings, ...settings },
    testFile
  })
}

const afterAll = (impl, settings = {}) => {
  context.afterAll.push({
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

export const getContext = () => context
