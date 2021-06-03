import { awaitDelay, compilable } from './'

/* #AUTODOC#
module: API
name: delay
tags: [Async, Compilable, Side Effect]
ts: |
  declare function delay<T>(ms: number, input: T) => Promise<T>
description: |
  Given a number of milliseconds, resolves after the milliseconds have elapsed.
examples: |
  ```javascript
  const saveAndLoad = pipe(
    saveRecord,
    delay(100), // wait 100 ms before loading
    loadRecord,
  )
  ```
*/
// eslint-disable-next-line no-warning-comments
/*
TODO: figure out why this test fails
specs:
  - !spec
    name: delay
    setup: {}
    fn: !js |
      pipe(
        { ..._, pre: Date.now },
        delay(_.ms),
        { ms: _.ms, duration: sub(Date.now, _.pre) },
      )
    tests:
      - input: [{ ms: 100 }]
        output: !js |
          toAsync({ ms: 100, duration: or(gt(100), eq(100)) })
*/
export const delay = compilable(function delay (ms, input) {
  return awaitDelay(typeof ms === 'function' ? ms(input) : ms).then(() => input)
})
