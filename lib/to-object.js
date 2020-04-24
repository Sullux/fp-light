/* eslint-disable no-restricted-syntax */
const objectFromIterable = iterable => {
  let result = {}
  for(const [key, value] of iterable) {
    result[key] = value
  }
  return result
}

export const toObject = any =>
  any === undefined
    ? { 'Undefined': undefined }
    : any === null
      ? { 'Null': null }
      : typeof any === 'object' && !(any instanceof Date)
        ? any[Symbol.iterator]
          ? objectFromIterable(any)
          : any
        : { [any.constructor.name]: any }
