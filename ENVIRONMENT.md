# Environment

## trace

```typescript
declare function trace<T as function>(fn: T): T
```

_Tags: `{{Foundational}}`, `{{Environment}}`_

_Aliases: `(none)`_

_Description_

Given a function, returns the function with additional error processing. A
traced function, when it throws an error, will have a different stack trace
from an untraced function. The thrown error will also have additional
properties to aid in debugging.

Tracing is off by default. Turning tracing on will have a dramatic effect on
performance (up to 10x slower than without tracing). To turn on tracing, set
the environment variable FP_LIGHT_TRACE=on.

_Examples_

to do...
