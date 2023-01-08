/* eslint no-prototype-builtins: 0 */
const { assert } = require('./assert')

const parentScope = Symbol.for('fp.scope.parent')

const arrayContext = (array = []) => {
  const parentContext = (array instanceof ScopeContext)
    ? array
    : [...array].reverse()
  return new Proxy([], {
    defineProperty: (target, key, descriptor) =>
      assert(
        !(key in target),
        `property "${key}" is already defined`,
      ) && Reflect.defineProperty(target, key, descriptor),
    deleteProperty: () =>
      assert.fail('cannot delete properties on a scope context'),
    get: (target, prop) =>
      prop === parentScope
        ? parentContext
        : prop === Symbol.iterator
          ? function * () {
              for (let i = (target.length - 1); i > -1; i--) {
                yield target[i]
              }
              for (const v of parentContext) { yield v }
            }
          : prop === 'length'
            ? target.length + parentContext.length
            : prop === 'push'
              ? (...args) => target.push(...args)
              : undefined,
    preventExtensions: () => true,
    set: (target, prop, value) =>
      assert.fail('setting array properties is not supported'),
  })
}

function mapContext (parentContext = new Map()) {
  // todo
}

function ScopeContext (parentContext = globalThis) {
  if (Array.isArray(parentContext)) {
    return arrayContext(parentContext)
  }
  if (parentContext instanceof Map) {
    return mapContext(parentContext)
  }
  return new Proxy({ [parentScope]: parentContext }, {
    defineProperty: (target, key, descriptor) =>
      assert(
        !(key in target),
        `property "${key && key.toString()}" is already defined`,
      ) && Reflect.defineProperty(target, key, descriptor),
    deleteProperty: () =>
      assert.fail('cannot delete properties on a scope context'),
    get: (target, prop) => {
      if (prop in target) {
        return target[prop]
      }
      const result = parentContext[prop]
      if (result instanceof ScopeContext) {
        return (target[prop] = ScopeContext(result))
      }
      return result
    },
    has: (target, prop) =>
      Reflect.has(target, prop) || Reflect.has(parentContext, prop),
    preventExtensions: () => true,
    set: (target, prop, value) => {
      assert(
        !(prop in target),
        `property "${prop && prop.toString()}" is already defined`,
      )
      return (target[prop] = value)
    },
  })
}
Object.defineProperty(ScopeContext, Symbol.hasInstance, {
  value: (v) => !!v?.[parentScope],
})

function Scope (parent) {
  const context = ScopeContext(parent?.context)
  const scope = {
    parent,
    context,
    enter: () => (Scope.current = Scope(scope)),
    leave: () => (parent && (Scope.current = parent)) || scope,
  }
  return Object.freeze(scope)
}
Scope.current = Scope()

module.exports = { Scope, ScopeContext, parentScope }
