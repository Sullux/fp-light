import { compilable } from './'

export const charCodeAt = compilable(function charCodeAt (index, str) {
  return str.charCodeAt(index)
})

export const codePointAt = compilable(function codePointAt (pos, str) {
  return str.codePointAt(pos)
})

export const parse = function parse (string) {
  return JSON.parse(string)
}

export const stringify = function stringify (value) {
  return JSON.stringify(value, null, 2)
}
