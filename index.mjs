import { fail } from 'assert';
import { inspect } from 'util';
import { isAsync as isAsync$1, curry as curry$1, awaitAll as awaitAll$1, deepAwait as deepAwait$1, awaitArray as awaitArray$1, trace as trace$1, override as override$1, is as is$1, compilable as compilable$1, resolve as resolve$1, isIterable as isIterable$1, includes as includes$1, toSpreadable as toSpreadable$1, awaitDelay as awaitDelay$1, toArray as toArray$1, fromBase as fromBase$1, defineError as defineError$1, isMissing as isMissing$1, appendedName as appendedName$1, isFunction as isFunction$1, isNumber as isNumber$1, isSymbol as isSymbol$1, isObject as isObject$1, getSpreadable as getSpreadable$1, isSpreadableSymbol as isSpreadableSymbol$1, isArray as isArray$1, arraySpreadFrom as arraySpreadFrom$1, trap as trap$1, equal as equal$1, functionName as functionName$1, rest } from '.';

/* eslint-disable no-restricted-syntax */
const syncMap = function* (mapper, iterable) {
  for (const v of iterable) {
    yield mapper(v);
  }
};

/* #AUTODOC#
module: API
name: toAsync
aliases: [toPromise, toThennable]
tags: [Async, Foundational]
ts: |
  declare function toAsync<T>(value: T): Promise<T>
  declare function toPromise<T>(value: T): Promise<T>
  declare function toThennable<T>(value: T): Promise<T>
description: |
  Given a value that may or may not be thennable, returns a thennable.
examples: |
  ```javascript
  const asyncValue = Promise.resolve(42)
  const value = 42
  toAsync(asyncValue).then(console.log) // 42
  toAsync(value).then(console.log) // 42
  isThennable(toAsync(value)) // true
  ```
specs:
  - !spec
    name: toAsync
    fn: !js toAsync
    tests:
      - input: [42]
        output: !js Promise.resolve(42)
*/
const toAsync = value =>
  isAsync(value)
    ? value
    : Promise.resolve(value);

/* #AUTODOC#
module: API
name: isAsync
aliases: [isPromise, isThennable]
tags: [Async, Foundational]
ts: |
  declare function isAsync(value: any): boolean
  declare function isPromise(value: any): boolean
  declare function isThennable(value: any): boolean
description: |
  Given any value, returns true if the value is thennable; otherwise, returns
  false.
examples: |
  ```javascript
  const asyncValue = Promise.resolve(42)
  const value = 42
  isAsync(value) // false
  isAsync(asyncValue) // true
  ```
specs:
  - !spec
    name: isAsync
    fn: !js isAsync
    tests:
      - input: [42]
        output: false
      - input: [!js Promise.resolve(42)]
        output: true
*/
const isAsync = value =>
  // !!(value && value.then && (typeof value.then === 'function'))
  !!value && value.constructor === Promise;

/* #AUTODOC#
module: API
name: reject
tags: [Async, Foundational]
ts: |
  declare function reject<T>(value: T): Promise<T>
description: |
  Given an error, returns a rejected promise for the error.
examples: |
  ```javascript
  const error = new Error('reasons')
  const rejection = reject(error)
  rejection.catch(caught => caught === error) // true
  ```
specs:
  - !spec
    name: reject
    fn: !js (input) => reject(input).catch(output => output === input)
    tests:
      - input: [42]
        output: !js toAsync(true)
*/
const reject = value =>
  Promise.reject(value);

/* #AUTODOC#
module: API
name: awaitAll
tags: [Async, Foundational]
ts: |
  declare function awaitAll(value: Iterable<any>): Promise<any[]>
description: |
  Given an iterable, waits for all promises to resolve and then resolves to an
  array of the resolved values in original input order.
examples: |
  ```javascript
  const first = Promise.resolve(41)
  const second = 42
  const third = Promise.resolve(43)
  awaitAll([first, second, third]) // [41, 42, 43]
  ```
specs:
  - !spec
    name: awaitAll
    fn: !js awaitAll
    tests:
      - input:
          - - 42
            - 42
        output: !js toAsync([42, 42])
      - input:
          - - 42
            - !js Promise.resolve(42)
        output: !js toAsync([42, 42])
      - input:
          - - !js toAsync(42)
            - !js Promise.resolve(42)
        output: !js toAsync([42, 42])
      - input: []
        output: !js toAsync()
*/
const awaitAll = promises =>
  promises
    ? Promise.all(syncMap(toAsync, promises))
    : Promise.resolve();

const syncSymbol = Symbol('sync');

const sync = (input) =>
  (input && (Array.isArray(input) || input.constructor === Object))
    ? Object.defineProperty(input, syncSymbol, { value: true })
    : input;

const isSync = (input) =>
  isAsync(input)
    ? false
  : (input && (typeof input === 'object'))
    ? input[syncSymbol]
  : true;

/* #AUTODOC#
module: API
name: awaitArray
tags: [Async, Foundational]
ts: |
  declare function awaitArray(value: Iterable<any>): any[] | Promise<any[]>
description: |
  Given an iterable, deep awaits each value and then resolves to an array or
  promise-to-array of the resolved values in original input order.
  ```
specs:
  - !spec
    name: awaitArray
    fn: !js awaitArray
    tests:
      - name: should return sync output on sync input
        input: [[42, 42]]
        output: [42, 42]
      - name: should return resolved async array on partially async input
        input: [[42, !js toAsync(42)]]
        output: !js toAsync([42, 42])
      - name: >
          should return resolved async array on nested object with async
          property
        input: [[42, { foo: !js toAsync(42) }]]
        output: !js |
          toAsync([42, { foo: 42 }])
*/
const awaitAsyncArray = async (array, offset, firstAsync) => {
  let result = array.slice(0, offset);
  result.push(await firstAsync);
  for(let i = offset + 1, length = array.length; i < length; i++) {
    result.push(await deepAwait(array[i]));
  }
  return result
};

const awaitArray = (value) => {
  for(let i = 0, length = value.length; i < length; i++) {
    const maybeAsync = deepAwait(value[i]);
    if (isAsync(maybeAsync)) {
      return awaitAsyncArray(value, i, maybeAsync)
    }
  }
  return value
};

const awaitArray_OLD = value =>
  value.reduce(
    (state, item) => {
      const result = deepAwait(item);
      return isAsync(state)
        ? Promise.all([state, result]).then(([s, i]) => ([...s, i]))
      : isAsync(result)
        ? result.then(i => ([...state, i]))
        : sync([...state, result])
    },
    [],
  );

/* #AUTODOC#
module: API
name: awaitObject
tags: [Async, Foundational]
ts: |
  declare function awaitObject(value: object): object | Promise<object>
description: |
  Given an object, deep awaits each value and then resolves to an object or
  promise-to-object with each async value resolved to a synchronous value.
  ```
specs:
  - !spec
    name: awaitObject
    fn: !js awaitObject
    tests:
      - name: should return resolved async object on partially async input
        input: [{ foo: 42, bar: !js toAsync(42) }]
        output: !js |
          toAsync({ foo: 42, bar: 42 })
      - name: >
          should return resolved async object on nested array with async
          property
        input:
          - foo: 42
            bar:
              - !js toAsync(42)
              - !js toAsync(42)
        output: !js |
          toAsync({ foo: 42, bar: [42, 42] })
*/
const awaitObject = value => {
  // todo: use a map to protect against recursion
  const pairs = Object.entries(value).reduce(
    (state, [key, item]) => {
      const result = deepAwait(item);
      return isAsync(state)
        ? Promise.all([state, result]).then(([s, i]) => ([...s, [key, i]]))
      : isAsync(result)
        ? result.then(i => ([...state, [key, i]]))
        : [...state, [key, result]]
    },
    [],
  );
  const toObject = input =>
    input.reduce(
      (state, [key, item]) => {
        state[key] = item;
        return state
      },
      {},
    );
  return isAsync(pairs)
    ? pairs.then(toObject)
    : sync(value)
};

/* #AUTODOC#
module: API
name: deepAwait
tags: [Async, Foundational]
ts: |
  declare function deepAwait(value: any): any | Promise<any>
description: |
  Given any value, awaits and/or deep awaits using the {{#awaitArray}} and
  {{#awaitObject}} functions and then resolves to the synchronous or
  asynchronous result.
  ```
specs:
  - !spec
    name: deepAwait
    fn: !js deepAwait
    tests:
      - name: should return falsy values
        input: [0]
        output: 0
      - name: should deep await an array
        input:
          - !js |
              [42, toAsync(42)]
        output: !js toAsync([42, 42])
      - name: should deep await an object
        input:
          - !js |
              { foo: 42, bar: toAsync(42) }
        output: !js |
          toAsync({ foo: 42, bar: 42 })
      - name: should return simple types
        input: ['foo']
        output: 'foo'
*/
const deepAwait = value =>
  isSync(value)
    ? value
  : isAsync(value)
    ? value.then(deepAwait)
  : Array.isArray(value)
    ? awaitArray(value)
  : value.constructor === Object
    ? awaitObject(value)
  : value;

/* #AUTODOC#
module: API
name: awaitAny
aliases: [race]
tags: [Async, Foundational]
ts: |
  declare function awaitAny(promises: Iterable<any>): Promise<any>
description: |
  Given an iterable, waits for the first promise from that iterable to resolve.
examples: |
  ```javascript
  const first = awaitDelay(10).then(() => 41)
  const second = 42
  const third = Promise.resolve(43)
  awaitAny([first, second, third]) // 42
  ```
specs:
  - !spec
    name: awaitAny
    fn: !js awaitAny
    tests:
      - name: should return the first completed
        input:
          - - !js awaitDelay(10).then(() => 43)
            - 42
        output: !js toAsync(42)
*/
const awaitAny = promises =>
  Promise.race(syncMap(toAsync, promises));

/* #AUTODOC#
module: API
name: awaitDelay
tags: [Async, Foundational]
ts: |
  declare function awaitDelay(ms: number) => Promise<void>
description: |
  Given a number of milliseconds, resolves after the milliseconds have elapsed.
examples: |
  ```javascript
  const first = awaitDelay(10).then(() => 41)
  const second = Promise.resolve(42)
  awaitAny([first, second]) // 42
  awaitAll([first, second]) // [41, 42]
  ```
specs:
  - !spec
    name: awaitDelay
    fn: !js |
      () => Promise.race([awaitDelay(10).then(() => 43), toAsync(42)])
    tests:
      - name: should return the first completed
        output: !js toAsync(42)
*/
const awaitDelay = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

const { custom } = inspect;

const isTracedError = Symbol('isTracedError');

const distinct$3 = input => ([...(new Set(input))]);

