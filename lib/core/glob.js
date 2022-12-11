const { isString } = require('./helpers')

const isGlob = ({ pattern, regex } = {}) =>
  isString(pattern) && (regex instanceof RegExp)

function Glob (pattern) {
  const regexString = `.*${pattern
    .replace(/\*\*/, '.*')
    .replace(/\*/, '[^/]*')
    .replace(/\?/, '.')
    .replace(/\[!/, '[^')}.*`
  const regex = new RegExp(regexString, 'g')
  return Object.freeze({ pattern, regex })
}
Object.defineProperty(Glob, Symbol.hasInstance, {
  value: isGlob,
})

module.exports = {
  isGlob,
  Glob,
}
