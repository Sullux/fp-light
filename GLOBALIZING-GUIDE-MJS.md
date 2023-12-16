[Home](https://github.com/Sullux/fp-light/blob/master/README.md) | [Full API](https://github.com/Sullux/fp-light/blob/master/API.md)
| [Tutorial](https://github.com/Sullux/fp-light/blob/master/TUTORIAL.md)
| [Project Setup Guide](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE.md) ([CJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-CJS.md) / **MJS**)

# Guide To Globalizing The FP Language Elements: ES Modules

You've chosen ES Modules. We are the hipsters who use the latest tech, but we tend to have compatibility problems with some popular dev tools which can make us a little harder to work with.

* [Global Import File](#global_import_file)
* [Jest](#jest)
* [Linter](#linter)

## Global Import File

We recommend having a global file whose job it is to set up all global language elements. This file can then be imported in an `index.js` file or in a test setup or any other entry point to the system. This also provides a convenient place to introduce/modify language elements, something most FP Light users choose to do as they start using the library.

```javascript
// ./fp.js
import * as fp from '@sullux/fp-light'

export const customGlobals = {
  ...fp,
  // add other globals here, such as:
  // globalThis.key: _[0]
  // globalThis.value: _[1]
}
// globalize it
Object.assign(globalThis, customGlobals)
// export it (you may need this later for your linter!)
```

Now in your entry points (such as `index.js`) you can just import this one file, such as:

```javascript
// index.js
import '../fp.js'

// rest of your index.js code here
```

## Jest

Jest has a few ways to set up the global scope. After experimenting, the best way seems to be to use the `globalSetup` option in the Jest config. WARNING: as far as we can tell, Jest only supports CJS. That means the setup file (below) must use `require` and `module.exports`.

```javascript
// in jest.config.js
module.exports = {
  // ...other setup
  globalSetup: './jestSetup.js',
}
```

Which requires you to create the jest setup file itself:

```javascript
// ./jestSetup.js
module.exports = () => {
  require('./fp') // set up the global scope
}
```

Jest requires this module to export a function, so we obey.

## Linter

This is a big topic with lots of possibilities that we won't go into here. Luckily, most linters seem to have one important concept, and that is a list of known globals. For FP Light it's a pretty long list. We use [standardx](https://github.com/standard/standardx) ourselves. That allows us to dump our globals straight into our `package.json` file as:

```json
{
  "standardx": {
    "global": [
      "_",
      "baseIdentity",
      "baseArgument",
      "_base",
      "thisIdentity",
      "thisArgument",
      "_this",
      "isResolve",
      "resolve",
      // etc.
    ]
  }
}
```

Since standardx is based on eslint, another (better?) option is to put these in the `.eslintrc` file. Either way, you can do this as a one-time step or you can use a script to do it for you. We like the idea of building the globals list as a build step, but either way, it's useful to add a script to your `package.json`. Ours looks like this:

```json
{
  "scripts": {
    // you can run this with `yarn globals`` or `npm run globals`
    "globals": "node ./setupGlobals.js"
  }
}
```

```javascript
// ./setupGlobals.js
import { readFileSync, writeFileSync } from 'fs'
import { customGlobals } from './fp'

const readEslint = () => {
  try {
    return JSON.parse(readFileSync('./.eslintrc').toString())
  } catch() {
    return {}
  }
}
const eslint = readEslint()
const existingGlobals = eslint.globals || []

const customGlobalNames = Object.keys(customGlobals)
const globals = [...(new Set([...existingGlobals, ...customGlobalNames]))]

const newEslint = {
  ...eslint,
  globals,
}

writeFileSync('./.eslintrc', JSON.stringify(newEslint, null, 2))
```

Now, either explicitly or as part of your build, whenever you modify your global setup file you can run `yarn globals` or `npm run globals` and your changes will be reflected in your `.eslintrc` file. Note that the above logic is additive, so if you want to _remove_ a global you will need to edit the `.eslintrc` file by hand to remove it.
