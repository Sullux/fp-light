import { isIterable, override } from '.'

/* #AUTODOC#
module: API
name: spread
tags: [Composition, Foundational]
ts: |
  declare function spread<T>(fn: (...args: any) => T): (args: any[]) => T
description: |
  Given a function that accepts arguments, return a function that accepts an
  array of arguments and spreads them to the underlying function on invocation.
examples: |
  Spreading to allow logging array elements individually:

  ```javascript
  const logSquares = pipe(
    map(square(_)),
    spread(console.log),
  )
  logSquares([2, 3])
  // 4 8
  ```
specs:
  - !spec
    name: spread
    fn: !js spread
    tests:
      - name: should spread an array to the underlying function params
        input:
          - !js add.$
        output: !js |
          fn => fn([1, 2]) === 3
*/
export const spread = function spread (fn) {
  return override({
    apply: (target, thisArg, args) => {
      const array = args[0] || []
      if (!isIterable.$(array)) {
        throw new TypeError(`Expected an iterable to spread to function ${fn.name}(); got ${array} instead.`)
      }
      return target(...array)
    },
  }, fn)
}

/* #AUTODOC#
module: API
name: gather
tags: [Composition, Foundational]
ts: |
  declare function gather(<arg>: <type>): <type>
description: |
  <add description here>
examples: |
  <add code blocks and explanations here>
specs:
  - !spec
    name: gather
    fn: !js gather
    tests:
      - name: should gather args into an array for the underlying function
        input:
          - !js |
              ([x, y, z]) => (x + y) === z
        output: !js |
          fn => fn(1, 2, 3)
*/
export const gather = function gather (fn) {
  return override({
    apply: (target, thisArg, args) => target(args),
  })(fn)
}
