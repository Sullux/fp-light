const { readFileSync } = require('fs')
const { join } = require('path')
const { parse } = require('./fws')

const input1 = '(foo (bar)) baz'
const output1 = `
source:
  list:
    label: foo
    list:
      label: bar
  label: baz
`.trim()

const input2 = '#(ecma (const foo 42) ([bar] baz))'
const output2 = `
source:
  list:
    label: ecma
    list:
      label: const
      label: foo
      number: 42
    list:
      array:
        label: bar
      label: baz
`.trim()

const input3 = '#(ecma foo.bar (baz biz))'
const output3 = `
source:
  list:
    label: ecma
    list:
      dereference
      label: foo
      label: bar
    list:
      label: baz
      label: biz
`.trim()

const input4 = '#(ecma foo ...bar)'
const output4 = `
source:
  list:
    label: ecma
    label: foo
    list:
      spread
      label: bar
`.trim()

const printNext = (stack, indent = 0) =>
  stack.type
    ? stack.value
        ? '  '.repeat(indent) + stack.type + ':' + printNext(stack.value, indent)
        : '  '.repeat(indent) + stack.type
    : Array.isArray(stack)
      ? '\n' + stack.map((v) => printNext(v, indent + 1)).join('\n')
      : ' ' + stack.toString()

const printStack = ({ stack }) => printNext({ type: 'source', value: stack })

describe('fws2', () => {
  it.only('should parse ecma and lists', () => {
    const { input, ...result } = parse(input1)
    expect(printStack(result)).toBe(output1)
  })

  it('should parse lists and parameters', () => {
    const { input, ...result } = parse(input2)
    expect(printStack(result)).toBe(output2)
  })

  it('should parse the dereference operator', () => {
    const { input, ...result } = parse(input3)
    expect(printStack(result)).toBe(output3)
  })

  it('should parse the spread operator', () => {
    const { input, ...result } = parse(input4)
    expect(printStack(result)).toBe(output4)
  })

  it('should parse an entire file', () => {
    const text = readFileSync(join(__dirname, 'fwslib', 'Scope.fws')).toString()
    const { input, ...result } = parse(text)
    console.log(printStack(result))
  })
})
