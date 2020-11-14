import {
  awaitAll,
  compilable,
  resolve,
} from './'

/* #AUTODOC#
module: API
name: parallel
aliases: [concurrent]
tags: [Compilable, Mapping]
ts: |
  declare function parallel(mapper: any, array: Array): Promise<Array>
description: |
  Given an async mapper and an array, invokes the mapper for each element in the
  array concurrently. This is different from the behavior of the {{map}}
  function which ensures the resolution of each element before executing the
  mapper on the next element.
examples: |
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
specs:
  - !spec
    name: parallel
    fn: !js |
      (input) => {
        const order = []
        const test = pipe(
          parallel(tap(pipe(
            delay(_, _),
            v => order.push(v),
          ))),
          output => ({ order, output }),
        )
        return test(input)
      }
    tests:
      - name: should execute the mapper in parallel
        input: [[500, 100]]
        output: !js |
          toAsync({ order: [100, 500], output: [500, 100] })
*/
export const parallel = compilable(function parallel (mapper, array) {
  const fn = resolve(mapper)
  return awaitAll(array.map(fn))
})

export { parallel as concurrent }
