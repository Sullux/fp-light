const { stringLiteral } = require('./stringLiteral')

const stack = []

const defaultSource = {
  file: 'fws',
  line: 0,
  offset: 0,
  position: 0,
}

let typeId = 0
const createType = (name, source = defaultSource) => ({ /* eslint-disable-line no-return-assign */
  name,
  id: typeId += 1,
  source,
})

const defaultContext = {
  source: defaultSource,
  types: {
    Array: createType('Array'),
    Map: createType('Map'),
    String: createType('String'),
    Number: createType('Number'),
  },
  literals: {
    string: stringLiteral,
    number: () => {},
    label: () => {},
  },
  operators: {},
  state: {
    type: [], // todo
  },
}

const compile = (text, source, context = defaultContext) => {

}

module.exports = {
  compile,
}
