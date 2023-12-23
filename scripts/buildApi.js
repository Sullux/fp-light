import pkg from '../package.json' assert { type: 'json' }

const toSignature = ({ args, returns }) =>
  `(${Object.values(args).map(({ name, type }) => `${name} ${type}`).join(', ')}) => ${returns.type}`

const testsBySignature = (tests) => tests.reduce(
  (result, test) => {
    const signature = toSignature(test.details)
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
  `| _\`${name}\`_ | **\`${type}\`** | ${description || 'todo...'} |`

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
${error ? `❌ **${error.name}**: _${error.message}_` : '✅ **Pass**' }
${notes ? `\n${notes}\n` : ''}
`

const signatureDescriptionEntry = ({
  details: { usage, args, returns, features },
}) => `
${usage}

${features.length ? `\n_${features.join(', ')}_\n` : ''}
| Arg | Type | Description |
| --- | ---- | ----------- |${args.length ? `\n${Object.entries(args).map(argumentEntry).join('\n')}` : ''}
${argumentEntry(returns)}
`

const signatureEntry = ([
  signature,
  tests,
]) => `
**\`${signature}\`**
${signatureDescriptionEntry(tests[0])}\n${tests.map(testEntry).join('\n')}`

const entry = (name, signatures) => `### ${name}

${Object.entries(signatures).map(signatureEntry).join('\n')}
`

export const buildApi = (testLog) => {
  const tests = testLog.filter(({ type }) => type === 'test')
  const functions = functionsByName(tests)
  for (const name of Object.keys(functions)) {
    functions[name] = testsBySignature(functions[name])
  }
  const keys = Object.keys(functions).sort()
  const firstLetterCap = ([c]) => ((c === '_') || (c === '$')) ? '...' : c.toUpperCase()
  const groups = Object.fromEntries(groupBy.$(firstLetterCap, keys))
  const sectionNames = Object.keys(groups).sort()

  const nonAlpha = /[^a-zA-Z]/g
  const formattedName = (name) => `[${name}](#${name.toLowerCase().replace(nonAlpha, '-')})`

  const sectionRow = ([section, names]) =>
    `* ${formattedName(section)}\n  * ${names.map(formattedName).join('\n  * ')}\n` // todo

  const sectionIndex = sectionNames.map((name) =>
    ([name, groups[name].sort()])).map(sectionRow).join('\n')

  const functionEntry = (name) => entry(name, functions[name])

  const sections = sectionNames.map((name) => `## ${name}

  ${groups[name].sort().map(functionEntry).join('\n')}`).join('\n')

  return `[Home](https://github.com/Sullux/fp-light/blob/master/README.md) | **Full API**
| [Tutorial](https://github.com/Sullux/fp-light/blob/master/TUTORIAL.md)
| [Project Setup Guide](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE.md) ([CJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-CJS.md) / [MJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-MJS.md))

# API

${sectionIndex}

${sections}
`
}
