/* eslint no-new-func: 0 */
/* eslint no-unreachable-loop: 0 */

const { Scope } = require('../core/scope')
const { typeName } = require('../core/types')

const assemblerSymbol = Symbol.for('fp.lang.assembler')
const assemblersSymbol = Symbol.for('fp.lang.assemblers')

class AssembleError extends Error {
  constructor (message, assembler, input) {
    super(message)
    // todo
  }
}

const ecma = {
  operators: {
    falsy: Symbol.for('fp.lang.ecma.operators.falsy'),
    truthy: Symbol.for('fp.lang.ecma.operators.truthy'),
    rest: Symbol.for('fp.lang.ecma.operators.rest'),
    math: {
      add: Symbol.for('fp.lang.ecma.operators.math.add'),
      sub: Symbol.for('fp.lang.ecma.operators.math.sub'),
      mul: Symbol.for('fp.lang.ecma.operators.math.mul'),
      div: Symbol.for('fp.lang.ecma.operators.math.div'),
      mod: Symbol.for('fp.lang.ecma.operators.math.mod'),
      exp: Symbol.for('fp.lang.ecma.operators.math.exp'),
      neg: Symbol.for('fp.lang.ecma.operators.math.neg'),
    },
    bitwise: {
      and: Symbol.for('fp.lang.ecma.operators.bitwise.and'),
      or: Symbol.for('fp.lang.ecma.operators.bitwise.or'),
      not: Symbol.for('fp.lang.ecma.operators.bitwise.not'),
    },
    logic: {
      and: Symbol.for('fp.lang.ecma.operators.logic.and'),
      or: Symbol.for('fp.lang.ecma.operators.logic.or'),
      gt: Symbol.for('fp.lang.ecma.operators.logic.gt'),
      lt: Symbol.for('fp.lang.ecma.operators.logic.lt'),
      gte: Symbol.for('fp.lang.ecma.operators.logic.gte'),
      lte: Symbol.for('fp.lang.ecma.operators.logic.lte'),
      eq: Symbol.for('fp.lang.ecma.operators.logic.eq'),
    },
  },
  Primitive: Symbol.for('fp.lang.ecma.Primitive'),
  Array: Symbol.for('fp.lang.ecma.Array'),
  ArrayBuffer: Symbol.for('fp.lang.ecma.ArrayBuffer'),
  BigInt: Symbol.for('fp.lang.ecma.BigInt'),
  BigInt64Array: Symbol.for('fp.lang.ecma.BigInt64Array'),
  BigUint64Array: Symbol.for('fp.lang.ecma.BigUint64Array'),
  Boolean: Symbol.for('fp.lang.ecma.Boolean'),
  Buffer: Symbol.for('fp.lang.ecma.Buffer'),
  DataView: Symbol.for('fp.lang.ecma.DataView'),
  Date: Symbol.for('fp.lang.ecma.Date'),
  Error: Symbol.for('fp.lang.ecma.Error'),
  EvalError: Symbol.for('fp.lang.ecma.EvalError'),
  FinalizationRegistry: Symbol.for('fp.lang.ecma.FinalizationRegistry'),
  Float32Array: Symbol.for('fp.lang.ecma.Float32Array'),
  Float64Array: Symbol.for('fp.lang.ecma.Float64Array'),
  Function: Symbol.for('fp.lang.ecma.Function'),
  Int16Array: Symbol.for('fp.lang.ecma.Int16Array'),
  Int32Array: Symbol.for('fp.lang.ecma.Int32Array'),
  Int8Array: Symbol.for('fp.lang.ecma.Int8Array'),
  Map: Symbol.for('fp.lang.ecma.Map'),
  Null: Symbol.for('fp.lang.ecma.Null'),
  Number: Symbol.for('fp.lang.ecma.Number'),
  Object: Symbol.for('fp.lang.ecma.Object'),
  Promise: Symbol.for('fp.lang.ecma.Promise'),
  Proxy: Symbol.for('fp.lang.ecma.Proxy'),
  RangeError: Symbol.for('fp.lang.ecma.RangeError'),
  ReferenceError: Symbol.for('fp.lang.ecma.ReferenceError'),
  RegExp: Symbol.for('fp.lang.ecma.RegExp'),
  Set: Symbol.for('fp.lang.ecma.Set'),
  SharedArrayBuffer: Symbol.for('fp.lang.ecma.SharedArrayBuffer'),
  String: Symbol.for('fp.lang.ecma.String'),
  Symbol: Symbol.for('fp.lang.ecma.Symbol'),
  SyntaxError: Symbol.for('fp.lang.ecma.SyntaxError'),
  TextDecoder: Symbol.for('fp.lang.ecma.TextDecoder'),
  TextEncoder: Symbol.for('fp.lang.ecma.TextEncoder'),
  TypeError: Symbol.for('fp.lang.ecma.TypeError'),
  URIError: Symbol.for('fp.lang.ecma.URIError'),
  URL: Symbol.for('fp.lang.ecma.URL'),
  URLSearchParams: Symbol.for('fp.lang.ecma.URLSearchParams'),
  Uint16Array: Symbol.for('fp.lang.ecma.Uint16Array'),
  Uint32Array: Symbol.for('fp.lang.ecma.Uint32Array'),
  Uint8Array: Symbol.for('fp.lang.ecma.Uint8Array'),
  Uint8ClampedArray: Symbol.for('fp.lang.ecma.Uint8ClampedArray'),
  Undefined: Symbol.for('fp.lang.ecma.Undefined'),
  WeakMap: Symbol.for('fp.lang.ecma.WeakMap'),
  WeakRef: Symbol.for('fp.lang.ecma.WeakRef'),
  WeakSet: Symbol.for('fp.lang.ecma.WeakSet'),
}

