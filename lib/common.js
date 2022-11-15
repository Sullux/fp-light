export const compiledFrom = Symbol('compiledFrom')

export const primitiveFunctions = {}
let primitiveFunctionCount = 0
export const primitiveFunctionSymbol = Symbol('primitiveFunction')

export const pushPrimitiveFunction = (fn) => {
  const index = primitiveFunctionCount++
  const prop = fn[primitiveFunctionSymbol] =
    `${index}:__FP_LIGHT_PROPERTY_FUNCTION__ ${fn.name || '(anonymous)'}()`
  primitiveFunctions[prop] = fn
  return prop
}

export const toPrimitiveFunction = (fn) => fn[primitiveFunctionSymbol]
  ? fn
  : new Proxy(fn, {
    get: (target, prop) => (prop === Symbol.toPrimitive)
      ? () => target[primitiveFunctionSymbol] || pushPrimitiveFunction(target)
      : target[prop],
  })

export const targetPropertyIfExists = (target, property) =>
  (typeof property === 'function')
    ? property
    : function targetPropertyIfExists(input) {
      const value = target(input)
      return value && value[property]
    }
