// eslint-disable-next-line
/* global $, Any, Async, DeepAsync, isDeepAsync, DeepSync, isDeepSync, Sync, I, InvalidTrapTargetError, MissingPipeArgumentError, Null, Primitive, Undefined, ValidationError, _, _base, _this, add, always, and, any, anyOf, appendedName, argument, arity, arraySpreadFrom, asPromise, aside, assertValid, awaitAll, awaitAny, awaitArray, awaitDelay, awaitObject, band, baseArgument, baseIdentity, binary, bit, bitand, bitnot, bitor, bitwise, bitxor, bnot, bor, bxor, call, charAt, charCodeAt, charPointAt, compare, compareTypes, comparer, comparing, compilable, compose, concat, concurrent, conditional, constant, construct, constructed, constructor, curry, deepAwait, deepEqual, defaultHashToStringOutputChars, defineError, delay, dispatch, div, divide, dotAll, endsWith, eq, equal, equalTo, every, exists, exp, exponent, f, fail, failWith, fallback, falsy, filter, flat, fromBase, fromCharCode, fromCodePoint, functionName, gather, get, getArraySpread, getObjectSpread, getSpreadable, globalMatch, greater, greaterThan, groupBy, gt, hash, hashAny, hashFrom, hashToDouble, hashToInt, hashToString, identity, ignoreCase, includes, indexOf, is, isArray, isAsync, isBoolean, isCompiled, isDate, isDefined, isError, isErrorOf, isExactType, isExactly, isExtendedFrom, isFalsy, isFunction, isIdentity, isInteger, isIterable, isMap, isMissing, isNull, isNumber, isObject, isPromise, isRegex, isResolve, isSet, isSpreadable, isSpreadableSymbol, isString, isSymbol, isSync, isThennable, isTruthy, isType, isUndefined, isValid, join, just, lastIndexOf, left, leftShift, less, lessThan, literal, lshift, lt, map, mod, modulo, mul, multiline, multiply, named, nary, not, notExists, nullary, or, override, padEnd, padStart, parallel, parse, pipe, pow, product, propertyValue, proxy, race, reduce, regex, reject, rem, remainder, required, resolve, rest, reverse, right, rightShift, round, rshift, same, sameType, scalar, select, selectCase, shallowResolve, shift, some, sort, spread, spreadableSymbol, sqr, sqrt, square, squareRoot, startsWith, sticky, strictEqual, strictEqualType, stringify, sub, subtract, sync, syncSymbol, tag, tap, template, ternary, thisArgument, thisIdentity, toArray, toAsync, toIdentity, toObject, toPrimitiveFunction, toPromise, toRegex, toSpreadable, toThennable, trace, trap, trapAsync, truthy, typeName, typeOf, unary, uncurry, unicode, validate, when, without, xor */
import * as fp from '../index.js'

Object.assign(global, fp)

/*
✅ Async
✅ DeepAsync
✅ DeepSync
awaitAny
✅ awaitArray
awaitDelay
✅ awaitObject
✅ deepAwait
isAsync
isDeepAsync
isDeepSync
isSync
reject
Sync
syncSymbol
toAsync
*/

describe({
  name: 'Async',
  usage: 'As a type, passes the `instanceof` operand to {{isAsync}}. As a factory, passes through to {{toAsync}}.',
  features: ['Factory', 'Type', '{{isAsync}}', '{{toAsync}}'],
}, () => {
  describe({
    operator: 'instanceof',
    args: [{
      name: 'value',
      type: 'Any',
      description: '`value instanceof Async` is equivalent to {{isAsync(value)}}',
    }],
    returns: { type: 'Boolean', description: 'the result of {{isAsync(value)}}' },
  }, () => {
    it('should pass through to isAsync', () => {
      const input = [
        undefined,
        null,
        42,
        'foo',
        true,
        { foo: 42 },
        ['foo'],
        Promise.resolve(42),
        { then: (res) => res(42) },
        { foo: Promise.resolve(42) },
      ]
      const output = input.map((value) => value instanceof Async)
      const expected = input.map(isAsync)
      expect(output).toEqual(expected)
    })
  })
  describe({
    args: [{
      name: 'value',
      type: 'T',
      description: '`Async(value)` is equivalent to `{{toAsync(value)}}`',
    }],
    returns: { type: '*T', description: 'the result of {{toAsync(value)}}' },
  }, () => {
    it('should pass through to toAsync', async () => {
      const input = [
        undefined,
        null,
        42,
        'foo',
        true,
        { foo: 42 },
        ['foo'],
        Promise.resolve(42),
      ]
      const output = await Promise.all(input.map(Async))
      const expected = await Promise.all(input.map(toAsync))
      expect(output).toEqual(expected)
    })
  })
})

