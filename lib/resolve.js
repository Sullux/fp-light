import { awaitAll, awaitDelay, deepAwait, isAsync, override, trace } from './'

// export const spreadableSymbol = () => Symbol('spreadable')

// export const isSpreadableSymbol = s =>
//   (typeof s === 'symbol') &&
//     (s.toString() === 'Symbol(spreadable)')

/* EXPLANATION
Symbols don't work because Reflect.ownKeys() returns all symbols _after_ keys.
That means the spread operator will override other properties even if the spread
is declared first. That means we have to use a magic string instead of a symbol.
*/

let spreadableCount = 0

export const spreadableSymbol = () => `@@spread:${spreadableCount += 1}`

export const isSpreadableSymbol = s =>
  s && s.startsWith && s.startsWith('@@spread:')

export const isSpreadable = value => {
  try {
    return !!value && Reflect.ownKeys(value).some(isSpreadableSymbol)
  }catch(err){
    return false
  }
}
export const getSpreadable = value =>
  !!value && value[Reflect.ownKeys(value).find(isSpreadableSymbol)]

const distinct = input => Array.from(new Set(input))

const arraySpread = Symbol('arraySpread')

export const arraySpreadFrom = ({ [arraySpread]: fn } = {}) => fn

const primitiveFunctions = {}
let primitiveFunctionCount = 0
const primitiveFunctionSymbol = Symbol('primitiveFunction')

const pushPrimitiveFunction = (fn) => {
  const index = primitiveFunctionCount++
  const prop = fn[primitiveFunctionSymbol] = `${index}:__FP_LIGHT_PROPERTY_FUNCTION__`
  primitiveFunctions[prop] = fn
  return prop
}

export const toPrimitiveFunction = (fn) => fn[primitiveFunctionSymbol]
  ? fn
  : new Proxy(fn, {
    get: (target, prop) => (prop === Symbol.toPrimitive)
      ? () => target[primitiveFunctionSymbol] || pushPrimitiveFunction(target)
      : target[prop],
  })

const targetPropertyIfExists = (target, property) =>
  (typeof property === 'function')
    ? property
    : function targetPropertyIfExists(input) {
      const value = target(input)
      return value && value[property]
    }

const spreadableProxy = {
  get: (target, property) =>
    property === arraySpread
      ? false
    : property === Symbol.iterator
      ? function* () { yield { [arraySpread]: target } }
    : isSpreadableSymbol(property)
      ? target
    : target[property],
  getOwnPropertyDescriptor: (target, property) =>
    isSpreadableSymbol(property)
      ? { value: target, configurable: true, enumerable: true }
      : Object.getOwnPropertyDescriptor(target, property),
  ownKeys: (target) => target[compiledFrom]
    ? distinct([
      ...Reflect.ownKeys(target)
        .filter(key => key !== compiledFrom && key !== '$'),
      spreadableSymbol(),
      Symbol.iterator,
    ])
    : distinct([
      ...Reflect.ownKeys(target),
      spreadableSymbol(),
      Symbol.iterator,
    ]),
}

export const toSpreadable = fn => {
  if (isSpreadable(fn)) {
    return fn
  }
  return new Proxy(fn, spreadableProxy)
}

export { toSpreadable as rest }

const identityProxy = {
  get: (target, property) => {
    if (property === Symbol.toPrimitive) {
      return () =>
        target[primitiveFunctionSymbol] || pushPrimitiveFunction(target)
    }
    const accessor = primitiveFunctions[property]
    if (accessor) {
      return new Proxy(input => target(input)[accessor(input)], identityProxy)
    }
    return (property === arraySpread)
      ? false
    : property === Symbol.iterator
      ? function* () { yield { [arraySpread]: target } }
    : isSpreadableSymbol(property)
      ? target
    : property === '$'
      ? target
    : (property === 'then')
      || (property === 'constructor')
      || (property === 'apply')
      || (property === Symbol.toPrimitive)
      ? target[property]
    : new Proxy(targetPropertyIfExists(target, property), identityProxy)
  },
  getOwnPropertyDescriptor: (target, property) =>
    isSpreadableSymbol(property)
      ? { value: target, configurable: true, enumerable: true }
      : Object.getOwnPropertyDescriptor(target, property),
  ownKeys: (target) =>
    distinct([...Reflect.ownKeys(target), spreadableSymbol(), Symbol.iterator]),
}

const baseSymbol = Symbol('base')
const thisSymbol = Symbol('this')

const canProxy = (input) => {
  const type = typeof input
  return ((type === 'object') || (type === 'function'))
}

