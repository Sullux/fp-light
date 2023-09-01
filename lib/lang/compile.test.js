const { parse } = require('./parse')
const { compile } = require('./compile')

const operators = [
  { type: 'group', name: 'list', symbol: '(', closeSymbol: ')', precedence: 0 },
  { type: 'infix', symbol: '>=', precedence: 10 },
  { type: 'infix', symbol: '+', precedence: 100 },
  { type: 'string', name: 'label', symbol: '"', closeSymbol: '"', precedence: 0 },
  { type: 'string', name: 'string', symbol: "'", closeSymbol: "'", precedence: 0 },
  { type: 'string', name: 'native', symbol: '`', closeSymbol: '`', precedence: 0 },
  { type: 'string', name: 'comment', symbol: ';', precedence: 0 },
]
const uri = 'file://parse.test.js'

describe('lang', () => {
  describe('compile', () => {
    it('should compile', () => {
      const text = 'foo (bar (baz \'biz\' 42) ) baz'
      const input = {
        text,
        uri,
        withMap: true,
        operators,
      }
      const output = compile(parse(input))
      console.log(JSON.stringify(output, null, 2))
    })

    it.only('should compile infix', () => {
      const text = 'foo (1 + 2) baz'
      const input = {
        text,
        uri,
        withMap: true,
        operators,
      }
      const output = compile(parse(input))
      console.log(JSON.stringify(output, null, 2))
    })
  })
})
