const { commentLiteral } = require('./commentLiteral')

describe('stringLiteral', () => {
  const parse = commentLiteral

  it('should process a comment', () => {
    const input = 'XXX ; foo bar\n'
    const { comment, length } = parse(input, { position: 4 })
    expect(comment).toBe(' foo bar')
    expect(length).toBe(10)
  })

  it('should process a multiline comment', () => {
    const input = 'XXX ;= foo bar\n baz; biz =;'
    const { comment, length } = parse(input, { position: 4 })
    expect(comment).toBe(' foo bar\n baz; biz ')
    expect(length).toBe(24)
  })

  it('should fail on unexpected end of input', () => {
    const input = 'XXX ;= foo bar\n baz; biz'
    expect(() => parse(input, { position: 4 }))
      .toThrow('unexpected end of input')
  })
})