const overrideProxy = (value, overrides) =>
  new Proxy(value, {
    get: (target, prop) =>
      overrides[prop] || target[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      overrides[prop]
        ? Object.getOwnPropertyDescriptor(overrides, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (target, prop) =>
      (prop in overrides) || (prop in target),
    ownKeys: (target) =>
      distinct$3([...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)]),
  });

/* #AUTODOC#
module: API
name: functionName
tags: [Foundational]
ts: |
  declare functionName(fn: function): string
description: |
  Given a function, returns a human-readable name. This is either the name
  property of the function or the first line of its `toString()` value limited
  to a maximum of 12 characters.
specs:
  - !spec
    name: functionName
    fn: !js functionName
    tests:
      - name: should return the name property
        input:
          - !js |
              function foo () {}
        output: foo
      - name: should return the first 12 characters when no name property
        input:
          - !js |
              () => console.log('foo')
        output: () => consol...
*/
const functionName = (fn) => {
  const { name } = fn;
  if (name) {
    return name
  }
  const firstLine = (fn.toString() || inspect(fn)).split('\n')[0];
  return firstLine.length > 12
    ? `${firstLine.substring(0, 12)}...`
    : firstLine
};

const stack = [{
  name: 'APP_START',
  thisArg: process.argv,
  args: process.env,
  time: Date.now(),
}];

const push = frame => {
  const stackFrame = {
    time: Date.now(),
    ...frame, // allow restoring the previous and time properties
  };
  stack.push(stackFrame);
  return stackFrame
};

const pop = () =>
  stack.pop();

const traceAsync = (result, frame) => {
  const overrides = {
    then: (onFulfilled, onRejected) =>
      result.then(
        onFulfilled && traceFromFrame(onFulfilled, frame),
        onRejected && traceFromFrame(onRejected, frame),
      ),
    catch: (onRejected) =>
      result.then(traceFromFrame(onRejected, frame)),
    finally: (onFinally) =>
      result.finally(traceFromFrame(onFinally, frame)),
  };
  return overrideProxy(result, overrides)
};

const errorFrame = err => ({
  time: Date.now(),
  name: err.code || '<ERR_MISSING_CODE>',
  args: [{
    message: err.message,
    ...(Reflect.ownKeys(err)
      .reduce(
        (result, key) => {
          result[key] = err[key];
          return result
        },
        {},
      )),
  }],
});

const callStack = (frame, err) => {
  const result = [frame];
  let nextFrame = frame;
  while(nextFrame = nextFrame.previous) {
    result.push(nextFrame);
  }
  return [
    errorFrame(err),
    ...result.slice(0, result.length - 1)
      .map(({ previous, ...rest }) => ({ ...rest })),
  ]
};

const inspectCalls = (calls, depth, options) =>
  calls
    .map(({ name, file, line, column, thisArg, args, time }) =>
      inspect({
        ...(file ? { '@': `${file}:${line}:${column}` } : {}),
        time,
        name,
        ...(thisArg ? { this: thisArg } : {}),
        args,
      }, depth, options))
    .map(entry => entry.split('\n').map(line => `    ${line}`).join('\n'))
    .map((entry) => `    -----------\n${entry}`)
    .join('\n');

const irrelevantPartialMatches = [
  '(internal/',
  '/node_modules/',
  'internal/main',
  __filename,
  '(<anonymous>)',
];

const relevantLineFilter = line =>
  !irrelevantPartialMatches.some(str => line.includes(str));

const relevantStack = err =>
  err.stack
    .split('\n')
    .filter(relevantLineFilter)
    .join('\n');

const errorProxy = frame => {
  return err => {
    const traceStack = callStack(frame, err);
    const [stackHeader, ...stackLines] = relevantStack(err).split('\n');
    const stack = [
      stackHeader,
      ...traceStack.slice(1).map(({ fn, name, file, line, column }) =>
        `    from ${name} (${file}:${line}:${column})`),
      ...stackLines,
    ].join('\n');
    const overrides = {
      trace: traceStack,
      [custom]: (depth, options) =>
        `${stack}\n  == TRACE ==\n${inspectCalls(traceStack, depth, options)}`,
      stack,
      [isTracedError]: true,
    };
    throw overrideProxy(err, overrides)
  }
};

// const mozillaLineAndColumn = (text) => {
//   const matches = /(.*)@(.*):([0-9]+):([0-9]+)/.exec(text)
//   if (!matches) {
//     return null
//   }
//   const [fn, file, line, column] = matches.slice(1, 5)
//   return {
//     fn,
//     file,
//     line: Number(line),
//     column: Number(column),
//   }
// }

const nodeLineAndColumn = (text) => {
  const matches = /at ([a-zA-Z0-9_$<>.]+) \((.*):([0-9]+):([0-9]+)\)/.exec(text);
  if (!matches) {
    return null
  }
  const [file, line, column] = matches.slice(2, 5);
  return {
    file,
    line: Number(line),
    column: Number(column),
  }
};

const currentLineAndColumn = () => {
  const err = new Error('-');
  const line = (err.stack
    .split('\n')
    .slice(1)
    .filter(relevantLineFilter)[0] || '').trim();
  const result = nodeLineAndColumn(line);
  return result || {}
};

/* #AUTODOC#
module: API
name: named
tags: [Foundational]
ts: |
  declare function named<T as function>(fn: T, ?name: string): T
description: |
  Given a function, returns the function with its name overridden. If no name is
  given and the function has a `name` property, the original function is
  returned. If the function has no `name` property and no name is given, the
  name is overridden with the output of the `functionName` function.
specs:
  - !spec
    name: named
    fn: !js named
    tests:
      - name: should name an anonymous function
        input: [!js 'v => v']
        output: !js |
          and(isFunction(_), is(_.name, 'v => v'))
      - name: should explicitly name a function
        input:
          - !js 'v => v'
          - foo
        output: !js |
          and(isFunction(_), is(_.name, 'foo'))
*/
const named = (fn, name) =>
  fn.name && !name
    ? fn
    : overrideProxy(fn, { name: (name || functionName(fn)) });

/* #AUTODOC#
module: API
name: appendedName
tags: [Foundational]
ts: |
  declare function appendedName<T as function>(fn: T, ?name: string): T
description: |
  Given a function, returns the function with its name overridden. The original
  function name is suffixed with the given suffix in angled brackets.
examples: |
  ```javascript
  const product = compilable((x, y) => x * y)
  const triple = appendName(product(3), '3')
  console.log(triple.name) // product<3>
  ```
specs:
  - !spec
    name: appendedName
    fn: !js appendedName
    tests:
      - name: should name an anonymous function
        input:
          - !js 'v => v'
          - foo
        output: !js |
          and(isFunction(_), is(_.name, 'foo'))
      - name: should append a name to a named function
        input:
          - !js 'function foo () {}'
          - bar
        output: !js |
          and(isFunction(_), is(_.name, 'foo<bar>'))
*/
const appendedName = (fn, name) =>
  fn.name
    ? overrideProxy(fn, { name: `${fn.name}<${name}>` })
    : named(fn, name);

const traceFromFrame = (fn, existingFrame) => {
  const name = fn.name;
  const previous = stack[stack.length - 1];
  return new Proxy(fn, {
    apply: (target, thisArg, args) => {
      const frame = existingFrame
        ? push({ ...existingFrame, previous })
        : push({ name, ...currentLineAndColumn(), thisArg, args, previous });
      try {
        // todo: investigate whey this returns undefined
        // const result = target.apply(thisArg, args)
        const result = target(...args);
        pop();
        if (!isAsync$1(result)) {
          return result
        }
        return result.catch(err => {
          if (err[isTracedError]) {
            throw err
          }
          errorProxy(frame)(err);
        })
      } catch (err) {
        pop();
        if (err[isTracedError]) {
          throw err
        }
        errorProxy(frame)(err);
      }
    },
  })
};

/* #AUTODOC#
module: API
name: trace
tags: [Foundational, Environment]
ts: |
  declare function trace<T as function>(fn: T): T
description: |
  Given a function, returns the function with additional error processing. A
  traced function, when it throws an error, will have a different stack trace
  from an untraced function. The thrown error will also have additional
  properties to aid in debugging.

  Tracing is off by default. Turning tracing on will have a dramatic effect on
  performance (up to 10x slower than without tracing). To turn on tracing, set
  the environment variable FP_LIGHT_TRACE=on.
*/
const trace = (fn) => {
  if (typeof fn !== 'function') {
    fail(new TypeError(`\`trace\` argument 1: expected function but got ${typeof fn}`));
  }
  if (process.env.FP_LIGHT_TRACE !== 'on') {
    return fn
  }
  return traceFromFrame(named(fn))
};

const required = Symbol('required');

const passthroughProxy = (source, target) =>
  new Proxy(target, {
    get: (target, prop) =>
      source[prop],
    getOwnPropertyDescriptor: (target, prop) =>
      Object.getOwnPropertyDescriptor(source),
    has: (target, prop) =>
      prop in source,
    isExtensible: () =>
      Object.isExtensible(source),
    ownKeys: () =>
      Reflect.ownKeys(source),
  });

const curryObject = (fn, args) => {
  const { [required]: properties, ...rest } = Array.isArray(args)
    ? { [required]: args }
    : args;
  const result = obj => {
    const state = { ...rest, ...obj };
    const remaining = properties.filter((property) =>
      !state.hasOwnProperty(property));
    return remaining.length
      ? curryObject(fn, { [required]: remaining, ...state })
      : fn(state)
  };
  return passthroughProxy(fn, result)
};

const curryArity = (fn, arity) =>
  arity < 2
    ? fn
    : passthroughProxy(fn, (...args) =>
        (args.length >= arity
          ? fn(...args)
          : curryArity(fn.bind(null, ...args), arity - args.length)));

/* #AUTODOC#
module: API
name: curry
tags: [Composition, Foundational]
ts: |
  function curry(fn: function): function
  declare function curry(arity: number, fn: function): function
description: |
  Allows partial application of function arguments.
specs:
  - !spec
    name: curry
    fn: !js curry
    tests:
      - name: should pass through when arity 0
        input: [!js () => true]
        output: !js v => v() === true
      - name: should pass through when arity 1
        input: [!js (arg) => arg]
        output: !js v => v(42) === 42
      - name: should allow partial application of arity 2
        input:
          - !js |
              (arg1, arg2) => arg1 + arg2
        output: !js |
          v => v(40)(2) === 42
      - name: should allow complete application of arity 2
        input:
          - !js |
              (arg1, arg2) => arg1 + arg2
        output: !js |
          v => v(40, 2) === 42
      - name: should pass through when explicit arity 0
        input: [!js () => true, 0]
        output: !js v => v() === true
      - name: should pass through when explicit arity 1
        input: [!js (arg) => arg, 1]
        output: !js v => v(42) === 42
      - name: should allow partial application of explicit arity 2
        input:
          - !js |
              (arg1, arg2, arg3 = 0) => arg1 + arg2 + arg3
          - 2
        output: !js |
          v => v(40)(2) === 42
      - name: should allow complete application of explicit arity 2
        input:
          - !js |
              (arg1, arg2, arg3 = 0) => arg1 + arg2 + arg3
          - 2
        output: !js |
          v => v(40, 2) === 42
      - name: should allow application of additional args with explicit arity 2
        input:
          - !js |
              (arg1, arg2, arg3 = 0) => arg1 + arg2 + arg3
          - 2
        output: !js |
          v => v(40, 1, 1) === 42
*/
// TODO: use [this guide](https://www.freecodecamp.org/news/typescript-curry-ramda-types-f747e99744ab/)
// to provide a full typescript implementation.
const curry = (arity, fn) =>
  typeof arity === 'function'
    ? curry(arity.length, arity)
    : typeof arity === 'object'
      ? curryObject(fn, arity)
      : curryArity(fn, arity);

/* #AUTODOC#
module: API
name: uncurry
tags: [Composition, Foundational]
ts: |
  declare function uncurry(fn: function): function
description: |
  Allows partial application of function arguments.
specs:
  - !spec
    name: uncurry
    fn: !js uncurry
    tests:
      - name: should apply all args
        input:
          - !js |
              v1 => v2 => v1 + v2
        output: !js |
          f => f(40, 2) === 42
*/
const uncurry = fn =>
  (...args) =>
    args.reduce((nextFn, arg) => nextFn(arg), fn);

/* #AUTODOC#
module: API
name: nullary
tags: [Composition, Foundational]
ts: |
  declare function nullary<T>(fn: () => T): (...any[]) => T
description: |
  Given a function, returns a function that invokes the original function
  without passing any arguments through.
specs:
  - !spec
    name: nullary
    fn: !js nullary
    tests:
      - name: should not pass through an argument
        input: [!js v => v]
        output: !js fn => fn(42) === undefined
*/
const nullary = fn =>
  () =>
    fn();

/* #AUTODOC#
module: API
name: unary
tags: [Composition, Foundational]
ts: |
  declare function unary<T, A>(fn: (arg: A) => T): (arg: A, ...any[]) => T
description: |
  Given a function, returns a function that invokes the original function
  passing only the first argument through.
specs:
  - !spec
    name: unary
    fn: !js unary
    tests:
      - name: should only pass through a single argument
        input:
          - !js |
              (v1, v2) => v2
        output: !js fn => fn(42, 42) === undefined
*/
const unary = fn =>
  arg =>
    fn(arg);

/* #AUTODOC#
module: API
name: binary
tags: [Composition, Foundational]
ts: |
  declare function binary<T, A1, A2>(
    fn: (arg1: A1, arg2: A2) => T
  ): (arg1: A1, arg2: A2, ...any[]) => T
description: |
  Given a function, returns a function that invokes the original function
  passing only the first 2 arguments through.
specs:
  - !spec
    name: binary
    fn: !js binary
    tests:
      - name: should only pass through two arguments
        input:
          - !js |
              (v1, v2, v3) => v3
        output: !js fn => fn(42, 42, 42) === undefined
*/
const binary = fn =>
  (arg1, arg2) =>
    fn(arg1, arg2);

/* #AUTODOC#
module: API
name: ternary
tags: [Composition, Foundational]
ts: |
  declare function ternary<T, A1, A2, A3>(
    fn: (arg1: A1, arg2: A2, arg3: A3) => T
  ): (arg1: A1, arg2: A2, arg3: A3, ...any[]) => T
description: |
  Given a function, returns a function that invokes the original function
  passing only the first 3 arguments through.
specs:
  - !spec
    name: ternary
    fn: !js ternary
    tests:
      - name: should only pass through three arguments
        input:
          - !js |
              (v1, v2, v3, v4) => v4
        output: !js fn => fn(42, 42, 42, 42) === undefined
*/
const ternary = fn =>
  (arg1, arg2, arg3) =>
    fn(arg1, arg2, arg3);

/* #AUTODOC#
module: API
name: arity
aliases: [nary]
tags: [Composition, Foundational]
ts: |
  declare function arity(arity: number, fn: function): function
description: |
  Given a function, returns a function that invokes the original function
  passing only the first _n_ (`arity`) arguments through.
specs:
  - !spec
    name: arity
    fn: !js arity
    tests:
      - name: should only pass through the given number of arguments
        input:
          - 2
          - !js |
              (v1, v2, v3) => v3
        output: !js fn => fn(42, 42, 42) === undefined
*/
const arity = (arity, fn) =>
  (...args) =>
    fn(...args.slice(0, arity));

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
const proxy = curry$1(function proxy (definition, target) {
  return new Proxy(target, definition)
});

const distinct$2 = input => ([...(new Set(input))]);

const merged = (target, properties) => {
  const merged = {};
  Object.entries(Object.getOwnPropertyDescriptors(target))
    .filter(([key]) => !properties[key])
    .forEach(([key, value]) => Object.defineProperty(merged, key, value));
  Object.entries(Object.getOwnPropertyDescriptors(properties))
    .forEach(([key, value]) => Object.defineProperty(merged, key, value));
  if (Object.isFrozen(target)) {
    return Object.freeze(merged)
  }
  if (!Object.isExtensible(target)) {
    return Object.preventExtensions(merged)
  }
  return Object.seal(merged)
};

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
const override = curry$1(({ properties = {}, apply, prototype }, target) => {
  // todo: come up with a way more elegant solution to this problem
  if (Object.isSealed(target)) {
    return merged(target, properties)
  }
  const valueOrBoundFunction = (value, prop) =>
    (typeof value === 'function') && (prop !== 'constructor')
      ? value.bind(apply || target)
      : value;
  const overriddenKeys = Reflect.ownKeys(properties);
  const definition = {
    get: (t, prop) => overriddenKeys.includes(prop)
      ? valueOrBoundFunction(properties[prop], prop)
      : valueOrBoundFunction(target[prop], prop),
    getOwnPropertyDescriptor: (t, prop) =>
      overriddenKeys.includes(prop)
        ? Object.getOwnPropertyDescriptor(properties, prop)
        : Object.getOwnPropertyDescriptor(target, prop),
    has: (t, prop) =>  overriddenKeys.includes(prop) || (prop in target),
    ownKeys: (t) => distinct$2([
      ...Reflect.ownKeys(target),
      ...overriddenKeys,
    ]),
    ...(apply ? { apply } : {}),
    ...(prototype ? { getPrototypeOf: () => prototype } : {} ),
  };
  return new Proxy(target, definition)
});

// export const spreadableSymbol = () => Symbol('spreadable')

// export const isSpreadableSymbol = s =>
//   (typeof s === 'symbol') &&
//     (s.toString() === 'Symbol(spreadable)')

/* EXPLANATION
Symbols don't work because Reflect.ownKeys() returns all symbols _after_ keys.
That means the spread operator will override other properties even if the spread
is declared first. That means we have to use a magic string instead of a symbol.
*/

let spreadableCount = 0;

const spreadableSymbol = () => `@@spread:${spreadableCount += 1}`;

const arraySpread = Symbol('arraySpread');

const arraySpreadFrom = ({ [arraySpread]: fn } = {}) => fn;

const isSpreadableSymbol = s =>
  s && s.startsWith && s.startsWith('@@spread:');

const isSpreadable = value => {
  try {
    return !!value &&
      value.constructor === Object &&
      (value[arraySpread] || Reflect.ownKeys(value).some(isSpreadableSymbol))
  } catch(err) {
    return false
  }
};

const getSpreadable = value => {
  try {
    return !!value &&
      value.constructor === Object &&
      (value[arraySpread] ||
        value[Reflect.ownKeys(value).find(isSpreadableSymbol)])
  } catch(err) {
    return false
  }
};

const distinct$1 = input => Array.from(new Set(input));

const primitiveFunctions = {};
let primitiveFunctionCount = 0;
const primitiveFunctionSymbol = Symbol('primitiveFunction');

const pushPrimitiveFunction = (fn) => {
  const index = primitiveFunctionCount++;
  const prop = fn[primitiveFunctionSymbol] =
    `${index}:__FP_LIGHT_PROPERTY_FUNCTION__ ${fn.name || '(anonymous)'}()`;
  primitiveFunctions[prop] = fn;
  return prop
};

const toPrimitiveFunction = (fn) => fn[primitiveFunctionSymbol]
  ? fn
  : new Proxy(fn, {
    get: (target, prop) => (prop === Symbol.toPrimitive)
      ? () => target[primitiveFunctionSymbol] || pushPrimitiveFunction(target)
      : target[prop],
  });

const targetPropertyIfExists = (target, property) =>
  (typeof property === 'function')
    ? property
    : function targetPropertyIfExists(input) {
      const value = target(input);
      return value && value[property]
    };

const spreadableProxy = {
  get: (target, property) =>
    (property === Symbol.isConcatSpreadable)
      ? false
    : property === arraySpread
      ? false
    : property === Symbol.iterator
      ? function* () { yield { [spreadableSymbol()]: target }; }
    : isSpreadableSymbol(property)
      ? target
    : target[property],
  getOwnPropertyDescriptor: (target, property) =>
    isSpreadableSymbol(property)
      ? { value: target, configurable: true, enumerable: true }
      : Object.getOwnPropertyDescriptor(target, property),
  ownKeys: (target) => target[compiledFrom]
    ? distinct$1([
      ...Reflect.ownKeys(target)
        .filter(key => key !== compiledFrom && key !== '$'),
      spreadableSymbol(),
      Symbol.iterator,
    ])
    : distinct$1([
      ...Reflect.ownKeys(target),
      spreadableSymbol(),
      Symbol.iterator,
    ]),
};

const toSpreadable = fn => {
  if (isSpreadable(fn)) {
    return fn
  }
  return new Proxy(fn, spreadableProxy)
};

const inspectSymbol = Symbol.for('nodejs.util.inspect.custom');

const concatOriginal = Array.prototype.concat;
const valueOrSpread = (a) =>
  (typeof a === 'function') ? [{ [arraySpread]: a }] : a;
// eslint-disable-next-line no-extend-native
Array.prototype.concat = function concat (...args) {
  return concatOriginal.apply(this, args.map(valueOrSpread))
};

const identityProxy = {
  get: (target, property) => {
    if (property === Symbol.toPrimitive) {
      return () =>
        target[primitiveFunctionSymbol] || pushPrimitiveFunction(target)
    }
    const accessor = primitiveFunctions[property];
    if (accessor) {
      return new Proxy(input => target(input)[accessor(input)], identityProxy)
    }
    return (property === Symbol.isConcatSpreadable)
      ? false
    : (property === arraySpread)
      ? false
    : isSpreadableSymbol(property)
      ? target
    : property === '$'
      ? target
    : (property === 'then')
      || (property === 'constructor')
      || (property === 'prototype')
      || (property === 'call')
      || (property === 'apply')
      || (property === Symbol.toPrimitive)
      || (property === inspectSymbol)
      ? target[property]
    : new Proxy(targetPropertyIfExists(target, property), identityProxy)
  },
  getOwnPropertyDescriptor: (target, property) =>
    isSpreadableSymbol(property)
      ? { value: target, configurable: true, enumerable: true }
    : property === Symbol.iterator
      ? {
        value: function* () { yield { [spreadableSymbol()]: target }; },
        writable: true,
        enumerable: false,
        configurable: true,
      }
    : Object.getOwnPropertyDescriptor(target, property),
  ownKeys: (target) => target[compiledFrom]
    ? distinct$1([
      ...Reflect.ownKeys(target)
        .filter(key => key !== compiledFrom && key !== '$'),
      spreadableSymbol(),
      Symbol.iterator,
    ])
    : distinct$1([
      ...Reflect.ownKeys(target),
      spreadableSymbol(),
      Symbol.iterator,
    ]),
};

const baseSymbol = Symbol('base');
const thisSymbol = Symbol('this');

const canProxy = (input) => {
  const type = typeof input;
  return ((type === 'object') || (type === 'function'))
};

const fromBase = function fromBase(base) {
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
};

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
const identity = new Proxy(
  function identity (v){ return v },
  identityProxy,
);

const baseIdentity = new Proxy(
  function baseIdentity (v){ return v[baseSymbol] },
  identityProxy,
);

const thisIdentity = new Proxy(
  function thisIdentity (v){ return v[thisSymbol] },
  identityProxy,
);

const resolveObject = (predicate) => {
  const entries = Reflect.ownKeys(predicate)
    .map(key => {
      const value = predicate[key];
      return isSpreadableSymbol(key)
        ? [spreadableSymbol, value]
        : [key, resolve(value)]
    });
  return input => {
    const mutate = (target, key, value) => {
      if (value === undefined) {
        delete target[key];
        return target
      }
      if (key === spreadableSymbol) {
        return Object.assign(target, value)
      }
      target[key] = value;
      return target
    };
    return entries.reduce(
      (state, [key, resolve]) => {
        const result = resolve(input);
        return (isAsync$1(result) || isAsync$1(state))
          ? Promise.all([state, result]).then(([s, r]) => mutate(s, key, r))
          : mutate(state, key, result)
      },
      {},
    )
  }
};

const iterableToArray = (value) => {
  if (Array.isArray(value)) {
    return value
  }
  if (!value || !value[Symbol.iterator]) {
    throw TypeError(`${value} is not iterable`)
  }
  return [...value]
};

const resolveIterable = (predicate) => {
  let resolves = [];
  for (let c of predicate) {
    const spreadable = getSpreadable(c);
    resolves.push(spreadable ? { [arraySpread]: spreadable } : resolve(c));
  }
  return input => {
    const r = resolves.reduce(
      (result, c) => {
        const resolveToSpread = c && c[arraySpread];
        const getSpreadValues = () => {
          const values = iterableToArray(resolveToSpread(input));
          return values.some(isAsync$1)
            ? awaitAll$1(values)
            : values
        };
        const value = resolveToSpread
          ? getSpreadValues()
          : c(input);
        const mutate = (mutable, added) => {
          if (resolveToSpread) {
            added.map(a => mutable.push(a));
            return mutable
          }
          mutable.push(added);
          return mutable
        };
        return (isAsync$1(result) || isAsync$1(value))
          ? Promise.all([result, value]).then(([r, v]) => mutate(r, v))
          : mutate(result, value)
      },
      [],
    );
    return r
  }
};

const isConstant = predicate =>
  (predicate === null) ||
    ['string', 'boolean', 'number', 'undefined'].includes(typeof predicate) ||
    (predicate instanceof Date) ||
    (predicate instanceof RegExp); // todo: special handling of regex?

const resolveProxy = (predicate, resolve) => {
  const overrides = { '$resolve': predicate };
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
      distinct$1([...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)]),
    apply: (target, thisArg, args) => {
      const awaited = deepAwait$1(args);
      return isAsync$1(awaited)
        ? awaited.then(a => resolve(...a))
        : resolve(...args)
    },
  })
};

