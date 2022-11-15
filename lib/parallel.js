import { resolve } from './resolve.js'
import { compilable } from './compilable.js'
import { awaitAll } from './async.js'

export const parallel = compilable(function parallel(mapper, array) {
  const fn = resolve(mapper)
  return awaitAll(array.map(v => fn(v)))
}, { skip: 1 })

export { parallel as concurrent }
