import { isAsync } from './core/async.js'
import { resolve } from './resolve.js'

const interpolateSync = (parts, values) => {
  const result = []
  parts.forEach((part, i) => {
    result.push(part)
    if (i < values.length) {
      result.push(values[i])
    }
  })
  return result.join('')
}

const interpolate = (parts, mappers) => {
  const resolveMappers = resolve(mappers)
  return value => {
    const mappedValues = resolveMappers(value)
    return isAsync(mappedValues)
      ? mappedValues.then(values => interpolateSync(parts, values))
      : interpolateSync(parts, mappedValues)
  }
}

export const tag = (parts, ...mappers) =>
  interpolate(parts, mappers)

export { tag as template }

export const constant = (value, ...stringMappers) =>
  stringMappers.length
    ? interpolate(value, stringMappers)
    : () => value

export {
  constant as $,
  constant as always,
  constant as just,
  constant as scalar,
}
