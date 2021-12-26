import * as fp from './index.js'
import { log } from './testUtils.js'

Object.assign(global, fp)

describe('map', () => {
  it('should reduce', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = reduce({
      reducer: ({ value, state }) => state + value.i,
      state: 0,
    })
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** reduce took', endTime - startTime, 'ms')
  })

  it('should reduce async elements', async () => {
    const input = [Promise.resolve(1), Promise.resolve(2), 3]
    const fn = reduce({
      reducer: ({ value, state }) => state + value,
      state: 0,
    })
    expect(await fn(input)).toBe(6)
  })

  it('should reduce async input', async () => {
    const input = Promise.resolve([Promise.resolve(1), Promise.resolve(2), 3])
    const fn = reduce({
      reducer: ({ value, state }) => state + value,
      state: 0,
    })
    expect(await fn(input)).toBe(6)
  })

  it('should map', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = map(({ i }) => ({ i2: i + 1 }))
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** map took', endTime - startTime, 'ms')
  })

  it('should map with async input', async () => {
    const input = [42, Promise.resolve(43), 44]
    const fn = map(add(1))
    const result = await fn(input)
    expect(result).toEqual([43, 44, 45])
  })

  it('should map with async output', async () => {
    const input = [42, 43, 44]
    const fn = map((v) => Promise.resolve(v + 1))
    const result = await fn(input)
    expect(result).toEqual([43, 44, 45])
  })

  it('should map to a pipe', () => {
    const input = [{ foo: 41 }, { foo: 42 }, { foo: 43 }]
    const fn = map(pipe(
      _.foo,
      add(1),
    ))
    const result = fn(input)
    expect(result).toEqual([42, 43, 44])
  })

  it('should spread a map', () => {
    const input = [1, 2]
    const fn = resolve([1, ...map(add(1))])
    const result = fn(input)
    expect(result).toEqual([1, 2, 3])
  })

  it('should spread a map result', () => {
    const input = {
      put: [{ tag: 'foo@1', name: 'foo' }],
      delete: ['buzz@1'],
    }
    const name = 'foo'
    const fn = resolve({
      RequestItems: {
        [name]: [
          ...map({ DeleteRequest: { Key: { tag: 'buzz@1' } } }, _.delete),
          ...map({ PutRequest: { Item: _ } }, _.put),
        ],
      },
    })
    const expected = {
      RequestItems: {
        [name]: [
          { DeleteRequest: { Key: { tag: 'buzz@1' } } },
          { PutRequest: { Item: { tag: 'foo@1', name: 'foo' } } },
        ],
      },
    }
    const actual = fn(input)
    expect(actual).toEqual(expected)
  })

  it('should preserve hidden fields', () => {
    const input = [
      { foo: 42 },
    ]
    Object.defineProperty(input[0], 'bar', { value: 'baz' })
    const fn = map({ foo: _.foo, bar: _.bar })
    const actual = fn(input)
    expect(actual).toEqual([{ foo: 42, bar: 'baz' }])
  })

  // it('should map with _base', () => {
  //   const input = [{ foo: 41 }, { foo: 42 }, { foo: 43 }]
  //   const mapper = pipe(
  //     _.foo,
  //     add(_base.input.length),
  //     v => console.log('?', v) || v,
  //   )
  //   const fn = map(mapper, _.input)
  //   const result = fn({ input })
  //   expect(result).toEqual([44, 45, 46])
  // })

  it('should group', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = groupBy(({ i }) => i % 3)
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** group took', endTime - startTime, 'ms')
  })

  it('should filter', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = filter(({ i }) => (i % 3) === 0)
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** filter took', endTime - startTime, 'ms')
  })

  it('should filter with async output', async () => {
    const input = [42, 43, 44]
    const fn = filter((v) => Promise.resolve(v % 2))
    const result = await fn(input)
    expect(result).toEqual([43])
  })

  it('should return boolean some', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = some(({ i }) => i > 998)
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** some took', endTime - startTime, 'ms')
  })

  it('should return boolean every', () => {
    const input = Array(1000).fill().map((v, i) => ({ i }))
    const fn = every(({ i }) => i > -1)
    const startTime = Date.now()
    fn(input)
    const endTime = Date.now()
    log('*** every took', endTime - startTime, 'ms')
  })

  describe('join', () => {
    it('should join', () => {
      const input = Array(1000).fill().map((v, i) => ({ i }))
      const fn = join({
        left: _,
        right: [2, 3],
        on: ({ left, right }) => (left.i % right) === 0,
        map: ({ left, right }) => `${left.i} / ${right}`,
      })
      const startTime = Date.now()
      fn(input)
      const endTime = Date.now()
      log('*** join took', endTime - startTime, 'ms')
    })

    it('should cross join', () => {
      const input = Array(3).fill().map((v, i) => i)
      const fn = join({
        left: _,
        right: [1, 2],
        map: ({ left, right }) => left * right,
      })
      expect(fn(input)).toEqual([0, 0, 1, 2, 2, 4])
    })

    it('should join with predicate', () => {
      const input = Array(3).fill().map((v, i) => i)
      const fn = join({
        left: _,
        right: [1, 2],
        map: ({ left, right }) => left * right,
        on: ({ left, right }) => (left % 2) === 0,
      })
      expect(fn(input)).toEqual([0, 0, 2, 4])
    })

    it('should join literal with predicate', () => {
      const input = Array(3).fill().map((v, i) => i)
      const result = join.$({
        left: input,
        right: [1, 2],
        map: ({ left, right }) => left * right,
        on: ({ left, right }) => (left % 2) === 0,
      })
      expect(result).toEqual([0, 0, 2, 4])
    })

    it('should convert join arguments to arrays', () => {
      const input = {
        name: 'BlackBox2-Schemas-dev',
        pk: 'tag',
        indexes: {
          typeOrderGsi: { name: 'idxName', pk: 'name', sk: 'version' },
        },
      }
      const fn = join({
        left: _.indexes,
        right: [_],
        map: { pk: _.right.pk, indexName: _.left[1].name },
      })
      const result = fn(input)
      expect(result).toEqual([{ pk: 'tag', indexName: 'idxName' }])
    })
  })

  it('should flatten', () => {
    const input = Array(500).fill().map((v, i) => ({ i }))
      .reduce(
        (state, value) => ([...state, [value, value]]),
        [],
      )
    const startTime = Date.now()
    const result = flat.$(input)
    const endTime = Date.now()
    expect(result).toEqual(input.flat())
    log('*** flatten took', endTime - startTime, 'ms')
  })

  it('should reduce with a derived identity', () => {
    const input = [1, 2, 3]
    const fn = reduce({
      reducer: [..._.state, _.value],
      state: [],
    })
    expect(fn(input)).toEqual([1, 2, 3])
  })
})
