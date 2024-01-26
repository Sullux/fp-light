// import { Spreadable } from './spread.js'
// import { Context } from './context.js'

const symbol = Symbol.fp || (Symbol.fp = {})

export const defineSymbol = symbol.define = Symbol.for('fp.define')

export const isDefine = (value) => !!(value && value[defineSymbol])

const isObject = (value) => !!(value && (value.constructor === Object))
const isFunction = (value) => (typeof value) === 'function'

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

const asm = Object.fromEntries([
  'fn', // a function definition
  'meta', // defines meta state
  'outer', // references the outer state
  'native', // a native js function
  'call', // a function call
  'dec', // declare in scope
  'lbl', // a label in scope and/or property name(s)
  'str', // a string literal
  'num', // a number literal
  'nul', // null
  'undef', // undefined
  'err', // a compile-time error
  'ctx', // a compile-time context

  'src', // javascript source
  'map',
  'list',
  'nd', // non-deterministic
  'when', // conditional
  'assert', // compile-time assertion
].map((name) => ([name, Symbol(`fp.def.asm.${name}`)])))

const Context = (parent, key, value, frameParent) => {
  const getParent = parent
    ? parent.get
    : (key) => ({ key, value: globalThis[key], next: () => {} })
  const findParent = parent
    ? parent.find
    : () => {}
  const instance = {
    get: (findKey) => {
      if (findKey === key) {
        return { key, value, next: () => parent.get(findKey) }
      }
      return (typeof findKey) === 'number'
        ? instance === frameParent ? undefined : getParent(findKey)
        : getParent(findKey)
    },
    find: (predicate) => predicate(key, value)
      ? { key, value, next: () => findParent(predicate) }
      : findParent(predicate),
    add: (key, value) => Context(instance, key, value, frameParent),
    push: (params) => Context(instance, meta.self, params, instance),
    pop: () => frameParent,
    frame: () => {}, // todo: current frame
    frameParent,
    parent,
    key,
    value,
  }
}

const maxFnSize = 999

const defineValue = (context, value) => {
  if (Array.isArray(value)) {
    return defineCall(context, value)
  }
  return { type: [], value }
}

const defineFunction = (parentContext, params) => {
  const initialContext = parentContext.push(params)
  const last = params[params.length - 1]
  const [decs, returns] = (params.length % 2) === 0
    ? [params, [asm.lbl, 0]]
    : [params.slice(0, -1), last]
  let context = initialContext
  for (let i = 0, l = decs.length / 2; i < l; i++) {
    const ik = i * 2
    const k = decs[ik]
    const v = decs[ik + 1]
    context = context.add(
      'string|symbol|number'.includes(typeof k) ? k : [asm.err, 'invalid label', 'must be a string, symbol or number', k],
      defineValue(context, v),
    )
  }
  // todo: analyze
  return { type: [], value: returns }
}

const defineCall = (context, params) => {
  const [fn, ...args] = params
  // todo
}

const defaultState = {
  meta: {
    [asm.fn]: [
      {
        args: [{ name: 'returns', type: 'TReturns' }],
        context: [],
        returns: {
          type: asm.fn,
          args: { maxOccurs: maxFnSize },
          returns: 'TReturns',
        },
      },
      {
        args: [
          { name: 'declarations', type: asm.dec, maxOccurs: maxFnSize - 1 },
          { name: 'returns', type: 'TReturns' },
        ],
        context: [],
        returns: {
          type: asm.fn,
          args: { maxOccurs: maxFnSize },
          returns: 'TReturns',
        },
      },
    ],
  },
  expr: asm.nul,
  context: Context(null, [
    'maxFnSize', maxFnSize,
    'anonymouseFunctionName', '<anonymous>',
    asm.fn, defineFunction,
    asm.call, defineCall,
  ]),
}

const compiled = new WeakSet()

const compile = ({ name, ...context }) => {
  // eslint-disable-next-line no-new-func
  const fn = new Function(
    'c',
    'toNative',
    'apply',
    `return ${compileTemplate.replace('__name__', name)}`,
  )(context, toNative, apply)
  fn[meta.context] = context
  compiled.add(fn)
  return fn
}

