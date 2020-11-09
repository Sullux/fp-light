import {
  compilable,
  isAsync,
  isIterable,
  override,
  resolve,
  toArray,
} from './'

async function reduceAsync (currentState, reducer, array, offset, originalArray) {
  let state = currentState
  let i = 0
  for (let value of array) {
    state = await state
    value = await value
    state = reducer({ state, value, i: i + offset, array: originalArray })
    i++
  }
  return state
}

export const reduce = compilable(function reduce ({ state: currentState, reducer: rawReducer }, array) {
  const reducer = resolve(rawReducer)
  let state = currentState
  let i = 0
  const iterable = isIterable.$(array) ? array : toArray(array)
  for (const value of iterable) {
    if (isAsync(value) || isAsync(state)) {
      return reduceAsync(
        state,
        reducer,
        i === 0 ? iterable : iterable.slice(i),
        i,
        array,
      )
    }
    state = reducer({ state, value, i, array })
    i++
  }
  return state
}, { skip: 1 })

export const map = compilable(function map (mapper, array) {
  const fn = resolve(mapper)
  return reduce.$(
    {
      state: (array && array.length) ? Array(array.length) : [],
      reducer: ({ state, value, i }) => {
        const result = fn(value)
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
        const key = fn(value)
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
  const fn = resolve(predicate)
  return reduce.$(
    {
      state: [],
      reducer: ({ state, value }) => {
        const result = fn(value)
        if (isAsync(result)) {
          return result.then((resolvedResult) => {
            if (resolvedResult) {
              state.push(value)
            }
            return state
          })
        }
        if (result) {
          state.push(value)
        }
        return state
      },
    },
    array,
  )
}, { skip: 1 })

const toSyncArray = (iterable) => {
  const array = toArray(iterable)
  return reduce.$(
    {
      state: (array && array.length) ? Array(array.length) : [],
      reducer: ({ state, value, i }) => {
        if (isAsync(value)) {
          return value.then((resolvedResult) => {
            state[i] = resolvedResult
            return state
          })
        }
        state[i] = value
        return state
      },
    },
    array,
  )
}

export const some = compilable(function some (predicate, array) {
  const syncArray = toSyncArray(array)
  const fn = resolve(predicate)
  function some (a) {
    return a.some(v => fn(v))
  }
  if (isAsync(syncArray)) {
    return syncArray.then(resolvedArray => some(resolvedArray))
  }
  return some(array)
}, { skip: 1 })

export const every = compilable(function every (predicate, array) {
  const syncArray = toSyncArray(array)
  const fn = resolve(predicate)
  function every (a) {
    return a.every(v => fn(v))
  }
  if (isAsync(syncArray)) {
    return syncArray.then(resolvedArray => every(resolvedArray))
  }
  return every(array)
}, { skip: 1 })

const defaultJoinPredicate = () => true

function joinLiteral ({left, right, on = defaultJoinPredicate, map, outer }) {
  const compared = resolve(on)
  const rightArray = toArray(right)
  if (rightArray.some(isAsync)) {
    return toSyncArray(rightArray)
      .then(resolvedArray => joinLiteral({left, right: resolvedArray, on}))
  }
  const mutate = map
    ? (state, left, right) => state.push (map({ left, right }))
    : (state, left, right) => state.push({ left, right })
  return reduce.$(
    {
      state: [],
      reducer: ({ state, value }) => {
        let matched
        rightArray.filter(v => compared({ left: value, right: v }))
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
    const toLeft = resolve(left)
    const toRight = resolve(right)
    const toMap = map && resolve(map)
    return function joinFrom (input) {
      return joinLiteral({
        left: toLeft(input),
        right: toRight(input),
        on,
        map: toMap,
        outer,
      })
    }
  }
)

export const left = 0
export const right = 1

export const product = function product ({left, right}) {
  return join({left, right})
}

// todo: left and right join

export const sort = compilable(function sort (comparer, array) {
  const result = toSyncArray(array)
  return isAsync(result)
    ? result.then(r => r.sort(comparer))
    : result.sort(comparer)
}, { skip: 1 })

export const reverse = compilable(function reverse (array) {
  const result = toSyncArray(array)
  return isAsync(result)
    ? result.then(r => r.reverse())
    : result.reverse()
})

export const flat = compilable(function flat (array) {
  return reduce.$(
    {
      state: [],
      reducer: ({ state, value }) => {
        if (!isIterable.$(value)) {
          state.push(value)
          return state
        }
        return reduce.$(
          {
            state,
            reducer: ({ state: s, value: v }) => {
              s.push(v)
              return s
            },
          },
          value,
        )
      },
    },
    array,
  )
})
