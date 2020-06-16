# Async

## awaitAll

```typescript
declare function awaitAll(value: Iterable<any>): Promise<any[]>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

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

```typescript
declare function awaitAny(promises: Iterable<any>): Promise<any>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

_Aliases: `race`_

_Description_

Given an iterable, waits for the first promise from that iterable to resolve.

_Examples_

```javascript
const first = awaitDelay(10).then(() => 41)
const second = 42
const third = Promise.resolve(43)
awaitAny([first, second, third]) // 42
```


## awaitArray

```typescript
declare function awaitArray(value: Iterable<any>): any[] | Promise<any[]>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given an iterable, deep awaits each value and then resolves to an array or
promise-to-array of the resolved values in original input order.
```

_Examples_

to do...

## awaitDelay

```typescript
declare function awaitDelay(ms: number) => Promise<void>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

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


## awaitObject

```typescript
declare function awaitObject(value: object): object | Promise<object>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given an object, deep awaits each value and then resolves to an object or
promise-to-object with each async value resolved to a synchronous value.
```

_Examples_

to do...

## deepAwait

```typescript
declare function deepAwait(value: any): any | Promise<any>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

_Aliases: `(none)`_

_Description_

Given any value, awaits and/or deep awaits using the {{#awaitArray}} and
{{#awaitObject}} functions and then resolves to the synchronous or
asynchronous result.
```

_Examples_

to do...

## isAsync

```typescript
declare function isAsync(value: any): boolean
declare function isPromise(value: any): boolean
declare function isThennable(value: any): boolean
```

_Tags: `{{Async}}`, `{{Foundational}}`_

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

```typescript
declare function reject<T>(value: T): Promise<T>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

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

```typescript
declare function toAsync<T>(value: T): Promise<T>
declare function toPromise<T>(value: T): Promise<T>
declare function toThennable<T>(value: T): Promise<T>
```

_Tags: `{{Async}}`, `{{Foundational}}`_

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