export const fromBase = function fromBase(base) {
  return function fromBase(v) {
    if (!canProxy(v)) {
      return v
    }
    return new Proxy(
      v,
      {
        get: (target, property) =>
          property === baseSymbol
            ? base
          : property === thisSymbol
            ? target
          : Reflect.has(target, property)
            ? target[property]
          : base[property],
      }
    )
  }
}

/* #AUTODOC#
module: API
name: identity
aliases: [argument, _]
tags: [Convenience Functions, Spreadable]
description: |
  Given a value, returns that value. This is useful in cases where a resolvable
  object needs to resolve the input into the output. This can also be useful in
  cases where two logical branches must return a function, but where one branch
  exhibits the "no change" logic (i.e. a function that returns the original
  argument).

  Additionally, `identity` proxies the property accessor such that an accessed
  property returns a function that will retrieve that property from the given
  argument. This means that `identity.foo` returns a function shaped like
  `value => value.foo` and `identity[3]` returns a function shaped like
  `value => value[3]`. Note that properties are resolved safely, meaning
  `identity` will never throw on undefined.
examples: |
  This example demonstrates the branch-to-no-change logic. The `log` function
  uses `identity` to pass logged values straight through to `console.log` while
  the `logObject` function uses the JSON serializer.

  ```javascript
  const logWith = serialize =>
    value =>
      console.log(serialize(value))

  // log plain values
  const log = logWith(identity)

  // log serialized values
  const logObject = logWith(JSON.stringify)
  ```

  This example uses the `_` alias and the property accessor to mimic the
  behavior of Scala's underscore operator.

  ```javascript
  const area = multiply(_.x, _.y)

  area({ x: 2, y: 3 }) // 6
  ```

  This example shows how `identity` protects against accessing properties of
  undefined values.

  ```javascript
  const inners = map(_.nums[0])

  inners([
    { nums: [42, 43] },
    {}, // this would throw if accessing literally with v => v.nums[0]
    { nums: [44] },
  ])
  // [42, undefined, 44]
  ```

definition:
  types:
    Any: ~Object
  context:
    value: 42
  specs:
    - signature: value:Any? => Any
      tests:
        - value => value
        - null => null
*/
export const identity = new Proxy(
  function identity (v){ return v },
  identityProxy,
)

export {
  identity as argument,
  identity as _,
}

export const baseIdentity = new Proxy(
  function baseIdentity (v){ return v[baseSymbol] },
  identityProxy,
)

export {
  baseIdentity as baseArgument,
  baseIdentity as _base,
}

export const thisIdentity = new Proxy(
  function thisIdentity (v){ return v[thisSymbol] },
  identityProxy,
)

export {
  thisIdentity as thisArgument,
  thisIdentity as _this,
}

const resolveObject = (predicate) => {
  const entries = Reflect.ownKeys(predicate)
    .map(key => {
      const value = predicate[key]
      return isSpreadableSymbol(key)
        ? [spreadableSymbol, value]
        : [key, resolve(value)]
    })
  return input => {
    const mutate = (target, key, value) => {
      if (value === undefined) {
        delete target[key]
        return target
      }
      if (key === spreadableSymbol) {
        return Object.assign(target, value)
      }
      target[key] = value
      return target
    }
    return entries.reduce(
      (state, [key, resolve]) => {
        const result = resolve(input)
        return (isAsync(result) || isAsync(state))
          ? Promise.all([state, result]).then(([s, r]) => mutate(s, key, r))
          : mutate(state, key, result)
      },
      {},
    )
  }
}

const iterableToArray = (value) => {
  if (Array.isArray(value)) {
    return value
  }
  if (!value || !value[Symbol.iterator]) {
    throw TypeError(`${value} is not iterable`)
  }
  return [...value]
}

const resolveIterable = (predicate) => {
  const resolves = (Array.isArray(predicate) ? predicate : [...predicate])
    .map(c => (c && c[arraySpread]) ? c : resolve(c))
  return input => {
    const result = resolves.reduce(
      (result, c) => {
        const resolveToSpread = c && c[arraySpread]
        const getSpreadValues = () => {
          const values = iterableToArray(resolveToSpread(input))
          return values.some(isAsync)
            ? awaitAll(values)
            : values
        }
        const value = resolveToSpread
          ? getSpreadValues()
          : c(input)
        const mutate = (mutable, added) => {
          if (resolveToSpread) {
            added.map(a => mutable.push(a))
            return mutable
          }
          mutable.push(added)
          return mutable
        }
        return (isAsync(result) || isAsync(value))
          ? Promise.all([result, value]).then(([r, v]) => mutate(r, v))
          : mutate(result, value)
      },
      [],
    )
    return result
  }
}

