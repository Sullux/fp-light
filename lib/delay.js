import { awaitDelay } from './core/async.js'
import { compilable } from './resolve.js'

export const delay = compilable(function delay (ms, input) {
  return awaitDelay(typeof ms === 'function' ? ms(input) : ms).then(() => input)
})
