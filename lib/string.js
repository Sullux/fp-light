import { compilable } from './index.js'

export const parse = function parse(string) {
  return JSON.parse(string)
}

export const stringify = function stringify(value) {
  return JSON.stringify(value, null, 2)
}

export const padStart = compilable(function padStart(length, char, string) {
  return string.padStart(length, char)
})

export const padEnd = compilable(function padEnd(length, char, string) {
  return string.padEnd(length, char)
})

export const startsWith = compilable(function startsWith(value, string) {
  return string.startsWith(value)
})

export const endsWith = compilable(function endsWith(value, string) {
  return string.endsWith(value)
})

// TODO: implement a functional version of String.raw

export const fromCharCode = compilable(function fromCharCode(bytes) {
  return String.fromCharCode(...bytes)
})

export const fromCodePoint = compilable(function fromCodePoint(bytes) {
  return String.fromCodePoint(...bytes)
})

export const charAt = compilable(function charAt(index, string) {
  return string.charAt(index)
})

export const charCodeAt = compilable(function charCodeAt(index, string) {
  return string.charCodeAt(index)
})

export const charPointAt = compilable(function charPointAt(index, string) {
  return string.charPointAt(index)
})

export const indexOf = compilable(function indexOf(value, string, fromIndex) {
  if (typeof fromIndex === 'string') {
    return fromIndex.indexOf(value)
  }
  return string.indexOf(value, fromIndex)
}, { count: 2 })

export const lastIndexOf = compilable(function lastIndexOf(value, string, fromIndex) {
  if (typeof fromIndex === 'string') {
    return fromIndex.lastIndexOf(value)
  }
  return string.lastIndexOf(value, fromIndex)
}, { count: 2 })

export const isRegex = compilable(function isRegex(value) {
  return value instanceof RegExp
})

export const globalMatch = 'g'
export const ignoreCase = 'i'
export const multiline = 'm'
export const dotAll = 's'
export const unicode = 'u'
export const sticky = 's'

export const toRegex = compilable(function toRegex(flags, pattern) {
  if (isRegex.$(value)) {
    return value
  }
  return RegExp(pattern, Array.isArray(flags) ? flags.join('') : flags)
})

export { toRegex as regex }