const isConstant = predicate =>
  (predicate === null) ||
    ['string', 'boolean', 'number', 'undefined'].includes(typeof predicate) ||
    (predicate instanceof Date) ||
    (predicate instanceof RegExp) // todo: special handling of regex?

const resolveProxy = (predicate, resolve) => {
  const overrides = { '$resolve': predicate }
  return new Proxy(resolve, {
    get: (target, prop) =>
      overrides[prop] || target[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      overrides[prop]
        ? Object.getOwnPropertyDescriptor(overrides, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (target, prop) =>
      (prop in overrides) || (prop in target),
    ownKeys: (target) =>
      distinct([...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)]),
    apply: (target, thisArg, args) => {
      const awaited = deepAwait(args)
      return isAsync(awaited)
        ? awaited.then(a => resolve(...a))
        : resolve(...args)
    },
  })
}

export const isResolve = predicate =>
  ((typeof predicate) === 'function') && ('$resolve' in predicate)

/* #AUTODOC#
module: API
name: resolve
tags: [Foundational]
description: |
  The `resolve` function is arguably the most important function in this library.
  It is a curried function that accepts a _resolve predicate_ and an input value. A
  _resolve predicate_ is one of:

  * a function;
  * an object that will be treated as an unordered list of key/value pairs where
    the values are themselves resolvables;
  * an iterable that will be treated as an ordered list of resolvables; or
  * a literal value to pass through;

  Additionally, a resolve predicate can include or return a promise or a value that
  includes promises such as an array of promises or an object with a property
  that is a promise.
examples: |
  ```javascript
  const setOnFoo = resolve({ foo: _ })

  setOnFoo(42) // { foo: 42 }
  setOnFoo()   // { foo: undefined }
  ```

  These examples use a more complex value.

  ```javascript
  const values = [
    { foo: 41 },
    { foo: 42 },
    { foo: 43 },
  ]

  // extract the foo property of each element

  values.map(resolve(_.foo))
  // [41, 42, 43]

  // remap the foo element to bar for each element

  values.map(resolve({ bar: _.foo }))
  // [
  //   { bar: 41 },
  //   { bar: 42 },
  //   { bar: 43 },
  // ]
  ```

  This example includes promises.

  ```javascript
  const values = [41, toAsync(42), 43]

  const incrementedOnFoo = resolve({ foo: x => x + 1 })

  const process = async () =>
    console.log(await values.map(incrementedOnFoo))

  process()
  // [
  //   { foo: 42 },
  //   { foo: 43 },
  //   { foo: 44 },
  // ]
  ```
definition:
  types:
    Any: ~Object
  context:
    value: 42
    stringValue: '42'
    date: { $Date: '2019-10-19' }
    toString:
      $mock: [value => stringValue]
    propertyName: foo
    object:
      foo: { $: value }
    objectWithString:
      foo: bar
    resolvableObject:
      bar: foo
      biz: { $mock: [value => stringValue] }
    transformedObject:
      bar: foo
      biz: { $: stringValue }
    resolvableArray:
      - foo
      - { $mock: [value => stringValue] }
    transformedArray:
      - foo
      - { $: stringValue }
    resolvableComplexObject:
      missing: null
      bool: true
      date: { $: date }
      fn: { $mock: [value => stringValue] }
      string: foo
      array: { $: resolvableArray }
      object: { $lib: _ }
    transformedComplexObject:
      missing: null
      bool: true
      date: { $: date }
      fn: { $: stringValue }
      string: foo
      array: { $: transformedArray }
      object: { $: value }
  specs:
    - signature: resolvable:Null => Any? => Null
      tests:
        - null => => null
        - null => value => null
    - signature: resolvable:Undefined => Any? => Undefined
      tests:
        - => =>
        - => value =>
    - signature: resolvable:Boolean => Any? => Boolean
      tests:
        - true => => true
        - true => value => true
        - false => => false
        - false => value => false
    - signature: resolvable:Date => Any? => Date
      tests:
        - date => => date
        - date => value => date
    - signature: resolvable:Function => Any? => Any?
      tests:
        - toString => value => stringValue
    - signature: resolvable:String => Any? => Any?
      tests:
        - stringValue => value => stringValue
    - signature: resolvable:Array => Any? => Array
      tests:
        - resolvableArray => value => transformedArray
    - signature: resolvable:Object => Any? => Object
      tests:
        - resolvableObject => value => transformedObject
        - resolvableComplexObject => value => transformedComplexObject
*/
export const resolve = (predicate) =>
  resolveProxy(predicate, isConstant(predicate)
    ? () => predicate
    : typeof predicate === 'function'
      ? predicate
      : typeof predicate === 'object'
        ? predicate[Symbol.iterator]
          ? resolveIterable(predicate)
          : resolveObject(predicate)
        : () => predicate)

const shallowResolveProxy = (predicate, resolve) => {
  const overrides = { '$resolve': predicate }
  return new Proxy(resolve, {
    get: (target, prop) =>
      overrides[prop] || target[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      overrides[prop]
        ? Object.getOwnPropertyDescriptor(overrides, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (target, prop) =>
      (prop in overrides) || (prop in target),
    ownKeys: (target) =>
      distinct([...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)]),
    apply: (target, thisArg, args) => {
      const hasAsyncArgs = args.some(isAsync)
      return hasAsyncArgs
        ? Promise.all(args).then(a => resolve(...a))
        // maybe webpack bug? args cannot be passed with spread!
        : resolve(...args)
    },
  })
}

export const shallowResolve = (predicate) =>
  shallowResolveProxy(predicate, isConstant(predicate)
    ? () => predicate
    : typeof predicate === 'function'
      ? predicate
      : typeof predicate === 'object'
        ? predicate[Symbol.iterator]
          ? resolveIterable(predicate)
          : resolveObject(predicate)
        : () => predicate)

export const literal = Symbol('$')

const compiledFrom = Symbol('compiledFrom')

const compiledProxy = (fn) => ({
  get: (target, property) => {
    if (property === Symbol.toPrimitive) {
      return () =>
        target[primitiveFunctionSymbol] || pushPrimitiveFunction(target)
    }
    const accessor = primitiveFunctions[property]
    if (accessor) {
      return new Proxy(input => target(input)[accessor(input)], identityProxy)
    }
    return (property === arraySpread)
      ? false
    : property === Symbol.iterator
      ? function* () { yield { [arraySpread]: target } }
    : isSpreadableSymbol(property)
      ? target
    : property === '$' || property === compiledFrom
      ? fn
    : (fn[property] || new Proxy(
      targetPropertyIfExists(fn, property),
      identityProxy,
    ))
  },
  getOwnPropertyDescriptor: (target, property) =>
    isSpreadableSymbol(property)
      ? { value: target, configurable: true, enumerable: true }
      : Object.getOwnPropertyDescriptor(target, property),
  ownKeys: (target) =>
    distinct([...Reflect.ownKeys(target), spreadableSymbol(), Symbol.iterator]),
})

const compiledLiteral = (fn, arg) => {
  const apply = (target, thisArg, args) => {
    const resolved = awaitArray(args)
    if (isAsync(resolved)) {
      return resolved.then(resolvedArgs =>
        fn.apply(args[0], [arg, ...resolvedArgs]))
    }
    return fn.apply(args[0], [arg, ...args])
  }
  return new Proxy(fn, {
    ...compiledProxy((...args) => apply(fn, undefined, args)),
    apply,
  })
}

const compiledWithPasshrough = (fn, passthroughArgs, resolver) => {
  const apply = (target, thisArg, [arg]) => {
    const resolved = resolver(arg)
    if (isAsync(resolved)) {
      return resolved.then(resolvedArgs =>
        fn.apply(arg, [...passthroughArgs, ...resolvedArgs]))
    }
    return fn.apply(arg, [...passthroughArgs, ...resolved])
  }
  return new Proxy(fn, {
    ...compiledProxy((...args) => apply(fn, undefined, args)),
    apply,
  })
}

const compiled = (fn, resolver) => {
  const apply = (target, thisArg, [arg]) => {
    const resolved = resolver(arg)
    if (isAsync(resolved)) {
      return resolved.then(resolvedArgs =>
        fn.apply(arg, resolvedArgs))
    }
    return fn.apply(arg, resolved)
  }
  return new Proxy(fn, {
    ...compiledProxy((...args) => apply(fn, undefined, args)),
    apply,
  })
}

export const compilable = (fn, { count, skip = 0 } = {}) =>
  toSpreadable(trace(override({
    properties: { '$': fn, [compiledFrom]: fn },
    apply: (target, thisArg, args) => {
      if (args.length === 0) {
        return toSpreadable(fn)
      }
      const argsCount = count || fn.length
      if (args.length === (argsCount - 1)) {
        return compiledLiteral(fn, args[0])
      }
      if (skip === 0) {
        return compiled(fn, resolve(args))
      }
      return compiledWithPasshrough(
        fn,
        args.slice(0, skip),
        resolve(args.slice(skip)),
      )
    },
  })(fn)))

export const isCompiled = fn =>
  ((typeof fn) === 'function') && ((typeof fn[compiledFrom]) === 'function')
