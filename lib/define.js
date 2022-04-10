const scope = []

const distinct = (...args) => ([...(new Set(args.flat()))])

export const enterScope = () => {
  scope.unshift({})
}

export const exitScope = () => {
  scope.shift()
}

function Type(name, options) {
  const self = new.target
    ? this
    : Object.setPrototypeOf({}, Type.prototype)
  Object.assign(self, options)
  self.name = name
  return self
}
Type.get = function get(name) {
  for (let i = 0, n = scope.length; i < n; i++) {
    const value = scope[i][name]
    if (value) {
      return value
    }
  }
}
Type.prototype.merge = function merge({
  alias = [],
  implicit = [],
  explicit = [],
  methods = [],
}) {
  const existing = this
  return new Type(existing.name, {
    alias: distinct(existing.alias, alias),
  })
}

export const define = (name, options = {}) => {
  const existing = Type.get(name)
  const type = existing ? existing.merge(options) : new Type(name, options)
  scope[0][name] = type
  return type
}

export const constant = () => { }

export const operator = () => { }

export const alias = () => { }

export const implicit = () => { }

export const explicit = () => { }

export const scope = () => { }

export const syntax = () => { }
