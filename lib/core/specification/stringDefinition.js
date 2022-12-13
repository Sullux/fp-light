const {
  equal,
  is,
  isFunction,
  isString,
  unwrapped,
} = require('../helpers')
const { Glob } = require('../glob')
const { assert } = require('../assert')
const { isExtendedFrom } = require('../types')

const defaultStringOptions = (options = {}) => ({
  minLength: options.minLength || 0,
  maxLength: options.maxLength || Number.MAX_SAFE_INTEGER,
  matches: options.matches || undefined,
})

const compareStringOptions = (options1, options2) => {
  const o1 = defaultStringOptions(options1)
  const o2 = defaultStringOptions(options2)
  return equal(o1, o2) || (
    (o1.minLength >= o2.minLength) &&
    (o1.maxLength <= o2.maxLength) &&
    is(o1.matches, o2.matches)
  )
}

const stringMatches = (matches) => matches && (isString(matches)
  ? stringMatches(Glob(matches).regex)
  : (matches instanceof Glob)
      ? stringMatches(matches.regex)
      : (matches instanceof RegExp)
          ? (v) => !!v.match(matches)
          : isFunction(matches)
            ? matches
            : assert.fail(unwrapped(`matches: expected ${matches} to be a
                string, regex, glob or function`)))

const stringDefinition = (options) => {
  if (isString(options) || (options instanceof RegExp)) {
    return stringDefinition({ matches: options })
  }
  const matches = stringMatches(options?.matches)
  const { minLength, maxLength } = (options || {})
  return {
    isCompatible: (t, o) =>
      isExtendedFrom(t, String) && compareStringOptions(options, o),
    isImplemented: (v) => isString(v) &&
      (minLength ? v.length >= minLength : true) &&
      (maxLength ? v.length <= maxLength : true) &&
      (matches ? matches(v) : true),
  }
}

module.exports = { stringDefinition }