const ecmaByName = {
  'ecma.operators.falsy': ecma.operators.falsy,
  'ecma.operators.truthy': ecma.operators.truthy,
  'ecma.operators.rest': ecma.operators.rest,
  'ecma.operators.math.add': ecma.operators.math.add,
  'ecma.operators.math.sub': ecma.operators.math.sub,
  'ecma.operators.math.mul': ecma.operators.math.mul,
  'ecma.operators.math.div': ecma.operators.math.div,
  'ecma.operators.math.mod': ecma.operators.math.mod,
  'ecma.operators.math.exp': ecma.operators.math.exp,
  'ecma.operators.math.neg': ecma.operators.math.neg,
  'ecma.operators.bitwise.and': ecma.operators.bitwise.and,
  'ecma.operators.bitwise.or': ecma.operators.bitwise.or,
  'ecma.operators.bitwise.not': ecma.operators.bitwise.not,
  'ecma.operators.logic.and': ecma.operators.logic.and,
  'ecma.operators.logic.or': ecma.operators.logic.or,
  'ecma.operators.logic.gt': ecma.operators.logic.gt,
  'ecma.operators.logic.lt': ecma.operators.logic.lt,
  'ecma.operators.logic.gte': ecma.operators.logic.gte,
  'ecma.operators.logic.lte': ecma.operators.logic.lte,
  'ecma.operators.logic.eq': ecma.operators.logic.eq,
  'ecma.Primitive': ecma.Primitive,
  'ecma.Array': ecma.Array,
  'ecma.ArrayBuffer': ecma.ArrayBuffer,
  'ecma.BigInt': ecma.BigInt,
  'ecma.BigInt64Array': ecma.BigInt64Array,
  'ecma.BigUint64Array': ecma.BigUint64Array,
  'ecma.Boolean': ecma.Boolean,
  'ecma.Buffer': ecma.Buffer,
  'ecma.DataView': ecma.DataView,
  'ecma.Date': ecma.Date,
  'ecma.Error': ecma.Error,
  'ecma.EvalError': ecma.EvalError,
  'ecma.FinalizationRegistry': ecma.FinalizationRegistry,
  'ecma.Float32Array': ecma.Float32Array,
  'ecma.Float64Array': ecma.Float64Array,
  'ecma.Function': ecma.Function,
  'ecma.Int16Array': ecma.Int16Array,
  'ecma.Int32Array': ecma.Int32Array,
  'ecma.Int8Array': ecma.Int8Array,
  'ecma.Map': ecma.Map,
  'ecma.Null': ecma.Null,
  'ecma.Number': ecma.Number,
  'ecma.Object': ecma.Object,
  'ecma.Promise': ecma.Promise,
  'ecma.Proxy': ecma.Proxy,
  'ecma.RangeError': ecma.RangeError,
  'ecma.ReferenceError': ecma.ReferenceError,
  'ecma.RegExp': ecma.RegExp,
  'ecma.Set': ecma.Set,
  'ecma.SharedArrayBuffer': ecma.SharedArrayBuffer,
  'ecma.String': ecma.String,
  'ecma.Symbol': ecma.Symbol,
  'ecma.SyntaxError': ecma.SyntaxError,
  'ecma.TextDecoder': ecma.TextDecoder,
  'ecma.TextEncoder': ecma.TextEncoder,
  'ecma.TypeError': ecma.TypeError,
  'ecma.URIError': ecma.URIError,
  'ecma.URL': ecma.URL,
  'ecma.URLSearchParams': ecma.URLSearchParams,
  'ecma.Uint16Array': ecma.Uint16Array,
  'ecma.Uint32Array': ecma.Uint32Array,
  'ecma.Uint8Array': ecma.Uint8Array,
  'ecma.Uint8ClampedArray': ecma.Uint8ClampedArray,
  'ecma.Undefined': ecma.Undefined,
  'ecma.WeakMap': ecma.WeakMap,
  'ecma.WeakRef': ecma.WeakRef,
  'ecma.WeakSet': ecma.WeakSet,
}

