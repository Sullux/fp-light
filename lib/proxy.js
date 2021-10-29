import { curry } from '.'
import { inspect } from 'util'

/* #AUTODOC#
module: API
name: proxy
tags: [Foundational, Composition]
ts: |
  type ProxyTarget = object | function
  type ProxyDefinition = {
    get: (target: ProxyTarget, prop: string) => any,
    getOwnPropertyDescriptor: (target: ProxyTarget, prop: string) => object,
    getPrototypeOf: () => function,
    has: (target: ProxyTarget, prop: string): boolean,
    ownKeys: (target: ProxyTarget) => string[],
  }
  declare function proxy<T>(definition: ProxyDefinition, target: T): T
description: |
  A curried implementation of proxy creation. See the ECMA [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
  documentation for details.
specs:
  - !spec
    name: proxy
    fn: !js proxy
    tests:
      - name: should proxy the given target
        input:
          - !js |
              { get: (t, p) => p === 'foo' ? 42 : t[p] }
          - { foo: 'bar' }
        output: { foo: 42 }
*/
export const proxy = curry(function proxy (definition, target) {
  return new Proxy(target, definition)
})

const distinct = input => ([...(new Set(input))])

const merged = (target, properties) => {
  const merged = {}
  Object.entries(Object.getOwnPropertyDescriptors(target))
    .filter(([key]) => !properties[key])
    .forEach(([key, value]) => Object.defineProperty(merged, key, value))
  Object.entries(Object.getOwnPropertyDescriptors(properties))
    .forEach(([key, value]) => Object.defineProperty(merged, key, value))
  if (Object.isFrozen(target)) {
    return Object.freeze(merged)
  }
  if (!Object.isExtensible(target)) {
    return Object.preventExtensions(merged)
  }
  return Object.seal(merged)
}

/* #AUTODOC#
module: API
name: override
tags: [Foundational, Composition]
ts: |
  function override<T, P>({ properties: P }): (T) => T extends P
  function override<T, P, A extends function>({
    properties: P,
    apply: A,
  }): (T) => T extends A, P
  declare function override<T, P, A extends function, F extends object>({
    properties: P,
    apply: A,
    prototype: F,
  }): (T) => T extends A, P
description: |
  A helper to simplify the process of overriding properties and function call
  behavior. See the ECMA [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
  documentation for details.

  Note that in the case of frozen, sealed or inextensible objects, the return
  value is _not_ a proxy. Javascript goes to great lengths to ensure that
  proxying such objects fails. If the target is sealed, the return object is a
  manual merge of the target with the given properties.
examples: |
  Add a property to a frozen object.

  ```javascript
  const obj = Object.freeze({ foo: 'bar' })
  const addBiz = override({ biz: 'baz' })
  const bizObj = addBiz(obj)
  console.log(bizObj)
  // { foo: 'bar', biz: 'baz' }
  ```

  Add a property to an array.

  ```javascript
  const array = [1, 2, 3]
  const withSum = override(
    { properties: { sum: array.reduce((s, v) => s + v, 0) } },
    array,
  )
  console.log(withSum)
  // [ 1, 2, 3 ]
  console.log(withSum.sum)
  // 6
  ```

  Override a function.

  ```javascript
  const fn = n => n * 2
  console.log(fn(21))
  // 42
  const overridden = override(
    { apply: (target, thisArg, args) => target(args[0] + 1) },
    fn,
  )
  console.log(overridden(20))
  // 42
  ```
specs:
  - !spec
    name: override
    fn: !js override
    tests:
      - name: should override and add properties
        input: [{ properties: { x: 40, y: 2 } }, { x: 20 }]
        output: { x: 40, y: 2 }
#      - name: should override a frozen object
#        input:
#          - { properties: { x: 40, y: 2 } }
#          - !js |
#              Object.freeze({ x: 20 })
#        output: { x: 40, y: 2 }
#      - name: should override function invocation
#        input:
#          - !js |
#              { apply: (target, thisArg, args) => target(args[0] * 2) }
#          - !js |
#              v => v + 2
#        output: !js |
#          v => v(20) === 42
*/
export const override = curry(({ properties = {}, apply, prototype }, target) => {
  // todo: come up with a way more elegant solution to this problem
  if (Object.isSealed(target)) {
    return merged(target, properties)
  }
  const valueOrBoundFunction = (value, prop) =>
    (typeof value === 'function') && (prop !== 'constructor')
      ? value.bind(apply || target)
      : value
  const overriddenKeys = Reflect.ownKeys(properties)
  const definition = {
    get: (t, prop) => overriddenKeys.includes(prop)
      ? valueOrBoundFunction(properties[prop], prop)
      : valueOrBoundFunction(target[prop], prop),
    getOwnPropertyDescriptor: (t, prop) =>
      overriddenKeys.includes(prop)
        ? Object.getOwnPropertyDescriptor(properties, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (t, prop) =>  overriddenKeys.includes(prop) || (prop in target),
    ownKeys: (t) => distinct([
      ...Reflect.ownKeys(target),
      ...overriddenKeys,
    ]),
    ...(apply ? { apply } : {}),
    ...(prototype ? { getPrototypeOf: () => prototype } : {} ),
  }
  return new Proxy(target, definition)
})
