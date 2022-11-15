import { awaitDelay } from './async.js'
import { compilable } from './compilable.js'

export const delay = compilable(function delay(ms, input) {
  return awaitDelay(typeof ms === 'function' ? ms(input) : ms).then(() => input)
})
