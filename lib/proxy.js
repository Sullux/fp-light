import { curry } from './'

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
Description: |
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
Description: |
  A helper to simplify the process of overriding properties and function call
  behavior. See the ECMA [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
  documentation for details.
*/
export const override = ({ properties = {}, apply, prototype }) =>
  proxy({
    get: (target, prop) =>
      prop in properties ? properties[prop] : target[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      prop in properties
        ? Object.getOwnPropertyDescriptor(properties, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (target, prop) =>
      (prop in properties) || (prop in target),
    ownKeys: (target) =>
      distinct([...Reflect.ownKeys(target), ...Reflect.ownKeys(properties)]),
    ...(apply ? { apply } : {}),
    ...(prototype ? { getPrototypeOf: () => prototype } : {} ),
  })
