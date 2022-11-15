import { compilable } from './compilable.js'

export const propertyValue = compilable(function propertyValue(path, input) {
  return (input === undefined)
    ? undefined
    : Array.isArray(path)
      ? path.reduce(
        (state, value) => propertyValue(value, state),
        input,
      )
      : input[path]
})

export { propertyValue as get }

const withoutElement = (index, array) => {
  const wrappedIndex = index % array.length
  const trueIndex = wrappedIndex < 0
    ? (array.length + wrappedIndex)
    : wrappedIndex
  return [
    ...array.slice(0, trueIndex),
    ...array.slice(trueIndex + 1),
  ]

}

export const without = compilable(function without(path, input) {
  if (Array.isArray(path)) {
    return path.reduce(
      (state, value) => without(value, state),
      input,
    )
  }
  return Array.isArray(input)
    ? path === 0
      ? input.slice(1)
      : withoutElement(path, input)
    : (({ [path]: ignored, ...rest }) => rest)(input)
})
