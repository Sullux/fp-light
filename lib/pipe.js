import { appendedName, defineError, isAsync, isMissing, resolve, trace } from './'

/* #AUTODOC#
module: API
name: MissingPipeArgumentError
tags: [Error]
ts: |
  declare function MissingPipeArgumentError (
    this: MissingPipeArgumentError | undefined | void,
    arg: any,
    index: number
  ) : MissingPipeArgumentError extends Error
Description: |
  An error thrown when a null or undefined argument is compiled into a piped or
  composed function.
*/
export const MissingPipeArgumentError = defineError(
  'MissingPipeArgumentError',
  'ERR_MISSING_PIPE_ARGUMENT',
  (arg, index) => ({ message: `Argument ${index + 1} of the pipe is ${arg}.` }),
)

const assertNotMissingAndResolve = (value, i) => {
  if (isMissing.$(value)) {
    throw MissingPipeArgumentError(value, i)
  }
  return resolve(value)
}

/* #AUTODOC#
module: API
name: pipe
aliases: [I]
tags: [Compilable, Composition]
ts: |
  declare function pipe(...steps: resolvable[]): (initialValue: any) => any
description: |
  Piping is the basis for the FP library. A pipe is a unary function (accepts
  a single argument) that is composed of a sequence of other functions. When
  called, the pipe passes the argument to its first function. The result of that
  call is passed to the second function, etc. The result of the last function is
  the return value of the pipe. For this documentation, we will refer to these
  functions as "steps" in the pipe.

  In addition to the vanilla form of piping described above, this pipe
  implementation adds the additional feature of resolving each step of the pipe.
  That means that instead of a function, a step could be an array, object,
  string literal, etc.
examples: |
  A simple pipe.

  ```javascript
  const productOfIncrement = pipe(
    add(1),
    mul(2),
  )

  productOfIncrement(3) // 8
  ```

  A pipe with various resolving steps. This is a no-frills but fully-working
  example. Note that the two pipes include asynchronous steps, but that those
  steps will be automagically awaited by the piping infrastructure.

  ```javascript
  const { dynamoDB: { documentClient } } = require('@sullux/aws-sdk')()

  const tableName = process.env.TABLE_NAME
  const keyName = process.env.KEY_NAME

  const getItem = pipe(
    { TableName: tableName, Key: { [keyName]: _ } },
    documentClient.get,
    _.Item,
  )

  const putItem = pipe(
    { TableName: $tableName, Item: _ },
    documentClient.put,
    'Attributes',
  )
  ```
specs:
  - !spec
    name: pipe
    setup: {}
    fn: !js |
      pipe(x => x + 1, { y: _ })
    tests:
      - input: [41]
        output: { y: 42 }
      - input: ['foo']
        output: { y: 'foo1' }
*/
export const pipe = trace(function pipe (...steps) {
  const resolvableSteps = steps
    .map(assertNotMissingAndResolve)
    .map((fn, i) => appendedName(fn, `STEP_${i + 1}`))
    .map(trace)
  return initialValue =>
    resolvableSteps.reduce(
      (value, step) =>
        isAsync(value)
          ? value.then(awaitedValue => step(awaitedValue))
          : step(value),
      initialValue,
    )
})

export { pipe as I }

/* #AUTODOC#
module: API
name: compose
aliases: [f]
tags: [Compilable, Composition]
ts: |
  declare function compose(...steps: resolvable[]): (initialValue: any) => any
description: |
  This is the inverse of {{pipe}}.
example: |
  ```javascript
  pipe(a, b, c)(x) === compose(c, b, a)(x)
  ```
*/
export const compose = trace(function compose (...steps) {
  const resolvableSteps = steps
    .reverse()
    .map(assertNotMissingAndResolve)
    .map((fn, i) => appendedName(fn, `STEP ${i + 1}`))
    .map(trace)
  return initialValue =>
    resolvableSteps.reduce(
      (value, step) =>
        isAsync(value)
          ? value.then(awaitedValue => step(awaitedValue))
          : step(value),
      initialValue,
    )
})

export { compose as f }
