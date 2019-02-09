[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-pipe

`npm i @sullux/fp-light-pipe`
[source](https://github.com/Sullux/fp-light/blob/master/lib/pipe/pipe.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/pipe/pipe.spec.js)

A pipe is a function comprised of a sequence of functions where the initial argument is passed to the first function, the result of that is passed to the second function and so on, and where the final result is the return value of the last function in the sequence.

* [pipe](#pipe)

### pipe

`pipe(...steps: Function[]): Function`

This is an example of a synchronous pipe:

```javascript
const productOfDouble = pipe(
  value => value + value,
  value => value * value
)

productOfDouble(3) // 36
```

And this is an example of an asynchronous pipe. This example also uses `curry`, `compose`, and the AWS SDK, and is a more practical example of the power of functional pipes.

```javascript
const { curry } = require('@sullux/fp-light-curry')
const { pipe } = require('@sullux/fp-light-pipe')
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
  pipe(
    readObject,
    decodeObject,
    composeWith(added),
    saveObject(key)
  )(key)

module.exports = {
  extendObject
}
```
