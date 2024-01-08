import { compilable, resolve } from './resolve.js'
import { awaitAll } from './core/async.js'

export const parallel = compilable(function parallel (mapper, array) {
  const fn = resolve(mapper)
  return awaitAll(array.map(v => fn(v)))
}, { skip: 1 })

export { parallel as concurrent }
