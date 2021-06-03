import {
  compilable,
  deepAwait,
  fromBase,
  isAsync,
  isIterable,
  override,
  resolve,
  shallowResolve,
  toArray,
} from './'

async function reduceAsync (base, currentState, reducer, array, offset, originalArray) {
  let state = currentState
  let i = 0
  for (let value of array) {
    state = await state
    value = await value
    state = reducer(base({ state, value, i: i + offset, array: originalArray }))
    i++
  }
  return state
}

export const reduce = compilable(function reduce ({ state: currentState, reducer: rawReducer }, array) {
  const base = fromBase(this)
  const reducer = resolve(rawReducer)
  let state = currentState
  let i = 0
  const iterable = isIterable.$(array) ? array : toArray(array)
  for (const value of iterable) {
    if (isAsync(value) || isAsync(state)) {
      return reduceAsync(
        base,
        state,
        reducer,
        i === 0 ? iterable : iterable.slice(i),
        i,
        array,
      )
    }
    state = reducer(base({
      state: state,
      value,
      i: () => i,
      array: () => array,
    }))
    i++
  }
  return state
}, { skip: 1 })

export const map = compilable(function map (mapper, array) {
  const base = fromBase(this)
  const fn = shallowResolve(mapper)
  return reduce.$(
    {
      state: (array && array.length) ? Array(array.length) : [],
      reducer: ({ state, value, i }) => {
        const result = fn(base(value))
        if (isAsync(result)) {
          return result.then((resolvedResult) => {
            state[i] = resolvedResult
            return state
          })
        }
        state[i] = result
        return state
      },
    },
    array,
  )
}, { skip: 1 })

export const groupBy = compilable(function groupBy (predicate, array) {
  const base = fromBase(this)
  const fn = shallowResolve(predicate)
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

export const filter = compilable(function filter (predicate, array) {
  const base = fromBase(this)
  const fn = shallowResolve(predicate)
  // if returning state dynamically in reduce, perf is 10x slower!
  const state = []
  reduce.$(
    {
      reducer: ({ value }) => {
        const result = fn(base(value))
        if (isAsync(result)) {
          return result.then((resolvedResult) => {
            if (resolvedResult) {
              state.push(value)
            }

          })
        }
        if (result) {
          state.push(value)
        }
      },
    },
    array,
  )
  return state
}, { skip: 1 })

const toSyncArray = (iterable) => {
  const array = Array.isArray(iterable) ? iterable : [...iterable]
  return deepAwait(array)
}

export const some = compilable(function some (predicate, array) {
  const base = fromBase(this)
  const syncArray = toSyncArray(array)
  const fn = shallowResolve(predicate)
  function some (a) {
    return a.some(v => fn(base(v)))
  }
  if (isAsync(syncArray)) {
    return syncArray.then(resolvedArray => some(resolvedArray))
  }
  return some(array)
}, { skip: 1 })

export const every = compilable(function every (predicate, array) {
  const base = fromBase(this)
  const syncArray = toSyncArray(array)
  const fn = shallowResolve(predicate)
  function every (a) {
    return a.every(v => fn(base(v)))
  }
  if (isAsync(syncArray)) {
    return syncArray.then(resolvedArray => every(resolvedArray))
  }
  return every(array)
}, { skip: 1 })

const defaultJoinPredicate = () => true

function joinLiteral ({
  left,
  right,
  on = defaultJoinPredicate,
  map,
  outer,
  base,
}) {
  const resolved = deepAwait({ left, right })
  if (isAsync(resolved)) {
    return resolved.then(inputs =>
      joinLiteral({ ...inputs, on, map, outer, base }))
  }
  const compared = shallowResolve(on)
  const mutate = map
    ? (state, left, right) => state.push(map(base({ left, right })))
    : (state, left, right) => state.push(base({ left, right }))
  return reduce.$(
    {
      state: [],
      reducer: ({ state, value }) => {
        let matched
        right.filter(v => compared(base({ left: value, right: v })))
          .forEach(match => (matched = true) && mutate(state, value, match))
        if (outer && !matched) {
          mutate(state, value, null)
        }
        return state
      },
    },
    left,
  )
}

export const join = override({ properties: { '$': joinLiteral } })(
  function join ({left, right, on, map, outer}) {
    const toLeft = shallowResolve(left)
    const toRight = shallowResolve(right)
    const toMap = map && shallowResolve(map)
    return function joinFrom (input) {
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

export const product = function product ({left, right}) {
  return join({left, right})
}

export const sort = compilable(function sort (comparer, array) {
  const result = toSyncArray(array)
  return isAsync(result)
    ? result.then(r => r.sort(comparer))
    : result.sort(comparer) // todo: use _base
}, { skip: 1 })

export const reverse = compilable(function reverse (array) {
  const result = toSyncArray(array)
  return isAsync(result)
    ? result.then(r => r.reverse())
    : result.reverse()
})

export const flat = compilable(function flat (array) {
  const result = toSyncArray(array)
  return isAsync(result)
    ? result.then(r => r.flat())
    : result.flat()
})