describe({
  name: 'DeepAsync',
  usage: 'As a type, passes the `instanceof` operand to {{isDeepAsync}}. As a factory, passes through to {{toAsync}}.',
  features: ['Factory', 'Type', '{{isDeepAsync}}', '{{toAsync}}'],
}, () => {
  describe({
    operator: 'instanceof',
    args: [{
      name: 'value',
      type: 'Any',
      description: '`value instanceof DeepAsync` is equivalent to {{isDeepAsync(value)}}',
    }],
    returns: { type: 'Boolean', description: 'the result of {{isDeepAsync(value)}}' },
  }, () => {
    it('should pass through to isDeepAsync', async () => {
      const input = [
        undefined,
        null,
        42,
        'foo',
        true,
        { foo: 42 },
        ['foo'],
        Promise.resolve(42),
        { then: (res) => res(42) },
        { foo: Promise.resolve(42) },
        { foo: [40, 2] },
        { foo: [40, Promise.resolve(2)] },
        [Promise.resolve('foo')],
        ['foo', { bar: 42 }],
        ['foo', { bar: Promise.resolve(42) }],
      ]
      const output = input.map((value) => value instanceof DeepAsync)
      const expected = input.map(isDeepAsync)
      expect(output).toEqual(expected)
    })
  })
  describe({
    args: [{
      name: 'value',
      type: 'T',
      description: 'DeepAsync(value) is equivalent to {{toAsync(value)}}',
    }],
    returns: { type: '*T', description: 'the result of {{toAsync(value)}}' },
  }, () => {
    it('should pass through to toAsync', async () => {
      const input = [
        undefined,
        null,
        42,
        'foo',
        true,
        { foo: 42 },
        ['foo'],
        Promise.resolve(42),
      ]
      const output = await Promise.all(input.map(DeepAsync))
      const expected = await Promise.all(input.map(toAsync))
      expect(output).toEqual(expected)
    })
  })
})

describe({
  name: 'DeepSync',
  usage: 'As a type, passes the `instanceof` operand to {{isDeepSync}}. As a factory, passes through to {{deepAwait}}.',
  features: ['Factory', 'Type', '{{isDeepSync}}', '{{deepAwait}}'],
}, () => {
  describe({
    operator: 'instanceof',
    args: [{
      name: 'value',
      type: 'Any',
      description: '`value instanceof DeepSync` is equivalent to {{isDeepSync(value)}}',
    }],
    returns: { type: 'Boolean', description: 'the result of {{isDeepSync(value)}}' },
  }, () => {
    it('should pass through to isDeepSync', () => {
      const input = [
        undefined,
        null,
        42,
        'foo',
        true,
        { foo: 42 },
        ['foo'],
        Promise.resolve(42),
        { then: (res) => res(42) },
        { foo: Promise.resolve(42) },
        { foo: [40, 2] },
        { foo: [40, Promise.resolve(2)] },
        [Promise.resolve('foo')],
        ['foo', { bar: 42 }],
        ['foo', { bar: Promise.resolve(42) }],
      ]
      const output = input.map((value) => value instanceof DeepSync)
      const expected = input.map(isDeepSync)
      expect(output).toEqual(expected)
    })
  })
  describe({
    args: [{
      name: 'value',
      type: 'T',
      description: 'DeepSync(value) is equivalent to {{deepAwait(value)}}',
    }],
    returns: { type: '*T', description: 'the result of {{deepAwait(value)}}' },
  }, () => {
    it('should pass through to deepAwait', async () => {
      const input = [
        null,
        undefined,
        42,
        'foo',
        true,
        { foo: 42, bar: ['baz', 'biz'] },
        ['foo', { bar: 42 }],
        { foo: Async(42), bar: ['baz', Async('biz')] },
        [Async('foo'), { bar: Async(42) }],
      ]
      const output = await input.map(DeepSync)
      const expected = await input.map(deepAwait)
      expect(output).toEqual(expected)
    })
  })
})

