/* eslint no-new-func: 0 */
/* eslint no-unreachable-loop: 0 */

const compileWithMap = (context) => {
  const {
    operators,
    tokens,
  } = context
  const { length } = tokens
  const operatorsByPrecedence = [...operators]
    .sort(({ precedence: p1 }, { precedence: p2 }) => p2 - p1)
  const elements = []
  let previous = 0
  for (let i = 0; i < length; i++) {
    const token = tokens[i]
    const operator = operatorsByPrecedence.find(({ symbol }) =>
      token.startsWith(symbol))
    if (!operator) {
      const numeric = Number(token)
      let type, value
      if (Number.isNaN(numeric)) {
        type = 'label'
        value = token
      } else {
        type = 'number'
        value = numeric
      }
      elements.push({
        type,
        value,
        position: i,
        endPosition: i,
        previous,
      })
      continue
    }
    const {
      symbol: { length: symbolLength },
      type,
      precedence,
    } = operator
    const { length: elementsLength } = elements
    if (((type === 'infix') || (type === 'postfix')) && (elementsLength > -1)) {
      elements[elementsLength - 1].next = precedence
    }
    previous = ((type === 'infix') || (type === 'prefix'))
      ? precedence
      : 0
    elements.push({
      position: i,
      endPosition: i,
      previous,
      ...operator,
    })
    if (token.length > symbolLength) {
      // there's another operator in this token
      tokens[i] = token.substring(symbolLength)
      i--
      continue
    }
  }
  let current = [{ closeSymbol: -1 }]
  let closeSymbol = -1 // make the outermost block unclosable
  const stack = []
  const createGroup = ([open, ...values], close) => ({
    ...open,
    values,
    next: close.next,
    endPosition: close.endPosition,
  })
  const createPrefix = ([operator], rvalue) => ({
    ...operator,
    rvalue,
    next: rvalue.next,
    endPosition: rvalue.endPosition,
  })
  const createInfix = ([lvalue, operator], rvalue) => ({
    ...operator,
    rvalue,
    lvalue,
    previous: lvalue.previous,
    next: rvalue.next,
    position: lvalue.position,
    endPosition: rvalue.position,
  })
  const createPostfix = ([lvalue], operator) => ({
    ...operator,
    lvalue,
    previous: lvalue.previous,
    position: lvalue.position,
  })
  const append = (element) => {
    if ((element.type === 'group') && !element.values) {
      return push(element)
    }
    if (((element.next || 0) > (element.previous || 0)) || (element.type === 'prefix')) {
      return push(element)
    }
    if (closeSymbol) {
      if (element.value === closeSymbol) {
        const operator = createGroup(current, element)
        pop()
        return append(operator)
      }
      return current.push(element)
    }
    if (current.length === 1) {
      const operator = (element.type === 'prefix')
        ? createPrefix(current, element)
        : createPostfix(current, element)
      pop()
      return append(operator)
    }
    const operator = createInfix(current, element)
    pop()
    return append(operator)
  }
  const pop = () => {
    if (!stack.length) {
      throw new Error('end of stack')
    }
    current = stack.shift()
    const [first] = current
    closeSymbol = first?.closeSymbol
  }
  const push = (...elements) => {
    stack.unshift(current)
    current = elements
    const [first] = elements
    closeSymbol = first?.closeSymbol
    return current
  }
  elements.forEach(append)
  while (stack.length) {
    // todo
    throw new Error('unclosed group!')
  }
  return {
    ...context,
    values: current.slice(1),
  }
}

const compileWithoutMap = () => {} // todo

const compile = (context) => context.map
  ? compileWithMap(context)
  : compileWithoutMap(context)

module.exports = { compile }
