const { deepStrictEqual, ok } = require('assert')

const Sequence = require('./sequence')
const Iterable = require('./iterable')

const { from, isSequence } = Sequence
const { isIterable } = Iterable

const notOk = value => ok(!value)

describe('sequence', () => {
  describe('Sequence', () => {
    describe('isSequence', () => {
      it('should be true for a sequence', () => ok(isSequence(from())))
      it('should be false for a non-sequence', () => notOk(isSequence([])))
    })

    describe('isIterable', () => {
      it('should be true for a sequence', () => ok(isIterable(from())))
    })
  })

  describe('instance of Sequence', () => {
    it('should be instanceof Sequence', () => ok(from() instanceof Sequence))
    it('should be instanceof Iterable', () => ok(from() instanceof Iterable))

    describe('append', () => {
      it('should append to an empty sequence', () => deepStrictEqual(
        [...from().append(42)],
        [42]
      ))
      it('should append to a non-empty sequence', () => deepStrictEqual(
        [...from().append(42).append('foo')],
        [42, 'foo']
      ))
      it('should append immutably', () => {
        const original = from(42)
        original.append('foo')
        deepStrictEqual([...original], [42])
      })
    })
  })
})
