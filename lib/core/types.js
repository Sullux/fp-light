export class ImplicitConversionError extends Error {
  constructor (from, to) {
    super(`cannot implicitly convert from "${from}" to "${to}"`)
    this.code = 'ERR_IMPLICIT_CONVERSION'
  }
}

export class ExplicitConversionError extends Error {
  constructor (from, to) {
    super(`cannot explicitly convert from "${from}" to "${to}"`)
    this.code = 'ERR_EXPLICIT_CONVERSION'
  }
}

export function Undefined() { }

export function Null() { return null }

const typeName = value =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor.name

function isType(type, value) {
  // todo: walk the heirarchy by hand instead?
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value instanceof type)
}

function isExactType(type, value) {
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value && (value.constructor === type))
}
