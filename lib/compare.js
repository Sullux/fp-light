const { typeName } = require('./common')
const { pipe } = require('./pipe')

// copied here to prevent circular reference
const curry = (fn, arity) =>
  (arity > -1
    ? (...args) =>
      (args.length >= arity
        ? fn(...args)
        : curry(fn.bind(null, ...args), arity - 1))
    : curry(fn, fn.length))

const compareBooleans = curry((lvalue, rvalue) =>
  (lvalue === true ? 1 : 0) - (rvalue === true ? 1 : 0))

const compareNumbers = curry((lvalue, rvalue) =>
  lvalue - rvalue)

const compareDates = curry((lvalue, rvalue) =>
  lvalue.getTime() - rvalue.getTime())

const compareStrings = lvalue => rvalue =>
  (lvalue < rvalue
    ? -1
    : lvalue > rvalue
      ? 1
      : 0)

const compareArrays = curry((compare, lvalue, rvalue) =>
  lvalue
    .map((v, i) => compare(v, rvalue[i]))
    .find(v => v !== 0)
    || compareNumbers(lvalue.length, rvalue.length))

const compareObjects = curry((compare, lvalue, rvalue) =>
  pipe(
    () => obj => Object.keys(obj)
      .filter(k => obj[k] !== undefined)
      .sort(),
    significantKeys =>
      ({ significantKeys, lkeys: significantKeys(lvalue) }),
    ({ significantKeys, lkeys }) =>
      lkeys
        .map(key => compare(lvalue[key], rvalue[key]))
        .find(v => v !== 0)
    || compare(lkeys, significantKeys(rvalue))
  ))()

const typePrecedence = Object.freeze([
  'undefined',
  'null',
  'boolean',
  'number',
  'date',
  'string',
  'array',
  'object'
])

const compareTypeNames = curry((lvalue, rvalue) =>
  typePrecedence.indexOf(lvalue) - typePrecedence.indexOf(rvalue))

const compareTypes = curry((lvalue, rvalue) =>
  compareTypeNames(typeName(lvalue), typeName(rvalue)))

const compare = curry((lvalue, rvalue) =>
  (lvalue === rvalue
    ? 0
    : (ltype, rtype) =>
      (compareTypeNames(ltype, rtype)
      || ltype === 'boolean'
        ? compareBooleans(lvalue, rvalue)
        : ltype === 'number'
          ? compareNumbers(lvalue, rvalue)
          : ltype === 'date'
            ? compareDates(lvalue, rvalue)
            : ltype === 'string'
              ? compareStrings(lvalue, rvalue)
              : ltype === 'array'
                ? compareArrays(compare, lvalue, rvalue)
                : compareObjects(compare, lvalue, rvalue))))

const is = curry((lvalue, rvalue) =>
  compare(lvalue, rvalue) === 0)

module.exports = {
  compareBooleans,
  compareNumbers,
  compareDates,
  compareStrings,
  compareArrays: compareArrays(compare),
  compareObjects: compareObjects(compare),
  typePrecedence,
  compareTypeNames,
  compareTypes,
  compare,
  is,
}
