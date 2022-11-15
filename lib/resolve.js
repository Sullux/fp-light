import {
  compiledFrom,
  primitiveFunctions,
  primitiveFunctionSymbol,
  pushPrimitiveFunction,
  targetPropertyIfExists,
} from './common.js'
import {
  awaitAll,
  deepAwait,
  isAsync,
} from './async.js'

// export const spreadableSymbol = () => Symbol('spreadable')

// export const isSpreadableSymbol = s =>
//   (typeof s === 'symbol') &&
//     (s.toString() === 'Symbol(spreadable)')

/* EXPLANATION
Symbols don't work because Reflect.ownKeys() returns all symbols _after_ keys.
That means the spread operator will override other properties even if the spread
is declared first. That means we have to use a magic string instead of a symbol.
*/

let spreadableCount = 0

export const spreadableSymbol = () => `@@spread:${spreadableCount += 1}`

export const arraySpread = Symbol('arraySpread')

export const arraySpreadFrom = ({ [arraySpread]: fn } = {}) => fn

export const isSpreadableSymbol = s =>
  s && s.startsWith && s.startsWith('@@spread:')

export const isSpreadable = value => {
  try {
    return !!value &&
      value.constructor === Object &&
      (value[arraySpread] || Reflect.ownKeys(value).some(isSpreadableSymbol))
  } catch (err) {
    return false
  }
}

const distinct = input => Array.from(new Set(input))

