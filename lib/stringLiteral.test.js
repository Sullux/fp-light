const { stringLiteral } = require('./stringLiteral')

describe('stringLiteral', () => {
  it('should process a string', () => {
    const input = "XXX 'foo bar'"
    const { value, length } = stringLiteral(input, { position: 4 })
    expect(value).toBe('foo bar')
    expect(length).toBe(8)
  })

  it('should fail on end of input', () => {
    const input = "XXX 'foo bar"
    let error
    try {
      stringLiteral(input, { position: 4 })
    } catch (err) {
      error = err
    }
    expect(error && error.message).toBe('unexpected end of input')
  })

  it('should handle escapes', () => {
    const input = "XXX 'foo\\tbar'"
    const { value, length } = stringLiteral(input, { position: 4 })
    expect(value).toBe('foo\tbar')
    expect(length).toBe(9)
  })

  it('should handle escape edge cases', () => {
    const input = "XXX 'fo\\obar\\t'"
    const { value, length } = stringLiteral(input, { position: 4 })
    expect(value).toBe('foobar\t')
    expect(length).toBe(10)
  })
})
