[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-hash

`npm i @sullux/fp-light-hash`
[source](https://github.com/Sullux/fp-light/blob/master/lib/hash/hash.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/hash/hash.spec.js)

This is a quick hashing algorithm for use in hash maps and other implementations that demand deterministic but well-distributed values based on not-well-distributed input values.

WARNING: THIS ALGORITHM IS NOT SUITABLE FOR CRYPTOGRAPHIC OPERATIONS. A password hashed with this algorithm could be easily reverse-engineered. This algorithm is for _distribution_, not _obfuscation_. The benefit of this algorithm for distribution scenarios is that it has far better performance than cryptographic hashing.

* [hash](#hash)
* [hashFrom](#hashfrom)
* [hashAny](#hashany)
* [hashToString](#hashtostring)
* [hashToDouble](#hashtodouble)
* [hashToInt](#hashtoint)

### hash

`hash(outputSize: Number, input: Buffer): Buffer`

This is the core implementation of `hash`. Given an output size (desired length of the output buffer) and an input buffer (data to be hashed), returns the hashed value as a buffer. All of the other functions are convenience functions for this core `hash` implementation.

### hashFrom

`hashFrom(seed: Buffer, input: Buffer): Buffer`

WARNING: this function mutates the `seed` argument. This is the underlying unit of work for the core `hash` function which mutates as a performance optimization. It is surfaced to enable progresssive hashing use cases such as reducers or streaming. The return value is a reference to the `seed` buffer, which is mutated during hashing. A hash reducer might look like the following example:

```javascript
const hashBigArray = (outputSize, bigArray) =>
  bigArray.reduce((seed, value) =>
    seed
      ? hashFrom(seed, JSON.stringify(value))
      : hashAny(outputSize, value))
```

### hashAny

`hashAny(outputSize: Number, input: any): Buffer`

Like `hash`, but will internally create an input buffer from the supplied input value.

### hashToString

`hashToString(outputSize: Number, input: any): String`

Like `hashAny`, but outputs a hex-encoded string instead of a buffer. Because hex encoding is twice as long as the number of bytes in the output buffer, the actual output buffer is half the given outputSize. Odd numbered output sizes are handled gracefully.

### hashToDouble

`hashToDouble(outputSize: Number, input: any): Number`

Like `hashAny`, but outputs a floating point number instead of a buffer.

### hashToInt

`hashToInt(outputSize: Number, input: any): Number`

Like `hashAny`, but outputs a 32-bit integer instead of a buffer. This would be useful in creating a custom hashmap implementation as in the following (incomplete) example:

```javascript
const { hashToInt } = require('@sullux/fp-light-hash')

const hashMap = (from = [], capacity = 128) => {
  const indexOf = key => hashToInt(key) % capacity
  const values = Array(capacity)

  from.map(indexValues =>
    indexValues.map(([key, value]) =>
      values[indexOf(key)] = value)

  return {
    get: (key) => {
      const index = indexOf(key)
      const indexValues = values[index]
      return indexValues && indexValues.reduce((result, [entryKey, value]) =>
        entryKey === key
          ? value
          : result)
    },
    set: (key, value) => {
      const index = indexOf(key)
      const indexValues = values[index]
      return (indexValues
        ? indexValues.push([key, value])
        : values[index] = [[key, value]]) && value
    },
  }
}
```