const defaultInput = [ecma.Array, [ecma.operators.rest, ecma.Any]]

const globalContext = [
  null,
  ...Reflect.ownKeys(globalThis).map((key) => {
    const value = globalThis[key]
    const ref = `ecma.${typeName(value)}`
    return { key, value: { ref, args: [value] } }
  }),
]

const fromContext = (context, key) => {
  for (let i = context.length - 1; i > 0; i--) {
    const entry = context[i]
    if (entry.key === key) { return entry.value }
  }
  const [nextContext] = context
  return nextContext && fromContext(nextContext, key)
}

const fromLocalContext = (context, key) => {
  for (let i = context.length - 1; i > 0; i--) {
    const entry = context[i]
    if (entry.key === key) { return entry.value }
  }
  return null
}

const contextEntry = () => {}

const defaultAssembler = () =>
  (input) => input.elements.reduce(
    ({ expressions, context }, expression) =>
      expression.ref === 'fp.pushContext'
        ? { expressions, context: [...context, contextEntry(expression)] }
        : { expressions: [...expressions, expression], context },
    input,
  )

Scope.context.current[assemblersSymbol] = [defaultAssembler]
Scope.context.current[assemblerSymbol] = [defaultAssembler()]

const assembler = (factory) => {
  const assemblers = Scope.context.current[assemblersSymbol]
  assemblers.push(factory)
  const currentAssembler = Scope.context.current[assemblerSymbol]
  const assembler = factory(currentAssembler[0], assemble)
  assembler.factory = factory
  currentAssembler[0] = (input) => {
    try {
      return assembler(input)
    } catch (err) {
      throw new AssembleError(
        err.message,
        factory,
        input,
      )
    }
  }
  return currentAssembler[0]
}

// { elements, expressions, context }
const assemble = ({ elements, expressions, context = globalContext }) => {
  const assembler = Scope.context.current[assemblerSymbol][0]
  const assembled = assembler({ elements, context, expressions })
  return { ...assembled, elements }
}
assemble.ecma = ecma
assemble.fromContext = fromContext
assemble.fromLocalContext = fromLocalContext

module.exports = {
  assembler,
  assemble,
}
