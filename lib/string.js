import { callable } from './call'
import { curry } from './curry'

export const charCodeAt = curry(callable(function charCodeAt (index, str) {
  return str.charCodeAt(index)
}))

export const codePointAt = curry(callable(function codePointAt (pos, str) {
  return str.codePointAt(pos)
}))
