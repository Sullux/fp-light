import { writeFileSync } from 'fs'
import * as fp from '../dist/index.js'
Object.assign(globalThis, fp)

const keys = Object.keys(fp).sort()
const firstLetterCap = ([c]) => ((c === '_') || (c === '$')) ? '...' : c.toUpperCase()
const groups = Object.fromEntries(groupBy.$(firstLetterCap, keys))
const sectionNames = Object.keys(groups).sort()

const nonAlpha = /[^a-zA-Z]/g
const formattedName = (name) => `[${name}](#${name.toLowerCase().replace(nonAlpha, '-')})`

const sectionRow = ([section, names]) =>
  `* ${formattedName(section)}\n  * ${names.map(formattedName).join('\n  * ')}\n` // todo

const sectionIndex = sectionNames.map((name) =>
  ([name, groups[name].sort()])).map(sectionRow).join('\n')

const entry = (name) => `### ${name}

_features_

**\`${name}()\`**

* args
* returns

\`\`\`javascript
// example
\`\`\`
`

const sections = sectionNames.map((name) => `## ${name}

${groups[name].sort().map(entry).join('\n')}`).join('\n')

const output = `[Home](https://github.com/Sullux/fp-light/blob/master/README.md) | **Full API**
| [Tutorial](https://github.com/Sullux/fp-light/blob/master/TUTORIAL.md)
| [Project Setup Guide](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE.md) ([CJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-CJS.md) / [MJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-MJS.md))

# API

${sectionIndex}

${sections}
`

writeFileSync('./API_BUILD.md', output)
