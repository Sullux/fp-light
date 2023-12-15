import * as fp from './index.js'

Object.assign(global, fp)

describe('resolve', () => {
  test('should deep await', async () => {
    const fn = resolve({
        foo: [Promise.resolve(42)],
        bar: Promise.resolve('baz'),
        value: _,
      })
    const result = await fn('biz')
    expect(result).toEqual({ foo: [42], bar: 'baz', value: 'biz' })
  })

  test('should spread compiled pipe', async () => {
    const inc = compilable(pipe(
      _.foo,
      foo => ({ inc: foo + 1}),
    ))
    const input = { foo: (41) }
    const fn = pipe(
      { ...inc({ ..._ }) },
    )
    expect(await fn(input)).toEqual({ inc: 42 })
  })

  test('should equal', () => {
    const extra = { test: 1, foo: true, bar: false}
    const justEnough = { foo: true, bar: false}
    const output = pipe(
      equal(({ extra: { test, ...rest } }) => rest, _.justEnough),
    )({
      extra,
      justEnough,
    })
    expect(output).toEqual(true)
  })

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
    test('should be spreadable', () => {
      const input = { foo: 42 }
      const output = pipe(
        { ..._, bar: 3 },
        _.foo,
      )(input)
      expect(output).toBe(42)
    })
    test('should be spreadable as a derived identity', () => {
      const input = { value: { foo: 42 } }
      const output = pipe(
        { ..._.value, bar: 3 },
        _.foo,
      )(input)
      expect(output).toBe(42)
    })
    test('should be spreadable in array', () => {
      const input = ['foo']
      const output = resolve([..._, 42])(input)
      expect(output).toEqual(['foo', 42])
    })
    test('should not resolve the "then" property', () => {
      expect(_.then).toBe(undefined)
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
    test('should settle a compilable arg', () => {
      const double = compilable((x) => x * 2)
      expect(pipe(double, double)(2)).toBe(8)
    })
    test('should compile to an identity proxy', () => {
      const coords = compilable((x, y) => ({ x, y }))
      const from2 = coords(2)
      expect(from2.x(3)).toBe(2)
    })
    test('should pass through the compiled function', () => {
      const add = compilable((x, y) => x + y)
      expect(add.$(1, 2)).toBe(3)
    })
    test('should handle async values', async () => {
      const add = compilable((x, y) => x + y)
      const add1 = add(1)
      const result = await add1(Promise.resolve(2))
      expect(result).toBe(3)
    })
    test('should compile tap', () => {
      let sideEffect
      const fn = compilable(tap(v => sideEffect = v + 1))
      expect(fn(_)(42)).toBe(42)
      expect(sideEffect).toBe(43)
    })
    test('should compile trap', () => {
      const add = compilable(trap(({ a, b }) => a + b))
      const fn = add({ a: _, b: _ })
      const [err, result] = fn(21)
      expect(result).toBe(42)
      expect(err).toBe(undefined)
    })
    test('should spread compiled function with an identity param', async () => {
      const inc = compilable((v) => ({ inc: v + 1 }))
      const input = { foo: (41) }
      const fn = pipe(
        { ...inc(_.foo) },
      )
      expect(await fn(input)).toEqual({ inc: 42 })
    })
  })
})
