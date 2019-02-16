[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-get

`npm i @sullux/fp-light-get`
[source](https://github.com/Sullux/fp-light/blob/master/lib/get/get.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/get/get.spec.js)

The purpose of the `get` helper is to

* [get](#get)

### get

`get(...steps: Function[]): Function`

This is an example of a synchronous get:

```javascript
const productOfDouble = get(
  value => value + value,
  value => value * value
)

productOfDouble(3) // 36
```

And this is an example of an asynchronous get. This example also uses `curry`, `compose`, and the AWS SDK, and is a more practical example of the power of functional gets.

```javascript
const { curry } = require('@sullux/fp-light-curry')
const { get } = require('@sullux/fp-light-get')
const { compose } = require('@sullux/fp-light-compose')
const AWS = require('aws-sdk')

const s3 = new AWS.s3()

const saveObject = curry((key, o) =>
  s3.putObject({
    Body: JSON.stringify(o),
    Bucket: process.env.BUCKET,
    Key: key,
  }).promise())

const readObject = key =>
  s3.getObject({
    Bucket: process.env.BUCKET,
    Key: key,
  }).promise()

const decodeObject = ({ Body }) =>
  JSON.parse(Body)

const composeWith = curry(compose, 2)

const extendObject = (key, added) =>
  get(
    readObject,
    decodeObject,
    composeWith(added),
    saveObject(key)
  )(key)

module.exports = {
  extendObject
}
```
