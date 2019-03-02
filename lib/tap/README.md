[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-tap

`npm i @sullux/fp-light-tap`  
[source](https://github.com/Sullux/fp-light/blob/master/lib/tap/tap.js)  
[test](https://github.com/Sullux/fp-light/blob/master/lib/tap/tap.spec.js)  

A tap is a function that wraps a side-effect such that the return value of the tap is always the same as the input value.

* [tap](#tap)

### tap

`tap<T>((aside: any) => T): (T) => T`

Alias: `aside`

Creates a function that calls the wrapped function but always returns the original argument. The return value of the wrapped function is ignored.

```javascript
const { tap } = require('@sullux/fp-light-tap')
const { strictEqual } = require('assert')

describe('tap', () => {
  it('should call the wrapped function', () => {
    let mutable
    tap(v => { mutable = v })(42)
    strictEqual(mutable, 42)
  })
  it('should return the input value', () =>
    strictEqual(tap(() => 7)(42), 42))
})
```

Or a somewhat practical example of an `s3Bucket` implementation with a `putObject` function:

```javascript
const { curry } = require('@sullux/fp-light-curry')
const { tap } = require('@sullux/fp-light-tap')
const { pipe } = require('@sullux/fp-light-pipe')

const s3 = new (require('aws-sdk')).S3

const putObjectParams = curry((bucket, { key, data }) => ({
  Bucket: bucket,
  Key: key,
  Data: JSON.stringify(data),
}))

const putObject = params => 
  s3.putObject(params).promise()

const s3Bucket = (bucket) => ({
  putObject: pipe(
    putObjectParams(bucket),
    tap(console.log),
    putObject,
    tap(console.log),
  ),
})
```
