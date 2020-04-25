# Spreadable

## identity

_Aliases: `argument`, `_`_

_Description_

Given a value, returns that value. This is useful in cases where a resolvable
object needs to resolve the input into the output. This can also be useful in
cases where two logical branches must return a function, but where one branch
exhibits the "no change" logic (i.e. a function that returns the original
argument).

Additionally, `identity` proxies the property accessor such that an accessed
property returns a function that will retrieve that property from the given
argument. This means that `identity.foo` returns a function shaped like
`value => value.foo` and `identity[3]` returns a function shaped like
`value => value[3]`. Note that properties are resolved safely, meaning
`identity` will never throw on undefined.

_Examples_

This example demonstrates the branch-to-no-change logic. The `log` function
uses `identity` to pass logged values straight through to `console.log` while
the `logObject` function uses the JSON serializer.

```javascript
const logWith = serialize =>
  value =>
    console.log(serialize(value))

// log plain values
const log = logWith(identity)

// log serialized values
const logObject = logWith(JSON.stringify)
```

This example uses the `_` alias and the property accessor to mimic the
behavior of Scala's underscore operator.

```javascript
const area = multiply(_.x, _.y)

area({ x: 2, y: 3 }) // 6
```

This example shows how `identity` protects against accessing properties of
undefined values.

```javascript
const inners = map(_.nums[0])

inners([
  { nums: [42, 43] },
  {}, // this would throw if accessing literally with v => v.nums[0]
  { nums: [44] },
])
// [42, undefined, 44]
```
