export const compiledFrom = Symbol('compiledFrom')

export const targetPropertyIfExists = (target, property) =>
  (typeof property === 'function')
    ? property
    : function targetPropertyIfExists(input) {
      const value = target(input)
      return value && value[property]
    }

const inspectSymbol = Symbol.for('nodejs.util.inspect.custom')

export const identitySymbol = Symbol('identity')

export const distinct = input => Array.from(new Set(input))

export const primitiveFunctions = {}
export const primitiveFunctionSymbol = Symbol('primitiveFunction')

export const identityProxy = {
  get: (target, property) => {
    if (property === Symbol.toPrimitive) {
      return () =>
        target[primitiveFunctionSymbol] || pushPrimitiveFunction(target)
    }
    const accessor = primitiveFunctions[property]
    if (accessor) {
      return new Proxy(input => target(input)[accessor(input)], identityProxy)
    }
    return (property === Symbol.isConcatSpreadable)
      ? false
      : (property === identitySymbol)
        ? true
        : (property === arraySpread)
          ? false
          : property === Symbol.iterator
            ? function* () { yield { [arraySpread]: target } }
            : isSpreadableSymbol(property)
              ? target
              : property === '$'
                ? target
                : (property === 'then')
                  || (property === 'constructor')
                  || (property === 'prototype')
                  || (property === 'call')
                  || (property === 'apply')
                  || (property === Symbol.toPrimitive)
                  || (property === inspectSymbol)
                  ? target[property]
                  : new Proxy(
                    targetPropertyIfExists(target, property),
                    identityProxy,
                  )
  },
  getOwnPropertyDescriptor: (target, property) =>
    isSpreadableSymbol(property)
      ? { value: target, configurable: true, enumerable: true }
      : property === Symbol.iterator
        ? {
          value: function* () { yield { [arraySpread]: target } },
          writable: true,
          enumerable: false,
          configurable: true,
        }
        : Object.getOwnPropertyDescriptor(target, property),
  ownKeys: (target) => target[compiledFrom]
    ? distinct([
      ...Reflect.ownKeys(target)
        .filter(key => key !== compiledFrom && key !== '$'),
      spreadableSymbol(),
      Symbol.iterator,
    ])
    : distinct([
      ...Reflect.ownKeys(target),
      spreadableSymbol(),
      Symbol.iterator,
    ]),
}
