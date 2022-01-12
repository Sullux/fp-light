import { readFileSync, writeFileSync } from 'fs'

const packageJson = JSON.parse(readFileSync('./package.json'))
delete packageJson.scripts
delete packageJson.devDependencies
delete packageJson.type
writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2))
