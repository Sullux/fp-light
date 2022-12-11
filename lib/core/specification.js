const {
  equal,
  is,
  isFunction,
  isString,
  unwrapped,
} = require('./helpers')
const { Any, isExtendedFrom } = require('./types')
const { assert } = require('./assert')
const { Glob } = require('./glob')

const specificationType = Symbol.for('fp.interface.specificationType')
const isSpecification = (type) => !!type?.[specificationType]
const specifications = new WeakMap()

function Specification (type, define = () => {}) {
  assert.isFunction(type)
  const specificationTemplate = (options) => {
    const definition = define(options)
    // can match the interface definition (String {maxLength: 5} == String)
    const isCompatible = definition.isCompatible || ((t) => t === type)
    // the given value fits this specification ('foo' ~~ String)
    const isImplemented = definition.isImplemented ||
      ((v) => v instanceof type)
    // the unmatched part of the value ({ foo: 42 } ~~ Object { foo, bar } ?? bar)
    const delta = definition.delta ||
      ((v) => isImplemented(v) ? [] : [[type, options]])
    return { type, options, isCompatible, isImplemented, delta }
  }
  const existing = specifications.get(type) || []
  specificationTemplate[specificationType] = type
  specifications.set(type, [specificationTemplate, ...existing])
  return specificationTemplate
}
Object.defineProperties(Specification, {
  [Symbol.hasInstance]: { value: isSpecification },
  for: {
    value: (type) => {
      const existing = specifications.get(type)
      return existing?.[0] || Specification(type)
    },
  },
})

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

const objectSpread = Symbol.for('fp.specification.objectSpread')

const objectsAreCompatible = (o1, o2) => {
  const leftSpread = o1.filter(([key]) => key === objectSpread)
    .map(([, [kType, kOptions], [vType, vOptions]]) => ([
      Specification.for(kType)(kOptions),
      Specification.for(vType)(vOptions),
    ]))
  const rightSpread = o2.filter(([key]) => key === objectSpread)
    .map(([, [kType, kOptions], [vType, vOptions]]) => ([
      Specification.for(kType)(kOptions),
      [vType, vOptions],
    ]))
  const leftNamed = o1.filter(([key]) => key !== objectSpread)
  const rightNamed = o2.filter(([key]) => key !== objectSpread)
  if (rightSpread.length) {
    const leftUnmatched = leftNamed.filter(([lKey]) =>
      rightNamed.every(([rKey]) => lKey !== rKey))
      .map(([key, type, options]) => ([key, Specification.for(type)(options)]))
    if (leftUnmatched.length) {
      if (!leftUnmatched.some(([key, { isCompatible }]) =>
        rightSpread.some((
          [{ isImplemented: keyOk }, [vType, vOptions]],
        ) => keyOk(key) && isCompatible(vType, vOptions)))) {
        return false
      }
    }
  }
  return rightNamed.every(([key, type, options]) =>
    leftNamed.some(([lKey]) => lKey === key) ||
      leftSpread.some(([keySpec, valueSpec]) =>
        keySpec.isImplemented(key) && valueSpec.isCompatible(type, options)))
}

const objectIsImplemented = (options, v) => {
  const spec = Object.fromEntries(options
    .filter(([key]) => key !== objectSpread)
    .map(([key, t, o]) => ([key, Specification.for(t)(o).isImplemented])))
  const spread = options.filter(([key]) => key === objectSpread)
    .map(([, [kType, kOptions], [vType, vOptions]]) => ([
      Specification.for(kType)(kOptions).isImplemented,
      Specification.for(vType)(vOptions).isImplemented,
    ]))
  const valueKeys = Array.isArray(v)
    ? Array(v.length).fill().map((x, i) => i)
    : Reflect.ownKeys(v)
  return valueKeys.every((prop) => {
    const isImplemented = spec[prop]
    return isImplemented
      ? isImplemented(v[prop])
      : (!spread.length) ||
          spread.some(([key, value]) => key(prop) && value(v[prop]))
  })
}

const objectDelta = (options, v) => options.map(([key, t, o]) =>
  (key !== objectSpread) && [key, Specification.for(t)(o).delta(v)])
  .filter(([, d] = []) => d?.length)

const objectDefinition = (options = []) => {
  if (!Array.isArray(options)) {
    assert.fail(`options: expected ${options} to be an array`)
  }
  return {
    isCompatible: (t, o = []) =>
      isExtendedFrom(t, Object) &&
        Array.isArray(o) &&
        objectsAreCompatible(options, o),
    isImplemented: (v) => (v instanceof Object) &&
      objectIsImplemented(options, v),
    delta: (v) => objectDelta(options, v),
  }
}

const defaultSpecifications = {
  String: Specification(String, stringDefinition),
  Object: Specification(Object, objectDefinition),
  Array: Specification(Array, objectDefinition),
  Any: Specification(Any),
  // todo: add remaining types
}

Object.assign(Specification, defaultSpecifications)

module.exports = {
  Specification,
  specificationType,
  isSpecification,
  objectSpread,
}
