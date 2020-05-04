import {
  curry,
  isAsync,
  isIterable,
  override,
  resolvable,
  resolve,
  toArray,
  trace,
} from './'

async function reduceAsync ({ state: currentState, reducer }, array, originalArray) {
  let state = currentState
  let i = 0
  for (let value of array) {
    state = await state
    value = await value
    state = reducer({ state, value, i, array: originalArray })
    i++
  }
  return state
}

const predicateArrayFunction = (untraced) => {
  const fn = trace(curry(untraced))
  return override({
    properties: { '$': fn },
    apply: (target, thisArg, args) => {
      if (args.length < 1) {
        return fn
      }
      if (args.length === 1) {
        return fn(args[0])
      }
      const [arg1] = args
      const arg2 = resolve(args[1])
      return override({
        apply: (ignore1, ignore2, [finalArgs]) => {
          const input = arg2(finalArgs)
          if (isAsync(input)) {
            return input.then((i) => fn(arg1, i))
          }
          return fn(arg1, input)
        },
      })(fn)
    },
  })(fn)
}

export const reduce = predicateArrayFunction(function reduce ({ state: currentState, reducer }, array) {
  let state = currentState
  let i = 0
  const iterable = isIterable.$(array) ? array : toArray(array)
  for (const value of iterable) {
    if (isAsync(value) || isAsync(state)) {
      return reduceAsync(
        { state, reducer },
        i === 0 ? iterable : iterable.slice(i),
        array,
      )
    }
    state = reducer({ state, value, i, array })
    i++
  }
  return state
})

export const map = predicateArrayFunction(function map (mapper, array) {
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
})

export const filter = predicateArrayFunction(function filter (predicate, array) {
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
})

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

export const some = predicateArrayFunction(function some (predicate, array) {
  const syncArray = toSyncArray(array)
  const fn = resolve(predicate)
  function some (a) {
    return a.some(v => fn(v))
  }
  if (isAsync(syncArray)) {
    return syncArray.then(resolvedArray => some(resolvedArray))
  }
  return some(array)
})

export const every = predicateArrayFunction(function every (predicate, array) {
  const syncArray = toSyncArray(array)
  const fn = resolve(predicate)
  function every (a) {
    return a.every(v => fn(v))
  }
  if (isAsync(syncArray)) {
    return syncArray.then(resolvedArray => every(resolvedArray))
  }
  return every(array)
})

const defaultJoinPredicate = () => true

function joinLiteral ({left, right, on = defaultJoinPredicate}) {
  const compared = resolve(on)
  const rightArray = toArray(right)
  if (rightArray.some(isAsync)) {
    return toSyncArray(rightArray)
      .then(resolvedArray => joinLiteral({left, right: resolvedArray, on}))
  }
  return reduce.$(
    {
      state: [],
      reducer: ({ state, value }) => {
        rightArray.filter(v => compared({ left: value, right: v }))
          .forEach(match => state.push([value, match]))
        return state
      },
    },
    left,
  )
}

export const join = override({ properties: { '$': joinLiteral } })(function join ({left, right, on}) {
  const toLeft = resolve(left)
  const toRight = resolve(right)
  return function joinFrom (input) {
    return joinLiteral({ left: toLeft(input), right: toRight(input), on })
  }
})

export { join as innerJoin }

export const left = 0
export const right = 1

export const product = function product ({left, right}) {
  return join({left, right})
}

// todo: left and right join

export const sort = predicateArrayFunction(function sort (comparer, array) {
  const result = toSyncArray(array)
  return isAsync(result)
    ? result.then(r => r.sort(comparer))
    : result.sort(comparer)
})

export const reverse = resolvable(function reverse (array) {
  const result = toSyncArray(array)
  return isAsync(result)
    ? result.then(r => r.reverse())
    : result.reverse()
})

export const flat = resolvable(function flat (array) {
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