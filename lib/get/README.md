[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-get

`npm i @sullux/fp-light-get`
[source](https://github.com/Sullux/fp-light/blob/master/lib/get/get.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/get/get.spec.js)

The purpose of the `get` helper is to provide a functional way to retrieve properties from an input object.

* [get](#get)

### get

`get(pathParts: (string | number) | (string | number)[], source: any): any`

The `get` function is useful for traversing a property path. The path parts can be strings or numbers. This supports retrieving properties and array elements.

```javascript
const { get } = require('@sullux/fp-light-get')

const object = { foo: [41, 42] }

get(['foo', 1], object) // 42
```

The `get` helper can be useful in functional composition. The following is a more complete example of the `get`function.

```javascript
const { call } = require('@sullux/fp-light-call')
const { get } = require('@sullux/fp-light-get')

const random0To31 = () =>
  Math.floor(Math.random() * 36)

const randomString = length =>
  Array(length)
    .fill()
    .map(random0To31)
    .map(get('toString'))
    .map(call(36))
    .join('')
```
