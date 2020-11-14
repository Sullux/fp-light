# Mapping

## parallel

```typescript
declare function parallel(mapper: any, array: Array): Promise<Array>
```

_Tags: `{{Compilable}}`, `{{Mapping}}`_

_Aliases: `concurrent`_

_Description_

Given an async mapper and an array, invokes the mapper for each element in the
array concurrently. This is different from the behavior of the {{map}}
function which ensures the resolution of each element before executing the
mapper on the next element.

_Examples_

Using `map`:

```javascript
const input = [500, 100]

const test = map(pipe(
tap(delay(_)),
console.log,
))

test(input)
// 500
// 100
```

Using `parallel`:

```javascript
const input = [500, 100]

const test = parallel(pipe(
tap(delay(_)),
console.log,
))

test(input)
// 100
// 500
```

Note that while the `map` example prints the items in their original order,
the `parallel` function executes concurrently and thus the smaller delay
completes before the larger delay. Note that the output of each function is
identical as in the following example:

```javascript
const input = [500, 100]

const test = assertValid(equal(
map(tap(delay(_))),
parallel(tap(delay(_))),
))

test(input) // ok
```

