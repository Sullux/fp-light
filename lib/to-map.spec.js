const { strictEqual, deepStrictEqual, notStrictEqual } = require('assert')
const { ImmutableMap } = require('./to-map')

describe('ImmutableMap', () => {
  it('should create an empty map', () =>
    deepStrictEqual([...ImmutableMap()], []))
  it('should create a map of the right size', () =>
    strictEqual(ImmutableMap([['foo', 42], ['bar', 'baz']]).size, 2))
  it('should create a map with the given pairs', () =>
    deepStrictEqual(
      [...ImmutableMap([['foo', 42], ['bar', 'baz']])],
      [['foo', 42], ['bar', 'baz']],
    ))
  it('should delete a key immutably', () => {
    const map = ImmutableMap([['foo', 42], ['bar', 'baz']])
    const deleted = map.delete('bar')
    deepStrictEqual([...deleted], [['foo', 42]])
    deepStrictEqual([...map], [['foo', 42], ['bar', 'baz']])
  })
  it('should list entries', () =>
    deepStrictEqual(
      [...ImmutableMap([['foo', 42], ['bar', 'baz']]).entries()],
      [['foo', 42], ['bar', 'baz']],
    ))
  it('should execute a side-effect on each entry', () => {
    const values = []
    ImmutableMap([['foo', 42], ['bar', 'baz']])
      .forEach(([key, value]) => values.push(value))
    deepStrictEqual(values, [42, 'baz'])
  })
  it('should get a value', () =>
    strictEqual(
      ImmutableMap([['foo', 42], ['bar', 'baz']]).get('foo'),
      42
    ))
  it('should have a value when the key exists', () => {
    const map = ImmutableMap([['foo', 42], ['bar', 'baz']])
    strictEqual(map.has('foo'), true)
    strictEqual(map.has('baz'), false)
  })
  it('should iterate keys', () =>
    deepStrictEqual(
      [...ImmutableMap([['foo', 42], ['bar', 'baz']]).keys()],
      ['foo', 'bar'],
    ))
  it('should set an existing key immutably', () => {
    const map = ImmutableMap([['foo', 42], ['bar', 'baz']])
    const changed = map.set('bar', 42)
    deepStrictEqual([...changed], [['foo', 42], ['bar', 42]])
    deepStrictEqual([...map], [['foo', 42], ['bar', 'baz']])
  })
  it('should set a new key immutably', () => {
    const map = ImmutableMap([['foo', 42]])
    const changed = map.set('bar', 'baz')
    deepStrictEqual([...changed], [['foo', 42], ['bar', 'baz']])
    deepStrictEqual([...map], [['foo', 42]])
  })
  it('should iterate values', () =>
    deepStrictEqual(
      [...ImmutableMap([['foo', 42], ['bar', 'baz']]).values()],
      [42, 'baz'],
    ))
})

describe('toMap', () => {
  //
})
