function Null() {
  if (new.target) {
    throw new Error('Cannot construct with "new".')
  }
  return null
}

function Undefined() {
  if (new.target) {
    throw new Error('Cannot construct with "new".')
  }
}

const inheritenceOf = (proto, chain = []) =>
  (proto === null
    ? chain
    : inheritenceOf(Object.getPrototypeOf(proto), [...chain, proto.constructor]))

const factoryOf = value =>
  (value === undefined
    ? Undefined
    : value === null
      ? Null
      : Object.getPrototypeOf(value).constructor)

const type = (value) => {
  const jstype = typeof value
  const factory = factoryOf(value)
  return {
    jstype,
    factory,
    inheritence: value === undefined
      ? [Undefined, Object]
      : value === null
        ? [Null, Object]
        : inheritenceOf(Object.getPrototypeOf(value))
  }
}

module.exports = {
  type,
  Null,
  Undefined,
}
