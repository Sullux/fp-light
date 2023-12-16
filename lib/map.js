import { deepAwait, isAsync } from './async.js'
import { compilable, fromBase, resolve } from './resolve.js'
import { override } from './proxy.js'
import { compare, isIterable } from './compare.js'
import { toArray } from './to-array.js'

const toSyncArray = (iterable) => {
  if (isAsync(iterable)) {
    return iterable.then(toSyncArray)
  }
  const array = Array.isArray(iterable)
    ? iterable
    : isIterable.$(iterable)
      ? [...iterable]
      : toSyncArray(toArray(iterable))
  return deepAwait(array)
}

export const reduce = compilable(function reduce(
  { state: currentState, reducer: rawReducer },
  array,
) {
  const base = fromBase(this)
  const reducer = resolve(rawReducer)
  const maybeAsyncInput = toSyncArray(array)
  let i = 0
  const reduceSync = (input) => {
    const length = input.length
    let state = currentState
    const reduceAsync = async () => {
      for (; i < length;) {
        state = await reducer(base({
          state,
          value: input[i],
          i,
          array: input,
        }))
        i++
      }
      return state
    }
    const startMappingAsync = (v) => {
      state = v
      i++
      return reduceAsync()
    }
    for (; i < length;) {
      state = reducer(base({
        state,
        value: input[i],
        i,
        array: input,
      }))
      if (isAsync(state)) {
        return state.then(startMappingAsync)
      }
      i++
    }
    return state
  }
  return isAsync(maybeAsyncInput)
    ? maybeAsyncInput.then(reduceSync)
    : reduceSync(maybeAsyncInput)
}, { skip: 1 })

export const map = compilable(function map(mapper, array) {
  const base = fromBase(this)
  const fn = resolve(mapper)
  const maybeAsyncInput = toSyncArray(array)
  const mapSync = (input) => {
    const length = input.length
    const result = Array(length)
    let i = 0
    const mapAsync = async () => {
      for (; i < length;) {
        const value = fn(base(input[i]))
        result[i] = await value
        i++
      }
      return result
    }
    const startMappingAsync = (v) => {
      result[i] = v
      i++
      return mapAsync()
    }
    for (; i < length;) {
      const value = fn(base(input[i]))
      if (isAsync(value)) {
        return value.then(startMappingAsync)
      }
      result[i] = value
      i++
    }
    return result
  }
  return isAsync(maybeAsyncInput)
    ? maybeAsyncInput.then(mapSync)
    : mapSync(maybeAsyncInput)
}, { skip: 1 })

export const groupBy = compilable(function groupBy(predicate, array) {
  const base = fromBase(this)
  const fn = resolve(predicate)
  return reduce.$(
    {
      state: new Map(),
      reducer: ({ state, value }) => {
        const mutate = (k) => {
          const values = state.get(k)
          if (!values) {
            return state.set(k, [value])
          }
          values.push(value)
          return state
        }
        const key = fn(base(value))
        if (isAsync(key)) {
          return key.then(mutate)
        }
        return mutate(key)
      },
    },
    array,
  )
}, { skip: 1 })

export const filter = compilable(function filter(predicate, array) {
  const base = fromBase(this)
  const fn = resolve(predicate)
  const maybeAsyncInput = toSyncArray(array)
  const filterSync = (input) => {
    const length = input.length
    const result = []
    let i = 0
    const filterAsync = async () => {
      for (; i < length;) {
        const value = input[i]
        const test = await fn(base(value))
        if (test) {
          result.push(value)
        }
        i++
      }
      return result
    }
    const startFilteringAsync = (value, test) => {
      if (test) {
        result.push(value)
      }
      i++
      return filterAsync()
    }
    for (; i < length;) {
      const value = input[i]
      const test = fn(base(value))
      if (isAsync(test)) {
        return test.then((t) => startFilteringAsync(value, t))
      }
      if (test) {
        result.push(value)
      }
      i++
    }
    return result
  }
  return isAsync(maybeAsyncInput)
    ? maybeAsyncInput.then(filterSync)
    : filterSync(maybeAsyncInput)
}, { skip: 1 })

export const some = compilable(function some(predicate, array) {
  const base = fromBase(this)
  const syncArray = toSyncArray(array)
  const fn = resolve(predicate)
  function some(a) {
    return a.some(v => fn(base(v)))
  }
  if (isAsync(syncArray)) {
    return syncArray.then(resolvedArray => some(resolvedArray))
  }
  return some(array)
}, { skip: 1 })

export const every = compilable(function every(predicate, array) {
  const base = fromBase(this)
  const syncArray = toSyncArray(array)
  const fn = resolve(predicate)
  function every(a) {
    return a.every(v => fn(base(v)))
  }
  if (isAsync(syncArray)) {
    return syncArray.then(resolvedArray => every(resolvedArray))
  }
  return every(array)
}, { skip: 1 })

const defaultJoinPredicate = () => true

function joinLiteral({
  left: rawLeft,
  right: rawRight,
  on = defaultJoinPredicate,
  map,
  outer,
  base = (v) => v,
}) {
  const resolved = deepAwait({
    left: toSyncArray(rawLeft),
    right: toSyncArray(rawRight),
  })
  if (isAsync(resolved)) {
    return resolved.then(inputs =>
      joinLiteral({ ...inputs, on, map, outer, base }))
  }
  const { left, right } = resolved
  const compared = resolve(on)
  const mutate = map
    ? (state, left, right) => state.push(map(base({ left, right })))
    : (state, left, right) => state.push(base({ left, right }))
  return left.reduce(
    (state, value) => {
      let matched
      right.filter(v => compared(base({ left: value, right: v })))
        .forEach(match => (matched = true) && mutate(state, value, match))
      if (outer && !matched) {
        mutate(state, value, null)
      }
      return state
    },
    [],
  )
}

export const join = override({ properties: { '$': joinLiteral } })(
  function join({ left, right, on, map, outer }) {
    const toLeft = resolve(left)
    const toRight = resolve(right)
    const toMap = map && resolve(map)
    return function joinFrom(input) {
      const base = fromBase(input)
      return joinLiteral({
        left: toLeft(input),
        right: toRight(input),
        on,
        map: toMap,
        outer,
        base,
      })
    }
  }
)

export const left = 0
export const right = 1

export const product = function product({ left, right }) {
  return join({ left, right })
}

const defaultComparer =  compare.$

export const sort = compilable(function sort(comparer, array) {
  const result = toSyncArray(array)
  return isAsync(result)
    ? result.then(r => r.sort(comparer || defaultComparer))
    : result.sort(comparer || defaultComparer) // todo: use _base
}, { skip: 1 })

export const reverse = compilable(function reverse(array) {
  const result = toSyncArray(array)
  return isAsync(result)
    ? result.then(r => r.reverse())
    : result.reverse()
})

function flatDeep(arr, d = 1) {
  return d > 0
    ? arr.reduce((acc, val) =>
      acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
    : arr.slice()
}

if (!Array.prototype.flat) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.flat = function flat(depth = 1) {
    return flatDeep(this, depth)
  }
}

export const flat = compilable(function flat(array) {
  const result = toSyncArray(array)
  return isAsync(result)
    ? result.then(r => r.flat())
    : result.flat()
})