const analyze = ({ expr, ...context }) => {
  // todo!!!
}

const apply = ({ expr: maybeCompiled, ...context }) => {
  if ((typeof maybeCompiled) === 'function') {
    const { [meta.context]: c } = maybeCompiled
    return c
      ? apply[c.expr[0]]({ ...c, ...context })
      : maybeCompiled(context)
  }
  const [op, ...expr] = maybeCompiled
  return apply[op]({ expr, ...context })
}

const toNative = (context) => {
  const { expr: [op] } = context
  if (op === asm.fn) {
    return compile(context)
  }
}

const compileTemplate = ((c, toNative, apply) => function __name__ (...args) {
  return toNative(apply({ ...c, positional: args }))
})({}, toNative, apply).toString()

apply[asm.fn] = ({ expr: namedExpr, ...context }) => {
  const maybeName = [namedExpr]
  const [name, expr] = (typeof maybeName) === 'string'
    ? [maybeName, namedExpr.slice(1)]
    : ['anonymous', namedExpr]
  const applied = expr.reduce(
    (c, expr) => apply({ ...c, expr }),
    { ...context, name },
  )
  const [a, v] = applied.expr
  if (a === asm.native) {
    return v
  }
  if (a !== asm.fn) {
    throw new Error(
      `unexpected directive ${a.toString()}: ${JSON.stringify(v, null, 2)}`,
    )
  }
  return compile(applied)
}

apply[asm.dec] = ({ expr: [name, expr], ...context }) => ({
  ...context,
  named: { ...context.named, [name]: apply({ ...context, expr }) },
})

apply[asm.call] = ({ expr: [fn, ...args], ...context }) => apply({
  ...context,
  positional: args.map(apply),
  expr: fn,
})

apply[asm.map] = ({ expr, ...context }) => expr.reduce(
  ({ expr: e, missing = [], ...c }, [, k, v]) => {
    const applied = apply({ ...c, expr: v })
    return {
      ...c,
      expr: [...e, [k, applied.expr]],
      missing: [...missing, ...applied.missing],
    }
  },
  context,
)

export const Def = (...spec) => Def.fn(spec)

Def._ = _
Def.c = c
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
Meta.define('context')

Def.value = (value) => {
  if (value === null) {
    return asm.nul
  }
  if (value === undefined) {
    return asm.undef
  }
  const type = typeof value
  if (type === 'function') {
    return [asm.native, value]
  }
  if (type === 'string') {
    return Def.str(value)
  }
  if (type === 'number') {
    return Def.num(value)
  }
  if (isAccessor(value)) {
    return Def.lbl(value)
  }
  if (Array.isArray(value)) {
    return Def.call(value)
  }
  if (isObject(value)) {
    return Def.map(value)
  }
  return Def.err('unexpected value', value)
}

Def.fn = (spec) => apply({
  expr: [asm.fn, ...spec.map(Def.value)],
  positional: [],
  named: {},
  positionalMeta: [],
  namedMeta: {},
})

Def.call = (spec) => ([asm.call, ...spec.map(Def.value)])

Def.dec = (name, value) => {
  if ((typeof name) !== 'string') {
    return Def.err('unexpected name', name)
  }
  return [asm.dec, name, Def.value(value)]
}

Def.lbl = ({ [propertiesSymbol]: value }) => !value.length
  ? [asm.lbl, meta.args]
  : typeof value[0] === 'number'
    ? [asm.lbl, meta.args, ...value]
    : [asm.lbl, ...value]

Def.str = (s) => ([asm.str, s])

Def.num = (n) => ([asm.num, n])

Def.src = () => {} // todo

Def.err = (desc, value) => ([asm.err, desc, value])

Def.map = (obj) => ([
  asm.map,
  ...Object.entries(obj).map(([k, v]) => Def.dec(k, v)),
])

Object.defineProperty(Def, Symbol.hasInstance, {
  value: isDefine,
})

export { Def as Define }
