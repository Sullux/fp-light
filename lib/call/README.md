[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-call

`npm i @sullux/fp-light-call`
[source](https://github.com/Sullux/fp-light/blob/master/lib/call/call.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/call/call.spec.js)

The purpose of the `call` helper is to allow the function to be passed as the most significant argument.

* [call](#call)

### call

`call(arg: any, fn: <T>(mixed) => T): T`

The `call` helper can be useful in functional composition. Consider the following example.

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

Note that since the call utility accepts an argument first and a function second, the `.map(call(36))` sets up the call `toString(36)` for each input value. This isn't the most efficient example, but it is fully functional and serves as an example of passing a function as the most significant argument to the call utility.
