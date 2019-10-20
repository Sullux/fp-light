const { factoryOf } = require('type')

const is = value =>
  compareValue => isNaN(value)
    ? isNaN(compareValue)
    : value === compareValue

const typesByPrecedence = [
  'Undefined',
  'Null',
  'Number',
  'Date',
  'String',
  'Array',
]

const typeIndex = value => {
  const index = typesByPrecedence.indexOf(factoryOf(value).name)
  return index < 0
    ? typesByPrecedence.length
    : index
}

const compareTypes = value => {
  const valueType = typeIndex(value)
  return compareValue =>
    valueType - typeIndex(compareValue)
}

const strictCompareTypes = value => {
  const valueTypeName = factoryOf(value).name
  const index = typesByPrecedence.indexOf(valueTypeName)
  return compareValue => {
    const compareTypeName = factoryOf(compareValue).name
    const simpleCompare = index - typesByPrecedence.indexOf(compareTypeName)
    return simpleCompare
      ? simpleCompare
      : valueTypeName.localeCompare(compareTypeName)
  }
}

const compareWith = ({ compareTypes, comparisons }) => {
  const compare = value => {
    const compareTo = compareValue => {
      const typeComparison = compareTypes(value)(compareValue)
      if (typeComparison !== 0) {
        return typeComparison
      }
      // todo: use rules
    }
    return compareTo
  }
  const rules = comparisons
    .map(comparison => comparison(compare))
  return compare
}

const defaultCompareRules = Object.freeze({
  compareTypes,
  comparisons: Object.freeze([
    compare => value => compareValue => {},
    compare => value => compareValue => {},
    compare => value => compareValue => {},
  ]),
})

const compare = compareWith(defaultCompareRules)

const equal = value => {
  const compareTo = compare(value)
  return compareValue =>
    compareTo(compareValue) === 0
}

module.exports = {
  is,
  equal,
  defaultCompareRules,
  compare,
  compareTypes,
  strictCompareTypes,
}
