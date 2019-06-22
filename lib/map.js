const { curry } = require('./curry')
const { isThennable } = require('./type')
const { resolve } = require('./resolve')

const syncMap = function* (mapper, iterable) {
  for (const v of iterable) {
    yield mapper(v)
  }
}

const map = function* (mapper, iterable) {
  let previous
  const resolver = resolve(mapper)
  for (const v of iterable) {
    if (previous) {
      yield (previous = previous.then(() => resolver(v)))
      continue
    }
    const mapped = resolver(v)
    yield isThennable(mapped)
      ? (previous = mapped)
      : mapped
  }
}

const parallelMap = (mapper, iterable) =>
  syncMap(resolve(mapper), iterable)

const mapTo = (mappers, value) =>
  map((fn => fn(value)), mappers)

module.exports = {
  map: curry(map),
  mapTo: curry(mapTo),
  parallelMap: curry(parallelMap),
  syncMap: curry(syncMap),
}
