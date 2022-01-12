/* eslint-disable no-restricted-syntax */
const syncMap = function* (mapper, iterable) {
  for (const v of iterable) {
    yield mapper(v)
  }
}

export const toAsync = value =>
  isAsync(value)
    ? value
    : Promise.resolve(value)

export {
  toAsync as toPromise,
  toAsync as toThennable,
}

export const isAsync = value =>
  // !!(value && value.then && (typeof value.then === 'function'))
  !!value && value.constructor === Promise

export {
  isAsync as isPromise,
  isAsync as isThennable,
}

export const reject = value =>
  Promise.reject(value)

export const awaitAll = promises =>
  promises
    ? Promise.all(syncMap(toAsync, promises))
    : Promise.resolve()

export const syncSymbol = Symbol('sync')

export const sync = (input) =>
  (input && (Array.isArray(input) || input.constructor === Object))
    ? Object.defineProperty(input, syncSymbol, { value: true })
    : input

export const isSync = (input) =>
  isAsync(input)
    ? false
    : (input && (typeof input === 'object'))
      ? input[syncSymbol]
      : true

const awaitAsyncArray = async (array, offset, firstAsync) => {
  let result = array.slice(0, offset)
  result.push(await firstAsync)
  for (let i = offset + 1, length = array.length; i < length; i++) {
    result.push(await deepAwait(array[i]))
  }
  return result
}

export const awaitArray = (value) => {
  for (let i = 0, length = value.length; i < length; i++) {
    const maybeAsync = deepAwait(value[i])
    if (isAsync(maybeAsync)) {
      return awaitAsyncArray(value, i, maybeAsync)
    }
  }
  return value
}

export const awaitArray_OLD = value =>
  value.reduce(
    (state, item) => {
      const result = deepAwait(item)
      return isAsync(state)
        ? Promise.all([state, result]).then(([s, i]) => ([...s, i]))
        : isAsync(result)
          ? result.then(i => ([...state, i]))
          : sync([...state, result])
    },
    [],
  )

export const awaitObject = value => {
  // todo: use a map to protect against recursion
  const pairs = Object.entries(value).reduce(
    (state, [key, item]) => {
      const result = deepAwait(item)
      return isAsync(state)
        ? Promise.all([state, result]).then(([s, i]) => ([...s, [key, i]]))
        : isAsync(result)
          ? result.then(i => ([...state, [key, i]]))
          : [...state, [key, result]]
    },
    [],
  )
  const toObject = input =>
    input.reduce(
      (state, [key, item]) => {
        state[key] = item
        return state
      },
      {},
    )
  return isAsync(pairs)
    ? pairs.then(toObject)
    : sync(value)
}

export const deepAwait = value =>
  isSync(value)
    ? value
    : isAsync(value)
      ? value.then(deepAwait)
      : Array.isArray(value)
        ? awaitArray(value)
        : value.constructor === Object
          ? awaitObject(value)
          : value

export const awaitAny = promises =>
  Promise.race(syncMap(toAsync, promises))

export { awaitAny as race }

export const awaitDelay = ms =>
  new Promise(resolve => setTimeout(resolve, ms))
