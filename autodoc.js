const { readFileSync, writeFileSync } = require('fs')
const { parse } = require('espree')
const { runInNewContext } = require('vm')
const { green, red, yellow, bgCyan, gray } = require('chalk')
const { loadYamlSpec } = require('./yamlSpec')
const { main } = require('./package.json')
const { inspect } = require('util')

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
  parse(fileData, {
    loc:true,
    comment: true,
    ecmaVersion: 2020,
    sourceType: 'module',
  })

const indentLines = (indentSpaces, lines) => {
  const indent = ' '.repeat(indentSpaces)
  const result = lines.split('\n')
    .map(line => `${indent}${line}`)
    .join('\n')
  return `${indent}${result}`
}

const indentedDescription = (description) => {
  const [first, ...rest] = description.split('\n')
  return [first, ...rest.map(line => `  ${line}`)].join('\n')
}

const reportTestResult = ([description, result]) => {
  console.log(
    ' ',
    result === true ? green('OK') : red(' X'),
    indentedDescription(description),
    result === true ? '' : `\n${indentLines(4, result)}`,
  )
  return [description, result]
}

const reportTestSuite = name =>
  console.log(`${yellow('spec')} ${bgCyan(name)}`)

const getProperty = (obj, path) => path.split('.').reduce(
  (obj, prop) => obj && obj[prop],
  obj,
)

const validateAliases = (lib, { name, aliases }) =>
  aliases
    ? aliases
      .map(alias => ([
        `${gray('alias')} ${alias}`,
        getProperty(lib, alias) === lib[name] || `Missing or invalid alias '${alias}'.`,
      ]))
    : []

const pretty = value =>
  inspect(value, { colors: true, depth: 7 })

const prettyInvalidResult = ({ validator, input }) =>
  `expected ${pretty(validator)}; got ${pretty(input)}`

const prettyFailure = ({ failureType, error: { trace, ...error } }) =>
  `${yellow(failureType)}\n${failureType === 'invalid result' ? prettyInvalidResult(error) : pretty(error)}`

const prettyFailures = failures =>
  failures.length > 1
    ? failures.map(prettyFailure).join('\n')
    : prettyFailure(failures[0])

const validateSpecs = ({ specs = [] }) =>
  specs.map(spec => spec.map(test => ([
    `${test.fn.name} ${test.testName}`,
    test.ok || prettyFailures(test.failures),
  ]))).flat()

const processAutodoc = lib =>
  async ({ value, loc, only }) => ({
    tests: [...validateAliases(lib, value), ...(validateSpecs(await deepAwait(value)))],
    title: value.name,
    body: `
      \`\`\`typescript
      ${(value.ts || '// todo: typescript declaration').trim()}
      \`\`\`

      _Tags: \`${value.tags ? `{{${value.tags.join('}}`, `{{')}}}` : '(none)'}\`_

      _Aliases: \`${value.aliases ? value.aliases.join('`, `') : '(none)'}\`_

      _Description_

      ${value.description}
      _Examples_

      ${value.examples || 'to do...'}
    `.split('\n').map(l => l.trim()).join('\n'),
    sections: [value.module || 'API', ...(value.tags || [])],
    only,
  })

const processFile = (file) => {
  const fileData = readFileSync(file).toString()
  if (!fileData.includes(AUTODOC)) {
    return
  }
  try {
    const comments = parseModule(fileData).comments
    const autodocComments = comments
      .filter(comment => comment.value.includes(AUTODOC))
      .map(({ value, loc }) => ({
        value: loadYamlSpec(value),
        loc,
        only: value.includes(ONLY),
      }))
    const filteredCommentsToProcess =
      autodocComments.filter(({ only }) => only)
    return filteredCommentsToProcess.length
      ? { comments: filteredCommentsToProcess, only: true }
      : { comments: autodocComments }
  } catch (err) {
    console.log(err.stack)
    throw new Error(`Failed to parse ${file}: ${err.message}`)
  }
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

const toDocFilePath = name =>
  `https://github.com/Sullux/fp-light/blob/master/${toDocFileName(name)}`

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
    .map(([name]) =>`* [${name}](${toDocFilePath(name)})`)
    .sort()
    .join('\n')
  const api = `[API](${toDocFilePath('api')})`
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
  const dependencies = [...compilation.fileDependencies]
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
  Object.keys(compilation.assets)
    .filter(key => key.endsWith('.md'))
    .forEach(key => {
      writeFileSync(key, compilation.assets[key].source())
    })
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
