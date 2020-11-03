# Side Effect

## delay

```typescript
declare function delay<T>(ms: number, input: T) => Promise<T>
```

_Tags: `{{Async}}`, `{{Compilable}}`, `{{Side Effect}}`_

_Aliases: `(none)`_

_Description_

Given a number of milliseconds, resolves after the milliseconds have elapsed.

_Examples_

```javascript
const saveAndLoad = pipe(
saveRecord,
delay(100), // wait 100 ms before loading
loadRecord,
)
```

