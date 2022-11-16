import {
  compiledFrom,
  distinct,
} from './common.js'

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
