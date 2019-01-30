const { curry } = require('./fn')

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

const hash = curry((outputSize, input) => {
  const outputSeed = Buffer.from(Array(outputSize).fill(input.length % 256))
  const firstPass = hashForward(input, outputSeed)
  return hashBackward(input, firstPass)
})

const stringify = input =>
  (input === undefined
    ? 'undefined'
    : JSON.stringify(input))

const hashAny = curry((outputSize, input) =>
  hash(outputSize, Buffer.from(stringify({ input }))))

const hashToDouble = input =>
  hashAny(8, input).readDoubleLE()

const hashToInt = input =>
  hashAny(4, input).readInt32LE()

const hashToString = (input, length = 16) =>
  hashAny(length, input).toString('hex')

module.exports = {
  hash,
  hashAny,
  hashToString,
  hashToDouble,
  hashToInt,
}
