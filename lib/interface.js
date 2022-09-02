import { Undefined, Null } from './compare'

const typeSymbol = Symbol('Type')
const finalTypeSymbol = Symbol('FinalType')
const valueSymbol = Symbol('Value')
const argsSymbol = Symbol('Args')
const returnSymbol = Symbol('Return')
const functionSymbol = Symbol('Function')

export const isTyped = ({ [typeSymbol]: type }) => !!type
export const finalTypeOf = ({ [finalTypeSymbol]: finalType }) => finalType
export const valueOf = ({ [valueSymbol]: value }) => value
export const functionOf = ({ [functionSymbol]: fn }) => fn
export const argsOf = ({ [argsSymbol]: args }) => args
export const returnOf = ({ [returnSymbol]: ret }) => ret

export const typed = (value, type) => {
  // todo
}

export const Js = {
  Undefined,
  Null,
  String,
  Function: {}, // todo
}

export const typeOf = (value) =>
  value === undefined
    ? Undefined
  : value === null
    ? Null
  : value[typeSymbol] || value.constructor

export const Define = (constructor, spec) => {
  // todo: adds type info to prototype of existing constructor
}

const As = (type) =>
  (value) => typed(value, type)

const Resolve = () => {} // todo

export const Type = (spec) =>
  spec === undefined
    ? js.Undefined
  : spec === null
    ? js.Null
  : spec === String
    ? js.String
  : Array.isArray(spec)


export const isCompatible = (type, value) => {
  // todo
}

export const Str = type('foo')
