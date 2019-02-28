[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-always

`npm i @sullux/fp-light-always`&#10
[source](https://github.com/Sullux/fp-light/blob/master/lib/always/always.js)&#10
[test](https://github.com/Sullux/fp-light/blob/master/lib/always/always.spec.js)

The always utility wraps a static value in a function. While simple as far as utilities go, it can add readability to functional code.

* [always(value)](#always)

### always

`always<T>(value: T): T`

The following example uses `always` to return a pre-determined value from a thennable.

```javascript
const { curry } = require('@sullux/fp-light-curry')
const AWS = require('aws-sdk')

const s3 = new AWS.s3()

const saveObject = curry((key, object) =>
  s3.putObject({
    Body: JSON.stringify(object),
    Bucket: process.env.BUCKET,
    Key: key,
  }).promise().then(always(object)))
```
