// import { Spreadable } from './spread.js'
// import { Context } from './context.js'

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
      toJSON: () => `@@properties: ${primitive}`,
      [Symbol.for('nodejs.util.inspect.custom')]:
        () => `Symbol(fp.properties): ${primitive}`,
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

const throwErrors = (context) => {
  const { errs } = context
  const err = new Error(`compile error: ${JSON.stringify(errs, null, 2)}`) // todo: custom error
  err.context = context
  throw err
}

const apply = ([op, ...expr], ...context) =>
  apply[op]({ expr, ...context })

apply.fn = ({ expr: namedExpr, ...context }) => {
  const maybeName = [namedExpr]
  const [name, expr] = (typeof maybeName) === 'string'
    ? [maybeName, namedExpr.slice(1)]
    : ['anonymous', namedExpr]
  const applied = expr.reduce(
    (c, expr) => apply({ ...c, expr }),
    context,
  )
}

export const Def = (...spec) => Def.fn(spec)

Def._ = _
Def.c = c

const asm = Object.fromEntries([
  'native', // a native js function
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
  'map',
  'list',
].map((name) => ([name, Symbol(`fp.def.asm.${name}`)])))

Def.asm = asm

const meta = symbol.meta || (symbol.meta = {})
const Meta = (args = { positional: [], named: {}, applied: {} }) =>
  ({ [meta.args]: args })
Def.Meta = Meta

// eslint-disable-next-line no-return-assign
Meta.define = (name) =>
  Meta[name] = meta[name] = Symbol(`fp.def.meta.${name}`)

Meta.define('from')
Meta.define('args')
Meta.define('is')
Meta.define('as')
Meta.define('gt')
Meta.define('lt')
Meta.define('and')
Meta.define('or')

const defaultContext = {
  expr: [],
  errs: [],
}

Def.value = (value, context = defaultContext) => {
  const type = typeof value
  if (type === 'function') {
    return { ...context, expr: [asm.native, value] }
  }
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
    return Def.map(Object.entries(value), context)
  }
  return Def.err('unexpected value', value, context)
}

Def.fn = (spec, context = defaultContext) => {
  const {
    expr,
    errs,
  } = spec.reduce(
    (c, value) => {
      const step = Def.value(value, c)
      return { ...step, expr: [...c.expr, step.expr] }
    },
    { ...context, expr: [asm.fn] },
  )
  return errs.length
    ? throwErrors(errs)
    : apply({
      expr,
      positional: [],
      named: {},
      positionalMeta: [],
      namedMeta: {},
    })
}

Def.call = (spec, context = defaultContext) => spec.reduce(
  (c, v) => {
    const result = Def.value(v, c)
    return {
      ...c,
      expr: [...c.expr, result.expr],
    }
  },
  { ...context, expr: [asm.call] },
)

Def.dec = (name, value, context = defaultContext) => {
  if ((typeof name) !== 'string') {
    return Def.err('unexpected name', name, context)
  }
  const valueContext = Def.value(value, context)
  const errs = valueContext.errs?.length
    ? valueContext.errs.map((err) => ([...err, [asm.dec, name]]))
    : []
  return {
    ...valueContext,
    errs,
    expr: [asm.dec, name, valueContext.expr],
  }
}

Def.lbl = ({ [propertiesSymbol]: value }, context = defaultContext) => {
  const expr = !value.length
    ? [asm.lbl, meta.args]
    : typeof value[0] === 'number'
      ? [asm.lbl, meta.args, ...value]
      : [asm.lbl, ...value]
  return { ...context, expr }
}

Def.str = () => {} // todo

Def.num = (n, context) => ({ ...context, expr: [asm.num, n] })

Def.nul = () => {} // todo

Def.undef = () => {} // todo

Def.src = () => {} // todo

Def.err = (desc, value, context = defaultContext) => ({
  ...context,
  errs: [...context.errs, [[desc, value]]],
})

Def.map = (entries, context = defaultContext) => entries.reduce(
  (c, [k, v]) => {
    const value = Def.value(v, c)
    const { expr } = value
    const namedExpr = expr[0] === asm.fn
      ? [expr[0], k, ...expr.slice(1)]
      : expr
    return {
      ...value,
      expr: [...c.expr, [k, namedExpr]],
    }
  },
  { ...context, expr: [] },
)

Object.defineProperty(Def, Symbol.hasInstance, {
  value: isDefine,
})

export { Def as Define }
