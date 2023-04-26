/* eslint no-new-func: 0 */
/* eslint no-unreachable-loop: 0 */

const compileWithMap = (context) => {
  const {
    operators,
    tokens,
    map,
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
    if (operator.type === 'string') {
      const position = i
      i++
      const value = tokens[i]
      i++
      if (i >= length) {
        elements.push({
          type: 'warning',
          position: length - 1,
          value: `missing closing ${operator.closeSymbol}`,
        })
        break
      }
      const { closeSymbol, precedence, ...element } = {
        ...operator,
        position,
        endPosition: i,
        previous,
        value,
      }
      elements.push(element)
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
  let current = [{ closeSymbol: -1, type: 'group' }]
  let currentType = 'group'
  let closeSymbol = -1 // make the outermost block unclosable
  const stack = []
  const mapRef = []
  const addMapRef = (position, endPosition) => {
    const i = mapRef.length
    mapRef.push({ position: map[position], endPosition: map[endPosition] })
    return i
  }
  const createCompiled = (
    { name, symbol, type },
    props,
    position,
    endPosition,
  ) => ({
    ...props,
    name: name || symbol || type,
    position,
    endPosition,
  })
  const finalized = ({
    name: providedName,
    symbol,
    type,
    position,
    endPosition,
    value,
    values,
    lvalue,
    rvalue,
  }) => {
    const name = providedName || symbol || type
    if (values) {
      return { name, values, mapRef: addMapRef(position, endPosition) }
    }
    if (value) {
      return { name, value, mapRef: addMapRef(position, endPosition) }
    }
    const result = {
      name: name || symbol || type,
      mapRef: addMapRef(position, endPosition),
    }
    if (lvalue) {
      result.lvalue = finalized(lvalue)
    }
    if (rvalue) {
      result.rvalue = finalized(rvalue)
    }
    return result
  }
  const createGroup = ([open, ...values], close) => createCompiled(
    open,
    {
      values: values.map(finalized),
      next: close.next,
    },
    open.position,
    close.endPosition,
  )
  const createPrefix = ([operator], rvalue) => createCompiled(
    operator,
    {
      rvalue,
      next: rvalue.next,
    },
    operator.position,
    rvalue.endPosition,
  )
  const createInfix = ([lvalue, operator], rvalue) => createCompiled(
    operator,
    {
      rvalue,
      lvalue,
      previous: lvalue.previous,
      next: rvalue.next,
    },
    lvalue.position,
    rvalue.position,
  )
  const createPostfix = ([lvalue], operator) => createCompiled(
    operator,
    {
      lvalue,
      previous: lvalue.previous,
    },
    lvalue.position,
    operator.endPosition,
  )
  const append = (element) => {
    console.log(
      '? depth', stack.length, 'close with', closeSymbol, element,
      '\n    currentType', currentType,
    )
    if (element.value === closeSymbol) {
      const operator = createGroup(current, element)
      pop()
      return append(operator)
    }
    if (element.type === 'group') {
      return push(element)
    }
    if (((element.next || 0) > (element.previous || 0)) || (element.type === 'prefix')) {
      return push(element)
    }
    if (currentType === 'group') {
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
    currentType = first.type
  }
  const push = (...elements) => {
    stack.unshift(current)
    current = elements
    const [first] = elements
    closeSymbol = first?.closeSymbol
    currentType = first.type
    return current
  }
  elements.forEach(append)
  while (stack.length) {
    // todo
    throw new Error('unclosed group!')
  }
  const { tokens: ignore, ...result } = context
  return {
    ...result,
    map: mapRef,
    values: current.slice(1).map(finalized),
  }
}

const compileWithoutMap = () => {} // todo

const compile = (context) => context.map
  ? compileWithMap(context)
  : compileWithoutMap(context)

module.exports = { compile }
