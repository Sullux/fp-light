const { Value } = require('./value')

const Fn = (...statements) => {
  if (!statements.length) { return () => {} }
  if (statements.length === 1) { return statements[0] }
  if (Array.isArray(statements[0])) {
    // todo
  }
}
