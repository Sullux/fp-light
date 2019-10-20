/* #AUTODOC#
module: API
name: constant
aliases: [$, always, just, scalar]
tags: [Convenience Functions]
description: |
  Given a value, returns a nullary function that will always return the original value.
examples: |
  ```javascript
  const meaning = constant('42')
  console.log(meaning()) // 42
  console.log(meaning('foo')) // 42
  const logMeaning = _(console.log, meaning)() // 42
  const logMeaning = _(console.log, meaning)('foo') // 42
  const logOops = _(console.log, '42')() // undefined
  ```
definition:
  types:
    Any: [Object, 'Null', Undefined]
  context:
    life: 42
    obj: { foo: 'bar' }
  specs:
    - signature: value:Any => => Any
      tests:
        - life => => life
        - life => obj => life
        - obj => => obj
        - obj => life => obj
        - => =>
        - => obj =>
*/
export const constant = value =>
  () => value

export const $ = constant
export const always = constant
export const just = constant
export const scalar = constant
