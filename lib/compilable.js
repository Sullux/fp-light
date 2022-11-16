import {
  compiledFrom,
  targetPropertyIfExists,
  identityProxy,
  distinct,
  primitiveFunctions,
  primitiveFunctionSymbol,
} from './common.js'
import {
  toSpreadable,
  arraySpread,
} from './spreadable.js'
import { override } from './proxy.js'
import { trace } from './trace.js'
import {
  awaitArray,
  isAsync,
} from './async.js'

let primitiveFunctionCount = 0

export const toPrimitiveFunction = (fn) => fn[primitiveFunctionSymbol]
  ? fn
  : new Proxy(fn, {
    get: (target, prop) => (prop === Symbol.toPrimitive)
      ? () => target[primitiveFunctionSymbol] || pushPrimitiveFunction(target)
      : target[prop],
  })

export const pushPrimitiveFunction = (fn) => {
  const index = primitiveFunctionCount++
  const prop = fn[primitiveFunctionSymbol] =
    `${index}:__FP_LIGHT_PROPERTY_FUNCTION__ ${fn.name || '(anonymous)'}()`
  primitiveFunctions[prop] = fn
  return prop
}

const compiledProxy = (fn) => ({
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
      : (property === arraySpread)
        ? false
        : property === Symbol.iterator
          ? function* () { yield { [arraySpread]: fn } }
          : isSpreadableSymbol(property)
            ? fn
            : property === '$' || property === compiledFrom
              ? fn
              : (fn[property] || new Proxy(
                targetPropertyIfExists(fn, property),
                identityProxy,
              ))
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
})

const compiledLiteral = (fn, arg) => {
  const apply = (target, thisArg, args) => {
    const resolved = awaitArray(args)
    if (isAsync(resolved)) {
      return resolved.then(resolvedArgs =>
        fn.apply(args[0], [arg, ...resolvedArgs]))
    }
    return fn.apply(args[0], [arg, ...args])
  }
  return new Proxy(fn, {
    ...compiledProxy((...args) => apply(fn, undefined, args)),
    apply,
  })
}

const compiledWithPasshrough = (fn, passthroughArgs, resolver) => {
  const apply = (target, thisArg, [arg]) => {
    const resolved = resolver(arg)
    if (isAsync(resolved)) {
      return resolved.then(resolvedArgs =>
        fn.apply(arg, [...passthroughArgs, ...resolvedArgs]))
    }
    return fn.apply(arg, [...passthroughArgs, ...resolved])
  }
  return new Proxy(fn, {
    ...compiledProxy((...args) => apply(fn, undefined, args)),
    apply,
  })
}

const compiled = (fn, resolver) => {
  const apply = (target, thisArg, [arg]) => {
    const resolved = resolver(arg)
    if (isAsync(resolved)) {
      return resolved.then(resolvedArgs =>
        fn.apply(arg, resolvedArgs))
    }
    return fn.apply(arg, resolved)
  }
  return new Proxy(fn, {
    ...compiledProxy((...args) => apply(fn, undefined, args)),
    apply,
  })
}

export const compilable = (fn, { count, skip = 0 } = {}) =>
  toSpreadable(trace(override({
    properties: { '$': fn, [compiledFrom]: fn },
    apply: (target, thisArg, args) => {
      if (args.length === 0) {
        return toSpreadable(fn)
      }
      const argsCount = count || fn.length
      if (args.length === (argsCount - 1)) {
        return compiledLiteral(fn, args[0])
      }
      if (skip === 0) {
        return compiled(fn, resolve(args))
      }
      return compiledWithPasshrough(
        fn,
        args.slice(0, skip),
        resolve(args.slice(skip)),
      )
    },
  })(fn)))

export const isCompiled = fn =>
  ((typeof fn) === 'function') && ((typeof fn[compiledFrom]) === 'function')