const isResolve = predicate =>
  ((typeof predicate) === 'function') && ('$resolve' in predicate);

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
const resolve = (predicate) =>
  resolveProxy(predicate, isConstant(predicate)
    ? () => predicate
    : typeof predicate === 'function'
      ? predicate
      : typeof predicate === 'object'
        ? predicate[Symbol.iterator]
          ? resolveIterable(predicate)
          : resolveObject(predicate)
        : () => predicate);

const shallowResolveProxy = (predicate, resolve) => {
  const overrides = { '$resolve': predicate };
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
      distinct$1([...Reflect.ownKeys(target), ...Reflect.ownKeys(overrides)]),
    apply: (target, thisArg, args) => {
      const hasAsyncArgs = args.some(isAsync$1);
      return hasAsyncArgs
        ? Promise.all(args).then(a => resolve(...a))
        // maybe webpack bug? args cannot be passed with spread!
        : resolve(...args)
    },
  })
};

const shallowResolve = (predicate) =>
  shallowResolveProxy(predicate, isConstant(predicate)
    ? () => predicate
    : typeof predicate === 'function'
      ? predicate
      : typeof predicate === 'object'
        ? predicate[Symbol.iterator]
          ? resolveIterable(predicate)
          : resolveObject(predicate)
        : () => predicate);

