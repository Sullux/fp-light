import { compilable, is } from '.'

const includesProperties = (value, input) => {
  if (is.$(value, input)) {
    return true
  }
  if (!value || !input) {
    return false
  }
  return Reflect.ownKeys(value)
    .every(key => is.$(value[key], input[key]))
}

/* #AUTODOC#
module: API
name: includes
tags: [compilable, arrays, strings]
ts: |
  declare function includes(value: any, input: any): boolean
description: |
  If the input has its own `includes` method, return the result of
  calling that function with the given input; otherwise, if the input strict
  equals the value, return true; if the input or value are falsy, return false;
  or returns true if each of the values's own properties is matched by one of
  the input's own properties using strict equal logic.
examples: |
  Check if an array includes a value:

  ```javascript
  includes('foo')(['foo', 'bar']) // true
  ```

  Check if a string includes a substring:

  ```javascript
  includes('foo')('biz foo bar') // true
  ```

  Check other types of values:

  ```javascript
  includes(42)(42) // true
  includes('foo')(42) // false
  includes({})({}) // true
  includes({ foo: 42 })({ bar: baz }) // false
  includes({ foo: 42 })({ foo: 42, bar: baz }) // true
  ```
specs:
  - !spec
    name: includes
    fn: !js includes.$
    tests:
      - name: should test string includes
        input: ['bar', 'foo bar baz']
        output: true
      - name: should test array includes
        input: ['bar', ['foo', 'bar', 'baz']]
        output: true
      - name: should test object includes
        input: [{ foo: 'bar' }, { foo: 'bar', baz: 'biz' }]
        output: true
      - name: should test negative object includes
        input: [{ foo: 'bar' }, { baz: 'biz' }]
        output: false
      - name: should handle undefined input
        input: ['foo', undefined]
        output: false
      - name: should handle literal values
        intput: [42, 42]
        output: true
*/
export const includes = compilable(function includes (value, input) {
  return input && input.includes
    ? input.includes(value)
    : includesProperties(value, input)
})
