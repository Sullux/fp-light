import { call, toCallable } from './call'
import { isAsync } from './async'

/* #AUTODOC#
module: API
name: pipeWith
tags: [Composition, Foundational]
description: |
  This function will not usually be used directly. This is the building block of
  the `pipe` and `compose` functions. The pipe function is simply defined as
  `pipeWith(call)` for example. The `pipeWith` function accepts an argument that
  maps a computational step to a function and returns a pipe function that
  accepts _n_ steps. When given steps, the pipe function returns a final
  function that is composed of each step.

  The final function will take an argument and pass it to each step in the pipe,
  taking the output of that step and passing it to the next step. Each step
  function, remember, is the result of passing the input step to the resolver.

  One additional piece of logic in this pipe generator factory is that when
  calling the next step with the current value, it will first check to see if
  the argument is asynchronous (a thennable). If so, the next step will return
  a promise that waits for the value to resolve before passing it to the step.
  In this way, if any step of the function returns an async result, all
  subsequent steps will return an async result.
examples: |
  While the standard pipe function uses callable steps by passing `call` as the
  resolver, this example imagines a pipe that extracts a property at each step.

  ```javascript
  const propertyPipe = pipeWith(prop => argument => argument[prop])

  const secondBar = propertyPipe(
    'foo',
    1,
    'bar',
  )

  const data = {
    foo: [
      {},
      { bar: 'baz' },
    ],
  }

  secondBar(data) // 'baz'
  ```
definition:
  types:
    Any: ~Object
    Resolver: Any => Any => Any
  context:
    data:
      foo:
        - {}
        - { bar: baz }
    properties: [foo, 1, bar]
    propertyResolver: { $lib: get }
    result: baz
  specs:
    - signature: resolver:Resolver => steps:...Any => Any => Any
      tests:
        - propertyResolver => ...properties => data => result
*/
export const pipeWith = resolver =>
  (...steps) => {
    const callableSteps = steps.map(resolver)
    return initialValue =>
      callableSteps.reduce(
        (value, step) =>
          isAsync(value)
            ? value.then(awaitedValue => step(awaitedValue))
            : step(value),
        initialValue,
      )
  }

/* #AUTODOC#
module: API
name: pipe
aliases: [I]
tags: [Callable, Composition]
description: |
  Piping is the basis for the FP library. A pipe is a unary function (accepts
  a single argument) that is composed of a sequence of other functions. When
  called, the pipe passes the argument to its first function. The result of that
  call is passed to the second function, etc. The result of the last function is
  the return value of the pipe. For this documentation, we will refer to these
  functions as "steps" in the pipe.

  In addition to the vanilla form of piping described above, this pipe
  implementation adds the additional feature of treating each step as a
  callable (see [call]({{call}}) for more information). That means that instead
  of a function, a step could be a string, array, object or any valid callable.

  The other benefit of this pipe implementation is that since it is based on
  [pipeWith]({{pipeWith}}), it will gracefully handle async values. If the input
  argument to the pipe or to any step is a promise, the foundational pipe
  infrastructure will wait for the promise to resolve before passing the
  resolved value to the next step.
examples: |
  A simple pipe.

  ```javascript
  const productOfIncrement = pipe(
    x => x + 1,
    x => x * 2,
  )

  productOfIncrement(3) // 8
  ```

  A pipe with various callables. This is a no-frills but fully-working example.
  Note that the two pipes include asynchronous steps, but that those steps will
  be automagically awaited by the piping infrastructure.

  ```javascript
  const { dynamoDB: { documentClient } } = require('@sullux/aws-sdk')()

  const $tableName = $(process.env.TABLE_NAME)
  const keyName = process.env.KEY_NAME

  const getItem = pipe(
    { TableName: $tableName, Key: { [keyName]: _ } },
    documentClient.get,
    'Item',
  )

  const putItem = pipe(
    { TableName: $tableName, Item: _ },
    documentClient.put,
    'Attributes',
  )

  // test the above functions assuming the configured key name is "id"
  const testIncrementValue = async (id) => {
    const item = await getItem(id)
    console.log(item) // { id: 'foo', value: 41 }
    await putItem({ ...item, value: item.value + 1 })
    const updatedItem = await getItem(id)
    console.log(updatedItem) // { id: 'foo', value: 42 }
    return updatedItem
  }

  testIncrementFooValue('foo')
  ```

  This is a rewrite of the test function from the previous example. This
  illustrates some of the benefits of declarative piping versus procedural code.
  This example assumes that `keyName`, `getItem` and `putItem` are defined as in
  the previous example.

  ```javascript
  const testIncrementValue = pipe(
    getItem,
    tap(console.log), // { id: 'foo', value: 41 }
    { ..._, value: increment('value') },
    tap(putItem),
    f(getItem, keyName),
    tap(console.log), // { id: 'foo', value: 42 }
  )
  ```
definition:
  types:
    Any: ~Object
  context:
    steps:
      - { $mock: [41 => 42] }
      - { $mock: [42 => true] }
  specs:
    - signature: steps:...Any => Any => Any
      tests:
        - ...steps => 41 => true
*/
// export const pipe = pipeWith(call)
const pipe = (...steps) =>
  initialValue =>
    steps.reduce(
      (value, step) =>
        isAsync(value)
          ? value.then(awaitedValue => step(awaitedValue))
          : step(value),
      initialValue,
    )

const callablePipe = toCallable(pipe)
callablePipe.raw = pipe

export {
  callablePipe as pipe,
  callablePipe as I,
}

const compose = (...steps) => {
  const reversedSteps = steps.reverse()
  return initialValue =>
    reversedSteps.reduce(
      (value, step) =>
        isAsync(value)
          ? value.then(awaitedValue => step(awaitedValue))
          : step(value),
      initialValue,
    )
}

const callableCompose = toCallable(compose)
callableCompose.raw = compose

export {
  compose as callableCompose,
  compose as f,
}
