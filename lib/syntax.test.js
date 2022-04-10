import {
  Any,
  Each,
  Element,
  Every,
  Expression,
  Some,
  Maybe,
  Syntax,
} from './syntax.js'

describe('syntax', () => {
  describe('Expression', () => {
    it('should compile an object', () => {
      const open = Element.char('{')
      const colon = Element.char(':')
      const comma = Element.char(',')
      const identifierChars =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      const identifier = Element('identifier', (context) => {
        let { code, i } = context
        if (!identifierChars.includes(code[i])) {
          return null
        }
        const start = i
        i += 1
        for (let l = code.length; i < l; i++) {
          if (!identifierChars.includes(code[i])) {
            break
          }
        }
        return {
          context: { ...context, i },
          value: code.substring(start, i),
        }
      })
      const { whitespace } = Element
      const close = Element.char('}')
      const optionalWhitespace = Maybe(whitespace)
      const compileKeyValue = (object, value) => {
        const [k, v] = value.filter((e) => e.is(identifier))
        return { ...object, [k.flatValue]: v.flatValue }
      }
      const compileObject = (context, value) => value.reduce(
        (o, v, i) => i === 0
          ? {}
          : v.flatValue === '}'
            ? o
            : compileKeyValue(o, v.value),
        {},
      )
      const keyValue = Expression(
        'keyValue',
        Each(
          optionalWhitespace,
          identifier,
          optionalWhitespace,
          colon,
          optionalWhitespace,
          identifier,
          optionalWhitespace,
          comma,
          optionalWhitespace,
        ),
        compileKeyValue,
      )
      const syntax = Syntax(
        'test',
        Expression(
          'object',
          Each(open, Some(keyValue), close),
          () => {},
          compileObject,
        ),
      )
      const result = syntax.parse(`{
        foo: bar,
        baz: biz,
      }`)
      const valueToString = ({ name, value }) => Array.isArray(value)
        ? value.map(valueToString)
        : name
      const keyValueNames = [
        'identifier',
        ':',
        'whitespace',
        'identifier',
        ',',
        'whitespace',
      ]
      expect(valueToString(result.value)).toEqual([
        '{',
        ['whitespace', ...keyValueNames],
        keyValueNames,
        '}',
      ])
      const compiled = result.value.compile()
      expect(compiled).toEqual({ foo: 'bar', baz: 'biz' })
    })
  })

  describe('Each', () => {
    it('should parse each element in order', () => {
      const open = Element.char('{')
      const { whitespace } = Element
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Each(open, whitespace, close),
      )
      const result = syntax.parse('{ \t \n }')
      expect(result.is(syntax) && syntax.is(result)).toBeTrue()
      const { value } = result
      expect(value.length).toBe(3)
      expect(value[0].is(open)).toBeTrue()
      expect(value[1].is(whitespace)).toBeTrue()
      expect(value[2].is(close)).toBeTrue()
    })

    it('should fail when an element is out of order', () => {
      const open = Element.char('{')
      const { whitespace } = Element
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Each(open, whitespace, close),
      )
      expect(() => syntax.parse('{} \t \n '))
        .toThrow('test failed to parse at 1:1')
    })
  })

  describe('Every', () => {
    it('should parse each element in any order', () => {
      const open = Element.char('{')
      const { whitespace } = Element
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Every(open, close, whitespace),
      )
      const result = syntax.parse('{ \t \n }')
      expect(result.is(syntax) && syntax.is(result)).toBeTrue()
      const { value } = result
      expect(value.length).toBe(3)
      expect(value[0].is(open)).toBeTrue()
      expect(value[1].is(whitespace)).toBeTrue()
      expect(value[2].is(close)).toBeTrue()
    })

    it('should fail when an element is not present', () => {
      const open = Element.char('{')
      const { whitespace } = Element
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Every(open, close, whitespace),
      )
      expect(() => syntax.parse('{ \t \n'))
        .toThrow('Expected Every [{, }, whitespace]')
    })
  })

  describe('Any', () => {
    it('should parse any single element', () => {
      const open = Element.char('{')
      const { whitespace } = Element
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Any(open, close, whitespace),
      )
      const result = syntax.parse(' \t \n }')
      expect(result.is(syntax) && syntax.is(result)).toBeTrue()
      const { value } = result
      expect(value.is(whitespace)).toBeTrue()
    })

    it('should fail when an element is not present', () => {
      const { whitespace } = Element
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Any(close, whitespace),
      )
      expect(() => syntax.parse('{ \t \n'))
        .toThrow('Expected Any [}, whitespace]')
    })
  })

  describe('Maybe', () => {
    it('should parse when a maybe element exists', () => {
      const open = Element.char('{')
      const { whitespace } = Element
      const maybeWhitespace = Maybe(whitespace)
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Each(open, maybeWhitespace, close),
      )
      const result = syntax.parse('{ \t \n }')
      const { value } = result
      expect(value.length).toBe(3)
      expect(value[0].is(open)).toBeTrue()
      expect(value[1].is(whitespace)).toBeTrue()
      expect(value[2].is(close)).toBeTrue()
    })

    it('should parse when a maybe element is missing', () => {
      const open = Element.char('{')
      const { whitespace } = Element
      const maybeWhitespace = Maybe(whitespace)
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Each(open, maybeWhitespace, close),
      )
      const result = syntax.parse('{}')
      const { value } = result
      expect(value.length).toBe(2)
      expect(value[0].is(open)).toBeTrue()
      expect(value[1].is(close)).toBeTrue()
    })

    it('should throw on multiple instances of a maybe element', () => {
      const open = Element.char('{')
      const maybeDash = Maybe(Element.char('-'))
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Each(open, maybeDash, close),
      )
      expect(() => syntax.parse('{--}'))
        .toThrow('expected at most 1 instances of -')
    })
  })

  describe('Some', () => {
    it('should parse when a valid number of elements exist', () => {
      const open = Element.char('{')
      const dashes = Some(Element.char('-'), 2, 3)
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Each(open, dashes, close),
      )
      const code = '{--}'
      const result = syntax.parse(code)
      const resultCode = result.value.map(({ name }) => name).join('')
      expect(resultCode).toBe(code)
    })

    it('should parse when no min or max is specified and no element exists', () => {
      const open = Element.char('{')
      const dashes = Some(Element.char('-'))
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Each(open, dashes, close),
      )
      const code = '{}'
      const result = syntax.parse(code)
      const resultCode = result.value.map(({ name }) => name).join('')
      expect(resultCode).toBe(code)
    })

    it('should parse when no min or max is specified and elements exist', () => {
      const open = Element.char('{')
      const dashes = Some(Element.char('-'))
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Each(open, dashes, close),
      )
      const code = '{-----------------}'
      const result = syntax.parse(code)
      const resultCode = result.value.map(({ name }) => name).join('')
      expect(resultCode).toBe(code)
    })

    it('should throw on too many elements', () => {
      const open = Element.char('{')
      const dashes = Some(Element.char('-'), 0, 2)
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Each(open, dashes, close),
      )
      const code = '{---}'
      expect(() => syntax.parse(code))
        .toThrow('expected at most 2 instances of -')
    })

    it('should throw on too few elements', () => {
      const open = Element.char('{')
      const dashes = Some(Element.char('-'), 2)
      const close = Element.char('}')
      const syntax = Syntax(
        'test',
        Each(open, dashes, close),
      )
      const code = '{-}'
      expect(() => syntax.parse(code))
        .toThrow('expected at least 2 instances of -')
    })
  })
})
