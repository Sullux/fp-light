const { assert } = require('../assert')
const { isSpread, spreadFunction } = require('../spreadable')
const { isExtendedFrom, Undefined } = require('../types')

const factory = (Specification) => {
  const arraysAreCompatible = (a1, a2) => {
    for (
      let i1 = 0, i2 = 0, l1 = a1.length, l2 = a2.length;
      i2 < l2;
      i1++, i2++
    ) {
      const [t1, options1] = a1[i1] || [Undefined]
      const [spread1, type1] = isSpread(t1)
        ? [true, t1[spreadFunction]]
        : [false, t1]
      const { isCompatible } = Specification.for(type1)(options1)
      if (!spread1) {
        const [t2, options2] = a2[i2]
        const [spread2, type2] = isSpread(t2)
          ? [true, t2[spreadFunction]]
          : [false, t2]
        if (!spread2) {
          if (!isCompatible(type2, options2)) { return false }
          continue
        }
        if (!isCompatible(type2, options2)) { continue }
        i1++
        for (; i1 < l1; i1++) {
          const [t1, options1] = a1[i1]
          const [spread1, type1] = isSpread(t1)
            ? [true, t1[spreadFunction]]
            : [false, t1]
          const { isCompatible } = Specification.for(type1)(options1)
          if (spread1) {
            if (isCompatible(type2, options2)) { break }
            return false
          }
          if (!isCompatible(type2, options2)) {
            i1--
            break
          }
        }
        continue
      }
      for (; i2 < l2; i2++) {
        const [t2, options2] = a2[i2]
        const [spread2, type2] = isSpread(t2)
          ? [true, t2[spreadFunction]]
          : [false, t2]
        if (spread2) {
          if (isCompatible(type2, options2)) { break }
          return false
        }
        if (!isCompatible(type2, options2)) {
          i2--
          break
        }
      }
    }
    return true
  }

  const arrayIsImplemented = (options, v) => {
    if (!(v instanceof Object)) { return false } // allow array-like objects
    for (let iO = 0, iV = 0, l = options.length; iO < l; iO++, iV++) {
      const [t, o] = options[iO]
      const [spread, type] = isSpread(t) ? [true, t[spreadFunction]] : [false, t]
      const { isImplemented } = Specification.for(type)(o)
      if (!spread) {
        if (!isImplemented(v[iV])) { return false }
        continue
      }
      for (let lV = v.length; iV < lV; iV++) {
        if (!isImplemented(v[iV])) {
          iV--
          break
        }
      }
    }
    return true
  }

  const arrayDelta = (options, v) => {
    if (!(v instanceof Object)) { return [Array, options] }
    for (let iO = 0, iV = 0, l = options.length; iO < l; iO++, iV++) {
      const [t, o] = options[iO]
      const [spread, type] = isSpread(t)
        ? [true, t[spreadFunction]]
        : [false, t]
      const { delta } = Specification.for(type)(o)
      if (!spread) {
        const difference = delta(v[iV])
        if (difference.length) {
          return [Array, [difference, ...options.slice(iO + 1)]]
        }
        continue
      }
      for (let lV = v.length; iV < lV; iV++) {
        if (delta(v[iV]).length) {
          iV--
          break
        }
      }
    }
    return []
  }

  const arrayDefinition = (options = []) => {
    if (!Array.isArray(options)) {
      assert.fail(`options: expected ${options} to be an array`)
    }
    return {
      isCompatible: (t, o = []) =>
        isExtendedFrom(t, Object) &&
        Array.isArray(o) &&
        arraysAreCompatible(options, o),
      isImplemented: (v) => (v instanceof Object) &&
      arrayIsImplemented(options, v),
      delta: (v) => arrayDelta(options, v),
    }
  }

  return arrayDefinition
}

module.exports = { factory }
