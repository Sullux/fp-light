const { readdirSync, writeFileSync } = require('fs')

const files = readdirSync('./lib')
  .filter(file => !file.includes('.spec.js'))
  .map(name => `export * from './${name}'`)

writeFileSync('./lib/index.js', [...files, ''].join('\n'))
