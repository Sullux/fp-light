const hashForward = (input, output) => {
  const inputLength = input.length
  const outputLength = output.length
  for (let i = 0, prev = 0; i < inputLength; i++) {
    const ii = i % outputLength
    output[ii] = prev = output[ii] ^ input[i] ^ prev ^ (i % 256)
  }
  return output
}

const hashBackward = (input, output) => {
  const outputLength = output.length
  for (let i = input.length - 1, prev = 0; i > -1; i--) {
    const ii = i % outputLength
    output[ii] = prev = output[ii] ^ input[i] ^ prev ^ (255 - (i % 256))
  }
  return output
}


const hashFrom = (seed, input) =>
  hashBackward(input, hashForward(input, seed))

const hash = (outputSize, input) =>
  hashFrom(Buffer.from(Array(outputSize).fill(input.length % 256)), input)

const stringify = input =>
  (input === undefined
    ? 'undefined'
    : JSON.stringify(input))

const hashAny = (outputSize, input) =>
  hash(
    outputSize,
    input instanceof Buffer
      ? input
      : Buffer.from(stringify({ input }))
  )

const hashToDouble = input =>
  hashAny(8, input).readDoubleLE()

const hashToInt = input =>
  hashAny(4, input).readInt32LE()

const halfRoundedUp = number => {
  const half = number / 2
  return half % 2 === 0
    ? half
    : Math.ceil(half)
}

const hashToString = (length, input) =>
  hashAny(halfRoundedUp(length), input)
    .toString('hex')
    .substring(0, length)

module.exports = {
  hash,
  hashFrom,
  hashAny,
  hashToString,
  hashToDouble,
  hashToInt,
}
