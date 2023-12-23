[Home](https://github.com/Sullux/fp-light/blob/master/README.md) | **Full API**
| [Tutorial](https://github.com/Sullux/fp-light/blob/master/TUTORIAL.md)
| [Project Setup Guide](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE.md) ([CJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-CJS.md) / [MJS](https://github.com/Sullux/fp-light/blob/master/GLOBALIZING-GUIDE-MJS.md))

# API

* [A](#a)
  * [asPromise](#aspromise)
  * [awaitArray](#awaitarray)
  * [awaitDelay](#awaitdelay)
  * [awaitObject](#awaitobject)

* [C](#c)
  * [compilable](#compilable)

* [D](#d)
  * [deepAwait](#deepawait)

* [I](#i)
  * [identity](#identity)

* [J](#j)
  * [join](#join)

* [M](#m)
  * [map](#map)

* [P](#p)
  * [parallel](#parallel)

* [R](#r)
  * [resolve](#resolve)

* [S](#s)
  * [sync](#sync)

* [T](#t)
  * [toPrimitiveFunction](#toprimitivefunction)

* [V](#v)
  * [validate](#validate)


## A

  ### asPromise


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should return the original promise

```javascript
() => {
  const input = Promise.resolve(42)
  expect(asPromise(input)).toBe(input)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should wrap and resolve a non-standard promise

```javascript
async () => {
  const input = {
    then: (resolve, reject) => Promise.resolve(42).then(resolve, reject)
  }
  const promise = asPromise(input)
  expect(promise.constructor).toBe(Promise)
  expect(await promise).toBe(42)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should wrap and rejrect a non-standard promise

```javascript
async () => {
  const error = new Error('reasons')
  const input = {
    then: (resolve, reject) => Promise.reject(error).then(resolve, reject)
  }
  const promise = asPromise(input)
  expect(promise.constructor).toBe(Promise)
  expect(await promise.catch(err => err)).toBe(error)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





### awaitArray


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should return sync output on sync input including an object

```javascript
() => {
  const input = [42, { foo: 42 }]
  const output = [42, { foo: 42 }]
  expect(awaitArray(input)).toEqual(output)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should return the input when all elements are sync

```javascript
() => {
  const input = [42, { foo: 42 }]
  expect(awaitArray(input)).toBe(input)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should return async output on async input

```javascript
async () => {
  const input = [Promise.resolve(42), { foo: 42 }]
  const output = [42, { foo: 42 }]
  expect(await awaitArray(input)).toEqual(output)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should return async output on nested async input

```javascript
async () => {
  const input = [42, { foo: Promise.resolve(42) }]
  const output = [42, { foo: 42 }]
  expect(await awaitArray(input)).toEqual(output)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





### awaitDelay


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should return a promise

```javascript
async () => {
  const start = Date.now()
  const promise = awaitDelay(100)
  const result = await promise.then(() => 42)
  expect(Date.now() - start).toBeGreaterThan(90)
  expect(result).toBe(42)
}
```

v 1.2.36 -- 102 ms --
✅ **Pass**





### awaitObject


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should return sync output on sync input

```javascript
() => {
  const input = { foo: 42, bar: 42 }
  const output = { foo: 42, bar: 42 }
  expect(awaitObject(input)).toEqual(output)
}
```

v 1.2.36 -- 1 ms --
✅ **Pass**





#### TEST: should return async output on async input

```javascript
async () => {
  const input = { foo: 42, bar: Promise.resolve(42) }
  const output = { foo: 42, bar: 42 }
  expect(await awaitObject(input)).toEqual(output)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should return original object if nothing to await

```javascript
() => {
  const input = { foo: 42, bar: 42 }
  expect(awaitObject(input)).toBe(input)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





## C

  ### compilable


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should compile zero args

```javascript
() => {
  const add = compilable(() => 1 + 2)
  expect(add()()).toBe(3)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should compile single arg

```javascript
() => {
  const add = compilable((x) => x + 2)
  expect(add(1)()).toBe(3)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should compile 2 args

```javascript
() => {
  const add = compilable((x, y) => x + y)
  expect(add(1)(2)).toBe(3)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should settle a compilable arg

```javascript
() => {
  const double = compilable((x) => x * 2)
  expect(pipe(double, double)(2)).toBe(8)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should compile to an identity proxy

```javascript
() => {
  const coords = compilable((x, y) => ({ x, y }))
  const from2 = coords(2)
  expect(from2.x(3)).toBe(2)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should pass through the compiled function

```javascript
() => {
  const add = compilable((x, y) => x + y)
  expect(add.$(1, 2)).toBe(3)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should handle async values

```javascript
async () => {
  const add = compilable((x, y) => x + y)
  const add1 = add(1)
  const result = await add1(Promise.resolve(2))
  expect(result).toBe(3)
}
```

v 1.2.36 -- 1 ms --
✅ **Pass**





#### TEST: should compile tap

```javascript
() => {
  let sideEffect
  const fn = compilable(tap(v => sideEffect = v + 1))
  expect(fn(_)(42)).toBe(42)
  expect(sideEffect).toBe(43)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should compile trap

```javascript
() => {
  const add = compilable(trap(({ a, b }) => a + b))
  const fn = add({ a: _, b: _ })
  const [err, result] = fn(21)
  expect(result).toBe(42)
  expect(err).toBe(undefined)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should spread compiled function with an identity param

```javascript
async () => {
  const inc = compilable((v) => ({ inc: v + 1 }))
  const input = { foo: (41) }
  const fn = pipe(
    { ...inc(_.foo) },
  )
  expect(await fn(input)).toEqual({ inc: 42 })
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





## D

  ### deepAwait


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should await async input

```javascript
async () => {
  const input = Promise.resolve({ foo: 42, bar: [Promise.resolve(42)] })
  const output = { foo: 42, bar: [42] }
  expect(await deepAwait(input)).toEqual(output)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





## I

  ### identity


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should return the original argument

```javascript
() => {
  expect(_(42)).toBe(42)
  const input = { foo: 42 }
  expect(_(input)).toBe(input)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should return property

```javascript
() => {
  const input = { foo: 42 }
  expect(_.foo(input)).toBe(42)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should return element

```javascript
() => {
  const input = [41, 42, 43]
  expect(_[1](input)).toBe(42)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should be spreadable

```javascript
() => {
  const input = { foo: 42 }
  const output = pipe(
    { ..._, bar: 3 },
    _.foo,
  )(input)
  expect(output).toBe(42)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should be spreadable as a derived identity

```javascript
() => {
  const input = { value: { foo: 42 } }
  const output = pipe(
    { ..._.value, bar: 3 },
    _.foo,
  )(input)
  expect(output).toBe(42)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should be spreadable in array

```javascript
() => {
  const input = ['foo']
  const output = resolve([..._, 42])(input)
  expect(output).toEqual(['foo', 42])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should not resolve the "then" property

```javascript
() => {
  expect(_.then).toBe(undefined)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





## J

  ### join


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should join

```javascript
() => {
  const input = Array(1000).fill().map((v, i) => ({ i }))
  const fn = join({
    left: _,
    right: [2, 3],
    on: ({ left, right }) => (left.i % right) === 0,
    map: ({ left, right }) => `${left.i} / ${right}`,
  })
  const startTime = Date.now()
  fn(input)
  const endTime = Date.now()
  log('*** join took', endTime - startTime, 'ms')
}
```

v 1.2.36 -- 9 ms --
✅ **Pass**





#### TEST: should cross join

```javascript
() => {
  const input = Array(3).fill().map((v, i) => i)
  const fn = join({
    left: _,
    right: [1, 2],
    map: ({ left, right }) => left * right,
  })
  expect(fn(input)).toEqual([0, 0, 1, 2, 2, 4])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should join with predicate

```javascript
() => {
  const input = Array(3).fill().map((v, i) => i)
  const fn = join({
    left: _,
    right: [1, 2],
    map: ({ left, right }) => left * right,
    on: ({ left, right }) => (left % 2) === 0,
  })
  expect(fn(input)).toEqual([0, 0, 2, 4])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should join literal with predicate

```javascript
() => {
  const input = Array(3).fill().map((v, i) => i)
  const result = join.$({
    left: input,
    right: [1, 2],
    map: ({ left, right }) => left * right,
    on: ({ left, right }) => (left % 2) === 0,
  })
  expect(result).toEqual([0, 0, 2, 4])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should convert join arguments to arrays

```javascript
() => {
  const input = {
    name: 'BlackBox2-Schemas-dev',
    pk: 'tag',
    indexes: {
      typeOrderGsi: { name: 'idxName', pk: 'name', sk: 'version' },
    },
  }
  const fn = join({
    left: _.indexes,
    right: [_],
    map: { pk: _.right.pk, indexName: _.left[1].name },
  })
  const result = fn(input)
  expect(result).toEqual([{ pk: 'tag', indexName: 'idxName' }])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





## M

  ### map


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should reduce

```javascript
() => {
  const input = Array(1000).fill().map((v, i) => ({ i }))
  const fn = reduce({
    reducer: ({ value, state }) => state + value.i,
    state: 0,
  })
  const startTime = Date.now()
  fn(input)
  const endTime = Date.now()
  log('*** reduce took', endTime - startTime, 'ms')
}
```

v 1.2.36 -- 66 ms --
✅ **Pass**





#### TEST: should reduce async elements

```javascript
async () => {
  const input = [Promise.resolve(1), Promise.resolve(2), 3]
  const fn = reduce({
    reducer: ({ value, state }) => state + value,
    state: 0,
  })
  expect(await fn(input)).toBe(6)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should reduce async input

```javascript
async () => {
  const input = Promise.resolve([Promise.resolve(1), Promise.resolve(2), 3])
  const fn = reduce({
    reducer: ({ value, state }) => state + value,
    state: 0,
  })
  expect(await fn(input)).toBe(6)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should map

```javascript
() => {
  const input = Array(1000).fill().map((v, i) => ({ i }))
  const fn = map(({ i }) => ({ i2: i + 1 }))
  const startTime = Date.now()
  fn(input)
  const endTime = Date.now()
  log('*** map took', endTime - startTime, 'ms')
}
```

v 1.2.36 -- 4 ms --
✅ **Pass**





#### TEST: should map with async input

```javascript
async () => {
  const input = [42, Promise.resolve(43), 44]
  const fn = map(add(1))
  const result = await fn(input)
  expect(result).toEqual([43, 44, 45])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should map with async output

```javascript
async () => {
  const input = [42, 43, 44]
  const fn = map((v) => Promise.resolve(v + 1))
  const result = await fn(input)
  expect(result).toEqual([43, 44, 45])
}
```

v 1.2.36 -- 1 ms --
✅ **Pass**





#### TEST: should map to a pipe

```javascript
() => {
  const input = [{ foo: 41 }, { foo: 42 }, { foo: 43 }]
  const fn = map(pipe(
    _.foo,
    add(1),
  ))
  const result = fn(input)
  expect(result).toEqual([42, 43, 44])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should spread a map

```javascript
() => {
  const input = [1, 2]
  const fn = resolve([1, ...map(add(1))])
  const result = fn(input)
  expect(result).toEqual([1, 2, 3])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should spread a map result

```javascript
() => {
  const input = {
    put: [{ tag: 'foo@1', name: 'foo' }],
    delete: ['buzz@1'],
  }
  const name = 'foo'
  const fn = resolve({
    RequestItems: {
      [name]: [
        ...map({ DeleteRequest: { Key: { tag: 'buzz@1' } } }, _.delete),
        ...map({ PutRequest: { Item: _ } }, _.put),
      ],
    },
  })
  const expected = {
    RequestItems: {
      [name]: [
        { DeleteRequest: { Key: { tag: 'buzz@1' } } },
        { PutRequest: { Item: { tag: 'foo@1', name: 'foo' } } },
      ],
    },
  }
  const actual = fn(input)
  expect(actual).toEqual(expected)
}
```

v 1.2.36 -- 1 ms --
✅ **Pass**





#### TEST: should preserve hidden fields

```javascript
() => {
  const input = [
    { foo: 42 },
  ]
  Object.defineProperty(input[0], 'bar', { value: 'baz' })
  const fn = map({ foo: _.foo, bar: _.bar })
  const actual = fn(input)
  expect(actual).toEqual([{ foo: 42, bar: 'baz' }])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should map with _base

```javascript
() => {
  const obj = { input: [{ foo: 41 }, { foo: 42 }, { foo: 43 }] }
  const fn = map(
    add(_base(_).input.length, _.foo),
    _.input,
  )
  const result = fn(obj)
  expect(result).toEqual([44, 45, 46])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should map with implicit _base

```javascript
() => {
  const obj = { input: [{ foo: 41 }, { foo: 42 }, { foo: 43 }] }
  const fn = map(
    add(_.input.length, _.foo),
    _.input,
  )
  const result = fn(obj)
  expect(result).toEqual([44, 45, 46])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should group

```javascript
() => {
  const input = Array(1000).fill().map((v, i) => ({ i }))
  const fn = groupBy(({ i }) => i % 3)
  const startTime = Date.now()
  fn(input)
  const endTime = Date.now()
  log('*** group took', endTime - startTime, 'ms')
}
```

v 1.2.36 -- 49 ms --
✅ **Pass**





#### TEST: should filter

```javascript
() => {
  const input = Array(1000).fill().map((v, i) => ({ i }))
  const fn = filter(({ i }) => (i % 3) === 0)
  const startTime = Date.now()
  fn(input)
  const endTime = Date.now()
  log('*** filter took', endTime - startTime, 'ms')
}
```

v 1.2.36 -- 3 ms --
✅ **Pass**





#### TEST: should filter with async output

```javascript
async () => {
  const input = [42, 43, 44]
  const fn = filter((v) => Promise.resolve(v % 2))
  const result = await fn(input)
  expect(result).toEqual([43])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should return boolean some

```javascript
() => {
  const input = Array(1000).fill().map((v, i) => ({ i }))
  const fn = some(({ i }) => i > 998)
  const startTime = Date.now()
  fn(input)
  const endTime = Date.now()
  log('*** some took', endTime - startTime, 'ms')
}
```

v 1.2.36 -- 3 ms --
✅ **Pass**





#### TEST: should return boolean every

```javascript
() => {
  const input = Array(1000).fill().map((v, i) => ({ i }))
  const fn = every(({ i }) => i > -1)
  const startTime = Date.now()
  fn(input)
  const endTime = Date.now()
  log('*** every took', endTime - startTime, 'ms')
}
```

v 1.2.36 -- 3 ms --
✅ **Pass**





#### TEST: should flatten

```javascript
() => {
  const input = Array(500).fill().map((v, i) => ({ i }))
    .reduce(
      (state, value) => ([...state, [value, value]]),
      [],
    )
  const startTime = Date.now()
  const result = flat.$(input)
  const endTime = Date.now()
  expect(result).toEqual(input.flat())
  log('*** flatten took', endTime - startTime, 'ms')
}
```

v 1.2.36 -- 2 ms --
✅ **Pass**





#### TEST: should reduce with a derived identity

```javascript
() => {
  const input = [1, 2, 3]
  const fn = reduce({
    reducer: [..._.state, _.value],
    state: [],
  })
  expect(fn(input)).toEqual([1, 2, 3])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should filter out null

```javascript
() => {
  const input = [null, 43, 44]
  const result = pipe(filter(_))
  expect(result(input)).toEqual([43,44])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should settle compilables

```javascript
() => {
  const keys = [1, 2, 3]
  const double = compilable((x) => x * 2)
  const result = map(double)(keys)
  expect(result).toEqual([2, 4, 6])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





## P

  ### parallel


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should execute the mapper in parallel

```javascript
async () => {
  const input = [500, 100]
  const order = []
  const fn = pipe(
    parallel(tap(pipe(
      delay(_, _),
      v => order.push(v),
    ))),
    output => ({ order, output }),
  )
  const output = await fn(input)
  const expected = { order: [100, 500], output: [500, 100] }
  expect(output).toEqual(expected)
}
```

v 1.2.36 -- 501 ms --
✅ **Pass**





## R

  ### resolve


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should deep await

```javascript
async () => {
  const fn = resolve({
      foo: [Promise.resolve(42)],
      bar: Promise.resolve('baz'),
      value: _,
    })
  const result = await fn('biz')
  expect(result).toEqual({ foo: [42], bar: 'baz', value: 'biz' })
}
```

v 1.2.36 -- 1 ms --
✅ **Pass**





#### TEST: should spread compiled pipe

```javascript
async () => {
  const inc = compilable(pipe(
    _.foo,
    foo => ({ inc: foo + 1}),
  ))
  const input = { foo: (41) }
  const fn = pipe(
    { ...inc({ ..._ }) },
  )
  expect(await fn(input)).toEqual({ inc: 42 })
}
```

v 1.2.36 -- 1 ms --
✅ **Pass**





#### TEST: should equal

```javascript
() => {
  const extra = { test: 1, foo: true, bar: false}
  const justEnough = { foo: true, bar: false}
  const output = pipe(
    equal(({ extra: { test, ...rest } }) => rest, _.justEnough),
  )({
    extra,
    justEnough,
  })
  expect(output).toEqual(true)
}
```

v 1.2.36 -- 1 ms --
✅ **Pass**





## S

  ### sync


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should sync an object

```javascript
() => {
  const input = { foo: 42, bar: 'baz' }
  const syncInput = sync(input)
  expect(isSync(syncInput)).toBe(true)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should sync a frozen object

```javascript
() => {
  const input = Object.freeze({ foo: 42, bar: 'baz' })
  const syncInput = sync(input)
  expect(isSync(syncInput)).toBe(true)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





## T

  ### toPrimitiveFunction


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should be implemented on identity

```javascript
() => {
  const input = {
    values: [1, 2, 3],
    offset: 1,
  }
  expect(_.values[_.offset](input)).toBe(2)
}
```

v 1.2.36 -- 1 ms --
✅ **Pass**





#### TEST: should allow primitive conversion of a custom function

```javascript
() => {
  const input = [1, 2, 3]
  const last = toPrimitiveFunction((v) => v.length - 1)
  expect(_[last](input)).toBe(3)
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





## V

  ### validate


**`() => void`**




| Arg | Type | Description |
| --- | ---- | ----------- |
| _`=>`_ | **`void`** | todo... |


#### TEST: should validate an object

```javascript
() => {
  const fn = validate({
    foo: 'bar',
    baz: isString,
  })
  const input = sync({
    foo: 'bar',
    baz: 'biz',
  })
  expect(fn(input)).toEqual([])
}
```

v 1.2.36 -- 1 ms --
✅ **Pass**





#### TEST: should validate an array

```javascript
() => {
  const fn = validate([any, ...any])
  const input = [42]
  const output = fn(input)
  expect(output).toEqual([])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





#### TEST: should validate a complex object

```javascript
() => {
  const fn = validate({
    name: anyOf(isString, isMissing),
    setup: anyOf(isObject, isMissing),
    tests: [any, ...any],
  })
  const input = {
    name: 'toAsync',
    tests: [{ input: [42] }],
  }
  fn(input)
  const output = fn(input)
  expect(output).toEqual([])
}
```

v 1.2.36 -- 1 ms --
✅ **Pass**





#### TEST: should validate any

```javascript
() => {
  const fn = validate(any)
  expect(fn({})).toEqual([])
  expect(fn([])).toEqual([])
  expect(fn(42)).toEqual([])
  expect(fn()).toEqual([])
}
```

v 1.2.36 -- 0 ms --
✅ **Pass**





