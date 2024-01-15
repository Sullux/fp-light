import { ArraySegment } from './arraySegment.js'

describe('js', () => {
  describe('array', () => {
    describe('ArraySegment', () => {
      it('should create an array segment', () => {
        const a = ['foo', 'bar']
        const s = ArraySegment(a, 1)
        expect(s[0]).toBe(a[1])
      })

      it('should create a segment from a segment', () => {
        const a = ['foo', 'bar', 'baz']
        const s1 = ArraySegment(a, 1)
        const s2 = ArraySegment(s1, 1)
        expect(s2[0]).toBe(a[2])
      })

      it('should at', () => {
        if (!Array.prototype.at) { return } // may not be implemented
        const a = [1, 2, 3]
        const s1 = ArraySegment(a, 1)
        expect(s1.at(1)).toEqual(3)
        expect(s1.at(-1)).toEqual(3)
      })

      it('should concat', () => {
        const a = [1, 2, 3]
        const s1 = ArraySegment(a, 1)
        const a2 = s1.concat('foo')
        expect(a2).toEqual([2, 3, 'foo'])
      })

      it('should have entries', () => {
        const a = [1, 2, 3]
        const s = ArraySegment(a, 1)
        expect([...s.entries()]).toEqual([
          [0, 2],
          [1, 3],
        ])
      })

      it('should test every', () => {
        const a = [1, 2, 3]
        const s = ArraySegment(a, 1)
        expect(s.every((v) => v > 1)).toBe(true)
      })

      it('should not fill', () => {
        const a = [1, 2, 3]
        const s = ArraySegment(a, 1)
        expect(s.fill).toBe(undefined)
      })

      it('should filter', () => {
        const a = [1, 2, 3]
        const s = ArraySegment(a, 1)
        expect(s.filter((v) => v < 3)).toEqual([2])
      })

      it('should find', () => {})

      it('should findIndex', () => {})

      it('should findLast', () => {})

      it('should findLastIndex', () => {})

      it('should flat', () => {})

      it('should flatMap', () => {})

      it('should forEach', () => {})

      it('should includes', () => {})

      it('should indexOf', () => {})

      it('should join', () => {})

      it('should keys', () => {})

      it('should lastIndexOf', () => {})

      it('should length', () => {})

      it('should map', () => {})

      it('should not pop', () => {})

      it('should not push', () => {})

      it('should reduce', () => {})

      it('should reduceRight', () => {})

      it('should reverse immutably', () => {
        const a = [1, 2, 3]
        const s = ArraySegment(a, 1)
        const r = s.reverse()
        expect(r).toEqual([3, 2])
        expect(s).toEqual([2, 3])
        expect(r.map((v) => v + 1)).toEqual([4, 3])
      })

      it('should not shift', () => {})

      it('should slice a new segment', () => {})

      it('should some', () => {})

      it('should sort immutably', () => {})

      it('should not splice', () => {})

      it('should toLocaleString', () => {})

      it('should toString', () => {})

      it('should not unshift', () => {})

      it('should values', () => {})

      it('should map', () => {
        const a = [1, 2, 3]
        const s1 = ArraySegment(a, 1)
        const s2 = s1.map(v => v + 1)
        expect(s2).toEqual([3, 4])
      })
    })
  })
})
