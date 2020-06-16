const pathPart = (part) => {
  const number = Number.parseInt(part, 10)
  return Number.isNaN(number) ? part : number
}

const pathFrom = path =>
  Array.isArray(path)
    ? path
    : Number.isInteger(path)
      ? [path]
      : path.split('.').map(pathPart)

const get = pathParts =>
  source =>
    (pathParts === null) || (pathParts === undefined) || (pathParts === '')
      ? source
      : pathFrom(pathParts).reduce(
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
