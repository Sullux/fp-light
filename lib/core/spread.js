const symbol = Symbol.fp || (Symbol.fp = {})

export const spreadFunction =
  symbol.spreadFunction =
  Symbol.for('fp.spreadFunction')

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')

let functionId = 0
const functions = new WeakMap()

// eslint-disable-next-line no-extend-native
Object.defineProperties(Function.prototype, {
  object: {
    get () {
      const fn = this
      return {
        [fn.spreadPropertyName]: Spread(fn),
      }
    },
  },
  [Symbol.iterator]: {
    value: function * () {
      yield Spread(this)
    },
  },
  id: {
    get () {
      const fn = this
      const existing = functions.get(fn)
      if (existing) { return existing }
      const nextId = (functionId += 1)
      functions.set(fn, nextId)
      return nextId
    },
  },
  spreadPropertyName: {
    get () {
      const { name = '(anonymous)', id } = this
      return `@@functionToObject:${name}:${id}`
    },
  },
})

export const Spread = (fn) => {
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
  value: (obj) => obj?.[spreadFunction],
})

export const isSpread = (v) => v instanceof Spread
export const callSpread = ({ [spreadFunction]: fn }, ...args) => fn(...args)
export const isSpreadable = (fn) => !!fn[fn.spreadPropertyName]
const toSpreadable = (fn) => isSpreadable(fn)
  ? fn
  : Object.assign(fn, fn.object) // todo: deal with console printing

export const Spreadable = toSpreadable
Object.defineProperty(Spreadable, Symbol.hasInstance, {
  value: isSpreadable,
})

Object.getOwnPropertyNames(globalThis).forEach((key) => {
  const fn = globalThis[key]
  if (typeof fn === 'function') { toSpreadable(fn) }
})
