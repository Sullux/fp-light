import * as fp from './'
import { log } from './testUtils'

Object.assign(global, fp)

describe('resolve', () => {
  describe('identity', () => {
    test('should return the original argument', () => {
      expect(_(42)).toBe(42)
      const input = { foo: 42 }
      expect(_(input)).toBe(input)
    })
    test('should return property', () => {
      const input = { foo: 42 }
      expect(_.foo(input)).toBe(42)
    })
    test('should return element', () => {
      const input = [41, 42, 43]
      expect(_[1](input)).toBe(42)
    })
    test.skip('should be spreadable', () => {
      const input = { foo: 42 }
      const output = pipe(
        { ..._, bar: 3 },
        _.foo,
      )(input)
      expect(output).toBe(42)
    })
  })

  describe('toPrimitiveFunction', () => {
    test('should be implemented on identity', () => {
      const input = {
        values: [1, 2, 3],
        offset: 1,
      }
      expect(_.values[_.offset](input)).toBe(2)
    })
    test('should allow primitive conversion of a custom function', () => {
      const input = [1, 2, 3]
      const last = toPrimitiveFunction((v) => v.length - 1)
      expect(_[last](input)).toBe(3)
    })
  })

  describe('compilable', () => {
    test('should compile zero args', () => {
      const add = compilable(() => 1 + 2)
      expect(add()()).toBe(3)
    })
    test('should compile single arg', () => {
      const add = compilable((x) => x + 2)
      expect(add(1)()).toBe(3)
    })
    test('should compile 2 args', () => {
      const add = compilable((x, y) => x + y)
      expect(add(1)(2)).toBe(3)
    })
  })
})
