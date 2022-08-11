# FWS

## Context

* `file`: the name of the file
* `line`: the 1-based line number
* `offset`: the 1-based character offset within the line
* `position`: the 0-based character position within the file
* `text`: the text being compiled
* `scope`:
  * `...[name/index]`: a map of in-scope values by name or 1-based index
* `stack`: the stack (array) of parsed elements
* `advance(length)`: return a new context with the position advanced
* `push(element, [length])`: return a new context with the element pushed to stack and optionally advanced the given length
* `pop()`: return a new context with the element popped from the stack
* `next()`: return a new context with the next element pushed