const literal = Symbol('$');

const compiledFrom = Symbol('compiledFrom');

const compiledProxy = (fn) => ({
  get: (target, property) => {
    if (property === Symbol.toPrimitive) {
      return () =>
        target[primitiveFunctionSymbol] || pushPrimitiveFunction(target)
    }
    const accessor = primitiveFunctions[property];
    if (accessor) {
      return new Proxy(input => target(input)[accessor(input)], identityProxy)
    }
    return (property === Symbol.isConcatSpreadable)
      ? false
    : (property === arraySpread)
      ? false
    : property === Symbol.iterator
      ? function* () { yield { [spreadableSymbol()]: fn }; }
    : isSpreadableSymbol(property)
      ? fn
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
  ownKeys: (target) => target[compiledFrom]
    ? distinct$1([
      ...Reflect.ownKeys(target)
        .filter(key => key !== compiledFrom && key !== '$'),
      spreadableSymbol(),
      Symbol.iterator,
    ])
    : distinct$1([
      ...Reflect.ownKeys(target),
      spreadableSymbol(),
      Symbol.iterator,
    ]),
});

const compiledLiteral = (fn, arg) => {
  const apply = (target, thisArg, args) => {
    const resolved = awaitArray$1(args);
    if (isAsync$1(resolved)) {
      return resolved.then(resolvedArgs =>
        fn.apply(args[0], [arg, ...resolvedArgs]))
    }
    return fn.apply(args[0], [arg, ...args])
  };
  return new Proxy(fn, {
    ...compiledProxy((...args) => apply(fn, undefined, args)),
    apply,
  })
};

const compiledWithPasshrough = (fn, passthroughArgs, resolver) => {
  const apply = (target, thisArg, [arg]) => {
    const resolved = resolver(arg);
    if (isAsync$1(resolved)) {
      return resolved.then(resolvedArgs =>
        fn.apply(arg, [...passthroughArgs, ...resolvedArgs]))
    }
    return fn.apply(arg, [...passthroughArgs, ...resolved])
  };
  return new Proxy(fn, {
    ...compiledProxy((...args) => apply(fn, undefined, args)),
    apply,
  })
};

const compiled = (fn, resolver) => {
  const apply = (target, thisArg, [arg]) => {
    const resolved = resolver(arg);
    if (isAsync$1(resolved)) {
      return resolved.then(resolvedArgs =>
        fn.apply(arg, resolvedArgs))
    }
    return fn.apply(arg, resolved)
  };
  return new Proxy(fn, {
    ...compiledProxy((...args) => apply(fn, undefined, args)),
    apply,
  })
};

const compilable = (fn, { count, skip = 0 } = {}) =>
  toSpreadable(trace$1(override$1({
    properties: { '$': fn, [compiledFrom]: fn },
    apply: (target, thisArg, args) => {
      if (args.length === 0) {
        return toSpreadable(fn)
      }
      const argsCount = count || fn.length;
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
  })(fn)));

const isCompiled = fn =>
  ((typeof fn) === 'function') && ((typeof fn[compiledFrom]) === 'function');

const includesProperties = (value, input) => {
  if (is$1.$(value, input)) {
    return true
  }
  if (!value || !input) {
    return false
  }
  return Reflect.ownKeys(value)
    .every(key => is$1.$(value[key], input[key]))
};

/* #AUTODOC#
module: API
name: includes
tags: [compilable, arrays, strings]
ts: |
  declare function includes(value: any, input: any): boolean
description: |
  If the input has its own `includes` method, return the result of
  calling that function with the given input; otherwise, if the input strict
  equals the value, return true; if the input or value are falsy, return false;
  or returns true if each of the values's own properties is matched by one of
  the input's own properties using strict equal logic.
examples: |
  Check if an array includes a value:

  ```javascript
  includes('foo')(['foo', 'bar']) // true
  ```

  Check if a string includes a substring:

  ```javascript
  includes('foo')('biz foo bar') // true
  ```

  Check other types of values:

  ```javascript
  includes(42)(42) // true
  includes('foo')(42) // false
  includes({})({}) // true
  includes({ foo: 42 })({ bar: baz }) // false
  includes({ foo: 42 })({ foo: 42, bar: baz }) // true
  ```
specs:
  - !spec
    name: includes
    fn: !js includes.$
    tests:
      - name: should test string includes
        input: ['bar', 'foo bar baz']
        output: true
      - name: should test array includes
        input: ['bar', ['foo', 'bar', 'baz']]
        output: true
      - name: should test object includes
        input: [{ foo: 'bar' }, { foo: 'bar', baz: 'biz' }]
        output: true
      - name: should test negative object includes
        input: [{ foo: 'bar' }, { baz: 'biz' }]
        output: false
      - name: should handle undefined input
        input: ['foo', undefined]
        output: false
      - name: should handle literal values
        intput: [42, 42]
        output: true
*/
const includes = compilable$1(function includes (value, input) {
  return input && input.includes
    ? input.includes(value)
    : includesProperties(value, input)
});

/* #AUTODOC#
module: API
name: is
aliases: [isExactly, same, strictEqual]
tags: [Comparison]
description: |
  Determines strict equality. Same as `===` except returns true if both values
  are `NaN`. This does not perform deep equality.
examples: |
  ```javascript
  is.$(Number('foo'), Number('bar')) // true
  is.$(42, 42) // true
  is.$({}, {}) // false
  const x = {}
  const y = x
  is.$(x, y) // true
  ```
*/
const is = compilable$1(function is (value, compareValue) {
  return (value === compareValue) || (
    (typeof value === 'number') &&
    (typeof compareValue === 'number') &&
    Number.isNaN(value) &&
    Number.isNaN(compareValue)
  )
});

/* #AUTODOC#
module: API
name: typeName
tags: [Foundational]
description: |
  Returns the name of the type as a string. For `null` and `undefined` returns
  `'Null'` and `'Undefined'` respectively.
*/
const typeName = value =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor.name;

/* #AUTODOC#
module: API
name: compareTypes
tags: [Comparison]
description: |
  Compares types returning `< 0`, `0` or `> 0`. The type name is used for the
  comparison.
*/
const compareTypes = compilable$1(function compareTypes (value, compareValue) {
  const valueName = typeName(value);
  const compareName = typeName(compareValue);
  if (compareName === valueName) {
    return 0
  }
  return valueName.localeCompare(compareName)
});

/* #AUTODOC#
module: API
name: Undefined
tags: [Convenience Functions, Types]
description: |
  A stand-in constructor for the value `undefined`.
*/
function Undefined () {}

/* #AUTODOC#
module: API
name: Undefined
tags: [Convenience Functions, Types]
description: |
  A stand-in constructor for the value `null`.
*/
function Null () { return null }

/* #AUTODOC#
module: API
name: isExactType
aliases: [sameType, strictEqualType]
tags: [Comparison]
description: |
  Given a type (constructor function) and a value, returns true if the value's
  constructor is the given type.
examples: |
  ```javascript
  isExactType.$(Number, 3) // true
  isExactType.$(String, 'foo') // true
  isExactType.$(Object, { x: 42 }) // true
  isExactType.$(Object, new Map()) // false
  ```
*/
const isExactType = compilable$1(function isType (type, value) {
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value && (value.constructor === type))
}, { skip: 1 });

/* #AUTODOC#
module: API
name: isType
tags: [Comparison]
description: |
  Given a type (constructor function) and a value, returns true if the value's
  constructor is the given type or if the value is an instance of the type.
*/
const isType = compilable$1(function isType (type, value) {
  // todo: walk the heirarchy by hand instead?
  return ((value === undefined) && (type === Undefined)) ||
    ((value === null) && (type === Null)) ||
    (value instanceof type)
}, { skip: 1 });

/* #AUTODOC#
module: API
name: isUndefined
tags: [Comparison]
description: |
  Returns true if the value is `undefined`.
*/
const isUndefined = compilable$1(function isUndefined(value) {
  return value === undefined
});

/* #AUTODOC#
module: API
name: isNull
tags: [Comparison]
description: |
  Returns true if the value is `null`.
*/
const isNull = compilable$1(function isNull(value) {
  return value === null
});

/* #AUTODOC#
module: API
name: isDefined
aliases: [exists]
tags: [Comparison]
description: |
  Returns true if the value is neither `undefined` nor `null`.
*/
const isDefined = compilable$1(function isDefined(value) {
  return (value !== undefined) && (value !== null)
});

/* #AUTODOC#
module: API
name: isMissing
aliases: [notExists]
tags: [Comparison]
description: |
  Returns true if the value is `undefined` or `null`.
*/
const isMissing = compilable$1(function isDefined(value) {
  return (value === undefined) || (value === null)
});

/* #AUTODOC#
module: API
name: isTruthy
aliases: [truthy]
tags: [Comparison]
description: |
  Returns true if the value is not `undefined`, `null`, `0`, `NaN`, `''` or
  `false`.
*/
const isTruthy = compilable$1(function isTruthy(value) {
  return !!value
});

/* #AUTODOC#
module: API
name: isFalsy
tags: [Comparison]
description: |
  Returns true if the value is `undefined`, `null`, `0`, `NaN`, `''` or `false`.
*/
const isFalsy = compilable$1(function isFalsy(value) {
  return !value
});

/* #AUTODOC#
module: API
name: isArray
tags: [Comparison]
description: |
  Returns true if the value is an array.
*/
const isArray = compilable$1(function isArray(value) {
  return Array.isArray(value)
});

/* #AUTODOC#
module: API
name: isBoolean
tags: [Comparison]
description: |
  Returns true if the value is a boolean.
*/
const isBoolean = compilable$1(function isBoolean(value) {
  return (typeof value === 'boolean')
});

/* #AUTODOC#
module: API
name: isDate
tags: [Comparison]
description: |
  Returns true if the value is a date.
*/
const isDate = compilable$1(function isDate(value) {
  return isType.$(Date, value)
});

/* #AUTODOC#
module: API
name: isError
tags: [Comparison]
description: |
  Returns true if the value is an error.
*/
const isError$1 = compilable$1(function isError(value) {
  return isType.$(Error, value)
});

/* #AUTODOC#
module: API
name: isFunction
tags: [Comparison]
description: |
  Returns true if the value is a function.
*/
const isFunction = compilable$1(function isFunction(value) {
  // need to use instanceof to account for async functions
  return (value instanceof Function) || (typeof value === 'function')
});

/* #AUTODOC#
module: API
name: isMap
tags: [Comparison]
description: |
  Returns true if the value is a map.
*/
const isMap = compilable$1(function isMap(value) {
  return isType.$(Map, value)
});

/* #AUTODOC#
module: API
name: isNumber
tags: [Comparison]
description: |
  Returns true if the value is a number. Note that this returns false for the
  value `NaN`.
*/
const isNumber = compilable$1(function isNumber(value) {
  return (typeof value === 'number' || isType.$(Number, value)) && !Number.isNaN(value)
});

/* #AUTODOC#
module: API
name: isObject
tags: [Comparison]
description: |
  Returns true if the value is a plain object.
*/
const isObject = compilable$1(function isObject(value) {
  return isExactType.$(Object, value)
});

/* #AUTODOC#
module: API
name: isSet
tags: [Comparison]
description: |
  Returns true if the value is a set.
*/
const isSet = compilable$1(function isSet(value) {
  return isType.$(Set, value)
});

/* #AUTODOC#
module: API
name: isString
tags: [Comparison]
description: |
  Returns true if the value is a string.
*/
const isString = compilable$1(function isString(value) {
  return typeof value === 'string' || isType.$(String, value)
});

/* #AUTODOC#
module: API
name: isSymbol
tags: [Comparison]
description: |
  Returns true if the value is a symbol.
*/
const isSymbol = compilable$1(function isSymbol(value) {
  return typeof value === 'symbol'
});

/* #AUTODOC#
module: API
name: isIterable
tags: [Comparison]
description: |
  Returns true if the value is an iterable.
*/
const isIterable = compilable$1(
  Symbol.asyncIterator
    ?
      function isIterable(value) {
        return !!(value && (value[Symbol.iterator] || value[Symbol.asyncIterator]))
      }
    :
      function isIterable(value) {
        return !!(value && value[Symbol.iterator])
      }
);

const comparisons = {
  Boolean: (value, compareValue) =>
    (value === compareValue)
      ? 0
      : (value ? 1 : -1),
  Number: (value, compareValue) =>
    isNaN(value)
      ? isNaN(compareValue) ? 0 : 1
      : isNaN(compareValue)
        ? -1
        : value - compareValue,
  Date: (value, compareValue) =>
    comparisons.Number(value.getTime(), compareValue.getTime()),
  Error: (value = {}, compareValue = {}) =>
    comparisons.Array(
      [typeName(value), value.code, value.message],
      [typeName(compareValue), compareValue.code, compareValue.message],
    ),
  String: (value, compareValue) =>
    value.localeCompare(compareValue),
  RegExp: (value, compareValue) =>
    value.toString().localeCompare(compareValue.toString()),
  Array: (value, compareValue) => {
    for (let i = 0, count = value.length; i < count; i++) {
      const result = compare.$(value[i], compareValue[i]);
      if (result !== 0) {
        return result
      }
    }
    return value.length - compareValue.length
  },
  Set: (value, compareValue) => {
    const v1 = [...value].sort(compare.$);
    const v2 = [...compareValue].sort(compare.$);
    return comparisons.Array(v1, v2)
  },
  Object: (value, compareValue) => {
    if (value[Symbol.iterator] && compareValue[Symbol.iterator]) {
      return comparisons.Set(value, compareValue)
    }
    const keys = Reflect.ownKeys(value);
    for (const key of keys) {
      const result = compare.$(value[key], compareValue[key]);
      if (result !== 0) {
        return result
      }
    }
    return keys.length - Reflect.ownKeys(compareValue).length
  },
  Map: (value, compareValue) => {
    const compareKeyValue = ([k1], [k2]) => compare.$(k1, k2);
    const v1 = [...value].sort(compareKeyValue);
    const v2 = [...compareValue].sort(compareKeyValue);
    return comparisons.Array(v1, v2)
  },
  Function: (value, compareValue) =>
    comparisons.String(value.toString(), compareValue.toString()),
};

/* #AUTODOC#
module: API
name: comparer
tags: [Comparison]
description: |
  A symbol to use to define a custom comparer function for an object.
examples: |
  ```javascript
  const compareColors = ({r: r1, g: g1, b: b1}, {r: r2, g: g2, b: b2}) =>
    (r1 - r2) || (g1 - g2) || (b1 - b2)

  Color.prototype[comparer] = compareColors

  const colors = [
    new Color(50, 40, 60),
    new Color(40, 50, 60),
    new Color(60, 50, 40),
  ]

  console.log(colors.sort(compare))
  // [
  //   { r: 40, g: 50, b: 60 },
  //   { r: 50, g: 40, b: 60 },
  //   { r: 60, g: 50, b: 40 }
  // ]
  ```
*/
const comparer = Symbol('comparer');

/* #AUTODOC#
module: API
name: compare
tags: [Comparison]
description: |
  Compares two values returning `< 0` if the first value is less than the
  second, `0` if the values are equal, and `> 0` if the first value is greater
  than the second. When types do not match, comparison is done on type name.
  For numbers, `NaN` is always greater than real numbers.

  For errors, the type, code and message are compared while other properties
  such as the stack trace are ignored. This allows errors to be equal if they
  are identical except for stack trace or custom properties.

  For functions, the function text is compared.

  Arrays and objects are deep compared. Nested values are compared using all of
  the above rules.
*/
const compare = compilable$1(function compare (value, compareValue) {
  if (is.$(value, compareValue)) {
    return 0
  }
  const valueName = typeName(value);
  const compareName = typeName(compareValue);
  if (valueName !== compareName) {
    return valueName.localeCompare(compareName)
  }
  const comparison = (value && value[comparer]) ||
    comparisons[valueName] ||
    (
      (value instanceof Error || compareValue instanceof Error) &&
      comparisons.Error
    ) ||
    comparisons.Object;
  return comparison(value, compareValue)
});

const comparing = function comparing (resolver) {
  const fn = resolve$1(resolver);
  return function comparing(value, compareValue) {
    const v1 = fn(value);
    const v2 = fn(compareValue);
    if (isAsync$1(v1) || isAsync$1(v2)) {
      return Promise.all([v1, v2]).then(([rv1, rv2]) => compare.$(rv1, rv2))
    }
    return compare.$(v1, v2)
  }
};

/* #AUTODOC#
module: API
name: equal
aliases: [deepEqual, eq]
tags: [Comparison]
description: |
  Using the same rules as the `compare` function, compares two values and
  returns true if the two values are comparable. This function is suitable for
  deep equality.
*/
const equal = compilable$1(function equal (value, compareValue) {
  return compare.$(value, compareValue) === 0
});

const equalTo = equal.$;

/* #AUTODOC#
module: API
name: spread
tags: [Composition, Foundational]
ts: |
  declare function spread<T>(fn: (...args: any) => T): (args: any[]) => T
description: |
  Given a function that accepts arguments, return a function that accepts an
  array of arguments and spreads them to the underlying function on invocation.
examples: |
  Spreading to allow logging array elements individually:

  ```javascript
  const logSquares = pipe(
    map(square(_)),
    spread(console.log),
  )
  logSquares([2, 3])
  // 4 8
  ```
specs:
  - !spec
    name: spread
    fn: !js spread
    tests:
      - name: should spread an array to the underlying function params
        input:
          - !js add.$
        output: !js |
          fn => fn([1, 2]) === 3
*/
const spread = function spread (fn) {
  return override$1({
    apply: (target, thisArg, args) => {
      const array = args[0] || [];
      if (!isIterable$1.$(array)) {
        throw new TypeError(`Expected an iterable to spread to function ${fn.name}(); got ${array} instead.`)
      }
      return target(...array)
    },
  }, fn)
};

/* #AUTODOC#
module: API
name: gather
tags: [Composition, Foundational]
ts: |
  declare function gather(<arg>: <type>): <type>
description: |
  <add description here>
examples: |
  <add code blocks and explanations here>
specs:
  - !spec
    name: gather
    fn: !js gather
    tests:
      - name: should gather args into an array for the underlying function
        input:
          - !js |
              ([x, y, z]) => (x + y) === z
        output: !js |
          fn => fn(1, 2, 3)
*/
const gather = function gather (fn) {
  return override$1({
    apply: (target, thisArg, args) => target(args),
  })(fn)
};

const isError = compilable$1(function isError(value) {
  return value instanceof Error
});

const isErrorOfType = (type) =>
  compilable$1(function isErrorOf (error) {
    return (error instanceof Error) && (error instanceof type)
  });

const isErrorIncluding = (type) =>
  compilable$1(function isErrorOf (error) {
    return includes$1.$(type, error)
  });

const isErrorOf = (type) =>
  (typeof type === 'function')
    ? isErrorOfType(type)
    : isErrorIncluding(type);

const defineError = (
  name,
  code,
  factory = message => ({ message }),
) => {
  const escapedCode = inspect(code || name.toUpperCase());
  const errorFunction = new Function('factory', `
    function ${name} (...args) {
      const self = new.target
        ? this
        : Object.setPrototypeOf({}, ${name}.prototype)
      Object.assign(self, factory(...args))
      self.code = ${escapedCode}
      const stackLines = new Error(self.message).stack.split('\\n')
      self.stack = ['${name}: ' + self.message, ...stackLines.slice(2)].join('\\n')
      self.name = '${name}'
      return self
    }
    return ${name}
  `)(factory);
  errorFunction.prototype = Object.create(Error.prototype);
  return override$1({
    properties: {
      is: isErrorOfType(errorFunction),
      throw: (...args) => { throw errorFunction(...args) },
      reject: (...args) => Promise.reject(errorFunction(...args)),
      name,
      code,
    },
  }, errorFunction)
};

const failWith = compilable$1(
  function failWith(error, ...args) {
    throw new error(...args)
  },
  { skip: 1 },
);

/* #AUTODOC#
module: API
name: bitand
aliases: [band, bitwise.and, bit.and]
tags: [Bitwise, Compilable]
ts: |
  declare function bitand(x: int, y: int): int
description: |
  Performs the bitwise AND operation as with the `&` operator.
specs:
  - !spec
    name: bitand
    fn: !js bitand.$
    tests:
      - name: should and bits
        input: [1, 3]
        output: 1
*/
const bitand = compilable$1(function bitand (x, y) {
  return x & y
});

/* #AUTODOC#
module: API
name: bitnot
aliases: [bnot, bitwise.not, bit.not]
tags: [Bitwise, Compilable]
ts: |
  declare function bitnot(x: int): int
description: |
  Performs the bitwise NOT operation as with the `~` operator.
specs:
  - !spec
    name: bitnot
    fn: !js bitnot.$
    tests:
      - name: should flip bits
        input: [-43]
        output: 42
*/
const bitnot = compilable$1(function bitnot (x) {
  return ~x
});

/* #AUTODOC#
module: API
name: bitor
aliases: [bor, bitwise.or, bit.or]
tags: [Bitwise, Compilable]
ts: |
  declare function bitor(x: int, y: int): int
description: |
  Performs the bitwise OR operation as with the `|` operator.
specs:
  - !spec
    name: bitor
    fn: !js bitor.$
    tests:
      - name: should or bits
        input: [1, 2]
        output: 3
*/
const bitor = compilable$1(function bitor (x, y) {
  return x | y
});

/* #AUTODOC#
module: API
name: bitxor
aliases: [bxor, bitwise.xor, bit.xor]
tags: [Bitwise, Compilable]
ts: |
  declare function bitxor(x: int, y: int): int
description: |
  Performs the bitwise XOR operation as with the `^` operator.
specs:
  - !spec
    name: bitxor
    fn: !js bitxor.$
    tests:
      - name: should exclusive or bits
        input: [1, 3]
        output: 2
*/
const bitxor = compilable$1(function bitxor (x, y) {
  return x ^ y
});

/* #AUTODOC#
module: API
name: leftShift
aliases: [lshift]
tags: [Bitwise, Compilable]
ts: |
  declare function leftShift(x: int, y: int): int
description: |
  Performs the left shift operation as with the `<<` operator.
specs:
  - !spec
    name: leftShift
    fn: !js leftShift.$
    tests:
      - name: should shift bits left
        input: [1, 2]
        output: 4
*/
const leftShift = compilable$1(function leftShift (x, y) {
  return x << y
});

/* #AUTODOC#
module: API
name: rightShift
aliases: [rshift]
tags: [Bitwise, Compilable]
ts: |
  declare function rightShift(x: int, y: int): int
description: |
  Performs the unsigned right shift operation as with the `>>>` operator. NOTE:
  the _signed_ right shift (the `>>` operator) is the {{shift}} function.
specs:
  - !spec
    name: rightShift
    fn: !js rightShift.$
    tests:
      - name: should shift bits right
        input: [4, 2]
        output: 1
*/
const rightShift = compilable$1(function rightShift (x, y) {
  return x >>> y
});

const bitwise = Object.freeze({
  and: bitand,
  not: bitnot,
  or: bitor,
  xor: bitxor,
});

const call = compilable$1(function call (fn, ...args) {
  return fn(...args)
});

const constructed = compilable$1(function constructed (obj) {
  const proxiedFunctions = {};
  const getProxiedFunction = (name, target, value) => {
    const existing = proxiedFunctions[name];
    if (existing) {
      return existing
    }
    const proxied = new Proxy(
      value,
      { apply: (t, ta, args) => target[name](...args) },
    );
    proxiedFunctions[name] = proxied;
    return proxied
  };
  // todo: add a property mapper that accounts for prototypal inheritance?
  return new Proxy(
    obj,
    {
      get: (target, property) => {
        const value = target[property];
        return (typeof value) === 'function'
          ? getProxiedFunction(property, target, value)
          : value
      }
    },
  )
});

const construct = compilable$1(function construct (fn, ...args) {
  return constructed.$(new fn(...args))
});

const concat = compilable$1(
  function concat (baseValue, value, ...values) {
    if (baseValue === undefined) {
      return undefined
    }
    if (value === undefined) {
      return baseValue
    }
    return baseValue.concat(value, ...values)
  }
);

const conditional = trace$1(function conditional (predicate, truecase, falsecase) {
  const p = resolve$1(predicate);
  const t = resolve$1(truecase);
  const f = falsecase ? resolve$1(falsecase) : v => v;
  return toSpreadable$1(function conditional (...args) {
    const result = p(...args);
    if (isAsync$1(result)) {
      return result.then((r) => r
        ? t(...args)
        : f(...args))
    }
    return result
      ? t(...args)
      : f(...args)
  })
});

const selectAsync = async (initialValue, initialTruecase, calls, args) => {
  if (await initialValue) {
    return initialTruecase(...args)
  }
  for (const [predicate, truecase] of calls) {
    const value = await predicate(...args);
    if (value) {
      return truecase(...args)
    }
  }
  return args[0]
};

const select = trace$1(function select (...conditionals) {
  const calls = conditionals.map(([predicate, truecase]) =>
    ([resolve$1(predicate), resolve$1(truecase)]));
  return toSpreadable$1(function select (...args) {
    let counter = 0;
    for (const [predicate, truecase] of calls) {
      counter += 1;
      const value = predicate(...args);
      if (isAsync$1(value)) {
        return selectAsync(value, truecase, calls.slice(counter), args)
      }
      if (value) {
        return truecase(...args)
      }
    }
    return args[0]
  })
});

const fallback = () => true;

const interpolateSync = (parts, values) => {
  const result = [];
  parts.forEach((part, i) => {
    result.push(part);
    if (i < values.length) {
      result.push(values[i]);
    }
  });
  return result.join('')
};

const interpolate = (parts, mappers) => {
  const resolveMappers = resolve$1(mappers);
  return value => {
    const mappedValues = resolveMappers(value);
    return isAsync$1(mappedValues)
      ? mappedValues.then(values => interpolateSync(parts, values))
      : interpolateSync(parts, mappedValues)
  }
};

/* #AUTODOC#
module: API
name: tag
aliases: [template]
tags: [Convenience Functions, Strings]
description: |
  Used as a tag for a template literal, returns a function that will resolve to
  the interpolated string.
examples: |
  ```javascript
  pipe(
    tap(console.log),
    tag`first ${_.x} then ${_.y}`,
    tap(console.log),
  )({ x: 'foo', y: 'bar' })
  ```

  outputs:

  ```
  { x: 'foo', y: 'bar' }
  first foo then bar
  ```
*/
const tag = (parts, ...mappers) =>
  interpolate(parts, mappers);

/* #AUTODOC#
module: API
name: constant
aliases: [$, always, just, scalar]
tags: [Convenience Functions]
description: |
  Given a value, returns a nullary function that will always return the original
  value. NOTE: as a convenience, if multiple arguments are passed to this
  function it will resort to the behavior of `tag()`; thus

  ```javascript
  $`before ${_} after`
  ```
  is identical to

  ```javascript
  tag`before ${_} after`
  ```
examples: |
  ```javascript
  const meaning = constant('42')
  meaning() // 42
  meaning('foo') // 42
  ```
definition:
  types:
    Any: ~Object
  context:
    life: 42
    obj: { foo: 'bar' }
  specs:
    - signature: value:Any? => => Any?
      tests:
        - life => => life
        - life => obj => life
        - obj => => obj
        - obj => life => obj
        - => =>
        - => obj =>
*/
const constant = (value, ...stringMappers) =>
  stringMappers.length
    ? interpolate(value, stringMappers)
    : () => value;

/* #AUTODOC#
module: API
name: delay
tags: [Async, Compilable, Side Effect]
ts: |
  declare function delay<T>(ms: number, input: T) => Promise<T>
description: |
  Given a number of milliseconds, resolves after the milliseconds have elapsed.
examples: |
  ```javascript
  const saveAndLoad = pipe(
    saveRecord,
    delay(100), // wait 100 ms before loading
    loadRecord,
  )
  ```
*/
// eslint-disable-next-line no-warning-comments
/*
TODO: figure out why this test fails
specs:
  - !spec
    name: delay
    setup: {}
    fn: !js |
      pipe(
        { ..._, pre: Date.now },
        delay(_.ms),
        { ms: _.ms, duration: sub(Date.now, _.pre) },
      )
    tests:
      - input: [{ ms: 100 }]
        output: !js |
          toAsync({ ms: 100, duration: or(gt(100), eq(100)) })
*/
const delay = compilable$1(function delay (ms, input) {
  return awaitDelay$1(typeof ms === 'function' ? ms(input) : ms).then(() => input)
});

const hashInputWithOutput = (input, output) => {
  const inputLength = input.length;
  const outputLength = output.length;
  const maxIterations = (inputLength + outputLength) * 2;
  // eslint-disable-next-line no-plusplus
  for (let i = 0, prev = 0; i < maxIterations; i++) {
    const io = i % outputLength;
    const ii = i % inputLength;
    const code = input[ii];
    const existing = output[io];
    // eslint-disable-next-line no-param-reassign
    output[io] = prev = (((code ^ existing) ^ (prev + 1)) % 256);
  }
  return output
};

const hashFrom = (seed, input) =>
  hashInputWithOutput(input, hashInputWithOutput(input, seed).reverse());

const hash = (outputSize, input) =>
  hashFrom(
    Buffer.from(Array(outputSize).fill(input.length % 256)),
    input
  );

const stringify$1 = input =>
  (input === undefined
    ? 'undefined'
    : JSON.stringify(input));

const hashAny = (outputSize, input) =>
  hash(
    outputSize,
    input instanceof Buffer
      ? input
      : Buffer.from(stringify$1({ input }))
  );

const hashToDouble = input =>
  hashAny(8, input).readDoubleLE();

const hashToInt = input =>
  hashAny(4, input).readInt32LE();

const range = (from, to) =>
  Array(to - from + 1).fill().map((v, i) => from + i);

const charRange = (from, to) =>
  range(from.charCodeAt(0), to.charCodeAt(0))
    .map(c => String.fromCharCode(c));

const defaultHashToStringOutputChars = Object.freeze([
  ...charRange('a', 'z'),
  ...charRange('A', 'Z'),
  ...charRange('0', '9'),
]);

const hashToString = (
  length,
  input,
  outputChars = defaultHashToStringOutputChars
) =>
  Array.from(hashAny(length, input))
    .map(c => outputChars[Math.floor((c / 256) * outputChars.length)])
    .join('');

const not = compilable$1(function not (predicate) { return !predicate });

const andAsync = async (args, result, calls) => {
  result = await result;
  if (!result) {
    return result
  }
  for (const call of calls) {
    result = await call(...args);
    if (!result) {
      return result
    }
  }
  return result
};

const and = trace$1(function and (...predicates) {
  const calls = predicates.map(resolve$1);
  let offset = 0;
  let result;
  return (...args) => {
    for (const call of calls) {
      offset += 1;
      result = call(...args);
      if (isAsync$1(result)) {
        return andAsync(args, result, calls.slice(offset))
      }
      if (!result) {
        return result
      }
    }
    return result
  }
});

const orAsync = async (args, result, calls) => {
  result = await result;
  if (result) {
    return result
  }
  for (const call of calls) {
    result = await call(...args);
    if (result) {
      return result
    }
  }
  return result
};

const or = trace$1(function or (...predicates) {
  const calls = predicates.map(resolve$1);
  let offset = 0;
  let result;
  return (...args) => {
    for (const call of calls) {
      offset += 1;
      result = call(...args);
      if (isAsync$1(result)) {
        return orAsync(args, result, calls.slice(offset))
      }
      if (result) {
        return result
      }
    }
    return result
  }
});

const xor = compilable$1(function xor (predicate1, predicate2) {
  return (predicate1 && !predicate2) || (predicate2 && !predicate1)
});

const toSyncArray = (iterable) => {
  if (isAsync$1(iterable)) {
    return iterable.then(toSyncArray)
  }
  const array = Array.isArray(iterable)
    ? iterable
  : isIterable$1.$(iterable)
    ? [...iterable]
  : toSyncArray(toArray$1(iterable));
  return deepAwait$1(array)
};

const reduce = compilable$1(function reduce (
  { state: currentState, reducer: rawReducer },
  array,
) {
  const base = fromBase$1(this);
  const reducer = resolve$1(rawReducer);
  const maybeAsyncInput = toSyncArray(array);
  let i = 0;
  const reduceSync = (input) => {
    const length = input.length;
    let state = currentState;
    const reduceAsync = async () => {
      for(; i < length;) {
        state = await reducer(base({
          state,
          value: input[i],
          i,
          array: input,
        }));
        i++;
      }
      return state
    };
    const startMappingAsync = (v) => {
      state = v;
      i++;
      return reduceAsync()
    };
    for(; i < length;) {
      state = reducer(base({
        state,
        value: input[i],
        i,
        array: input,
      }));
      if (isAsync$1(state)) {
        return state.then(startMappingAsync)
      }
      i++;
    }
    return state
  };
  return isAsync$1(maybeAsyncInput)
    ? maybeAsyncInput.then(reduceSync)
    : reduceSync(maybeAsyncInput)
}, { skip: 1 });

const map = compilable$1(function map (mapper, array) {
  const base = fromBase$1(this);
  const fn = resolve$1(mapper);
  const maybeAsyncInput = toSyncArray(array);
  const mapSync = (input) => {
    const length = input.length;
    const result = Array(length);
    let i = 0;
    const mapAsync = async () => {
      for(; i < length;) {
        const value = fn(base(input[i]));
        result[i] = await value;
        i++;
      }
      return result
    };
    const startMappingAsync = (v) => {
      result[i] = v;
      i++;
      return mapAsync()
    };
    for(; i < length;) {
      const value = fn(base(input[i]));
      if (isAsync$1(value)) {
        return value.then(startMappingAsync)
      }
      result[i] = value;
      i++;
    }
    return result
  };
  return isAsync$1(maybeAsyncInput)
    ? maybeAsyncInput.then(mapSync)
    : mapSync(maybeAsyncInput)
}, { skip: 1 });

const groupBy = compilable$1(function groupBy (predicate, array) {
  const base = fromBase$1(this);
  const fn = resolve$1(predicate);
  return reduce.$(
    {
      state: new Map(),
      reducer: ({ state, value }) => {
        const mutate = (k) => {
          const values = state.get(k);
          if (!values) {
            return state.set(k, [value])
          }
          values.push(value);
          return state
        };
        const key = fn(base(value));
        if (isAsync$1(key)) {
          return key.then(mutate)
        }
        return mutate(key)
      },
    },
    array,
  )
}, { skip: 1 });

const filter = compilable$1(function filter (predicate, array) {
  const base = fromBase$1(this);
  const fn = resolve$1(predicate);
  const maybeAsyncInput = toSyncArray(array);
  const filterSync = (input) => {
    const length = input.length;
    const result = [];
    let i = 0;
    const filterAsync = async () => {
      for(; i < length;) {
        const value = input[i];
        const test = await fn(base(value));
        if (test) {
          result.push(value);
        }
        i++;
      }
      return result
    };
    const startFilteringAsync = (value, test) => {
      if (test) {
        result.push(value);
      }
      i++;
      return filterAsync()
    };
    for(; i < length;) {
      const value = input[i];
      const test = fn(base(value));
      if (isAsync$1(test)) {
        return test.then((t) => startFilteringAsync(value, t))
      }
      if (test) {
        result.push(value);
      }
      i++;
    }
    return result
  };
  return isAsync$1(maybeAsyncInput)
    ? maybeAsyncInput.then(filterSync)
    : filterSync(maybeAsyncInput)
}, { skip: 1 });

const some = compilable$1(function some (predicate, array) {
  const base = fromBase$1(this);
  const syncArray = toSyncArray(array);
  const fn = resolve$1(predicate);
  function some (a) {
    return a.some(v => fn(base(v)))
  }
  if (isAsync$1(syncArray)) {
    return syncArray.then(resolvedArray => some(resolvedArray))
  }
  return some(array)
}, { skip: 1 });

const every = compilable$1(function every (predicate, array) {
  const base = fromBase$1(this);
  const syncArray = toSyncArray(array);
  const fn = resolve$1(predicate);
  function every (a) {
    return a.every(v => fn(base(v)))
  }
  if (isAsync$1(syncArray)) {
    return syncArray.then(resolvedArray => every(resolvedArray))
  }
  return every(array)
}, { skip: 1 });

const defaultJoinPredicate = () => true;

function joinLiteral ({
  left: rawLeft,
  right: rawRight,
  on = defaultJoinPredicate,
  map,
  outer,
  base = (v) => v,
}) {
  const resolved = deepAwait$1({
    left: toSyncArray(rawLeft),
    right: toSyncArray(rawRight),
  });
  if (isAsync$1(resolved)) {
    return resolved.then(inputs =>
      joinLiteral({ ...inputs, on, map, outer, base }))
  }
  const { left, right } = resolved;
  const compared = resolve$1(on);
  const mutate = map
    ? (state, left, right) => state.push(map(base({ left, right })))
    : (state, left, right) => state.push(base({ left, right }));
  return left.reduce(
    (state, value) => {
        let matched;
        right.filter(v => compared(base({ left: value, right: v })))
          .forEach(match => (matched = true) && mutate(state, value, match));
        if (outer && !matched) {
          mutate(state, value, null);
        }
        return state
    },
    [],
  )
}

const join = override$1({ properties: { '$': joinLiteral } })(
  function join ({left, right, on, map, outer}) {
    const toLeft = resolve$1(left);
    const toRight = resolve$1(right);
    const toMap = map && resolve$1(map);
    return function joinFrom (input) {
      const base = fromBase$1(input);
      return joinLiteral({
        left: toLeft(input),
        right: toRight(input),
        on,
        map: toMap,
        outer,
        base,
      })
    }
  }
);

const left = 0;
const right = 1;

const product = function product ({left, right}) {
  return join({left, right})
};

const sort = compilable$1(function sort (comparer, array) {
  const result = toSyncArray(array);
  return isAsync$1(result)
    ? result.then(r => r.sort(comparer))
    : result.sort(comparer) // todo: use _base
}, { skip: 1 });

const reverse = compilable$1(function reverse (array) {
  const result = toSyncArray(array);
  return isAsync$1(result)
    ? result.then(r => r.reverse())
    : result.reverse()
});

function flatDeep(arr, d = 1) {
  return d > 0
    ? arr.reduce((acc, val) =>
        acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
    : arr.slice()
}

if (!Array.prototype.flat) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.flat = function flat (depth = 1) {
    return flatDeep(this, depth)
  };
}

const flat = compilable$1(function flat (array) {
  const result = toSyncArray(array);
  return isAsync$1(result)
    ? result.then(r => r.flat())
    : result.flat()
});

const add = compilable$1(function add (x, y) { return x + y });

const subtract = compilable$1(function subtract (x, y) { return x - y });

const multiply = compilable$1(function multiply (x, y) { return x * y });

const divide = compilable$1(function divide (x, y) { return x / y });

const remainder = compilable$1(function remainder (x, y) { return x % y });

const modulo = compilable$1(function remainder (x, y) {
  return ((x % y ) + y ) % y
});

const exponent = compilable$1(function exponent (exponent, base) {
  return Math.pow(base, exponent)
});

const square = compilable$1(function square (base) {
  return base * base
});

const squareRoot = compilable$1(function squareRoot (base) {
  return Math.sqrt(base)
});

const greater = compilable$1(function greater (x, y) { return x > y });

const less = compilable$1(function less (x, y) { return x < y });

const isInteger = compilable$1(function isInteger (x) {
  return Number.isSafeInteger(x)
});

const shift = compilable$1(function shift (x, y) {
  return x >> y
});

const propertyValue = compilable$1(function propertyValue (path, input) {
  return (input === undefined)
    ? undefined
    : Array.isArray(path)
      ? path.reduce(
          (state, value) => propertyValue(value, state),
          input,
        )
      : input[path]
});

const withoutElement = (index, array) => {
  const wrappedIndex = index % array.length;
  const trueIndex = wrappedIndex < 0
    ? (array.length + wrappedIndex)
    : wrappedIndex;
  return [
    ...array.slice(0, trueIndex),
    ...array.slice(trueIndex + 1),
  ]

};

const without = compilable$1(function without (path, input) {
  if (Array.isArray(path)) {
    return path.reduce(
      (state, value) => without(value, state),
      input,
    )
  }
  return Array.isArray(input)
    ? path === 0
      ? input.slice(1)
      : withoutElement(path, input)
    : (({ [path]: ignored, ...rest }) => rest)(input)
});

/* #AUTODOC#
module: API
name: parallel
aliases: [concurrent]
tags: [Compilable, Mapping]
ts: |
  declare function parallel(mapper: any, array: Array): Promise<Array>
description: |
  Given an async mapper and an array, invokes the mapper for each element in the
  array concurrently. This is different from the behavior of the {{map}}
  function which ensures the resolution of each element before executing the
  mapper on the next element.
examples: |
  Using `map`:

  ```javascript
  const input = [500, 100]

  const test = map(pipe(
    tap(delay(_)),
    console.log,
  ))

  test(input)
  // 500
  // 100
  ```

  Using `parallel`:

  ```javascript
  const input = [500, 100]

  const test = parallel(pipe(
    tap(delay(_)),
    console.log,
  ))

  test(input)
  // 100
  // 500
  ```

  Note that while the `map` example prints the items in their original order,
  the `parallel` function executes concurrently and thus the smaller delay
  completes before the larger delay. Note that the output of each function is
  identical as in the following example:

  ```javascript
  const input = [500, 100]

  const test = assertValid(equal(
    map(tap(delay(_))),
    parallel(tap(delay(_))),
  ))

  test(input) // ok
  ```
specs:
  - !spec
    name: parallel
    fn: !js |
      (input) => {
        const order = []
        const test = pipe(
          parallel(tap(pipe(
            delay(_, _),
            v => order.push(v),
          ))),
          output => ({ order, output }),
        )
        return test(input)
      }
    tests:
      - name: should execute the mapper in parallel
        input: [[500, 100]]
        output: !js |
          toAsync({ order: [100, 500], output: [500, 100] })
*/
const parallel = compilable$1(function parallel (mapper, array) {
  const fn = resolve$1(mapper);
  return awaitAll$1(array.map(v => fn(v)))
}, { skip: 1 });

/* #AUTODOC#
module: API
name: MissingPipeArgumentError
tags: [Error]
ts: |
  declare function MissingPipeArgumentError (
    this: MissingPipeArgumentError | undefined | void,
    arg: any,
    index: number
  ) : MissingPipeArgumentError extends Error
Description: |
  An error thrown when a null or undefined argument is compiled into a piped or
  composed function.
*/
const MissingPipeArgumentError = defineError$1(
  'MissingPipeArgumentError',
  'ERR_MISSING_PIPE_ARGUMENT',
  (arg, index) => ({ message: `Argument ${index + 1} of the pipe is ${arg}.` }),
);

const assertNotMissingAndResolve = (value, i) => {
  if (isMissing$1.$(value)) {
    throw MissingPipeArgumentError(value, i)
  }
  return resolve$1(value)
};

/* #AUTODOC#
module: API
name: pipe
aliases: [I]
tags: [Compilable, Composition]
ts: |
  declare function pipe(...steps: resolvable[]): (initialValue: any) => any
description: |
  Piping is the basis for the FP library. A pipe is a unary function (accepts
  a single argument) that is composed of a sequence of other functions. When
  called, the pipe passes the argument to its first function. The result of that
  call is passed to the second function, etc. The result of the last function is
  the return value of the pipe. For this documentation, we will refer to these
  functions as "steps" in the pipe.

  In addition to the vanilla form of piping described above, this pipe
  implementation adds the additional feature of resolving each step of the pipe.
  That means that instead of a function, a step could be an array, object,
  string literal, etc.
examples: |
  A simple pipe.

  ```javascript
  const productOfIncrement = pipe(
    add(1),
    mul(2),
  )

  productOfIncrement(3) // 8
  ```

  A pipe with various resolving steps. This is a no-frills but fully-working
  example. Note that the two pipes include asynchronous steps, but that those
  steps will be automagically awaited by the piping infrastructure.

  ```javascript
  const { dynamoDB: { documentClient } } = require('@sullux/aws-sdk')()

  const tableName = process.env.TABLE_NAME
  const keyName = process.env.KEY_NAME

  const getItem = pipe(
    { TableName: tableName, Key: { [keyName]: _ } },
    documentClient.get,
    _.Item,
  )

  const putItem = pipe(
    { TableName: $tableName, Item: _ },
    documentClient.put,
    'Attributes',
  )
  ```
specs:
  - !spec
    name: pipe
    fn: !js |
      pipe(x => x + 1, { y: _ })
    tests:
      - input: [41]
        output: { y: 42 }
      - input: ['foo']
        output: { y: 'foo1' }
*/
const pipe = trace$1(function pipe (...steps) {
  const resolvableSteps = steps
    .map(assertNotMissingAndResolve)
    .map((fn, i) => appendedName$1(fn, `STEP_${i + 1}`))
    .map(trace$1);
  return toSpreadable$1(initialValue =>
    resolvableSteps.reduce(
      (value, step) =>
        isAsync$1(value)
          ? value.then(awaitedValue => step(awaitedValue))
          : step(value),
      initialValue,
    ))
});

/* #AUTODOC#
module: API
name: compose
aliases: [f]
tags: [Compilable, Composition]
ts: |
  declare function compose(...steps: resolvable[]): (initialValue: any) => any
description: |
  This is the inverse of {{pipe}}.
example: |
  ```javascript
  pipe(a, b, c)(x) === compose(c, b, a)(x)
  ```
*/
const compose = trace$1(function compose (...steps) {
  const resolvableSteps = steps
    .reverse()
    .map(assertNotMissingAndResolve)
    .map((fn, i) => appendedName$1(fn, `STEP ${i + 1}`))
    .map(trace$1);
  return toSpreadable$1(initialValue =>
    resolvableSteps.reduce(
      (value, step) =>
        isAsync$1(value)
          ? value.then(awaitedValue => step(awaitedValue))
          : step(value),
      initialValue,
    ))
});

const parse = function parse (string) {
  return JSON.parse(string)
};

const stringify = function stringify (value) {
  return JSON.stringify(value, null, 2)
};

const padStart = compilable$1(function padStart(length, char, string) {
  return string.padStart(length, char)
});

const padEnd = compilable$1(function padEnd(length, char, string) {
  return string.padEnd(length, char)
});

const startsWith = compilable$1(function startsWith(value, string) {
  return string.startsWith(value)
});

const endsWith = compilable$1(function endsWith(value, string) {
  return string.endsWith(value)
});

// TODO: implement a functional version of String.raw

const fromCharCode = compilable$1(function fromCharCode(bytes) {
  return String.fromCharCode(...bytes)
});

const fromCodePoint = compilable$1(function fromCodePoint(bytes) {
  return String.fromCodePoint(...bytes)
});

const charAt = compilable$1(function charAt(index, string) {
  return string.charAt(index)
});

const charCodeAt = compilable$1(function charCodeAt(index, string) {
  return string.charCodeAt(index)
});

const charPointAt = compilable$1(function charPointAt(index, string) {
  return string.charPointAt(index)
});

const indexOf = compilable$1(function indexOf(value, string, fromIndex) {
  if (typeof fromIndex === 'string') {
    return fromIndex.indexOf(value)
  }
  return string.indexOf(value, fromIndex)
}, { count: 2 });

const lastIndexOf = compilable$1(function lastIndexOf(value, string, fromIndex) {
  if (typeof fromIndex === 'string') {
    return fromIndex.lastIndexOf(value)
  }
  return string.lastIndexOf(value, fromIndex)
}, { count: 2 });

const isRegex = compilable$1(function isRegex(value) {
  return value instanceof RegExp
});

const globalMatch = 'g';
const ignoreCase = 'i';
const multiline = 'm';
const dotAll = 's';
const unicode = 'u';
const sticky = 's';

const toRegex = compilable$1(function toRegex(flags, pattern) {
  if (isRegex.$(value)) {
    return value
  }
  return RegExp(pattern, Array.isArray(flags) ? flags.join('') : flags)
});

const tap = (fn) => {
  const tapped = (arg) => {
    const result = fn(arg);
    return isAsync$1(result)
      ? result.then(() => arg)
      : arg
  };
  tapped.$ = fn;
  return tapped
};

const toArray = any =>
  any instanceof Array
    ? any
    : any === null || any === undefined || any === ''
      ? []
      : any[Symbol.iterator]
        ? [...any]
        : (typeof any === 'object') && !(any instanceof Date)
          ? Object.entries(any)
          : [any];

/* eslint-disable no-restricted-syntax */
const objectFromIterable = iterable => {
  let result = {};
  for(const [key, value] of iterable) {
    result[key] = value;
  }
  return result
};

const toObject = any =>
  any === undefined
    ? { 'Undefined': undefined }
    : any === null
      ? { 'Null': null }
      : typeof any === 'object' && !(any instanceof Date)
        ? any[Symbol.iterator]
          ? objectFromIterable(any)
          : any
        : { [any.constructor.name]: any };

const InvalidTrapTargetError = defineError$1(
  'InvalidTrapTargetError',
  'ERR_INVALID_TRAP_TARGET',
  (critical) => ({
    message: `Argument 1 "critical" must be a function. Got ${critical}.`,
  }),
);

const trapAsync = promise =>
  promise.then(result => ([undefined, result]), err => ([err]));

const trap = (critical) => {
  if (isAsync$1(critical)) {
    return trapAsync(critical)
  }
  if (!isFunction$1.$(critical)) {
    InvalidTrapTargetError.throw(critical);
  }
  const traced = trace$1(critical);
  const trapped = (...args) => {
    try {
      const result = traced(...args);
      return isAsync$1(result)
        ? trapAsync(result)
        : [undefined, result]
    } catch (err) {
      return [err]
    }
  };
  trapped.$ = critical;
  return trapped
};

const keyIsValidItendifier = key =>
  /^[a-zA-Z$_][a-zA-Z0-9$_]*$/.test(key);

const extraProperty = (input, path) => ([
  [path, input, 'property', 'unsupported'],
]);

const removeFromArray = (array, value) =>
  array.filter(v => v!== value);

const appendPath = (path, key) =>
  isNumber$1.$(key)
    ? `${path}[${key}]`
  : isSymbol$1.$(key)
    ? `${path}[${key.toString()}]`
  : keyIsValidItendifier(key)
    ? `${path}.${key}`
  : `${path}['${key}']`;

const validateObject = (validator, input, path) => {
  if (!isObject$1.$(input)) {
    return [[path, input, 'object', 'missing']]
  }
  // be sure to exclude non-enumerable properties:
  let inputKeys = Object.keys(input);
  const validateExtraProperty = getSpreadable$1(validator) || extraProperty;
  const problems = input
    ? Reflect.ownKeys(validator)
      .filter(key => (key !== Symbol.iterator) && (!isSpreadableSymbol$1(key)))
      .map(key => {
        inputKeys = removeFromArray(inputKeys, key);
        return validate.$(validator[key], input[key], appendPath(path, key))
      })
      .flat()
    : [[path, input, 'object', 'missing']];
  const extraProblems = inputKeys.map(key =>
      validate.$(validateExtraProperty, input[key], appendPath(path, key))).flat();
  return [
    ...problems,
    ...extraProblems,
  ]
};

const extraElement = (input, path) => ([
  [path, input, 'element', 'unsupported'],
]);

const validateArray = (validator, input, path) => {
  if (!isArray$1.$(input)) {
    return [[path, input, 'array', 'missing']]
  }
  const last = validator[validator.length - 1];
  const spreadFn = arraySpreadFrom$1(last);
  const validateExtraElement = spreadFn || extraElement;
  const checkedLength = spreadFn
    ? validator.length - 1
    : validator.length;
  const availableLength = input.length;
  let results = [];
  for (let i = 0; ; i++) {
    const elementPath = appendPath(path, i);
    const element = input[i];
    if (i < checkedLength) {
      results = results.concat(validate.$(validator[i], element, elementPath));
      continue
    }
    if (i >= availableLength) {
      break
    }
    results = results.concat(validate.$(validateExtraElement, element, elementPath));
  }
  return results
};

const validateFunction = (validator, input, path) => {
  const fn = validator.$ || validator;
  const [err, output] = trap$1(fn)(input, path);
  return err
    ? [[path, input, fn, err.message]]
  : isArray$1.$(output)
    ? output
  : output ? [] : [[path, input, fn, output]]
};

const validate = compilable$1(function validate (validator, input, path = '') {
  return isFunction$1.$(validator)
    ? validateFunction(validator, input, path)
  : isObject$1.$(validator)
    ? validateObject(validator, input, path)
  : isArray$1.$(validator)
    ? validateArray(validator, input, path)
  : validateFunction(v => equal$1.$(v, validator), input, path)
}, { skip: 1 });

const isValid = compilable$1(function isValid(validator, input) {
  return validate.$(validator, input).length === 0
}, { skip: 1 });

const validatorName = validator =>
  isFunction$1.$(validator)
    ? validator.name || functionName$1(validator)
    : validator.toString();

const problemToString = ([path, input, validator, output]) =>
  `${input}${path && ` at ${path}`}: ${validatorName(validator)} → ${output}`;

const distinct = input => ([...(new Set(input))]);

const problemsToOutput = (problems) => {
  // todo: build a pretty object/array instead of just listing things
  return distinct(problems.map(problemToString)).map(output => `  * ${output}`)
    .join('\n')
};

const ValidationError = defineError$1(
  'ValidationError',
  'ERR_INVALID',
  (validator, input, problems) => ({
    message: `Invalid input. ${problemToString(problems[0])}`,
    validator,
    input,
    output: problemsToOutput(problems),
  })
);

const assertValid = compilable$1(function assertValid(validator, input) {
  const problems = validate.$(validator, input);
  if (!problems.length) {
    return input
  }
  throw ValidationError(validator, input, problems)
}, { skip: 1 });

const any = rest(function any () { return true });

const anyOf = function anyOf (...validators) {
  return override$1({
    properties: {
      name: () => `anyOf(${validators.map(validatorName).join(', ')})`,
    },
  })((input, path) => {
    let allProblems = [];
    for (const validator of validators) {
      const problems = validate.$(validator, input, path);
      if (!problems.length) {
        return []
      }
      allProblems = [...allProblems, ...problems];
    }
    return allProblems
  })
};

export { constant as $, pipe as I, InvalidTrapTargetError, MissingPipeArgumentError, Null, Undefined, ValidationError, identity as _, baseIdentity as _base, thisIdentity as _this, add, constant as always, and, any, anyOf, appendedName, identity as argument, arity, arraySpreadFrom, tap as aside, assertValid, awaitAll, awaitAny, awaitArray, awaitArray_OLD, awaitDelay, awaitObject, bitand as band, baseIdentity as baseArgument, baseIdentity, binary, bitwise as bit, bitand, bitnot, bitor, bitwise, bitxor, bitnot as bnot, bitor as bor, bitxor as bxor, call, charAt, charCodeAt, charPointAt, compare, compareTypes, comparer, comparing, compilable, compose, concat, parallel as concurrent, conditional, constant, construct, constructed, curry, deepAwait, equal as deepEqual, defaultHashToStringOutputChars, defineError, delay, tap as dispatch, divide as div, divide, dotAll, endsWith, equal as eq, equal, equalTo, every, isDefined as exists, exponent as exp, exponent, compose as f, failWith, fallback, not as falsy, filter, flat, fromBase, fromCharCode, fromCodePoint, functionName, gather, propertyValue as get, getSpreadable, globalMatch, greater, greater as greaterThan, groupBy, greater as gt, hash, hashAny, hashFrom, hashToDouble, hashToInt, hashToString, identity, ignoreCase, includes, indexOf, is, isArray, isAsync, isBoolean, isCompiled, isDate, isDefined, isError$1 as isError, isErrorOf, isExactType, is as isExactly, isFalsy, isFunction, isInteger, isIterable, isMap, isMissing, isNull, isNumber, isObject, isAsync as isPromise, isRegex, isResolve, isSet, isSpreadable, isSpreadableSymbol, isString, isSymbol, isSync, isAsync as isThennable, isTruthy, isType, isUndefined, isValid, join, constant as just, lastIndexOf, left, leftShift, less, less as lessThan, literal, leftShift as lshift, less as lt, map, modulo as mod, modulo, multiply as mul, multiline, multiply, named, arity as nary, not, isMissing as notExists, nullary, or, override, padEnd, padStart, parallel, parse, pipe, exponent as pow, product, propertyValue, proxy, awaitAny as race, reduce, toRegex as regex, reject, remainder as rem, remainder, required, resolve, toSpreadable as rest, reverse, right, rightShift, rightShift as rshift, is as same, isExactType as sameType, constant as scalar, select, select as selectCase, shallowResolve, shift, some, sort, spread, spreadableSymbol, square as sqr, squareRoot as sqrt, square, squareRoot, startsWith, sticky, is as strictEqual, isExactType as strictEqualType, stringify, subtract as sub, subtract, sync, syncSymbol, tag, tap, tag as template, ternary, thisIdentity as thisArgument, thisIdentity, toArray, toAsync, toObject, toPrimitiveFunction, toAsync as toPromise, toRegex, toSpreadable, toAsync as toThennable, trace, trap, trapAsync, isTruthy as truthy, typeName, unary, uncurry, unicode, validate, conditional as when, without, xor };
//# sourceMappingURL=index.js.map
