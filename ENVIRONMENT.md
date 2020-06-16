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

Turning off tracing can improve performance. To turn off tracing in your app,
set the environment variable FP_LIGHT_TRACE=off.

_Examples_

to do...
