const isCapital = (c) => c && (c <= 'Z') && (c >= 'A')
const functionName = (fn) => fn?.name || '(anonymous)'
const isFunction = (fn) =>
  (fn instanceof Function) || (typeof fn === 'function')

const nonThennable = Symbol.for('fp.helpers.nonThennable')

const isThennable = (value) =>
  (value instanceof Promise) ||
    (isFunction(value?.then) && (!value?.[nonThennable]))

const unwrapped = (string) => string.split('\n')
  .map((s) => s.trim())
  .join(' ')

const is = (x, y) => (x === y) ||
  (isNaN(x) && isNaN(y)) ||
  ((x instanceof Date) && (y instanceof Date) && (x.getTime() === y.getTime()))

const objectsEqual = (x, y) => {
  const keys = Reflect.ownKeys(x).sort()
  return deepEqual(keys, Reflect.ownKeys(y).sort()) &&
    keys.every((key) => equal(x[key], y[key]))
}

const deepEqual = (x, y) => Array.isArray(x)
  ? (x.length === y.length) && x.every((v, i) => equal(v, y[i]))
  : x[Symbol.iterator]
    ? deepEqual([...x], [...y])
    : objectsEqual(x, y)

const equal = (x, y) => is(x, y) ||
  ((x?.constructor === y?.constructor) && deepEqual(x, y))

const isString = (x) => (typeof x === 'string') || (x instanceof String)

module.exports = {
  isCapital,
  functionName,
  isFunction,
  isThennable,
  unwrapped,
  is,
  equal,
  isString,
}
