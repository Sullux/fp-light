const { Spreadable, Spread } = require('./spreadable')
const { assert } = require('./assert')
const { isFunction, functionName } = require('./helpers')

const innerFunction = Symbol.for('fp.innerFunction')
const identityPath = Symbol.for('fp.identity')
const isIdentity = (v) => !!v?.[identityPath]
const defaultIdentity = (v) => v
defaultIdentity[innerFunction] = defaultIdentity
defaultIdentity[identityPath] = []

const allowedIdentityParts = [
  'string',
  'symbol',
  'number',
]
const expectationString =
  `expected parts of type ${allowedIdentityParts.join('/')}`

let lastPrimitiveValue
let lastPrimitiveName
let primitiveCount = 0

const savedAsPrimitive = (value, inner) => {
  lastPrimitiveValue = value
  primitiveCount += 1
  lastPrimitiveName = `@@identity:${functionName(inner)}:${primitiveCount}`
  return lastPrimitiveName
}

const identityProxy = (parts, apply) => ({
  get: (target, prop, receiver) => (prop === identityPath
    ? parts
    : prop === innerFunction
      ? target
      : prop === Symbol.toPrimitive
        ? () => savedAsPrimitive(receiver, target)
        : prop === Symbol.iterator
          ? function * () {
              yield Spread(receiver)
            }
          : prop === target.spreadPropertyName
            ? Spread(receiver)
            : Identity(target, [...parts, prop])),
  ownKeys: (target) => ([target.spreadPropertyName]),
  apply,
})

function Identity (fn, parts = [], apply) {
  const inner = fn?.[innerFunction] || fn || defaultIdentity
  assert(isFunction(inner), `expected a function; got ${fn}`)
  const path = parts.map((part) => {
    const type = typeof part
    assert(
      allowedIdentityParts.includes(type),
      `${expectationString}; got ${type}`,
    )
    if (type !== 'string') { return part }
    if (part === lastPrimitiveName) {
      return lastPrimitiveValue
    }
    const number = Number(part)
    return Number.isInteger(number) ? number : part
  })
  // todo: remove the dependence on Spreadable
  return new Proxy(Spreadable(inner), identityProxy(path, apply))
}
Object.defineProperty(Identity, Symbol.hasInstance, {
  value: isIdentity,
})

module.exports = {
  Identity,
  innerFunction,
  identityPath,
}
