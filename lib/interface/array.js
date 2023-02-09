const { Scope } = require('../core/scope')
const { isSpread, spreadFunction } = require('../core/spreadable')
const { ArraySegment } = require('../core/arraySegment')

module.exports = (I) => {
  const { Spread, Any } = Scope.current.context

  const applyElement = (
    array,
    { element, minLength, maxLength, isGreedy },
    peek,
  ) => {
    const { isImplemented } = element
    if (element === Any) {
      return ArraySegment(array, isGreedy ? maxLength : minLength)
    }
    for (let i = 0, l = array.length; i < maxLength; i++) {
      if (i >= maxLength) {
        // we've hit the max elements
        return undefined
      }
      if (i >= l) {
        // we're past the end; if undefined is ok then we match
        if (isImplemented(undefined)) { return undefined }
      }
      const v = array[i]
      if ((!isImplemented(v)) || ((!isGreedy) && peek?.isImplemented?.(v))) {
        // either it didn't match or it non-greedily matches the next one
        return ArraySegment(array, i)
      }
    }
  }

  const apply = (array, context, i) => {
    if (!Array.isArray(array)) { return i }
    if (!context) return undefined
    let x = 0
    let a = array
    for (const element of context) {
      if (a === undefined) {
        // out of array elements
        // return a new interface with everything from this point on
        return IArray.extend([ArrayElement({ maxLength: i }), context.slice(i)])
      }
      const remaining = applyElement(a, element, context[x + 1]?.element)
      if (remaining === a) {
        // no match
        // return a new interface with everything from this point on
        return IArray.extend([ArrayElement({ maxLength: i }), context.slice(i)])
      }
      a = remaining
      x++
    }
    // finished; array satisfies the context
    return undefined
  }

  const IArrayElement = I({
    name: 'ArrayElement',
  })

  const ArrayElement = ({
    element = Any,
    minLength = 0,
    maxLength = Number.MAX_SAFE_INTEGER,
    isGreedy = true,
  } = {}) => IArrayElement.extend({ element, minLength, maxLength, isGreedy })

  const IArray = I({
    name: 'Array',
    apply,
  })

  const inferElement = (v) => isSpread(v)
    ? ArrayElement({ element: I.infer(v[spreadFunction]) })
    : v?.extends?.(Spread)
      ? ArrayElement({ element: v.context })
      : ArrayElement({
        element: I.infer(v),
        minLength: 1,
        maxLength: 1,
      })

  const infer = (a) => a.length
    ? I.from(Array, ...a.map(inferElement))
    : IArray

  const IArraySpec = I.defineSpecification({
    name: 'Array',
    infer: (v) => Array.isArray(v) && infer(v),
    construct: (t, ...c) =>
      (t === Array) && IArray.extend(c.map(ArrayElement)),
  })

  return { IArray, IArraySpec }
}