describe({
  name: 'deepAwait',
  usage: `Returns the original primitive or already deeply-synchronous value _or_ returns a promise to a primitive or deeply-synchronous value, following this logic:
    * If primitive or falsy, return the original value.
    * If async, deep await the resolved value.
    * If an array with async elements, return a Promise to a {{DeepSync}} array.
    * If an iterable (e.g. Set, Map) with async elements, return a Promise to a new {{DeepSync}} iterable.
    * If matching a custom deep await (see {{onDeepAwait}}), return the result of the custom deep await.
    * If an object with async properties, return a Promise to a {{DeepSync}} object.
    * Otherwise, return the original value.`,
}, () => {
  describe({
    args: [{
      name: 'value',
      type: 'DeepSync',
      description: 'a deeply-synchronous value',
    }],
    returns: { type: 'DeepSync', description: 'the original value' },
  }, () => {
    it('should return a primitive or falsy value unchanged', () => {
      expect(deepAwait(null)).toBe(null)
      expect(deepAwait(undefined)).toBe(undefined)
      expect(deepAwait(42)).toBe(42)
      expect(deepAwait('foo')).toBe('foo')
      expect(deepAwait(true)).toBe(true)
      const fn = () => {}
      expect(deepAwait(fn)).toBe(fn)
    })

    it('should return a deeply synchronous object unchanged', () => {
      const input = { foo: 42, bar: ['baz', 'biz'] }
      const output = deepAwait(input)
      expect(output).toBe(input)
    })

    it('should return a deeply synchronous array unchanged', () => {
      const input = ['foo', { bar: 42 }]
      const output = deepAwait(input)
      expect(output).toBe(input)
    })

    it('should return a deeply synchronous Set unchanged', () => {
      const input = new Set(['foo', { bar: 42 }])
      const output = deepAwait(input)
      expect(output).toBe(input)
    })

    it('should return a deeply synchronous Map unchanged', () => {
      const input = new Map([['foo', { bar: 42 }], ['baz', { biz: 42 }]])
      const output = deepAwait(input)
      expect(output).toBe(input)
    })
  })
  describe({
    args: [{
      name: 'value',
      type: 'DeepAsync',
      description: 'a deeply-synchronous value',
    }],
    returns: { type: '*DeepSync', description: 'a promise to the original value but with all object properties and array elements deeply resolved' },
  }, () => {
    it('should deep await an object', async () => {
      const input = { foo: Async(42), bar: ['baz', Async('biz')] }
      const output = await deepAwait(input)
      const expected = { foo: 42, bar: ['baz', 'biz'] }
      expect(output).toEqual(expected)
    })

    it('should deep await an array', async () => {
      const input = [Async('foo'), { bar: Async(42) }]
      const output = await deepAwait(input)
      const expected = ['foo', { bar: 42 }]
      expect(output).toEqual(expected)
    })

    it('should deep await a Set', async () => {
      const input = new Set([Async('foo'), { bar: Async(42) }])
      const output = await deepAwait(input)
      const expected = new Set(['foo', { bar: 42 }])
      expect(output).toEqual(expected)
    })

    it('should deep await a Set', async () => {
      const input = new Set([
        [Async('foo'), { bar: 42 }],
        ['baz', { biz: Async(42) }],
      ])
      const output = await deepAwait(input)
      const expected = new Set([
        ['foo', { bar: 42 }],
        ['baz', { biz: 42 }],
      ])
      expect(output).toEqual(expected)
    })
  })
})

describe('sync', () => {
  test('should sync an object', () => {
    const input = { foo: 42, bar: 'baz' }
    const syncInput = Sync(input)
    expect(isSync(syncInput)).toBe(true)
  })

  test('should sync a frozen object', () => {
    const input = Object.freeze({ foo: 42, bar: 'baz' })
    const syncInput = Sync(input)
    expect(isSync(syncInput)).toBe(true)
  })
})

describe('awaitDelay', () => {
  test('should return a promise', async () => {
    const start = Date.now()
    const promise = awaitDelay(10)
    const result = await promise.then(() => 42)
    expect(Date.now() - start).toBeGreaterThan(5)
    expect(result).toBe(42)
  })
})
