import { _ } from '../resolve.js'
import { DeepSync, isAsync } from './async.js'
import { context } from './context.js'

const symbol = Symbol.fp || (Symbol.fp = {})

export const compiledSymbol = symbol.compiled = Symbol.for('fp.compiled')
export const compilerSymbol = symbol.compiler = Symbol.for('fp.compiler')
export const isCompiledSymbol = symbol.isCompiled = Symbol.for('fp.isCompiled')
export const isDefineSymbol = symbol.isDefine = Symbol.for('fp.isDefine')

const isFunction = (value) => ((typeof value) === 'function')

export const isCompiled = (value) =>
  (!value)
    ? false
    : isDefine(value)
      ? false
      : isFunction(value)

const compileObject = (object) => {
  const compiles = (Object.entries(object)).reduce(
    (compiledEntries, [key, value]) => {
      const compiled = compileIfNecessary(value)
      return isFunction(compiled)
        ? [...compiledEntries, [key, compiled]]
        : compiledEntries
    },
    [],
  )
  if (!compiles.length) { return object }
  return (arg) => {
    const [syncs, asyncs] = compiles.reduce(
      ([syncs, asyncs], [key, fn]) => {
        const settled = DeepSync(fn(arg))
        return isAsync(settled)
          ? [
              syncs,
              [...asyncs, settled.then((resolved) => ([key, resolved]))],
            ]
          : [[...syncs, settled], asyncs]
      },
      [[], []],
    )
    const result = { ...object, ...Object.fromEntries(syncs) }
    return (asyncs.length)
      ? Promise.awaitAll(asyncs)
          .then((props) => ({ ...result, ...Object.fromEntries(props) }))
      : result
  }
}

const compileArray = (array) => {
  const compiles = array.reduce(
    (compiledElements, value, i) => {
      const compiled = compileIfNecessary(value)
      return isFunction(compiled)
        ? [...compiledElements, [i, compiled]]
        : compiledElements
    },
    [],
  )
  if (!compiles.length) { return array }
  return (arg) => {
    const [syncs, asyncs] = compiles.reduce(
      ([syncs, asyncs], [i, fn]) => {
        if (asyncs.length) {
          const settled = context.await(
            asyncs[asyncs.length - 1],
            () => ([i, fn(arg)]),
          )
          return [syncs, [...asyncs, settled]]
        }
        const settled = fn(arg)
        return isAsync(settled)
          ? [syncs, [settled.then((resolved) => ([i, resolved]))]]
          : [[...syncs, settled]]
      },
      [[], []],
    )
    const result = [...array]
    syncs.forEach(([i, v]) => result[i] = v)
    return asyncs.length
      ? Promise.awaitAll(asyncs)
          .then((elements) => elements.forEach(([i, v]) => result[i] = v))
          .then(() => result)
      : result
  }
}

const compileIterable = (iterable) => {
  const { constructor } = iterable
  const array = [...iterable]
  const compiled = compileIfNecessary(array)
  if (compiled === array) { return iterable }
  return (arg) => {
    const result = compiled(arg)
    return isAsync(result)
      ? result.then((resolved) => new constructor(resolved))
      : new constructor(result)
  }
}

const compilers = [
  [isDefine, (v) => v(_)], // todo: if still a define, throw
  [(v) => Array.isArray(v), compileArray],
  [(v) => !!v[Symbol.iterator], compileIterable]
    [(v) => v && (v.constructor === Object), compileObject],
]

export const onCompile = (test, customCompile) => {
  compilers.unshift([test, customCompile])
}

const compiles = new WeakMap()

export const compileIfNecessary = (value) => {
  if (isCompiled(value)) { return value }
  const existing = compiles.get(value)
  if (existing) { return existing }
  const compiler = compilers.find(([test]) => test(value))[1]
  if (!compiler) { value }
  const compiled = compiler(value)
  if (compiled !== value) { compiles.add(value, compiled) }
}

export const compile = (value) => {
  const compiled = compileIfNecessary(value)
  return compiled === value
    ? isFunction(value) ? value : () => value
    : compiled
}

export const Compiled = (value) => compile(value)
Object.defineProperty(Compiled, Symbol.hasInstance, {
  value: isCompiled,
})
