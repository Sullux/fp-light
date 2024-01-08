import { Spreadable } from './spread.js'
import { Context } from './context.js'

const symbol = Symbol.fp || (Symbol.fp = {})

export const defineSymbol = symbol.define = Symbol.for('fp.define')

export const isDefine = (value) => !!(value && value[defineSymbol])

const isObject = (value) => !!(value && (value.constructor === Object))

const propertiesSymbol = Symbol('fp.properties')
const spreadPropertySymbol = Symbol('fp.spreadProperty')

const maybeNumber = (value) => {
  if ((typeof value) !== 'string') { return value }
  const n = Number(value)
  if (isNaN(n)) { return value }
  return (String(n) === value) ? n : value
}

const isAccessor = (v) => !!v[propertiesSymbol]

const Accessor = (properties = []) => {
  const primitive = properties
    .map((p) => ((typeof p) === 'symbol') ? p.toString() : p)
    .join('.')
  const spreadName = `@@spread:${primitive}`
  return new Proxy(
    {
      [propertiesSymbol]: properties,
      [Symbol.toPrimitive]: () => primitive,
      [spreadName]: { [spreadPropertySymbol]: properties },
      [Symbol.iterator]: function * () {
        yield { [spreadPropertySymbol]: properties }
      },
    },
    {
      get: (target, prop) => target[prop] ||
        Accessor([...target[propertiesSymbol], maybeNumber(prop)]),
      ownKeys: () => ([spreadName]),
    },
  )
}
Object.defineProperty(Accessor, Symbol.hasInstance, {
  value: isAccessor,
})

const c = Accessor()

const _ = c[0]

const analyzeValue = (value, cc) => {
  if (isObject(value)) {
    const symbol = value[propertiesSymbol]
    if (symbol) {
      const prev = cc
      for (const p of symbol) {
        //
      }
    }
    return symbol || analyzeObject(value, cc)
  }
  if (Array.isArray(value)) {
    return analyzeCall(value, cc)
  }
}

const analyzeSpec = (spec, cc) => {
  return spec.reduce(
    (state, term) => {
      const [fn, ...args] = term
      const symbol = fn[propertiesSymbol]
      if (symbol) { return analyzeCall(cc[symbol], args, cc) }
      if (!fn) { return state }
      if (isObject(fn)) {
        return {
          ...state,
          ...Object.fromEntries(
            Object.entries().map(([key, value]) => ([
              key,
              value[propertiesSymbol] ? value : analyzeSpec(value, cc),
            ])),
          ),
        }
      }
    },
    cc,
  )
}

const analyzeFunction = (spec, cc, applied) =>
  analyzeSpec(
    spec,
    Object.fromEntries([
      ...Object.entries(cc)
        .filter(([key]) => (typeof maybeNumber(key)) !== 'number'),
      ...applied.map((v, i) => ([i, v])),
    ]),
  )

// { and, or, not }
const named = (name, spec) => {
  const cc = {}
  const args = analyzeArgs(spec, cc)
  const decl = `function ${name} (...args) {}`
  return Spreadable(fn)
}

export const Def = (spec) => {
  if (isObject(spec)) {
    return Object.fromEntries(
      Object.entries(spec).map(([key, value]) => ([key, compile(key, value)])),
    )
  }
  return compile('anonymous', spec)
}
Def._ = _
Def.c = c

const asm = Object.fromEntries([
  'fn', // a function definition
  'call', // a function call
  'dec', // declare in scope
  'lbl', // a label in scope and/or property name(s)
  'str', // a string literal
  'num', // a number literal
  'nul', // null
  'undef', // undefined
  'src', // javascript source
  'err', // a compile-time error
].map((name) => ([name, Symbol(name)])))

Def.asm = asm

const meta = symbol.meta || (symbol.meta = {})
const Meta = () => ({ [meta.args]: [] })
Def.Meta = Meta

// eslint-disable-next-line no-return-assign
Meta.define = (name) =>
  Meta[name] = meta[name] = Symbol(`fp.meta.${name}`)

Meta.define('from')
Meta.define('args')
Meta.define('is')
Meta.define('as')
Meta.define('gt')
Meta.define('lt')
Meta.define('and')
Meta.define('or')

Def.value = (value, context) => {
  const type = typeof value
  if (type === 'string') {
    return Def.str(value, context)
  }
  if (type === 'number') {
    return Def.num(value, context)
  }
  if (isAccessor(value)) {
    return Def.lbl(value, context)
  }
  if (Array.isArray(value)) {
    return Def.call(value, context)
  }
  if (isObject(value)) {
    return Object.entries(value)
      .reduce(
        (c, [key, value]) => Def.dec(key, value, c),
        context,
      )
  }
  return Def.err('Def.value', value, context)
}

Def.fn = () => {} // todo

Def.call = ([fn, ...args], context) => {
  // todo
}

Def.dec = (label, value, context = {}) => {
  const { js, scope = Meta() } = Def.value(value, context)
  const decJs = `${context.scope[label] ? '' : 'let '}label=${js};`
  return {
    js: decJs,
    scope: { ...context.scope, ...scope },
    meta: { ...context.meta, ...meta },
  }
}

Def.lbl = () => {} // todo

Def.str = () => {} // todo

Def.num = () => {} // todo

Def.nul = () => {} // todo

Def.undef = () => {} // todo

Def.src = () => {} // todo

Def.err = () => {} // todo

Object.defineProperty(Def, Symbol.hasInstance, {
  value: isDefine,
})

export { Def as Define }
