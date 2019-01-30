const { isObject, isMissing, isFunction } = require('./common')
const { curry } = require('./fn')

let Iterable
let iterableFactory

const iterableSymbol = Symbol()

const isIterable = instance => instance && !!instance[iterableSymbol]

const canIterate = any => any && any[Symbol.iterator]

const fromObject = object => iterableFactory(Object.entries(object))

const fromPrototype = (object) => {
  const entries = []
  for (const key in object) {
    entries.push([key, object[key]])
  }
  return iterableFactory(entries)
}

const fromValue = value => iterableFactory([value])

const fromNext = next => iterableFactory({
  [Symbol.iterator]: () => ({ next }),
})

const from = any =>
  (any instanceof Iterable
    ? any
    : isMissing(any)
      ? Iterable.empty
      : any[Symbol.iterator]
        ? iterableFactory(any)
        : isObject(any)
          ? fromObject(any)
          : isFunction(any)
            ? fromNext(any)
            : fromValue(any))

const iteratorFrom = any => from(any)[Symbol.iterator]()

const skip = curry((count, iterable) => {
  const iterator = iteratorFrom(iterable)
  let skipped = -1
  return fromNext(() => {
    while ((skipped += 1) < count) {
      if (iterator.next().done) {
        return { done: true }
      }
    }
    return iterator.next()
  })
})

const take = curry((count, iterable) => {
  const iterator = iteratorFrom(iterable)
  let taken = -1
  return fromNext(() => ((taken += 1) < count
    ? iterator.next()
    : { done: true }))
})

const slice = curry((begin, end, iterable) => {
  const iterator = iteratorFrom(iterable)
  let index = 1 // 1-based
  return fromNext(() => {
    while (index < begin) {
      if (iterator.next().done) {
        return { done: true }
      }
      index += 1
    }
    return index < end
      ? (index += 1) && iterator.next()
      : { done: true }
  })
})

const map = curry((mapper, iterable) => {
  const iterator = iteratorFrom(iterable)
  let i = -1
  return fromNext(() => {
    const { done, value } = iterator.next()
    i += 1
    return done
      ? { done }
      : { done, value: mapper(value, i, iterable) }
  })
})

const reduce = curry((reducer, initialState, iterable) => {
  const iterator = iteratorFrom(iterable)
  const i = -1
  let state = initialState
  while (true) {
    const { done, value } = iterator.next()
    if (done) {
      return state
    }
    state = reducer(state, value, i, iterable)
  }
})

const filter = curry((test, iterable) => {
  const iterator = iteratorFrom(iterable)
  let i = -1
  return fromNext(() => {
    while (true) {
      const { done, value } = iterator.next()
      if (done) {
        return { done }
      }
      i += 1
      if (test(value, i, iterable)) {
        return { done, value }
      }
    }
  })
})

const concat = (...iterables) => {
  let currentIndex = -1
  let iterator
  let allDone = false
  const nextIteraor = () => {
    currentIndex += 1
    if (currentIndex === iterables.length) {
      allDone = true
      return
    }
    iterator = iteratorFrom(iterables[currentIndex])
  }
  nextIteraor()
  return fromNext(() => {
    while (true) {
      if (allDone) {
        return { done: true }
      }
      const { done, value } = iterator.next()
      if (done) {
        nextIteraor()
        continue
      }
      return { done, value }
    }
  })
}

const range = (start, end) => {
  let i = start
  const forward = () => iterableFactory({
    * [Symbol.iterator]() {
      while (i <= end) {
        yield i
        i += 1
      }
    }
  })
  const backward = () => iterableFactory({
    * [Symbol.iterator]() {
      while (i >= end) {
        yield i
        i -= 1
      }
    }
  })
  return start > end
    ? backward()
    : forward()
}

const toArray = iterable => Array.from(iterable)

iterableFactory = (any) => {
  const iterable = canIterate(any)
    ? any
    : from(any)
  return {
    [iterableSymbol]: true,
    [Symbol.iterator]: () => iterable[Symbol.iterator](),
    skip: count => skip(count, iterable),
    take: count => take(count, iterable),
    slice: (begin, end) => slice(begin, end, iterable),
    map: mapper => map(mapper, iterable),
    reduce: curry((reducer, initialState) => reduce(reducer, initialState, iterable)),
    filter: test => filter(test, iterable),
    concat: (...args) => concat(iterable, ...args),
    toArray: () => Array.from(iterable),
  }
}

Iterable = {
  [Symbol.hasInstance]: isIterable,
  isIterable,
  from,
  fromValue,
  fromObject,
  fromPrototype,
  fromNext,
  empty: iterableFactory([]),
  skip,
  take,
  slice,
  map,
  reduce,
  filter,
  concat,
  range,
  toArray,
}

module.exports = Iterable
