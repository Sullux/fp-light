const hashInputWithOutput = (input, output) => {
  const inputLength = input.length
  const outputLength = output.length
  const maxIterations = (inputLength + outputLength) * 2
  // eslint-disable-next-line no-plusplus
  for (let i = 0, prev = 0; i < maxIterations; i++) {
    const io = i % outputLength
    const ii = i % inputLength
    const code = input[ii]
    const existing = output[io]
    // eslint-disable-next-line no-param-reassign
    output[io] = prev = (((code ^ existing) ^ (prev + 1)) % 256)
  }
  return output
}

export const hashFrom = (seed, input) =>
  hashInputWithOutput(input, hashInputWithOutput(input, seed).reverse())

export const hash = (outputSize, input) =>
  hashFrom(
    Buffer.from(Array(outputSize).fill(input.length % 256)),
    input,
  )

const stringify = input =>
  (input === undefined
    ? 'undefined'
    : JSON.stringify(input))

export const hashAny = (outputSize, input) =>
  hash(
    outputSize,
    input instanceof Buffer
      ? input
      : Buffer.from(stringify({ input })),
  )

export const hashToDouble = input =>
  hashAny(8, input).readDoubleLE()

export const hashToInt = input =>
  hashAny(4, input).readInt32LE()

const range = (from, to) =>
  Array(to - from + 1).fill().map((v, i) => from + i)

const charRange = (from, to) =>
  range(from.charCodeAt(0), to.charCodeAt(0))
    .map(c => String.fromCharCode(c))

export const defaultHashToStringOutputChars = Object.freeze([
  ...charRange('a', 'z'),
  ...charRange('A', 'Z'),
  ...charRange('0', '9'),
])

export const hashToString = (
  length,
  input,
  outputChars = defaultHashToStringOutputChars,
) =>
  Array.from(hashAny(length, input))
    .map(c => outputChars[Math.floor((c / 256) * outputChars.length)])
    .join('')
