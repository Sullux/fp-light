const { isThennable } = require('./type')

const isVisitable = value => value && !(
  (typeof value === 'string')
  || (typeof value === 'number')
  || (value instanceof Date)
  || (value instanceof RegExp)
)

const visit = callback => {
  const visitNext = (value, visited, path) => {
    if (!isVisitable(value)) {
      return callback({ value, path })
    }
    if (visited.includes(value)) {
      return callback({ value, path, alreadyVisited: true })
    }
    const nowVisited = [...visited, value]
    if (Array.isArray(value)) {
      return value.forEach((v, i) => visitNext(v, nowVisited, [...path, i]))
    }
    return Object.entries(value)
      .forEach(([k, v]) => visitNext(v, nowVisited, [...path, k]))
  }
  return input => visitNext(input, [], [])
}

module.exports = {
  isVisitable,
  visit,
}

const canDeepReduce = value => value && !(
  (typeof value === 'string')
  || (typeof value === 'number')
  || (value instanceof Date)
  || (value instanceof RegExp)
)

const deepReduce = fn => {
  const next = (value, path, visited, result) => {
    fn({ value })

  }
  return value => {
    const result = fn({ value })
    return canDeepReduce(value)
      ? next(value, [], [], result)
      : result
  }
}
