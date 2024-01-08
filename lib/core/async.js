const symbol = Symbol.fp || (Symbol.fp = {})

export const syncSymbol = symbol.sync = Symbol.for('fp.sync')
export const deepAwaitSymbol = symbol.deepAwait = Symbol.for('fp.deepAwait')
export const isDeepSyncSymbol = symbol.isDeepSync = Symbol.for('fp.isDeepSync')

export const toAsync = (value) =>
  (value instanceof Promise)
    ? value
    : (value && ((typeof value.then) === 'function'))
        ? new Promise((resolve, reject) => value.then(resolve, reject))
        : Promise.resolve(value)

export const isAsync = (value) => (!!value) &&
  ((value instanceof Promise) || (typeof value.then === 'function'))

export const reject = (value) =>
  Promise.reject(value)

const syncSet = new WeakSet()

const KnownSync = (input) => {
  const type = typeof input
  if (input && ((type === 'object') || (type === 'function'))) {
    syncSet.add(input)
  }
  return input
}

const isKnownSync = (value) => (!!value[syncSymbol]) || syncSet.has(value)

export const isSync = (value) =>
  (value && (typeof value === 'object'))
    ? value[syncSymbol] || syncSet.has(value) || ((value.constructor !== Promise) && (typeof value.then !== 'function'))
    : true

const shouldAwait = (value) =>
  (value && (typeof value === 'object'))
    ? ((!value[syncSymbol]) && (!syncSet.has(value))) && ((value.constructor === Promise) || (typeof value.then === 'function'))
    : false

const awaitArray = (value) => {
  if (isKnownSync(value)) { return value }
  const asyncEntries = value.map((v, i) => ([i, deepAwait(v)]))
    .filter(([, v]) => isAsync(v))
    .map(([i, av]) => av.then((v) => ([i, v])))
  if (!asyncEntries.length) {
    return KnownSync(value)
  }
  return Promise.all(asyncEntries)
    .then((entries) =>
      KnownSync(entries.reduce(
        (result, [i, v]) => {
          result[i] = v
          return result
        },
        [...value],
      )))
}

export {
  awaitArray as awaitAll,
}

const awaitObject = (value) => {
  if (isKnownSync(value)) { return value }
  const asyncEntries = Object.entries(value)
    .map(([k, v]) => ([k, deepAwait(v)]))
    .filter(([, v]) => isAsync(v))
    .map(([k, av]) => av.then((v) => ([k, v])))
  if (!asyncEntries.length) {
    return KnownSync(value)
  }
  return Promise.all(asyncEntries)
    .then((entries) => KnownSync({ ...value, ...Object.fromEntries(entries) }))
}

const awaitIterable = (iterable) => {
  const result = awaitArray([...iterable])
  if (isSync(result)) { return iterable }
  return result.then((v) => new iterable.constructor(v))
}

const customDeepAwait = (fn, value) => {
  const result = fn(value)
  return shouldAwait(result) ? result.then((r) => KnownSync(r)) : result
}

const customDeepAwaits = [
  [(v) => Array.isArray(v), awaitArray],
  [(v) => !!v[Symbol.iterator], awaitIterable],
]

export const onDeepAwait = (test, customAwait) => {
  customDeepAwaits.unshift([test, customAwait])
}

export const deepAwait = (value) => {
  if ((!value) || ((typeof value) !== 'object')) {
    return value
  }
  if (isAsync(value)) {
    return value.then(deepAwait)
  }
  const custom =
    value[deepAwaitSymbol] ||
    value.constructor[deepAwaitSymbol] ||
    customDeepAwaits.find(([test]) => test(value))?.[1]
  if (custom) {
    return customDeepAwait(custom, value)
  }
  return awaitObject(value)
}

export const awaitAny = promises =>
  promises.find((v) => !shouldAwait(v)) || Promise.race(promises)

export { awaitAny as race }

export const awaitDelay = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

export const Sync = (value) => isAsync(value)
  ? value.then(KnownSync)
  : KnownSync(value)
Object.defineProperty(Sync, Symbol.hasInstance, {
  value: isSync,
})

const isArrayDeepSync = (value) => value.every(isDeepSync)

const isIterableDeepSync = (iterable) => {
  for (const value of iterable) {
    if (!isDeepSync(value)) { return false }
  }
  return true
}

const isObjectDeepSync = (value) => Object.values(value).every(isDeepSync)

const customDeepSyncs = [
  [(value) => Array.isArray(value), isArrayDeepSync],
  [(value) => value[Symbol.iterator], isIterableDeepSync],
]

export const onIsDeepSync = (test, customIsDeepSync) => {
  customDeepSyncs.push([test, customIsDeepSync])
}

export const isDeepSync = (value) => {
  if ((!value) || ((typeof value) !== 'object')) { return true }
  if (isAsync(value)) { return false }
  if (isKnownSync(value)) { return true }
  const custom =
    value[isDeepSyncSymbol] ||
    value.constructor[isDeepSyncSymbol] ||
    customDeepSyncs.find(([test]) => test(value))?.[1]
  return custom
    ? custom(value)
    : isObjectDeepSync(value)
}

export const DeepSync = (value) => deepAwait(value)
Object.defineProperty(DeepSync, Symbol.hasInstance, {
  value: isDeepSync,
})

export const Async = (value) => toAsync(value)
Object.defineProperty(Async, Symbol.hasInstance, {
  value: isAsync,
})

export const isDeepAsync = (value) => !isDeepSync(value)

export const DeepAsync = (value) => toAsync(value)
Object.defineProperty(DeepAsync, Symbol.hasInstance, {
  value: isDeepAsync,
})
