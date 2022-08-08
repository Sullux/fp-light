# FWS

## Context

* `file`: the name of the file
* `line`: the 1-based line number
* `offset`: the 1-based character offset within the line
* `position`: the 0-based character position within the file
* `text`: the text being compiled
* `whitespace`: a string containing the set of whitespace characters
* `scope`:
  * `...[name/index]`: a map of in-scope values by name or 1-based index
* `parsers`: an array of in-scope parsers
* `operators`:
  * `...[name]`: a map of in-scope operators by name
* `pragmas`:
  * `...[name]`: a map of in-scope pragmas by name
* `element`: the current (popped) element
* `stack`: the stack (array) of parsed elements
* `advance(length)`: return a new context with the position advanced
* `addParser(parser)`: return a new context with the additional parser
* `addOperator(operator)`: return a new context with the additional operator
* `addPragma(pragma)`: return a new context with the additional pragma
* `push(element)`: return a new context with the element pushed to stack
* `pop()`: return a new context with the element popped from the stack
* `pushScope()`: return a new context with a pushed scope
* `popScope()`: return a new context with the previous scope restored
* `addToScope(key, value)`: return a new context with the new value in scope
