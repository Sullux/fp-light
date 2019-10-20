const { readFileSync } = require('fs')
const esprima = require('esprima')
const { inspect } = require('util')
const { safeLoad } = require('js-yaml')
const { runInNewContext } = require('vm')

// const { decode } = require('vlq')
// todo: track down compiled version of original source for testing
// see https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-base64vlq
// and https://www.bugsnag.com/blog/source-maps for information about parsing source maps

const AUTODOC = '#AUTODOC#'

const { main } = require('./package.json')

const appendToFile = (compilation, fileName, text) => {
  // console.log(Object.keys(compilation))
  const existing = (compilation.assets[fileName] || { source: () => '' }).source()
  const newText = `${existing}${text}`
  compilation.assets[fileName] = { source: () => newText, size: () => newText.length }
}

const parseModule = fileData =>
  esprima.parseModule(fileData, { loc:true, comment: true })

const processAutodoc = ({ value, loc }) => ({
  tests: [], // todo
  title: value.name,
  body: `\n_Aliases: \`${value.aliases.join('`, `')}\`_\n\n_Description_\n\n${value.description}\n_Examples_\n${value.examples}`,
  sections: [value.module || 'README', ...(value.tags || [])],
})

const processFile = lib =>
  (file) => {
    const fileData = readFileSync(file).toString()
    if (!fileData.includes(AUTODOC)) {
      return
    }
    const comments = parseModule(fileData).comments
    return comments.filter(comment => comment.value.includes(AUTODOC))
      .map(({ value, loc }) => ({
        value: safeLoad(value),
        loc,
      }))
      .map(processAutodoc)
  }

const compileSource = (source) => {
  const module = { exports: {} }
  const sandbox = {
    require,
    global,
    Promise,
    module,
  }
  runInNewContext(source, sandbox)
  return module.exports
}

const toDocFileName = name =>
  `${name.replace(/ /g, '-').toUpperCase()}.md`

const flatReducer = (all = [], parts) => ([...all, ...parts])

const autodocPlugin = (compilation, callback) => {
  const entryPoint = main || 'index.js'
  const source = compilation.assets[entryPoint].children[0]._value
  const lib = compileSource(source)
  const dependencies =  [...compilation.fileDependencies]
  const results = dependencies.map(processFile(lib))
    .filter(v => v)
    .reduce(flatReducer)
  /* result: {
    tests: [
      { test: '...', message: 'failed somehow' },
    ],
    title: 'constant',
    body: '...',
    sections: ['API', 'Convenience Functions']
  } */
  const docSections = results
    .map(({ title, body, sections }) =>
      sections.map(section => ({ section, title, body })))
    .reduce(flatReducer)
    .reduce(
      (sections, { section, title, body }) => ({
        ...sections,
        [section]: [...(sections[section] || []), `\n## ${title}\n${body}`],
      }),
      {},
    )
  console.log(docSections)
  Object.entries(docSections)
    .map(([section, markdown]) =>
      appendToFile(compilation, toDocFileName(section), `# ${section}\n${markdown}`))
  callback()
}

module.exports = { autodocPlugin }
