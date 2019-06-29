const pathPart = (part) => {
  const number = parseInt(part, 10)
  return isNaN(number) ? part : number
}

const pathFrom = path =>
  Number.isInteger(path)
    ? [path]
    : path.split('.').map(pathPart)

const arrayOf = arg =>
  Array.isArray(arg)
    ? arg
    : pathFrom(arg)

const get = pathParts =>
  source =>
    (pathParts === null) || (pathParts === undefined) || (pathParts === '')
      ? source
      : arrayOf(pathParts).reduce(
        (value, name) =>
          value === null || value === undefined
            ? undefined
            : value[name],
        source
      )

const getFrom = source => pathParts =>
  get(pathParts)(source)

module.exports = {
  get,
  getFrom,
}
