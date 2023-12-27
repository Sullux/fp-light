import * as fp from './index.js'

Object.assign(global, fp)

/*
✅ Async
DeepAsync
DeepSync
Sync
asPromise
awaitAll
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
sync
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
        [ 'foo' ],
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
      type: 'Any',
      description: '`Async(value)` is equivalent to `{{toAsync(value)}}`',
    }],
    returns: { type: 'Promise', description: 'the result of {{toAsync(value)}}' },
  }, () => {
    it('should pass through to toAsync', async () => {
      const input = [
        undefined,
        null,
        42,
        'foo',
        true,
        { foo: 42 },
        [ 'foo' ],
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
  usage: 'As a type, passes the `instanceof` operand to {{isDeepAsync}}. As a factory, passes through to {{toAsync}}.'
}, () => {
  describe({
    operator: 'instanceof',
    args: [{
      name: 'value',
      type: 'Any',
      description: '`value instanceof DeepAsync` is equivalent to {{isDeepAsync(value)}}'
    }],
    returns: { type: 'Boolean', description: 'the result of {{isDeepAsync(value)}}'},
  }, () => {
    // todo
  })
})

describe({
  name: 'awaitArray',
  usage: 'Deep awaits every element in an array and returns a promise to a fully-resolved array. If no elements are async, return the original array.',
}, () => {
  describe({
    args: [{
      name: 'value',
      type: 'Array(...DeepSync)',
      description: 'an array of non-async elements and with no nested promises',
    }],
    returns: { type: 'Array', description: 'the original array' },
  }, () => {
    it('should return the input when all elements are sync', () => {
      const input = [42, { foo: 'bar' }]
      expect(awaitArray(input)).toBe(input)
    })
  })
  describe({
    args: [{
      name: 'value',
      type: 'Array(...DeepAsync)',
      description: 'An array that may contain promises or elements with nested promises.',
    }],
    returns: { type: '*Array', description: 'a promise to an array matching the original array but with all elements deep awaited' },
  }, () => {
    it('should return async output on async input', async () => {
      const input = [Promise.resolve(42), { foo: 42 }]
      const output = await awaitArray(input)
      const expected = [42, { foo: 42 }]
      expect(output).toEqual(expected)
    })

    it('should return async output on nested async input', async () => {
      const input = [42, { foo: Promise.resolve(42) }]
      const output = await awaitArray(input)
      const expected = [42, { foo: 42 }]
      expect(output).toEqual(expected)
    })
  })
})

describe({
  name: 'awaitObject',
  usage: 'Deep awaits every iterable value of an object and returns a full-resolved object. If no values are async, return the original object.',
}, () => {
  describe({
    args: [{
      name: 'value',
      type: 'Object(String, ...DeepSync)',
      description: 'an object of non-async values with no nested promises'
    }],
    returns: { type: 'Object', description: 'the original object' },
  }, () => {
    it('should return original object if nothing to await', () => {
      const input = { foo: 42, bar: [40, 2] }
      expect(awaitObject(input)).toBe(input)
    })
  })
  describe({
    args: [{
      name: 'value',
      type: 'Object(String, ...DeepAsync)',
      description: 'an object that may contain promises or values with nested promises'
    }],
    returns: { type: 'Object', description: 'a promise to an object matching the original object but with all values deep awaited' },
  }, () => {
    it('should return async output on async values', async () => {
      const input = { foo: 42, bar: Promise.resolve(42) }
      const output = await awaitObject(input)
      const expected = { foo: 42, bar: 42 }
      expect(output).toEqual(expected)
    })

    it('should return async output on nested async input', async () => {
      const input = { foo: 42, bar: [40, Promise.resolve(2)] }
      const output = await awaitObject(input)
      const expected = { foo: 42, bar: [40, 2] }
      expect(output).toEqual(expected)
    })
  })
})

describe({
  name: 'deepAwait',
  usage: `Returns the original primitive or already deeply-synchronous value _or_ returns a promise to a primitive or deeply-synchronous value, following this logic:
    * If primitive or falsy, return the original value.
    * If async, await the result and then deep await that result.
    * If an array, {{awaitArray}}.
    * If an object, {{awaitObject}}.
    * Otherwise, return the original value.`,
}, () => {
  describe({
    args: [{
      name: 'value',
      type: 'DeepSync',
      description: 'a deeply-synchronous value'
    }],
    returns: { type: 'DeepSync', description: 'the original value' }
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
  })
  describe({
    args: [{
      name: 'value',
      type: 'DeepAsync',
      description: 'a deeply-synchronous value'
    }],
    returns: { type: '*DeepSync', description: 'a promise to the original value but with all object properties and array elements deeply resolved' }
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
  })
})

describe('asPromise', () => {
  test('should return the original promise', () => {
    const input = Promise.resolve(42)
    expect(asPromise(input)).toBe(input)
  })
  test('should wrap and resolve a non-standard promise', async () => {
    const input = {
      then: (resolve, reject) => Promise.resolve(42).then(resolve, reject)
    }
    const promise = asPromise(input)
    expect(promise.constructor).toBe(Promise)
    expect(await promise).toBe(42)
  })
  test('should wrap and rejrect a non-standard promise', async () => {
    const error = new Error('reasons')
    const input = {
      then: (resolve, reject) => Promise.reject(error).then(resolve, reject)
    }
    const promise = asPromise(input)
    expect(promise.constructor).toBe(Promise)
    expect(await promise.catch(err => err)).toBe(error)
  })
})

describe('sync', () => {
  test('should sync an object', () => {
    const input = { foo: 42, bar: 'baz' }
    const syncInput = sync(input)
    expect(isSync(syncInput)).toBe(true)
  })

  test('should sync a frozen object', () => {
    const input = Object.freeze({ foo: 42, bar: 'baz' })
    const syncInput = sync(input)
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
