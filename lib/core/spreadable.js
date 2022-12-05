const spreadFunction = Symbol('spreadFunction')

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')

const Spread = (fn) => {
  const result = {
    call: fn,
    [spreadFunction]: fn,
  }
  Object.defineProperties(result, {
    toString: {
      value: () => `Spread([Function ${fn.name || 'anonymous'}])`,
    },
    [customInspectSymbol]: {
      enumerable: true,
      value: () => result.toString(),
    },
  })
  return result
}
Object.defineProperty(Spread, Symbol.hasInstance, {
  value: (obj) => obj[spreadFunction],
})

const isSpread = (v) => v instanceof Spread

const callSpread = ({ [spreadFunction]: fn }, ...args) => fn(...args)

// eslint-disable-next-line no-extend-native
Function.prototype[Symbol.iterator] = function * () {
  yield Spread(this)
}

let functionId = 0
const functions = new WeakMap()
// eslint-disable-next-line no-extend-native
Object.defineProperty(Function.prototype, 'id', {
  get () {
    const fn = this
    const existing = functions.get(fn)
    if (existing) { return existing }
    const nextId = (functionId += 1)
    functions.set(fn, nextId)
    return nextId
  },
})

// eslint-disable-next-line no-extend-native
Object.defineProperty(Function.prototype, 'object', {
  get () {
    const fn = this
    return {
      [`@@functionToObject:${fn.id}`]: Spread(fn),
    }
  },
})

const Spreadable = (fn) => Object.assign(fn, fn.object)

module.exports = {
  Spread,
  isSpread,
  spreadFunction,
  callSpread,
  Spreadable,
}
