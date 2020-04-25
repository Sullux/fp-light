# Strings

## tag

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
