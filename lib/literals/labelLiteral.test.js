const { labelLiteral } = require('./labelLiteral')
const { type: getType } = require('../type')

const labelType = getType('Label')

describe('labelLiteral', () => {
  const parse = labelLiteral

  it('should return false on whitespace', () => {
    const input = ' \t\r\nfoo_bar\r\t '
    const output = parse(input, { position: 1 }, { operators: {} })
    expect(output).toBe(false)
  })

  it('should parse a label', () => {
    const input = ' foo_bar\r\t '
    const { value, length, type } = parse(input, { position: 1 }, { operators: {} })
    expect(value).toBe('foo_bar')
    expect(length).toBe(7)
    expect(type).toBe(labelType)
  })

  it('should parse a quoted label', () => {
    const input = ' "foo bar"\r\t '
    const { value, length, type } = parse(input, { position: 1 }, { operators: {} })
    expect(value).toBe('foo bar')
    expect(length).toBe(9)
    expect(type).toBe(labelType)
  })

  it('should parse until end of input', () => {
    const input = ' foo_bar'
    const { value, length, type } = parse(input, { position: 1 }, { operators: {} })
    expect(value).toBe('foo_bar')
    expect(length).toBe(7)
    expect(type).toBe(labelType)
  })

  it('should parse until operator', () => {
    const input = ' foo+bar'
    const context = {
      operators: {
        '+': {},
      },
    }
    const { value, length, type } = parse(input, { position: 1 }, context)
    expect(value).toBe('foo')
    expect(length).toBe(3)
    expect(type).toBe(labelType)
  })
})
