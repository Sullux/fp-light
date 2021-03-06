# strings

## includes

```typescript
declare function includes(value: any, input: any): boolean
```

_Tags: `{{compilable}}`, `{{arrays}}`, `{{strings}}`_

_Aliases: `(none)`_

_Description_

If the input has its own `includes` method, return the result of
calling that function with the given input; otherwise, if the input strict
equals the value, return true; if the input or value are falsy, return false;
or returns true if each of the values's own properties is matched by one of
the input's own properties using strict equal logic.

_Examples_

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

# Strings

## tag

```typescript
// todo: typescript declaration
```

_Tags: `{{Convenience Functions}}`, `{{Strings}}`_

_Aliases: `template`_

_Description_

Used as a tag for a template literal, returns a function that will resolve to
the interpolated string.

_Examples_

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

