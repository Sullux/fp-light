import { statSync } from 'node:fs'
import pkg from '../package.json' assert { type: 'json' }

const consoleEscapeRegex = new RegExp('\x1B\\[[0-9]*m', 'g')
const fromConsole = (text) => text.replace(consoleEscapeRegex, '')

const nonAlpha = /[^a-zA-Z]/g
const bookmarkFormatted = (name) => name.toLowerCase().replace(nonAlpha, '-')
const bookmark = (text, name) => `[${text}](#${name})`
const nameToBookmark = (name) => bookmark(name, bookmarkFormatted(name))

const toSignature = ({ args, returns, operator, name }) =>
  operator === 'instanceof'
    ? `${args[0].name}:${args[0].type} instanceof ${name}`
    : `(${Object.values(args).map(({ name, type }) => `${name}:${type}`).join(', ')}) => ${returns.type}`

const testsBySignature = (tests) => tests.reduce(
  (result, test) => {
    const signature = test.type === 'alias'
      ? 'void => void'
      : toSignature(test.details)
    const tests = result[signature] || []
    return {
      ...result,
      [signature]: [...tests, test],
    }
  },
  {},
)

const functionsByName = (tests) => tests.reduce(
  (result, test) => {
    const name = test.details.name
    const tests = result[name] || []
    return {
      ...result,
      [name]: [...tests, test],
    }
  },
  {},
)

const argumentEntry = ({ name = '=>', type, description }) =>
  `| _\`${name}\`_ | **\`${type}\`** | ${description || ' '} |`

const testEntry = ({
  description,
  impl,
  duration,
  error,
  details: { notes },
}) => `
#### TEST: ${description}

\`\`\`javascript
${impl}
\`\`\`

v ${pkg.version} -- ${duration} ms --
${error ? `❌ **${error.name}**: \n\n\`\`\`\n${fromConsole(error.message)}\n\`\`\`` : '✅ **Pass**' }
${notes ? `\n${notes}\n` : ''}
`

const signatureDescriptionEntry = ({
  details: { usage, args, returns },
}) => `
${usage}

| Arg | Type | Description |
| --- | ---- | ----------- |${args.length ? `\n${args.map(argumentEntry).join('\n')}` : ''}
${argumentEntry(returns)}
`

const testSignatureEntry = (signature, tests) => `
**\`${signature}\`**
${signatureDescriptionEntry(tests[0])}\n${tests.map(testEntry).join('\n')}`

const aliasSignatureEntry = ({ details: { alias } }) =>
  `_${bookmark(`alias for ${alias}`, bookmarkFormatted(alias))}_`

const signatureEntry = ([signature, tests]) =>
  tests[0].details.alias ? aliasSignatureEntry(tests[0]) : testSignatureEntry(signature, tests)

const entry = (name, signatures) => {
  const entries = Object.entries(signatures)
  const aliases = entries[0][1][0].aliases
  const aliasEntry = aliases?.length
    ? `\nAliases: ${aliases.map(nameToBookmark).join(' | ')}\n`
    : ''
  const features = entries[0][1][0].details.features
  const featuresEntry = features?.length ? `\n_Related: ${features.join(', ')}_\n` : ''
  return `### ${name}\n${aliasEntry}${featuresEntry}
${entries.map(signatureEntry).join('\n')}
`
}

const toRef = (value) => {
  const argsStart = value.indexOf('(')
  const name = (argsStart === -1) ? value : value.substring(0, argsStart)
  return name.toLowerCase()
}

const fileSize = (file) => {
  try {
    return `${Math.round(statSync(file).size / 10) / 100}k`
  } catch(err) {
    return '_[build the distributable module to get this value]_'
  }
}

export const buildApi = (testLog) => {
  // const tests = testLog.filter(({ type }) => type === 'test')
  const tests = testLog.filter(({ type }) => ((type === 'test') || type === 'alias'))
  const functions = functionsByName(tests)
  for (const name of Object.keys(functions)) {
    functions[name] = testsBySignature(functions[name])
  }
  const keys = Object.keys(functions).sort()
  const firstLetterCap = ([c]) => ((c === '_') || (c === '$')) ? '...' : c.toUpperCase()
  const groups = Object.fromEntries(groupBy.$(firstLetterCap, keys))
  const sectionNames = Object.keys(groups).sort()
  const sectionRow = ([section, names]) =>
    `* ${nameToBookmark(section)}\n  * ${names.map(nameToBookmark).join('\n  * ')}\n` // todo

  const sectionIndex = sectionNames.map((name) =>
    ([name, groups[name].sort()])).map(sectionRow).join('\n')

  const functionEntry = (name) => entry(name, functions[name])
  const section = (name) => groups[name].sort().map(functionEntry).join('\n')
  const testsOnly = tests.filter(({ type }) => type === 'test')
  const passingTests = testsOnly.filter(({ error }) => !error).length
  const failingTests = testsOnly.length - passingTests
  const sections = sectionNames.map((name) => `## ${name}

  ${section(name)}`).join('\n')

  const body = sections.replace(
    /\{\{([^}]*)}}/g,
    (match, capture) => `[\`${capture}\`](#${toRef(capture)})`,
  )

  return `[Home](https://github.com/Sullux/fp-light/blob/master/README.md) | **Full API**
| [Tutorial](https://github.com/Sullux/fp-light/blob/master/TUTORIAL.md)
| [Project Setup Guide](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE.md) ([CJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-CJS.md) / [MJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-MJS.md))

# API

This API is set up for easy cross referencing. It is divided into sections
alphabetically and each section contains reference sections for each function
and alias. Additionally, each function reference contains links to aliases and
also links to related functions.

## Stats

* total functions: ${keys.length}
* passing tests: ${passingTests}
* failing tests: ${failingTests}
* module size: ${fileSize('./dist/index.js')}

## Index

${sectionIndex}

${body}
`
}
