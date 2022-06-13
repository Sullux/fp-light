import { join } from 'path'
import { readFile } from 'fs/promises'

import { importFile } from './import.js'
// import { yml } from './yml.js'
import { fws } from './fws.js'
import { ecma } from './ecma.js'

export {
  Syntax,
  Any,
  Every,
  Each,
  Some,
  Maybe,
  Element,
  Expression,
} from './syntax.js'

const defaultPath = process.env.PWD
const packageName = 'package.fws'

export const compile = async (path = defaultPath) => {
  if (!path.endsWith(packageName)) {
    return compile(join(path, packageName))
  }
  const text = await readFile(path).toString()
  const {
    name,
    version,
    description,
    main,
    export: exported,
    execute: entryPoint,
  } = fws(text)
}
