const { readFileSync } = require('fs')
const esprima = require('esprima')
const { safeLoad } = require('js-yaml')
const { runInNewContext } = require('vm')
const { green, red, yellow, bgCyan, gray } = require('chalk')

const { main } = require('./package.json')
const { testSpec } = require('./autodocSpec.js')

// const { decode } = require('vlq')
// todo: track down compiled version of original source for testing
// see https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-base64vlq
// and https://www.bugsnag.com/blog/source-maps for information about parsing source maps

const AUTODOC = '#AUTODOC#'
const ONLY = '#ONLY#'

const flatReducer = (all = [], parts) => ([...all, ...parts])

const appendToFile = (compilation, fileName, text) => {
  const existing = (compilation.assets[fileName] || { source: () => '' }).source()
  const newText = `${existing}${text}`
  compilation.assets[fileName] = { source: () => newText, size: () => newText.length }
}

const parseModule = fileData =>
  esprima.parseModule(fileData, { loc:true, comment: true })

const indentLines = (indentSpaces, lines) => {
  const indent = ' '.repeat(indentSpaces)
  const result = lines.split('\n')
    .map(line => `${indent}${line}`)
    .join('\n')
  return `${indent}${result}`
}

const reportTestResult = ([description, result]) => {
  console.log(
    ' ',
    result === true ? green('OK') : red(' X'),
    description,
    result === true ? '' : `\n${indentLines(4, result)}`,
  )
  return [description, result]
}

const reportTestSuite = name =>
  console.log(`${yellow('test')} ${bgCyan(name)}`) // ||
    // (results =>
    //   results.forEach(reportTestResult) || results)

const validateAliases = (lib, { name, aliases }) =>
  aliases
    ? aliases
      .map(alias => ([
        `${gray('alias')} ${alias}`,
        lib[alias] === lib[name] || `Missing or invalid alias '${alias}'.`,
      ]))
    : []

const spec = async (lib, { name, definition: { types, context, specs } = {} }) => {
  const fn = lib[name]
  if (!specs) {
    return [['(no tests defined)', true]]
  }
  const specResults = await Promise.all(specs
    .map(({ signature, tests }) => tests.map(test => ({ fn, context, test, lib })))
    .reduce(flatReducer)
    .map(testSpec))
  // return specResults.map(reportTestResult)
  return specResults
}

const processAutodoc = lib =>
  async ({ value, loc, only }) => ({
    tests: [...validateAliases(lib, value), ...(await spec(lib, value))],
    title: value.name,
    body: `\n_Aliases: \`${value.aliases ? value.aliases.join('`, `') : '(none)'}\`_\n\n_Description_\n\n${value.description}\n_Examples_\n\n${value.examples || 'to do...'}`,
    sections: [value.module || 'API', ...(value.tags || [])],
    only,
  })

const processFile = (file) => {
  const fileData = readFileSync(file).toString()
  if (!fileData.includes(AUTODOC)) {
    return
  }
  const comments = parseModule(fileData).comments
  const autodocComments = comments
    .filter(comment => comment.value.includes(AUTODOC))
    .map(({ value, loc }) => ({
      value: safeLoad(value),
      loc,
      only: value.includes(ONLY)
    }))
  const filteredCommentsToProcess =
    autodocComments.filter(({ only }) => only)
  return filteredCommentsToProcess.length
    ? { comments: filteredCommentsToProcess, only: true }
    : { comments: autodocComments }
}

const processComments = lib =>
  async (comments) => {
    const process = processAutodoc(lib)
    const results = []
    // I hate everything about this.
    while (comments.length) {
      const result = await process(comments.shift())
      reportTestSuite(result.title)
      result.tests.map(reportTestResult)
      results.push(result)
    }
    return Promise.all(results)
  }

const compileSource = (source) => {
  const module = { exports: {} }
  const sandbox = {
    require,
    global,
    process,
    Promise,
    module,
    setTimeout,
    console,
    Date,
    RegExp,
    String,
    Number,
    Object,
    Array,
    Map,
    Set,
    JSON,
  }
  runInNewContext(source, sandbox)
  return module.exports
}

const toDocFileName = name =>
  `${name.replace(/ /g, '-').toUpperCase()}.md`

const assertTestsPassed = (results) => {
  const tests = results
    .map(({ title, tests }) => tests.map(test => ({ title, test })))
    .reduce(flatReducer)
  const failedCount = tests
    .filter(({ test: [, message] }) => typeof message === 'string')
    .length
  const runCount = tests.length
  const percentPassed = Math.round(((runCount - failedCount) / runCount) * 100)
  const message =
    `${runCount} tests run\n${failedCount} tests failed\n${percentPassed} % passed`
  if (failedCount > 0) {
    const error = new Error(message)
    error.stack = error.stack.split('\n').slice(0, 5).join('\n')
    throw error
  }
  console.log(`\n${message}`)
}

const readme = (docSections) => {
  const sections = Object.entries(docSections)
    .filter(([name]) => name !== 'API')
    .map(([name]) =>`* [${name}](${toDocFileName(name)})`)
    .sort()
    .join('\n')
  const api = `[API](${toDocFileName('api')})`
  const template = readFileSync('README.template.md').toString()
  return [template
    .replace(/\{\{API\}\}/g, api)
    .replace(/\{\{sections\}\}/g, sections)]
}

const autodoc = async (compilation) => {
  console.log('\n=== AUTODOC ============\n')
  const entryPoint = main || 'index.js'
  const source = compilation.assets[entryPoint].children[0]._value
  const lib = compileSource(source)
  const dependencies =  [...compilation.fileDependencies]
  const allComments = dependencies.map(processFile).filter(v => !!v)
  const filteredComments = allComments.filter(({ only }) => only)
  const commentsToTest = filteredComments.length
    ? filteredComments
    : allComments
  const sortedComments = commentsToTest.sort(({ value: v1 }, { value: v2 }) =>
    ((v1 || '').name || '').localeCompare((v2 || '').name || ''))
  const flattenedComments = sortedComments
    .map(({ comments }) => comments)
    .reduce(flatReducer)
  const results = await processComments(lib)(flattenedComments)
  assertTestsPassed(results)
  const docSections = results
    .map(({ title, body, sections }) =>
      sections.map(section => ({ section, title, body })))
    .reduce(flatReducer)
    .sort(({ title: title1 }, { title: title2 }) => title1.localeCompare(title2))
    // todo: add index
    .reduce(
      (sections, { section, title, body }) => ({
        ...sections,
        [section]: [...(sections[section] || []), `## ${title}\n${body}`],
      }),
      {},
    )
  docSections.readme = readme(docSections)
  Object.entries(docSections)
    .map(([section, markdown]) =>
      appendToFile(compilation, toDocFileName(section), `# ${section}\n\n${markdown.join('\n')}`))
}

const autodocPlugin = (compilation, callback) => {
  const onSuccess = () => {
    console.log('\n=== AUTODOC COMPLETE ===\n')
    callback()
  }
  const onError = (err) => {
    console.log('\n=== AUTODOC COMPLETE ===\n')
    callback(err)
  }
  try {
    autodoc(compilation)
      .then(onSuccess)
      .catch(onError)
  } catch(err) {
    onError(err)
  }
}

module.exports = { autodocPlugin }
