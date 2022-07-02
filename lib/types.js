const jsTypes = {
  Array: Symbol('js.Array'),
  Map: Symbol('js.Map'),
  String: Symbol('js.String'),
  Number: Symbol('js.Number'),
  Function: Symbol('js.Function'),
}

const compileTypes = {
  Block: Symbol('compile.Block'),
  String: Symbol('compile.String'),
  Label: Symbol('compile.Label'),
  Operator: Symbol('compile.Operator'),
  Scope: Symbol('compile.Scope'),
  Sequence: Symbol('compile.Sequence'),
  Entry: Symbol('compile.Entry'),
}

module.exports = { jsTypes, compileTypes }
