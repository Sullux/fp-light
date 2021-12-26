import { fail } from 'assert'
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import globPackage from 'glob'
const { sync: glob } = globPackage

/* Parse Params
This section of the code parses the command line switches into a meaningful set
of flags and values.
*/
const N = Number.MAX_SAFE_INTEGER

const assertFlag = {
  name: 'assert',
  switches: ['-a', '--assert']
}

const fileFlag = {
  name: 'files',
  switches: ['-f', '--files'],
  maxValues: 1
}

const ignoreFlag = {
  name: 'ignore',
  switches: ['-i', '--ignore'],
  maxValues: 1
}

const flagMap = [
  assertFlag,
  fileFlag,
  ignoreFlag
].reduce(
  (state, value) => ({
    ...state,
    ...value.switches.reduce(
      (all, current) => ({ ...all, [current]: value }),
      {}
    )
  }),
  {}
)

const [, , ...switches] = process.argv
// -ab, --foo, bar, baz

const allSwitches = switches.reduce(
  (state, value) => value[0] === '-' && value[1] !== '-'
    ? [...state, ...[...value.substring(1)].map((char) => `-${char}`)]
    : [...state, value],
  []
)
// -a, -b, --foo, bar, baz

const assertExists = (value, name) => value || fail(`Unrecognized command line switch '${name}'.`)
const flagsAndValues = allSwitches.map((value) => value.startsWith('-')
  ? { ...assertExists(flagMap[value], value), values: [] }
  : value)
// { name: 'a' }, { name: 'b' }, { name: 'foo' }, bar, baz

const addValue = (flags, flag, values, value) =>
  flag && (flag.values.length < flag.maxValues)
    ? {
      flags: [
        ...flags.slice(0, flags.length - 1),
        { ...flag, values: [...flag.values, value] }],
      values
    }
    : { flags, values: [...values, value] }
const addFlag = (flags, values, value) => {
  const flag = { ...value, values: [] }
  return {
    flags: [...flags, flag],
    values
  }
}
const { flags: populatedFlags, values } = flagsAndValues.reduce(
  ({ flags, values }, value) => ((typeof value) === 'string')
    ? addValue(flags, flags[flags.length - 1], values, value)
    : addFlag(flags, values, value),
  { flags: [], values: [] }
)
// flags: { name: 'a' }, { name: 'b' }, { name: 'foo', values: [bar] }
// values: baz

const flags = populatedFlags.reduce(
  (state, value) => ({
    ...state,
    [value.name]: value.values.length
      ? value.values
      : true
  }),
  {}
)
// { a: true, b: true, foo: [bar] }
// values: baz

/* Write Test Harness
This section of code generates the test harness.
*/

const globString = flags.files[0] // `+(${flags.files.join('|')})`
const globOptions = {
  ignore: flags.ignore[0] // `+(${(flags.ignore || []).join('|')})`,
}
console.log('searching', globString, globOptions)
const files = glob(globString, globOptions)
  .map((file) => `../${file}`) // file.substring(file.indexOf('/') + 1)
  .filter((file) =>
    (!values.length) || values.some((value) => file.includes(value)))

console.log('found test files:')
files.forEach((file) => console.log(' -', file))

const fileImports = files
  .map((file) => `import '${file}'`)
  .join('\n')

const testRun = readFileSync('scripts/testRun.js').toString()
const testRunWithFiles = testRun.replace('/* IMPORTS */', fileImports)
writeFileSync('scripts/.testRun_instance.js', testRunWithFiles)
execSync('node scripts/.testRun_instance.js', { stdio: 'inherit' })
execSync('rm scripts/.testRun_instance.js')
