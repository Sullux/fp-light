# Async

## awaitAll

_Aliases: `(none)`_

_Description_

Given an iterable, waits for all promises to resolve and then resolves to an
array of the resolved values in original input order.

_Examples_

```javascript
const first = Promise.resolve(41)
const second = 42
const third = Promise.resolve(43)
awaitAll([first, second, third]) // [41, 42, 43]
```

## awaitAny

_Aliases: `(none)`_

_Description_

Given an iterable, waits for the first promise from that iterable to resolve.

_Examples_

```javascript
const first = awaitDelay(10).then(() => 41)
const second = 42
const third = Promise.resolve(43)
awaitAny([first, second, third]) // 42
```

## awaitDelay

_Aliases: `(none)`_

_Description_

Given a number of milliseconds, resolves after the milliseconds have elapsed.

_Examples_

```javascript
const first = awaitDelay(10).then(() => 41)
const second = Promise.resolve(42)
awaitAny([first, second]) // 42
awaitAll([first, second]) // [41, 42]
```

## isAsync

_Aliases: `isPromise`, `isThennable`_

_Description_

Given any value, returns true if the value is thennable; otherwise, returns false.

_Examples_

```javascript
const asyncValue = Promise.resolve(42)
const value = 42
isAsync(value) // false
isAsync(asyncValue) // true
```

## reject

_Aliases: `(none)`_

_Description_

Given an error, returns a rejected promise for the error.

_Examples_

```javascript
const error = new Error('reasons')
const rejection = reject(error)
rejection.catch(caught => caught === error) // true
```

## toAsync

_Aliases: `toPromise`, `toThennable`_

_Description_

Given a value that may or may not be thennable, returns a thennable.

_Examples_

```javascript
const asyncValue = Promise.resolve(42)
const value = 42
toAsync(asyncValue).then(console.log) // 42
toAsync(value).then(console.log) // 42
isThennable(toAsync(value)) // true
```
