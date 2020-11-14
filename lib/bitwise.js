import { compilable } from './'

/* #AUTODOC#
module: API
name: bitand
aliases: [band, bitwise.and, bit.and]
tags: [Bitwise, Compilable]
ts: |
  declare function bitand(x: int, y: int): int
description: |
  Performs the bitwise AND operation as with the `&` operator.
specs:
  - !spec
    name: bitand
    fn: !js bitand.$
    tests:
      - name: should and bits
        input: [1, 3]
        output: 1
*/
export const bitand = compilable(function bitand (x, y) {
  return x & y
})

export { bitand as band }

/* #AUTODOC#
module: API
name: bitnot
aliases: [bnot, bitwise.not, bit.not]
tags: [Bitwise, Compilable]
ts: |
  declare function bitnot(x: int): int
description: |
  Performs the bitwise NOT operation as with the `~` operator.
specs:
  - !spec
    name: bitnot
    fn: !js bitnot.$
    tests:
      - name: should flip bits
        input: [-43]
        output: 42
*/
export const bitnot = compilable(function bitnot (x) {
  return ~x
})

export { bitnot as bnot }

/* #AUTODOC#
module: API
name: bitor
aliases: [bor, bitwise.or, bit.or]
tags: [Bitwise, Compilable]
ts: |
  declare function bitor(x: int, y: int): int
description: |
  Performs the bitwise OR operation as with the `|` operator.
specs:
  - !spec
    name: bitor
    fn: !js bitor.$
    tests:
      - name: should or bits
        input: [1, 2]
        output: 3
*/
export const bitor = compilable(function bitor (x, y) {
  return x | y
})

export { bitor as bor }

/* #AUTODOC#
module: API
name: bitxor
aliases: [bxor, bitwise.xor, bit.xor]
tags: [Bitwise, Compilable]
ts: |
  declare function bitxor(x: int, y: int): int
description: |
  Performs the bitwise XOR operation as with the `^` operator.
specs:
  - !spec
    name: bitxor
    fn: !js bitxor.$
    tests:
      - name: should exclusive or bits
        input: [1, 3]
        output: 2
*/
export const bitxor = compilable(function bitxor (x, y) {
  return x ^ y
})

export { bitxor as bxor }

/* #AUTODOC#
module: API
name: leftShift
aliases: [lshift]
tags: [Bitwise, Compilable]
ts: |
  declare function leftShift(x: int, y: int): int
description: |
  Performs the left shift operation as with the `<<` operator.
specs:
  - !spec
    name: leftShift
    fn: !js leftShift.$
    tests:
      - name: should shift bits left
        input: [1, 2]
        output: 4
*/
export const leftShift = compilable(function leftShift (x, y) {
  return x << y
})

export { leftShift as lshift }

/* #AUTODOC#
module: API
name: rightShift
aliases: [rshift]
tags: [Bitwise, Compilable]
ts: |
  declare function rightShift(x: int, y: int): int
description: |
  Performs the unsigned right shift operation as with the `>>>` operator. NOTE:
  the _signed_ right shift (the `>>` operator) is the {{shift}} function.
specs:
  - !spec
    name: rightShift
    fn: !js rightShift.$
    tests:
      - name: should shift bits right
        input: [4, 2]
        output: 1
*/
export const rightShift = compilable(function rightShift (x, y) {
  return x >>> y
})

export { rightShift as rshift }

export const bitwise = Object.freeze({
  and: bitand,
  not: bitnot,
  or: bitor,
  xor: bitxor,
})

export { bitwise as bit }
