/* eslint-disable no-restricted-syntax */

const concat = function * (...iterables) {
  for (const v of iterables) { // eslint-disable-line no-restricted-syntax
    yield * v
  }
}

const filter = function * (test, iterable) {
  for (const v of iterable) { // eslint-disable-line no-restricted-syntax
    if (test(v)) {
      yield v
    }
  }
}

const forEach = (sideEffect, thisArg, iterable) => {
  for (const v of iterable) { // eslint-disable-line no-restricted-syntax
    sideEffect.call(thisArg, v)
  }
}

const keys = function * (iterable) {
  for (const [k] of iterable) { // eslint-disable-line no-restricted-syntax
    yield k
  }
}

const values = function * (iterable) {
  for (const [, v] of iterable) { // eslint-disable-line no-restricted-syntax
    yield v
  }
}

const sameValueZero = v1 => v2 =>
  v1 === v2 || (isNaN(v1) && isNaN(v2))

const keyNotSameValueZero = v1 => ([v2]) =>
  v1 !== v2

const ImmutableMap = function (iterable) {
  let instance
  const getInstance = () =>
    instance || (instance = new Map(iterable))
  const self = new.target
    ? this
    : {}
  return Object.freeze(Object.defineProperties(self, {
    size: {
      enumerable: true,
      value: getInstance().size,
    },
    clear: {
      enumerable: true,
      value: () => new ImmutableMap(),
    },
    delete: {
      enumerable: true,
      value: key => new ImmutableMap(filter(
        keyNotSameValueZero(key),
        iterable,
      )),
    },
    entries: {
      enumerable: true,
      value: () => iterable,
    },
    forEach: {
      enumerable: true,
      value: (callbackFn, thisArg = self) =>
        forEach(callbackFn, thisArg, iterable),
    },
    get: {
      enumerable: true,
      value: key => getInstance().get(key),
    },
    has: {
      enumerable: true,
      value: key => getInstance().has(key),
    },
    keys: {
      enumerable: true,
      value: () => keys(iterable),
    },
    set: {
      enumerable: true,
      value: (key, value) => new ImmutableMap(concat(iterable, [[key, value]])),
    },
    values: {
      enumerable: true,
      value: () => values(iterable),
    },
    [Symbol.iterator]: {
      enumerable: true,
      value: () => getInstance()[Symbol.iterator](),
    },
  }))
}
ImmutableMap.prototype = Object.create(Map.prototype)
ImmutableMap.prototype.constructor = ImmutableMap
Object.defineProperty(ImmutableMap, 'length', { value: 0 })

const toMap = any =>
  any === undefined || any === null
    ? new ImmutableMap()
    : typeof any === 'object' && !(any instanceof Date)
      ? any[Symbol.iterator]
          ? new ImmutableMap(any)
          : new ImmutableMap(Object.entries(any))
      : { [any.constructor.name]: any }

module.exports = {
  ImmutableMap,
  toMap,
}
