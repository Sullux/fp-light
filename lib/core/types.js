class ImplicitConversionError extends Error {
  constructor (from, to) {
    super(`cannot implicitly convert from "${from}" to "${to}"`)
    this.code = 'ERR_IMPLICIT_CONVERSION'
  }
}

class ExplicitConversionError extends Error {
  constructor (from, to) {
    super(`cannot explicitly convert from "${from}" to "${to}"`)
    this.code = 'ERR_EXPLICIT_CONVERSION'
  }
}

const types = []

const typeFromSpec = (spec) => spec === undefined
  ? Type(Undefined)
  : spec === null
    ? Type(Null)
    : ((spec instanceof Function) || (typeof spec === 'function'))
        ? { constructor: spec }
        : spec

function Type (spec) {
  const existing = types.get(spec)
  if (existing) { return existing }
  types.set(spec, typeFromSpec(spec))
}

function Undefined () { }

function Null () { return null }

const typeName = value =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor.name

function isType (type, value) {
  // todo: walk the heirarchy by hand instead?
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value instanceof type)
}

function isExactType (type, value) {
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value && (value.constructor === type))
}

const explicitConversions = new Map()

const defineExplicitConversions = (target) => {
  const value = new Map()
  Object.defineProperty(target, explicitConversion, { value })
  return value
}

function explicitConversion (
  fromType,
  toType,
  specification = {}, // { onConvert, canConvert }
) {
  const conversions = explicitConversions.get(fromType) ||
    defineExplicitConversions(fromType)
  conversions.set(toType, specification)
}

module.exports = {
  ImplicitConversionError,
  ExplicitConversionError,
  Type,
  T: Type,
  Undefined,
  Null,
  typeName,
  isType,
  isExactType,
  explicitConversion,
}
