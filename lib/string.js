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

export const padStart = compilable(function padStart(length, char, string) {
  return string.padStart(length, char)
})

export const padEnd = compilable(function padEnd(length, char, string) {
  return string.padEnd(length, char)
})
