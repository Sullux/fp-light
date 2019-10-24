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
  meaning() // 42
  meaning('foo') // 42
  ```
definition:
  types:
    Any: ~Object
  context:
    life: 42
    obj: { foo: 'bar' }
  specs:
    - signature: value:Any? => => Any?
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
