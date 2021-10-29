import { resolve } from '.'

const isVerbose = process.env.VERBOSE === 'true'
export const log = isVerbose ? console.log : () => {}

const mockSequence = ({ name, sequence, sync }) => {
  let calls = [...sequence]
  return jest.fn((...args) => {
    const current = calls[0]
    if (!current) {
      throw new Error(`Mocked function ${name} was called too many times.`)
    }
    calls = calls.slice(1)
    return mock({ name, ...current, sync })(...args)
  }).mockName(name)
}

export const mock = (spec = {}) => {
  if (spec.once) {
    return mockSequence({ ...spec, sequence: [spec.once] })
  }
  if (spec.sequence) {
    return mockSequence(spec)
  }
  const {
    name,
    input = expect.anything(),
    output: explicitOutput,
    sync,
    fn,
    tap,
  } = spec
  const output = tap ? input[0] : explicitOutput
  return jest.fn((...args) => {
    expect({ function: name, args }).toEqual({ function: name, args: input })
    if (fn) {
      return fn(...args)
    }
    if (sync) {
      if (output instanceof Error) {
        throw output
      }
      return output
    }
    return (output instanceof Error)
      ? Promise.reject(output)
      : Promise.resolve(output)
  }).mockName(name)
}

export const shouldNotBeCalled = (name) =>
  mock({ name, output: new Error(`${name} should not be called`), sync: true })
