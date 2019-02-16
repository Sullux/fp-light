[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-spread

`npm i @sullux/fp-light-spread`
[source](https://github.com/Sullux/fp-light/blob/master/lib/spread/spread.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/spread/spread.spec.js)

The spread utility creates a function that accepts an array and spreads the array elements as arguments to the wrapped function.

* [spread](#spread)

### spread

`spread<T>(fn: (...Array<mixed>) => T): (args: Array<mixed>) => T`

While this utility doesn't do a complex job, it can help make some functional programming more readable as in the following example.

```javascript
const { pipe } = require('@sullux/fp-light-pipe')
const { range } = require('@sullux/fp-light-range')
const { spread } = require('@sullux/fp-light-spread')

const print1ToN = pipe(
  range(1),
  spread(console.log)
)

print1ToN(5)
// 1 2 3 4 5
```
