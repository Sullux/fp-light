import { curry, resolvable } from './'

export const charCodeAt = curry(resolvable(function charCodeAt (index, str) {
  return str.charCodeAt(index)
}))

export const codePointAt = curry(resolvable(function codePointAt (pos, str) {
  return str.codePointAt(pos)
}))
