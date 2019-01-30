const { strictEqual, deepStrictEqual, ok } = require('assert')

const Iterable = require('./iterable')

const notOk = value => ok(!value)

const {
  isIterable,
  from,
  fromValue,
  fromObject,
  fromPrototype,
  fromNext,
  empty,
  skip,
  take,
  slice,
  map,
  reduce,
  filter,
  concat,
  range,
  toArray,
} = Iterable

describe('iterable', () => {
  describe('Iterable', () => {
    describe('isIterable', () => {
      it('should be true for an iterable', () => ok(isIterable(from())))
      it('should be false for a non-iterable', () => notOk(isIterable([])))
    })

    describe('from', () => {
      it('should be empty on undefined', () => deepStrictEqual(
        [...from(undefined)],
        []
      ))
      it('should be empty on null', () => deepStrictEqual(
        [...from(null)],
        []
      ))
      it('should accept an iterable', () => deepStrictEqual(
        [...from([1, 2])],
        [1, 2]
      ))
      it('should iterate object entries', () => deepStrictEqual(
        [...from({ foo: 42, bar: 'baz' })],
        [['foo', 42], ['bar', 'baz']]
      ))
      it('should iterate a next function', () => {
        const values = [42, 'foo']
        deepStrictEqual(
          [...from(() => {
            if (!values.length) {
              return { done: true }
            }
            return { value: values.shift() }
          })],
          [42, 'foo']
        )
      })
      it('should iterate a value', () => deepStrictEqual(
        [...from(42)],
        [42]
      ))
    })

    describe('fromValue', () => {
      it('should iterate a value', () => deepStrictEqual(
        [...fromValue(42)],
        [42]
      ))
      it('should iterate a missing value', () => deepStrictEqual(
        [...fromValue()],
        [undefined]
      ))
    })

    describe('fromObject', () => {
      it('should iterate object entries', () => deepStrictEqual(
        [...fromObject({ foo: 42, bar: 'baz' })],
        [['foo', 42], ['bar', 'baz']]
      ))
      it('should iterate object entries of an array', () => deepStrictEqual(
        [...fromObject([42, 'baz'])],
        [['0', 42], ['1', 'baz']]
      ))
    })

    describe('fromPrototype', () => {
      function P() {
        this.foo = 42
        return this
      }
      P.prototype = { bar: 'baz' }
      it('should iterate entries on a prototype', () => deepStrictEqual(
        [...fromPrototype(new P())],
        [['foo', 42], ['bar', 'baz']]
      ))
    })

    describe('fromNext', () => {
      it('should iterate a next function', () => {
        const values = [42, 'foo']
        deepStrictEqual(
          [...fromNext(() => {
            if (!values.length) {
              return { done: true }
            }
            return { value: values.shift() }
          })],
          [42, 'foo']
        )
      })
    })

    describe('empty', () => {
      it('should be empty', () => deepStrictEqual([...empty], []))
    })

    describe('skip', () => {
      it('should skip zero', () => deepStrictEqual(
        [...skip(0, [1, 2, 3])],
        [1, 2, 3]
      ))
      it('should skip zero with negative skip', () => deepStrictEqual(
        [...skip(-1, [1, 2, 3])],
        [1, 2, 3]
      ))
      it('should skip n values', () => deepStrictEqual(
        [...skip(1, [1, 2, 3])],
        [2, 3]
      ))
      it('should return empty skipping length', () => deepStrictEqual(
        [...skip(3, [1, 2, 3])],
        []
      ))
      it('should return empty skipping greater than length', () => deepStrictEqual(
        [...skip(4, [1, 2, 3])],
        []
      ))
    })

    describe('take', () => {
      it('should take all values when given length', () => deepStrictEqual(
        [...take(3, [1, 2, 3])],
        [1, 2, 3]
      ))
      it('should take all values when given greater than length', () => deepStrictEqual(
        [...take(4, [1, 2, 3])],
        [1, 2, 3]
      ))
      it('should take some values when given less than length', () => deepStrictEqual(
        [...take(2, [1, 2, 3])],
        [1, 2]
      ))
      it('should return empty when given zero', () => deepStrictEqual(
        [...take(0, [1, 2, 3])],
        []
      ))
      it('should return empty when given less than zero', () => deepStrictEqual(
        [...take(-1, [1, 2, 3])],
        []
      ))
    })

    describe('slice', () => {
      it('should return empty when end = begin', () => deepStrictEqual(
        [...slice(2, 2, [1, 2, 3])],
        []
      ))
      it('should return empty when end > begin', () => deepStrictEqual(
        [...slice(3, 2, [1, 2, 3])],
        []
      ))
      it('should return first element when start < 1', () => deepStrictEqual(
        [...slice(-1, 3, [1, 2, 3])],
        [1, 2]
      ))
      it('should return last element when end > length', () => deepStrictEqual(
        [...slice(2, 5, [1, 2, 3])],
        [2, 3]
      ))
      it('should return a slice', () => deepStrictEqual(
        [...slice(2, 4, [1, 2, 3, 4])],
        [2, 3]
      ))
    })

    describe('map', () => {
      it('should transform all values', () => deepStrictEqual(
        [...map(x => x + 1, [1, 2, 3])],
        [2, 3, 4]
      ))
    })

    describe('reduce', () => {
      it('should reduce to a single value', () => strictEqual(
        reduce((x, y) => y + x, 0, [1, 2, 3]),
        6
      ))
    })

    describe('filter', () => {
      it('should filter values', () => deepStrictEqual(
        [...filter(x => x % 2 === 0, [1, 2, 3])],
        [2]
      ))
    })

    describe('concat', () => {
      it('should concatenate iterables', () => deepStrictEqual(
        [...concat([1, 2, 3], [4, 5, 6])],
        [1, 2, 3, 4, 5, 6]
      ))
    })

    describe('range', () => {
      it('should produce a low to high range', () => deepStrictEqual(
        [...range(1, 3)],
        [1, 2, 3]
      ))
      it('should produce a high to low range', () => deepStrictEqual(
        [...range(3, 1)],
        [3, 2, 1]
      ))
      it('should produce a single digit range', () => deepStrictEqual(
        [...range(1, 1)],
        [1]
      ))
    })

    describe('toArray', () => {
      it('should return an array', () => deepStrictEqual(
        toArray(from([1, 2, 3])),
        [1, 2, 3]
      ))
    })
  })

  describe('instance of Iterable', () => {
    it('should be instanceof Iterable', () => ok(from() instanceof Iterable))

    describe('skip', () => {
      it('should skip zero', () => deepStrictEqual(
        [...from([1, 2, 3]).skip(0)],
        [1, 2, 3]
      ))
      it('should skip zero with negative skip', () => deepStrictEqual(
        [...from([1, 2, 3]).skip(-1)],
        [1, 2, 3]
      ))
      it('should skip n values', () => deepStrictEqual(
        [...from([1, 2, 3]).skip(1)],
        [2, 3]
      ))
      it('should return empty skipping length', () => deepStrictEqual(
        [...from([1, 2, 3]).skip(3)],
        []
      ))
      it('should return empty skipping greater than length', () => deepStrictEqual(
        [...from([1, 2, 3]).skip(4)],
        []
      ))
    })

    describe('take', () => {
      it('should take all values when given length', () => deepStrictEqual(
        [...from([1, 2, 3]).take(3)],
        [1, 2, 3]
      ))
      it('should take all values when given greater than length', () => deepStrictEqual(
        [...from([1, 2, 3]).take(4)],
        [1, 2, 3]
      ))
      it('should take some values when given less than length', () => deepStrictEqual(
        [...from([1, 2, 3]).take(2)],
        [1, 2]
      ))
      it('should return empty when given zero', () => deepStrictEqual(
        [...from([1, 2, 3]).take(0)],
        []
      ))
      it('should return empty when given less than zero', () => deepStrictEqual(
        [...from([1, 2, 3]).take(-1)],
        []
      ))
    })

    describe('slice', () => {
      it('should return empty when end = begin', () => deepStrictEqual(
        [...from([1, 2, 3]).slice(2, 2)],
        []
      ))
      it('should return empty when end > begin', () => deepStrictEqual(
        [...from([1, 2, 3]).slice(3, 2)],
        []
      ))
      it('should return first element when start < 1', () => deepStrictEqual(
        [...from([1, 2, 3]).slice(-1, 3)],
        [1, 2]
      ))
      it('should return last element when end > length', () => deepStrictEqual(
        [...from([1, 2, 3]).slice(2, 5)],
        [2, 3]
      ))
      it('should return a slice', () => deepStrictEqual(
        [...from([1, 2, 3, 4]).slice(2, 4)],
        [2, 3]
      ))
    })

    describe('map', () => {
      it('should transform all values', () => deepStrictEqual(
        [...from([1, 2, 3]).map(x => x + 1)],
        [2, 3, 4]
      ))
    })

    describe('reduce', () => {
      it('should reduce to a single value', () => strictEqual(
        from([1, 2, 3]).reduce((x, y) => y + x, 0),
        6
      ))
    })

    describe('filter', () => {
      it('should filter values', () => deepStrictEqual(
        [...from([1, 2, 3]).filter(x => x % 2 === 0)],
        [2]
      ))
    })

    describe('concat', () => {
      it('should concatenate iterables', () => deepStrictEqual(
        [...from([1, 2, 3]).concat([4, 5, 6])],
        [1, 2, 3, 4, 5, 6]
      ))
    })

    describe('toArray', () => {
      it('should return an array', () => deepStrictEqual(
        from([1, 2, 3]).toArray(),
        [1, 2, 3]
      ))
    })
  })
})
