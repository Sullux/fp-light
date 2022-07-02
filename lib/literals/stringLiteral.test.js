const { stringLiteral } = require('./stringLiteral')
const { type: getType } = require('../type.js')

const string = getType('String')

describe('stringLiteral', () => {
  const parse = stringLiteral("'")

  it('should process a string', () => {
    const input = "XXX 'foo bar'"
    const { value, length, type } = parse(input, { position: 4 })
    expect(value).toBe('foo bar')
    expect(length).toBe(9)
    expect(type).toBe(string)
  })

  it('should fail on end of input', () => {
    const input = "XXX 'foo bar"
    let error
    try {
      parse(input, { position: 4 })
    } catch (err) {
      error = err
    }
    expect(error && error.message).toBe('unexpected end of input')
  })

  it('should handle escapes', () => {
    const input = "XXX 'foo\\tbar'"
    const { value, length } = parse(input, { position: 4 })
    expect(value).toBe('foo\tbar')
    expect(length).toBe(10)
  })

  it('should handle escape edge cases', () => {
    const input = "XXX 'fo\\obar\\t'"
    const { value, length } = parse(input, { position: 4 })
    expect(value).toBe('foobar\t')
    expect(length).toBe(11)
  })
})
