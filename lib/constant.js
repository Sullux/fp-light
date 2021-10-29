import { isAsync, resolve } from '.'

const interpolateSync = (parts, values) => {
  const result = []
  parts.forEach((part, i) => {
    result.push(part)
    if (i < values.length) {
      result.push(values[i])
    }
  })
  return result.join('')
}

const interpolate = (parts, mappers) => {
  const resolveMappers = resolve(mappers)
  return value => {
    const mappedValues = resolveMappers(value)
    return isAsync(mappedValues)
      ? mappedValues.then(values => interpolateSync(parts, values))
      : interpolateSync(parts, mappedValues)
  }
}

/* #AUTODOC#
module: API
name: tag
aliases: [template]
tags: [Convenience Functions, Strings]
description: |
  Used as a tag for a template literal, returns a function that will resolve to
  the interpolated string.
examples: |
  ```javascript
  pipe(
    tap(console.log),
    tag`first ${_.x} then ${_.y}`,
    tap(console.log),
  )({ x: 'foo', y: 'bar' })
  ```

  outputs:

  ```
  { x: 'foo', y: 'bar' }
  first foo then bar
  ```
*/
export const tag = (parts, ...mappers) =>
  interpolate(parts, mappers)

export { tag as template }

/* #AUTODOC#
module: API
name: constant
aliases: [$, always, just, scalar]
tags: [Convenience Functions]
description: |
  Given a value, returns a nullary function that will always return the original
  value. NOTE: as a convenience, if multiple arguments are passed to this
  function it will resort to the behavior of `tag()`; thus

  ```javascript
  $`before ${_} after`
  ```
  is identical to

  ```javascript
  tag`before ${_} after`
  ```
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
export const constant = (value, ...stringMappers) =>
  stringMappers.length
    ? interpolate(value, stringMappers)
    : () => value

export {
  constant as $,
  constant as always,
  constant as just,
  constant as scalar,
}
