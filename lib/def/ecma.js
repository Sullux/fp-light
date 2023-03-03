const { I } = require('./interface')
const {
  isFunction,
} = require('../core/helpers')
const { isExactType, isType, Primitive } = require('../core/types')

const ecma = {
  //
  // custom helpers

  IPrimitive: I.define({
    name: 'ecma.Primitive',
    properties: (v) => v instanceof Primitive,
  }),

  //
  // standard definitions

  IArray: I.define({
    name: 'ecma.Array',
    properties: (v) => Array.isArray(v),
  }),

  IArrayBuffer: I.define({
    name: 'ecma.ArrayBuffer',
    properties: (v) => isType(ArrayBuffer, v),
  }),

  IBigInt: I.define({
    name: 'ecma.BigInt',
    properties: (v) => isExactType(BigInt, v),
  }),

  IBigInt64Array: I.define({
    name: 'ecma.BigInt64Array',
    properties: (v) => isExactType(BigInt64Array, v),
  }),

  IBigUint64Array: I.define({
    name: 'ecma.BigUint64Array',
    properties: (v) => isExactType(BigUint64Array, v),
  }),

  IBoolean: I.define({
    name: 'ecma.Boolean',
    properties: (v) => isExactType(Boolean, v),
  }),

  IBuffer: I.define({
    name: 'ecma.Buffer',
    properties: (v) => isType(Buffer, v),
  }),

  IDataView: I.define({
    name: 'ecma.DataView',
    properties: (v) => isExactType(DataView, v),
  }),

  IDate: I.define({
    name: 'ecma.Date',
    properties: (v) => isExactType(Date, v),
  }),

  IError: I.define({
    name: 'ecma.Error',
    properties: (v) => isExactType(Error, v),
  }),

  IEvalError: I.define({
    name: 'ecma.EvalError',
    properties: (v) => isExactType(EvalError, v),
  }),

  IFinalizationRegistry: I.define({
    name: 'ecma.FinalizationRegistry',
    properties: (v) => isExactType(FinalizationRegistry, v),
  }),

  IFloat32Array: I.define({
    name: 'ecma.Float32Array',
    properties: (v) => isExactType(Float32Array, v),
  }),

  IFloat64Array: I.define({
    name: 'ecma.Float64Array',
    properties: (v) => isExactType(Float64Array, v),
  }),

  IFunction: I.define({
    name: 'ecma.Function',
    properties: isFunction,
  }),

  IInt16Array: I.define({
    name: 'ecma.Int16Array',
    properties: (v) => isExactType(Int16Array, v),
  }),

  IInt32Array: I.define({
    name: 'ecma.Int32Array',
    properties: (v) => isExactType(Int32Array, v),
  }),

  IInt8Array: I.define({
    name: 'ecma.Int8Array',
    properties: (v) => isExactType(Int8Array, v),
  }),

  IMap: I.define({
    name: 'ecma.Map',
    properties: (v) => isExactType(Map, v),
  }),

  INull: I.define({
    name: 'ecma.Null',
    properties: (v) => v === null,
  }),

  INumber: I.define({
    name: 'ecma.Number',
    properties: (v) => isExactType(Number, v),
  }),

  IObject: I.define({
    name: 'ecma.Object',
    properties: (v) => isExactType(Object, v),
  }),

  IPromise: I.define({
    name: 'ecma.Promise',
    properties: (v) => isExactType(Promise, v),
  }),

  IProxy: I.define({
    name: 'ecma.Proxy',
    properties: (v) => isExactType(Proxy, v),
  }),

  IRangeError: I.define({
    name: 'ecma.RangeError',
    properties: (v) => isExactType(RangeError, v),
  }),

  IReferenceError: I.define({
    name: 'ecma.ReferenceError',
    properties: (v) => isExactType(ReferenceError, v),
  }),

  IRegExp: I.define({
    name: 'ecma.RegExp',
    properties: (v) => isExactType(RegExp, v),
  }),

  ISet: I.define({
    name: 'ecma.Set',
    properties: (v) => isExactType(Set, v),
  }),

  ISharedArrayBuffer: I.define({
    name: 'ecma.SharedArrayBuffer',
    properties: (v) => isExactType(SharedArrayBuffer, v),
  }),

  IString: I.define({
    name: 'ecma.String',
    properties: (v) => isExactType(String, v),
  }),

  ISymbol: I.define({
    name: 'ecma.Symbol',
    properties: (v) => isExactType(Symbol, v),
  }),

  ISyntaxError: I.define({
    name: 'ecma.SyntaxError',
    properties: (v) => isExactType(SyntaxError, v),
  }),

  ITextDecoder: I.define({
    name: 'ecma.TextDecoder',
    properties: (v) => isExactType(TextDecoder, v),
  }),

  ITextEncoder: I.define({
    name: 'ecma.TextEncoder',
    properties: (v) => isExactType(TextEncoder, v),
  }),

  ITypeError: I.define({
    name: 'ecma.TypeError',
    properties: (v) => isExactType(TypeError, v),
  }),

  IURIError: I.define({
    name: 'ecma.URIError',
    properties: (v) => isExactType(URIError, v),
  }),

  IURL: I.define({
    name: 'ecma.URL',
    properties: (v) => isExactType(URL, v),
  }),

  IURLSearchParams: I.define({
    name: 'ecma.URLSearchParams',
    properties: (v) => isExactType(URLSearchParams, v),
  }),

  IUint16Array: I.define({
    name: 'ecma.Uint16Array',
    properties: (v) => isExactType(Uint16Array, v),
  }),

  IUint32Array: I.define({
    name: 'ecma.Uint32Array',
    properties: (v) => isExactType(Uint32Array, v),
  }),

  IUint8Array: I.define({
    name: 'ecma.Uint8Array',
    properties: (v) => isExactType(Uint8Array, v),
  }),

  IUint8ClampedArray: I.define({
    name: 'ecma.Uint8ClampedArray',
    properties: (v) => isExactType(Uint8ClampedArray, v),
  }),

  IUndefined: I.define({
    name: 'ecma.Undefined',
    properties: (v) => v === undefined,
  }),

  IWeakMap: I.define({
    name: 'ecma.WeakMap',
    properties: (v) => isExactType(WeakMap, v),
  }),

  IWeakRef: I.define({
    name: 'ecma.WeakRef',
    properties: (v) => isExactType(WeakRef, v),
  }),

  IWeakSet: I.define({
    name: 'ecma.WeakSet',
    properties: (v) => isExactType(WeakSet, v),
  }),
}

module.exports = { ecma }
