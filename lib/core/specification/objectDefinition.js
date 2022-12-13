const { isExtendedFrom } = require('../types')
const { assert } = require('../assert')

const objectSpread = Symbol.for('fp.specification.objectSpread')

const factory = (Specification) => {
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
    const valueKeys = Reflect.ownKeys(v)
    return valueKeys.every((prop) => {
      const isImplemented = spec[prop]
      return isImplemented
        ? isImplemented(v[prop])
        : (!spread.length) ||
          spread.some(([key, value]) => key(prop) && value(v[prop]))
    })
  }

  const objectDelta = (options, v) => {
    const mismatched = options.map(([key, t, o]) =>
      (key === objectSpread)
        ? []
        : [key, ...Specification.for(t)(o).delta(v[key])])
      .filter(([, d] = []) => d?.length)
    return mismatched.length
      ? [Object, mismatched]
      : []
  }

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

  return objectDefinition
}

module.exports = { factory, objectSpread }
