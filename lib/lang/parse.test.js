const { parse } = require('./parse')

describe('lang', () => {
  describe('parse', () => {
    it('should parse', () => {
      const text = `
        (foo bar baz)
        ('foo' "bar" \`baz\`)
        40+2
        bar+'baz'
      `
      const uri = 'file://parse.test.js'
      const output = parse({
        text,
        uri,
        withMap: false,
      })
      expect(output).toEqual({
        text,
        uri,
        withMap: false,
        tokens: [
          '(', 'foo', 'bar', 'baz', ')',
          '(', "'", 'foo', "'", '"', 'bar', '"', '`', 'baz', '`', ')',
          '40', '+', '2',
          'bar', '+', "'", 'baz', "'",
        ],
      })
    })

    it('should parse with map', () => {
      const text = `
        (foo bar baz)
        ('foo' "bar" \`baz\`)
        40>=2
        bar+'baz'
      `
      const uri = 'file://parse.test.js'
      const output = parse({
        text,
        uri,
        withMap: true,
      })
      expect(output).toEqual({
        text,
        uri,
        withMap: true,
        tokens: [
          '(', 'foo', 'bar', 'baz', ')',
          '(', "'", 'foo', "'", '"', 'bar', '"', '`', 'baz', '`', ')',
          '40', '>=', '2',
          'bar', '+', "'", 'baz', "'",
        ],
        map: [
          { line: 2, character: 9, offset: 9 },
          { line: 2, character: 10, offset: 10 },
          { line: 2, character: 14, offset: 14 },
          { line: 2, character: 18, offset: 18 },
          { line: 2, character: 21, offset: 21 },
          { line: 3, character: 9, offset: 31 },
          { line: 3, character: 10, offset: 32 },
          { line: 3, character: 11, offset: 33 },
          { line: 3, character: 14, offset: 36 },
          { line: 3, character: 16, offset: 38 },
          { line: 3, character: 17, offset: 39 },
          { line: 3, character: 20, offset: 42 },
          { line: 3, character: 22, offset: 44 },
          { line: 3, character: 23, offset: 45 },
          { line: 3, character: 26, offset: 48 },
          { line: 3, character: 27, offset: 49 },
          { line: 4, character: 9, offset: 59 },
          { line: 4, character: 11, offset: 61 },
          { line: 4, character: 13, offset: 63 },
          { line: 5, character: 9, offset: 73 },
          { line: 5, character: 12, offset: 76 },
          { line: 5, character: 13, offset: 77 },
          { line: 5, character: 14, offset: 78 },
          { line: 5, character: 17, offset: 81 },
        ],
      })
    })
  })
})
