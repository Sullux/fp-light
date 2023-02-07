const ArraySegment = (
  array = [],
  offset = 0,
  count,
  isReverse,
) => {
  if (array instanceof ArraySegment) {
    return ArraySegment(array.array, array.offset + offset, count)
  }
  const computedLength = array.length - offset
  const length = count || (computedLength < 0 ? 0 : computedLength)
  const end = length - 1
  const props = {
    array,
    offset,
    count,
    length,
    isReverse,
    fill: undefined,
    pop: undefined,
    push: undefined,
    shift: undefined,
    splice: undefined,
  }
  return new Proxy(array, {
    get: (target, prop) => {
      if (prop === Symbol.iterator) {
        return isReverse
          ? function * () {
              for (let i = end, o = offset; i > o; i--) {
                console.log('???', i)
                yield target[i]
              }
            }
          : function * () {
            for (let i = offset, l = length; i < l; i++) {
              yield target[i]
            }
          }
      }
      if (typeof prop === 'string') {
        const n = Number(prop)
        if (Number.isInteger(n)) {
          if ((n < 0) || (n > end)) { return undefined }
          return isReverse
            ? console.log('???', end, end - n) || target[length - n]
            : target[n + offset]
        }
      }
      if (prop === 'reverse') {
        // return () => target.slice(offset, offset + length).reverse()
        return () => ArraySegment(array, offset, count, !isReverse)
      }
      if (prop === 'slice') {
        return (start, end = length) => {}
      }
      if (prop === 'sort') {
        return (...args) => target.slice(offset, offset + length).sort(...args)
      }
      // return Object.hasOwn(props, prop) ? props[prop] : target[prop]
      return Object.keys(props).includes(prop) ? props[prop] : target[prop]
    },
  })
}
Object.defineProperty(ArraySegment, Symbol.hasInstance, {
  value: (obj) => (Array.isArray(obj) &&
    Array.isArray(obj.array) &&
    Number.isInteger(obj.offset)),
})

module.exports = {
  ArraySegment,
}