const spreadableProxy = {
  get: (target, property) =>
    (property === Symbol.isConcatSpreadable)
      ? false
      : property === arraySpread
        ? false
        : property === Symbol.iterator
          ? function* () { yield { [arraySpread]: target } }
          : isSpreadableSymbol(property)
            ? target
            : target[property],
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

export const toSpreadable = fn => {
  if (isSpreadable(fn)) {
    return fn
  }
  return new Proxy(fn, spreadableProxy)
}

export { toSpreadable as rest }

const inspectSymbol = Symbol.for('nodejs.util.inspect.custom')

const concatOriginal = Array.prototype.concat
const valueOrSpread = (a) =>
  (typeof a === 'function') ? [{ [arraySpread]: a }] : a
// eslint-disable-next-line no-extend-native
Array.prototype.concat = function concat(...args) {
  return concatOriginal.apply(this, args.map(valueOrSpread))
}

const identitySymbol = Symbol('identity')

const identityProxy = {
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

export const isIdentity = (value) => !!(value && value[identitySymbol])

export const toIdentity = fn => {
  if (isIdentity(fn)) {
    return fn
  }
  return new Proxy(fn, identityProxy)
}

const baseSymbol = Symbol('base')
const thisSymbol = Symbol('this')

const canProxy = (input) => {
  if (input === null) {
    return false
  }
  const type = typeof input
  return ((type === 'object') || (type === 'function'))
}

export const fromBase = function fromBase(base) {
  function fromBaseValue(v) {
    if (!canProxy(v)) {
      return v
    }
    if (isAsync(base)) {
      return base.then((resolvedBase) => fromBase(resolvedBase)(v))
    }
    const get = (target, property) =>
      property === baseSymbol
        ? base
        : property === thisSymbol
          ? target
          : Reflect.has(target, property)
            ? target[property]
            : base[property]
    return new Proxy(
      v,
      { get },
    )
  }
  return fromBaseValue
}

export const identity = new Proxy(
  function identity(v) { return v },
  identityProxy,
)

export {
  identity as argument,
  identity as _,
}

export const baseIdentity = new Proxy(
  function baseIdentity(v) { return v[baseSymbol] },
  identityProxy,
)

export {
  baseIdentity as baseArgument,
  baseIdentity as _base,
}

export const thisIdentity = new Proxy(
  function thisIdentity(v) { return v[thisSymbol] },
  identityProxy,
)

export {
  thisIdentity as thisArgument,
  thisIdentity as _this,
}

const resolveObject = (predicate) => {
  const entries = Reflect.ownKeys(predicate)
    .map(key => {
      const value = predicate[key]
      return isSpreadableSymbol(key)
        ? [spreadableSymbol, value]
        : [key, resolve(value)]
    })
  return input => {
    const mutate = (target, key, value) => {
      if (value === undefined) {
        delete target[key]
        return target
      }
      if (key === spreadableSymbol) {
        return Object.assign(target, value)
      }
      target[key] = value
      return target
    }
    return entries.reduce(
      (state, [key, resolve]) => {
        const result = resolve(input)
        return (isAsync(result) || isAsync(state))
          ? Promise.all([state, result]).then(([s, r]) => mutate(s, key, r))
          : mutate(state, key, result)
      },
      {},
    )
  }
}

const iterableToArray = (value) => {
  if (Array.isArray(value)) {
    return value
  }
  if (!value || !value[Symbol.iterator]) {
    throw TypeError(`${value} is not iterable`)
  }
  return [...value]
}

export const getSpreadable = value => {
  try {
    return !!value &&
      value.constructor === Object &&
      (value[arraySpread] ||
        value[Reflect.ownKeys(value).find(isSpreadableSymbol)])
  } catch (err) {
    return false
  }
}

export const getArraySpread = value => {
  try {
    return !!value && (value.constructor === Object) && value[arraySpread]
  } catch (err) {
    return false
  }
}

export const getObjectSpread = value => {
  try {
    return !!value &&
      (value.constructor === Object) &&
        value[Reflect.ownKeys(value).find(isSpreadableSymbol)]
  } catch (err) {
    return false
  }
}

const resolveIterable = (predicate) => {
  let resolves = []
  for (let c of predicate) {
    const spreadable = getArraySpread(c)
    resolves.push(spreadable ? { [arraySpread]: spreadable } : resolve(c))
  }
  return input => {
    const r = resolves.reduce(
      (result, c) => {
        const resolveToSpread = c && c[arraySpread]
        const getSpreadValues = () => {
          const values = iterableToArray(resolveToSpread(input))
          return values.some(isAsync)
            ? awaitAll(values)
            : values
        }
        const value = resolveToSpread
          ? getSpreadValues()
          : c(input)
        const mutate = (mutable, added) => {
          if (resolveToSpread) {
            added.map(a => mutable.push(a))
            return mutable
          }
          mutable.push(added)
          return mutable
        }
        return (isAsync(result) || isAsync(value))
          ? Promise.all([result, value]).then(([r, v]) => mutate(r, v))
          : mutate(result, value)
      },
      [],
    )
    return r
  }
}

const isConstant = predicate =>
  (predicate === null) ||
  ['string', 'boolean', 'number', 'undefined'].includes(typeof predicate) ||
  (predicate instanceof Date) ||
  (predicate instanceof RegExp) // todo: special handling of regex?

const resolveProxy = (predicate, resolve) => {
  const overrides = { '$resolve': predicate }
  return new Proxy(resolve, {
    get: (target, prop) =>
      overrides[prop] || target[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      overrides[prop]
        ? Object.getOwnPropertyDescriptor(overrides, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (target, prop) =>
      (prop in overrides) || (prop in target),
    ownKeys: (target) =>
      distinct([...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)]),
    apply: (target, thisArg, args) => {
      const awaited = deepAwait(args)
      return isAsync(awaited)
        ? awaited.then(a => resolve(...a))
        : resolve(...args)
    },
  })
}

const resolveAsync = (predicate) => {
  const resolved = predicate.then(resolve)
  return (input) => resolved.then((r) => r(input))
}

export const isResolve = predicate =>
  ((typeof predicate) === 'function') && ('$resolve' in predicate)

export const resolve = (predicate) =>
  resolveProxy(predicate, isConstant(predicate)
    ? () => predicate
    : isAsync(predicate)
    ? resolveAsync(predicate)
    : typeof predicate === 'function'
      ? predicate
      : typeof predicate === 'object'
        ? predicate[Symbol.iterator]
          ? resolveIterable(predicate)
          : resolveObject(predicate)
        : () => predicate)

const shallowResolveProxy = (predicate, resolve) => {
  const overrides = { '$resolve': predicate }
  return new Proxy(resolve, {
    get: (target, prop) =>
      overrides[prop] || target[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      overrides[prop]
        ? Object.getOwnPropertyDescriptor(overrides, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (target, prop) =>
      (prop in overrides) || (prop in target),
    ownKeys: (target) =>
      distinct([...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)]),
    apply: (target, thisArg, args) => {
      const hasAsyncArgs = args.some(isAsync)
      return hasAsyncArgs
        ? Promise.all(args).then(a => resolve(...a))
        // maybe webpack bug? args cannot be passed with spread!
        : resolve(...args)
    },
  })
}

export const shallowResolve = (predicate) =>
  shallowResolveProxy(predicate, isConstant(predicate)
    ? () => predicate
    : typeof predicate === 'function'
      ? predicate
      : typeof predicate === 'object'
        ? predicate[Symbol.iterator]
          ? resolveIterable(predicate)
          : resolveObject(predicate)
        : () => predicate)

export const literal = Symbol('$')
